"""Build the V7 catalog and private Shadowrocket assets without changing V6.

Run from the repository root: python3 v7/build.py
Requires Pillow. LAB_KEY is read locally, never written to tracked sources.
"""
from collections import deque
from pathlib import Path
import copy
import hashlib
import json
import re
import shutil
import unicodedata

from PIL import Image

ROOT = Path(__file__).resolve().parent
REPO = ROOT.parent
ORIGIN = 'https://namdz-photobooth.namvu3121.workers.dev'
V6 = REPO / 'rollback-snapshots/v6-popup-hnam'
PUBLIC = ROOT / 'public'

# Existing client IDs are retained; display names and image files are our catalog.
CATALOG = [
    ('pb_vintage', 'pb_vintage@3x.png', 'Vintage 2×2', 'Photobooth'),
    ('pb_cortis_v2', 'pb_cortis_v2@3x.png', 'Cortis 2×2', 'Photobooth'),
    ('pb_denim_ripped_2x2', 'pb_denim_ripped_2x2%403x.png', 'Denim 2×2', 'Photobooth'),
    ('pb_holo_4cut', 'pb_holo_4cut.png', 'Holo 2×2', 'Photobooth'),
    ('pb_meo_dang_yeu_4cut', 'pb_meo_dang_yeu_4cut@3x.png', 'Mèo đáng yêu 2×2', 'Photobooth'),
    ('pb_strawberry', 'pb_strawberry.png', 'Dâu tây 2×2', 'Photobooth'),
    ('pb_supperman_4cut', 'pb_supperman_4cut.png', 'Superman 2×2', 'Photobooth'),
    ('frame_ba_khi', 'Khung Bá khí.png', 'Bá khí', 'Khung'),
    ('khung_hello_kitty_h_ng_pastel', 'khung_hello_kitty_h_ng_pastel@3x.png', 'Hello Kitty pastel', 'Khung'),
    ('khung_kh_ng_gian_xanh_pastel', 'khung_kh_ng_gian_xanh_pastel.png', 'Không gian xanh', 'Khung'),
    ('khung_nh_shin_chan_vi_n_m_nh', 'khung_nh_shin_chan_vi_n_m_nh.png', 'Shin-chan', 'Khung'),
    ('khung_vu_ng_ng_i_sao_h_ng_pastel', 'khung_vu_ng_ng_i_sao_h_ng_pastel.png', 'Ngôi sao hồng', 'Khung'),
    ('khung_xanh_v_tay_sao_v_ng', 'khung_xanh_v_tay_sao_v_ng.png', 'Xanh sao vàng', 'Khung'),
    ('photobooth_cute', 'photobooth_cute.png', 'Sweet Memories', 'Khung'),
    ('khung_hello_kitty_pastel_ng_t_ng_o', 'sinh_nh_t_hello_kitty_ho_i_c.png', 'Sinh nhật Hello Kitty', 'Khung'),
]


def compact(value):
    return json.dumps(value, ensure_ascii=False, separators=(',', ':'))


def find_source(name):
    normalized = unicodedata.normalize('NFC', name)
    return next(p for p in (ROOT / 'frames').glob('*.png')
                if unicodedata.normalize('NFC', p.name) == normalized)


def photobooth_slots(image):
    """Find four large transparent connected holes, normalized to 1080 square."""
    alpha = image.getchannel('A').resize((540, 540), Image.Resampling.NEAREST)
    mask = bytearray(1 if a < 32 else 0 for a in alpha.tobytes())
    components = []
    width = 540
    for start in range(width * width):
        if not mask[start]:
            continue
        queue = deque([start])
        mask[start] = 0
        x0 = y0 = width
        x1 = y1 = -1
        area = 0
        edge = False
        while queue:
            value = queue.popleft()
            x, y = value % width, value // width
            area += 1
            x0, y0 = min(x0, x), min(y0, y)
            x1, y1 = max(x1, x), max(y1, y)
            edge |= x in (0, width - 1) or y in (0, width - 1)
            for neighbor in (value - 1 if x else -1,
                             value + 1 if x < width - 1 else -1,
                             value - width if y else -1,
                             value + width if y < width - 1 else -1):
                if neighbor >= 0 and mask[neighbor]:
                    mask[neighbor] = 0
                    queue.append(neighbor)
        if not edge and area > 10000:
            # Extend by two pixels underneath antialiased frame borders.
            left, top = max(0, x0 * 2 - 2), max(0, y0 * 2 - 2)
            right, bottom = min(1080, (x1 + 1) * 2 + 2), min(1080, (y1 + 1) * 2 + 2)
            components.append((area, [left, top, right - left, bottom - top]))
    components.sort(reverse=True)
    if len(components) < 4:
        raise ValueError('Photobooth PNG must have four distinct transparent holes')
    boxes = [box for _, box in components[:4]]
    boxes.sort(key=lambda box: (box[1] + box[3] / 2 >= 540, box[0]))
    return boxes


