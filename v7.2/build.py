"""Publish an isolated relay experiment, keeping V7 and V7.1 assets unchanged."""
from pathlib import Path
import hashlib
import json
import re
import shutil

ROOT = Path(__file__).resolve().parent
REPO = ROOT.parent
ORIGIN = 'https://namdz-photobooth.namvu3121.workers.dev'

def main():
    public = ROOT / 'public'
    shutil.copytree(REPO / 'v7.1/public', public, dirs_exist_ok=True)
    links = json.loads((REPO / 'v7/private/links.json').read_text())
    stable_path = links['module'].removeprefix(ORIGIN + '/')
    stable = (public / stable_path).read_text()
    scripts = re.findall(r'script-path=(https://[^\s,]+)', stable)
    if len(scripts) != 2:
        raise ValueError('Review V7 module before generating a relay version')
    camera = json.loads(json.loads((public / 'config/v7.json').read_text())['entries']['camera_filter_config'])
    supported = sorted({f['uid'] for f in camera['remote_filters']} | {'namdz_vintage'})
    key = json.loads((REPO / '.lab-secrets.json').read_text())['LAB_KEY']
    relay = (ROOT / 'relay.js').read_text().replace('__SERVER__', json.dumps(ORIGIN)).replace('__KEY__', json.dumps(key)).replace('__SUPPORTED__', json.dumps(supported))
    relay_name = 'relay-v7.2-' + hashlib.sha256(relay.encode()).hexdigest()[:20] + '.js'
    (public / 'modules' / relay_name).write_text(relay)
    module = stable.replace('#!name=Locket Photobooth V7', '#!name=Locket Photobooth V7.2 Relay Test')
    module = re.sub(r'#!desc=.*', '#!desc=Independent HTTP relay experiment; same filters as V7; no automatic retry.', module)
    module = module.replace('locket_config_v7', 'locket_config_v72').replace('locket_frame_v7', 'locket_frame_v72')
    module = module.replace(scripts[1], ORIGIN + '/modules/' + relay_name)
    module_name = Path(stable_path).name.replace('-v7-', '-v7.2-')
    (public / 'modules' / module_name).write_text(module)
    private = ROOT / 'private'
    private.mkdir(exist_ok=True, mode=0o700)
    diagnostic = json.loads((REPO / 'v7.1/private/links.json').read_text())
    (private / 'links.json').write_text(json.dumps({'module': ORIGIN + '/modules/' + module_name,
        'stable_module': links['module'], 'diagnostic_module': diagnostic['module'],
        'stable_sha256': hashlib.sha256(stable.encode()).hexdigest()}, indent=2))
    print('Built isolated V7.2 relay; V7 and V7.1 assets preserved.')

if __name__ == '__main__':
    main()
