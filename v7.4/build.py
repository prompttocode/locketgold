"""Native V7 + bounded recovery in the response hook for one gateway signature."""
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
    shutil.copytree(REPO / 'v7.3/public', public, dirs_exist_ok=True)
    links = json.loads((REPO / 'v7/private/links.json').read_text())
    stable_path = links['module'].removeprefix(ORIGIN + '/')
    stable = (public / stable_path).read_text()
    config_url, native_url = re.findall(r'script-path=(https://[^\s,]+)', stable)
    native = (public / native_url.removeprefix(ORIGIN + '/')).read_text()
    if native.count('let completed=false;') != 1 or native.count(" headers['X-Namdz-Key']=KEY;") != 1:
        raise ValueError('Review V7 source before adding response recovery')
    native = native.replace('let completed=false;', (ROOT / 'pending.js').read_text() + '\nlet completed=false;')
    native = native.replace(" headers['X-Namdz-Key']=KEY;", " const pending=savePending(typeof $request.body==='string'?$request.body:JSON.stringify(body));\n if(pending)headers['X-Namdz-Pending']=pending;\n console.log('NAMDZDBG '+JSON.stringify({revision:'7.4',stage:'pending_saved',saved:!!pending}));\n headers['X-Namdz-Key']=KEY;")
    native = (REPO / 'v7.1/request-debug.js').read_text().replace("revision:'7.1'", "revision:'7.4'").replace('__NATIVE__', native)
    key = json.loads((REPO / '.lab-secrets.json').read_text())['LAB_KEY']
    recovery = (ROOT / 'recover.js').read_text().replace('__SERVER__', json.dumps(ORIGIN)).replace('__KEY__', json.dumps(key))
    native_name = 'native-v7.4-' + hashlib.sha256(native.encode()).hexdigest()[:20] + '.js'
    recovery_name = 'recover-v7.4-' + hashlib.sha256(recovery.encode()).hexdigest()[:20] + '.js'
    (public / 'modules' / native_name).write_text(native)
    (public / 'modules' / recovery_name).write_text(recovery)
    module = stable.replace('#!name=Locket Photobooth V7', '#!name=Locket Photobooth V7.4 Response Recovery Test')
    module = re.sub(r'#!desc=.*', '#!desc=Native V7; one response-hook recovery only for the observed plaintext gateway 502. Experimental.', module)
    module = module.replace('locket_config_v7', 'locket_config_v74').replace('locket_frame_v7', 'locket_frame_v74')
    module = module.replace(native_url, ORIGIN + '/modules/' + native_name)
    response_rule = ('locket_response_v74 = type=http-response,pattern=^https:\\/\\/(api\\.locketcamera\\.com|us-central1-locket-4252a\\.cloudfunctions\\.net|namdz-photobooth\\.namvu3121\\.workers\\.dev)\\/generateFilteredImage(?:[/?]|$),requires-body=1,max-size=0,timeout=60,script-path='
                     + ORIGIN + '/modules/' + recovery_name + '\n\n')
    module = module.replace('[MITM]', response_rule + '[MITM]')
    module_name = Path(stable_path).name.replace('-v7-', '-v7.4-')
    (public / 'modules' / module_name).write_text(module)
    private = ROOT / 'private'
    private.mkdir(exist_ok=True, mode=0o700)
    previous = json.loads((REPO / 'v7.3/private/links.json').read_text())
    (private / 'links.json').write_text(json.dumps({'module': ORIGIN + '/modules/' + module_name,
        'stable_module': links['module'], 'previous_module': previous['module'],
        'stable_sha256': hashlib.sha256(stable.encode()).hexdigest()}, indent=2))
    # Local dev/type generation needs the same key binding; never commit it.
    (ROOT / '.dev.vars').write_bytes((REPO / 'v7/.dev.vars').read_bytes())
    (ROOT / '.dev.vars').chmod(0o600)
    print('Built isolated V7.4 response recovery; all previous assets preserved.')

if __name__ == '__main__':
    main()
