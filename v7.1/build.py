"""Build a separate diagnostic module; preserve every deployed V7 resource."""
from pathlib import Path
import hashlib
import json
import re
import shutil

ROOT = Path(__file__).resolve().parent
REPO = ROOT.parent
BASE = REPO / 'v7'
ORIGIN = 'https://namdz-photobooth.namvu3121.workers.dev'

def main():
    public = ROOT / 'public'
    shutil.copytree(BASE / 'public', public, dirs_exist_ok=True)
    links = json.loads((BASE / 'private/links.json').read_text())
    module_path = links['module'].removeprefix(ORIGIN + '/')
    stable = (BASE / 'public' / module_path).read_text()
    scripts = re.findall(r'script-path=(https://[^\s,]+)', stable)
    config_url, native_url = scripts
    original = (BASE / 'public' / native_url.removeprefix(ORIGIN + '/')).read_text()
    # Instrument the previously silent parse catch. No body/URL/token output.
    needle = 'selected='
    if original.count('}catch(_){}') != 1 or needle not in original:
        raise ValueError('V7 native changed; review instrumentation before building')
    native = original.replace('}catch(_){}', '}catch(_){console.log(\'NAMDZDBG {"stage":"decode_error","revision":"7.1"}\');}')
    native = (ROOT / 'request-debug.js').read_text().replace('__NATIVE__', native)
    observer = (ROOT / 'response-debug.js').read_text()
    native_name = 'native-v7.1-' + hashlib.sha256(native.encode()).hexdigest()[:16] + '.js'
    observer_name = 'observe-v7.1-' + hashlib.sha256(observer.encode()).hexdigest()[:16] + '.js'
    modules = public / 'modules'
    (modules / native_name).write_text(native)
    (modules / observer_name).write_text(observer)
    debug = stable.replace('#!name=Locket Photobooth V7', '#!name=Locket Photobooth V7.1 Debug')
    debug = debug.replace('#!desc=', '#!desc=Console-only diagnostic version; ')
    debug = debug.replace('locket_config_v7', 'locket_config_v71').replace('locket_frame_v7', 'locket_frame_v71')
    debug = debug.replace(native_url, ORIGIN + '/modules/' + native_name)
    response_rule = ('locket_response_v71 = type=http-response,pattern=^https:\\/\\/(api\\.locketcamera\\.com|us-central1-locket-4252a\\.cloudfunctions\\.net|namdz-photobooth\\.namvu3121\\.workers\\.dev)\\/generateFilteredImage(?:[/?]|$),requires-body=1,max-size=0,script-path='
                     + ORIGIN + '/modules/' + observer_name + '\n\n')
    debug = debug.replace('[MITM]', response_rule + '[MITM]')
    debug_name = Path(module_path).name.replace('-v7-', '-v7.1-')
    (modules / debug_name).write_text(debug)
    private = ROOT / 'private'
    private.mkdir(exist_ok=True, mode=0o700)
    (private / 'links.json').write_text(json.dumps({'module': ORIGIN + '/modules/' + debug_name,
        'stable_module': links['module'], 'stable_sha256': hashlib.sha256(stable.encode()).hexdigest()}, indent=2))
    (ROOT / '.dev.vars').write_bytes((BASE / '.dev.vars').read_bytes())
    (ROOT / '.dev.vars').chmod(0o600)
    print('Built V7.1 diagnostics separately; V7 module/scripts preserved byte-for-byte.')

if __name__ == '__main__':
    main()
