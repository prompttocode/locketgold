"""V7 native rewrite with one non-rendering warm-up; preserve older versions."""
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
    shutil.copytree(REPO / 'v7.2/public', public, dirs_exist_ok=True)
    stable_links = json.loads((REPO / 'v7/private/links.json').read_text())
    stable_path = stable_links['module'].removeprefix(ORIGIN + '/')
    stable = (public / stable_path).read_text()
    config_url, native_url = re.findall(r'script-path=(https://[^\s,]+)', stable)
    native = (public / native_url.removeprefix(ORIGIN + '/')).read_text()
    ending = 'finish();\n})();'
    if not native.endswith(ending + '\n'):
        raise ValueError('V7 changed; review before injecting warm-up')
    native = native[:-len(ending + '\n')] + (ROOT / 'prime.js').read_text() + '\n})();\n'
    native = native.replace('}catch(_){}', '}catch(_){console.log(\'NAMDZDBG {"stage":"decode_error","revision":"7.3"}\');}')
    native = (REPO / 'v7.1/request-debug.js').read_text().replace("revision:'7.1'", "revision:'7.3'").replace('__NATIVE__', native)
    observer = (REPO / 'v7.1/response-debug.js').read_text().replace("revision:'7.1'", "revision:'7.3'")
    native_name = 'native-v7.3-' + hashlib.sha256(native.encode()).hexdigest()[:20] + '.js'
    observer_name = 'observe-v7.3-' + hashlib.sha256(observer.encode()).hexdigest()[:20] + '.js'
    (public / 'modules' / native_name).write_text(native)
    (public / 'modules' / observer_name).write_text(observer)
    module = stable.replace('#!name=Locket Photobooth V7', '#!name=Locket Photobooth V7.3 Warmup Test')
    module = re.sub(r'#!desc=.*', '#!desc=One lightweight warm-up before V7 native routing; experimental, no dummy image or AI generation.', module)
    module = module.replace('locket_config_v7', 'locket_config_v73').replace('locket_frame_v7', 'locket_frame_v73')
    module = module.replace(native_url, ORIGIN + '/modules/' + native_name)
    response_rule = ('locket_response_v73 = type=http-response,pattern=^https:\\/\\/(api\\.locketcamera\\.com|us-central1-locket-4252a\\.cloudfunctions\\.net|namdz-photobooth\\.namvu3121\\.workers\\.dev)\\/generateFilteredImage(?:[/?]|$),requires-body=1,max-size=0,script-path='
                     + ORIGIN + '/modules/' + observer_name + '\n\n')
    module = module.replace('[MITM]', response_rule + '[MITM]')
    module_name = Path(stable_path).name.replace('-v7-', '-v7.3-')
    (public / 'modules' / module_name).write_text(module)
    private = ROOT / 'private'
    private.mkdir(exist_ok=True, mode=0o700)
    diagnostic_links = json.loads((REPO / 'v7.1/private/links.json').read_text())
    relay_links = json.loads((REPO / 'v7.2/private/links.json').read_text())
    (private / 'links.json').write_text(json.dumps({'module': ORIGIN + '/modules/' + module_name,
        'stable_module': stable_links['module'], 'diagnostic_module': diagnostic_links['module'],
        'relay_module': relay_links['module'], 'stable_sha256': hashlib.sha256(stable.encode()).hexdigest()}, indent=2))
    print('Built V7.3 warm-up experiment; all earlier assets preserved.')

if __name__ == '__main__':
    main()