def main():
    # Preserve existing V1–V6 URLs when producing a new deployment.
    if V6.exists():
        shutil.copytree(V6 / 'public', PUBLIC, dirs_exist_ok=True)
    shutil.copytree(ROOT / 'static', PUBLIC, dirs_exist_ok=True)
    (PUBLIC / 'assets/v7').mkdir(parents=True, exist_ok=True)
    (PUBLIC / 'modules').mkdir(parents=True, exist_ok=True)
    (PUBLIC / 'config').mkdir(parents=True, exist_ok=True)
    payload = json.loads((ROOT / 'base-config.json').read_text())
    camera = json.loads(payload['entries']['camera_filter_config'])
    camera['allows_custom_filters'] = False
    camera['allowsCustomFilters'] = False
    payload['entries']['allows_custom_filters'] = 'false'
    prototype = next(f for f in camera['remote_filters'] if f['uid'] == 'pb_vintage')
    filters, definitions, report = [], {}, []
    for uid, filename, label, group in CATALOG:
        source = find_source(filename)
        image = Image.open(source).convert('RGBA')
        if image.width != image.height:
            raise ValueError(f'Frame must be square: {source.name}')
        asset = PUBLIC / f'assets/v7/{uid}.png'
        shutil.copy2(source, asset)
        thumbnail = image.copy()
        thumbnail.thumbnail((256, 256), Image.Resampling.LANCZOS)
        thumbnail.save(PUBLIC / f'assets/v7/{uid}-icon.png')
        slots = photobooth_slots(image) if group == 'Photobooth' else [[0, 0, 1080, 1080]]
        if uid == 'pb_vintage':
            slots = [[70, 62, 445, 440], [568, 63, 443, 439], [70, 562, 445, 441], [568, 563, 443, 440]]
        frame_path = f'/assets/v7/{uid}.png'
        definitions[uid] = {'asset': frame_path, 'name': label, 'group': group, 'slots': slots,
                            'width': image.width, 'height': image.height}
        item = copy.deepcopy(prototype)
        item.update(uid=uid, id=uid, name=label, category=group, prompt=uid)
        for field in ['imageUrl', 'overlayImageUrl', 'overlayImageURL']:
            item[field] = ORIGIN + frame_path
        icon_url = ORIGIN + f'/assets/v7/{uid}-icon.png'
        item['iconUrl'] = icon_url
        for field in ['url', 'iconUrl', 'remoteImage']:
            item['icon'][field] = icon_url
        symbol = 'square.grid.2x2' if group == 'Photobooth' else 'photo'
        item['icon'].update(sfSymbol=symbol, symbol=symbol, emoji='📸' if group == 'Photobooth' else '🖼️')
        filters.append(item)
        report.append({'id': uid, 'name': label, 'group': group, 'source': source.name, 'slots': slots})
    rows = [{'title': {'en': group, 'vi': group},
             'filter_ids': [f['uid'] for f in filters if f['category'] == group]}
            for group in ['Photobooth', 'Khung']]
    for field in ['sheet_filters', 'sheetFilters']:
        camera[field] = copy.deepcopy(rows)
    for field in ['picker_filters', 'pickerFilters']:
        camera[field] = [f['uid'] for f in filters]
    for field in ['remote_filters', 'remoteFilters', 'filters']:
        camera[field] = copy.deepcopy(filters)
    payload['entries']['camera_filter_config'] = compact(camera)
    (PUBLIC / 'config/v7.json').write_text(compact(payload))
    (ROOT / 'catalog.json').write_text(json.dumps(report, ensure_ascii=False, indent=2))
    (ROOT / 'src/frames.ts').write_text('export const FRAME_DEFINITIONS = ' + compact(definitions) + ' as const;\n')

    config_script = (ROOT / 'templates/config.js').read_text().replace('__ENTRIES__', compact(payload['entries']))
    config_name = 'config-v7-' + hashlib.sha256(config_script.encode()).hexdigest()[:12] + '.js'
    (PUBLIC / 'modules' / config_name).write_text(config_script)

    secrets = json.loads((REPO / '.lab-secrets.json').read_text())
    key = secrets['LAB_KEY']
    dev_vars = ROOT / '.dev.vars'
    dev_vars.write_text('LAB_KEY=' + json.dumps(key) + '\n')
    dev_vars.chmod(0o600)
    suffix = hashlib.sha256(key.encode()).hexdigest()[:32]
    module_suffix = hashlib.sha256(('v7-module:' + key).encode()).hexdigest()[:32]
    supported = list(definitions) + ['namdz_vintage']
    selector = compact(supported) + '.includes(id)||' + compact(supported) + '.some(function(value){return JSON.stringify(data).indexOf(JSON.stringify(value))>=0;})'
    native = (ROOT / 'templates/native-v7.js').read_text().replace('__KEY__', compact(key)).replace('__SERVER__', compact(ORIGIN)).replace('__SELECT_FILTER__', selector)
    native_name = 'native-v7-' + suffix + '.js'
    (PUBLIC / 'modules' / native_name).write_text(native)
    observer = (ROOT / 'templates/observe.js').read_text().replace('__KEY__', compact(key)).replace('__SERVER__', compact(ORIGIN))
    (PUBLIC / 'modules' / ('observe-v6-' + suffix + '.js')).write_text(observer)

    module = '''#!name=Locket Photobooth V7
#!desc=7 Photobooth + 8 khung riêng; giữ cách truyền ảnh của V6.

[Script]
locket_config_v7 = type=http-response,pattern=^https:\\/\\/firebaseremoteconfig\\.googleapis\\.com\\/v1\\/projects\\/(locket-4252a|641029076083)\\/namespaces\\/firebase(:|%3A)fetch,requires-body=1,max-size=0,script-path=__ORIGIN__/modules/__CONFIG__
locket_frame_v7 = type=http-request,pattern=^https:\\/\\/(api\\.locketcamera\\.com|us-central1-locket-4252a\\.cloudfunctions\\.net)\\/generateFilteredImage(?:[/?]|$),requires-body=1,max-size=0,timeout=60,script-path=__ORIGIN__/modules/__NATIVE__
locket_observe_v7 = type=http-response,pattern=^https:\\/\\/(api\\.locketcamera\\.com|us-central1-locket-4252a\\.cloudfunctions\\.net|namdz-photobooth\\.namvu3121\\.workers\\.dev)\\/generateFilteredImage(?:[/?]|$),requires-body=1,max-size=0,timeout=10,script-path=__ORIGIN__/modules/observe-v6-__SUFFIX__.js

[MITM]
hostname = %APPEND% firebaseremoteconfig.googleapis.com, api.locketcamera.com, us-central1-locket-4252a.cloudfunctions.net, namdz-photobooth.namvu3121.workers.dev
'''
    module = module.replace('__ORIGIN__', ORIGIN).replace('__CONFIG__', config_name).replace('__NATIVE__', native_name).replace('__SUFFIX__', suffix)
    module_name = 'Locket-Photobooth-v7-' + module_suffix + '.sgmodule'
    (PUBLIC / 'modules' / module_name).write_text(module)
    # Preserve the old renderer frame path as well as the new V7 asset path.
    shutil.copy2(find_source('pb_vintage@3x.png'), PUBLIC / 'assets/pb_vintage.png')
    private = ROOT / 'private'
    private.mkdir(exist_ok=True, mode=0o700)
    (private / 'links.json').write_text(json.dumps({'module': ORIGIN + '/modules/' + module_name}, indent=2))
    print(f'Built {len(filters)} filters: 7 Photobooth + 8 Khung; custom-look creation disabled.')


if __name__ == '__main__':
    main()
