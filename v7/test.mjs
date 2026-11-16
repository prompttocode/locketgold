import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import crypto from 'node:crypto';
import path from 'node:path';

const root = new URL('.', import.meta.url);
const read = (name) => fs.readFileSync(new URL(name, root), 'utf8');
const baseline = JSON.parse(read('base-config.json'));
const payload = JSON.parse(read('public/config/v7.json'));
const changed = Object.keys(payload.entries).filter(key => payload.entries[key] !== baseline.entries[key]);
assert.deepEqual(changed.sort(), ['allows_custom_filters', 'camera_filter_config']);
const config = JSON.parse(payload.entries.camera_filter_config);
assert.equal(config.allows_custom_filters, false);
assert.equal(config.allowsCustomFilters, false);
assert.equal(payload.entries.custom_filters_enabled, baseline.entries.custom_filters_enabled);
assert.equal(payload.entries.allows_custom_filters, 'false');
assert.deepEqual(config.sheet_filters.map(row => row.title.vi), ['Photobooth', 'Khung']);
assert.deepEqual(config.sheet_filters, config.sheetFilters);
assert.deepEqual(config.remote_filters, config.remoteFilters);
assert.deepEqual(config.remote_filters, config.filters);
assert.deepEqual(config.picker_filters, config.pickerFilters);
assert.equal(config.remote_filters.length, 15);
assert.equal(new Set(config.picker_filters).size, 15);
assert.equal(config.sheet_filters[0].filter_ids.length, 7);
assert.equal(config.sheet_filters[1].filter_ids.length, 8);
assert.equal(config.remote_filters[0].name, 'Vintage 2×2');
assert(!/Namdz|NAMDZ|Trò Chơi|AI 3D/i.test(JSON.stringify(config.sheet_filters)));
assert(!/Namdz|NAMDZ/i.test(config.remote_filters.map(f => f.name).join(',')));
for (const item of config.remote_filters) {
  assert(config.picker_filters.includes(item.uid));
  assert.equal(item.uid, item.prompt);
  assert(item.imageUrl.includes('/assets/v7/'));
  assert(fs.existsSync(new URL('public' + new URL(item.imageUrl).pathname, root)));
}

const links = JSON.parse(read('private/links.json'));
const module = read('public' + new URL(links.module).pathname);
const lines = module.split('\n').filter(line => line.includes('script-path='));
assert.equal(lines.length, 3);
let rewritten;
const configUrl = new URL(lines[0].split('script-path=')[1]);
const configCode = read('public' + configUrl.pathname);
for (const project of ['locket-4252a', '641029076083']) {
  vm.runInNewContext(configCode, {
    $request: {url: `https://firebaseremoteconfig.googleapis.com/v1/projects/${project}/namespaces/firebase:fetch?key=test`},
    $response: {body: '{"state":"NO_CHANGE","entries":{"unrelated":"keep"}}'},
    $done: value => { rewritten = value; }, console: {log() {}}
  });
  const result = JSON.parse(rewritten.body);
  assert.equal(result.state, 'UPDATE');
  assert.equal(result.entries.unrelated, 'keep');
  assert.equal(result.entries.camera_filter_config, payload.entries.camera_filter_config);
}

const nativeUrl = new URL(lines[1].split('script-path=')[1]);
const nativeCode = read('public' + nativeUrl.pathname);
const runRoute = body => {
  let output, count = 0;
  vm.runInNewContext(nativeCode, {
    $request: {url: 'https://api.locketcamera.com/generateFilteredImage', method: 'POST', body,
      headers: {Authorization: 'do-not-forward', 'Content-Type': 'application/json', 'Content-Length': '123'}},
    $httpClient: {post(options, callback) { callback(null, {status: 200}, '{}'); }},
    $done: result => { output = result; count++; }, console: {log() {}},
    ArrayBuffer, Uint8Array, TextDecoder
  });
  assert.equal(count, 1);
  return output;
};
for (const filter of config.remote_filters) {
  for (const field of ['filter_id', 'filterId', 'filter_uid', 'filterUid', 'prompt']) {
    const result = runRoute(JSON.stringify({data: {[field]: filter.uid, image_url: 'https://example.invalid/input'}}));
    assert(result.url.endsWith('/generateFilteredImage'));
    assert.equal(result.method, undefined);
    assert.equal(result.body, undefined); // V6 preservation behavior stays unchanged.
    assert.equal(result.headers.Authorization, undefined);
    assert.equal(result.headers['X-Namdz-Route'], 'native-v7');
  }
}
assert.equal(Object.keys(runRoute('{"data":{"filter_id":"unrelated_filter"}}')).length, 0);
assert(runRoute(new TextEncoder().encode('{"data":{"filter_id":"pb_vintage"}}')).url);

// Old module routing resources must remain unchanged so V6 can still be used.
const oldModules = new URL('../rollback-snapshots/v6-popup-hnam/public/modules/', root);
for (const name of fs.existsSync(oldModules) ? fs.readdirSync(oldModules).filter(name => /^(native|observe)-v6-.*\.js$/.test(name)) : []) {
  const before = fs.readFileSync(new URL(name, oldModules));
  const after = fs.readFileSync(new URL('public/modules/' + name, root));
  assert.equal(crypto.createHash('sha256').update(before).digest('hex'), crypto.createHash('sha256').update(after).digest('hex'));
}
console.log('PASS: 15 filters, two groups, preserved unrelated config, 75 routing cases, binary input, V6 assets unchanged.');
