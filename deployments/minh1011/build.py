"""Rebase the accepted V7.4 assets to an independent account and access key."""
from pathlib import Path
import hashlib
import json
import re
import secrets
import shutil

ROOT = Path(__file__).resolve().parent
REPO = ROOT.parents[1]
ORIGIN = 'https://locket-photobooth.minh1011-locket.workers.dev'

def main():
    private = ROOT / 'private'
    private.mkdir(exist_ok=True, mode=0o700)
    secret_path = private / 'secrets.json'
    if not secret_path.exists():
        secret_path.write_text(json.dumps({'LAB_KEY': secrets.token_hex(32)}))
        secret_path.chmod(0o600)
    key = json.loads(secret_path.read_text())['LAB_KEY']
    old_key = json.loads((REPO / '.lab-secrets.json').read_text())['LAB_KEY']
    source_links = json.loads((REPO / 'v7.4/private/links.json').read_text())
    old_origin = source_links['module'].split('/modules/')[0]
    old_host, new_host = old_origin.split('://')[1], ORIGIN.split('://')[1]
    old_pattern, new_pattern = old_host.replace('.', r'\.'), new_host.replace('.', r'\.')
    source_public = REPO / 'v7.4/public'
    public = ROOT / 'public'
    public.mkdir(exist_ok=True)

    def rebase(text):
        return text.replace(old_origin, ORIGIN).replace(old_pattern, new_pattern).replace(old_host, new_host).replace(old_key, key)

    for directory in ['assets', 'config']:
        shutil.copytree(source_public / directory, public / directory, dirs_exist_ok=True)
    for path in (public / 'config').rglob('*.json'):
        path.write_text(rebase(path.read_text()))
    source_module = (source_public / 'modules' / source_links['module'].split('/')[-1]).read_text()
    module = rebase(source_module)
    modules = public / 'modules'
    modules.mkdir(exist_ok=True)
    mapping = []
    for index, source_url in enumerate(re.findall(r'script-path=(https://[^\s,]+)', source_module)):
        original = (source_public / 'modules' / source_url.split('/')[-1]).read_text()
        script = rebase(original)
        prefix = ['config', 'native', 'recover'][index]
        name = prefix + '-v7.4-' + hashlib.sha256(script.encode()).hexdigest()[:20] + '.js'
        url = ORIGIN + '/modules/' + name
        (modules / name).write_text(script)
        module = module.replace(rebase(source_url), url)
        mapping.append({'source': source_url, 'target': url})
    name = 'Locket-Photobooth-v7.4-' + hashlib.sha256(('module:'+key).encode()).hexdigest()[:32] + '.sgmodule'
    (modules / name).write_text(module)
    (private / 'links.json').write_text(json.dumps({'origin': ORIGIN, 'module': ORIGIN + '/modules/' + name,
        'source_module': source_links['module'], 'mapping': mapping}, indent=2))
    (ROOT / '.dev.vars').write_text('LAB_KEY=' + json.dumps(key) + '\n')
    (ROOT / '.dev.vars').chmod(0o600)
    for path in public.rglob('*'):
        if path.suffix in ['.js', '.json', '.sgmodule']:
            text = path.read_text()
            assert old_origin not in text and old_key not in text and old_host not in text and old_pattern not in text
    print('Built independent V7.4 deployment: 3 scripts, separate key and all URLs rebased.')

if __name__ == '__main__':
    main()
