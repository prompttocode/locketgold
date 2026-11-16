// Optional integration test: calls the deployed renderer with its own sample PNG.
// Output is local under ignored private/; never use real user photos here.
import fs from 'node:fs';
import assert from 'node:assert/strict';

const root = new URL('.', import.meta.url);
const origin = 'https://namdz-photobooth.namvu3121.workers.dev';
const key = JSON.parse(fs.readFileSync(new URL('../.lab-secrets.json', root), 'utf8')).LAB_KEY;
const catalog = JSON.parse(fs.readFileSync(new URL('catalog.json', root), 'utf8'));
const links = JSON.parse(fs.readFileSync(new URL('private/links.json', root), 'utf8'));
const get = async url => {
  const response = await fetch(url, {signal: AbortSignal.timeout(45000)});
  assert.equal(response.status, 200, 'public resource must return 200');
  return response;
};
const health = await (await get(origin + '/health')).json();
assert.equal(health.renderer, 'photobooth-v7');
const module = await (await get(links.module)).text();
for (const match of module.matchAll(/script-path=(https:\/\/[^\s,]+)/g)) await get(match[1]);
const dir = new URL('private/results/', root);
fs.mkdirSync(dir, {recursive: true, mode: 0o700});
const records = [];
const queue = [...catalog, {id: 'namdz_vintage', name: 'Legacy V6 Vintage'}];
async function work() {
  for (;;) {
    const frame = queue.shift();
    if (!frame) return;
    const started = Date.now();
    const response = await fetch(origin + '/generateFilteredImage', {
      method: 'POST', headers: {'Content-Type': 'application/json', 'X-Namdz-Key': key, 'X-Namdz-Route': 'native-v7'},
      body: JSON.stringify({data: {filter_id: frame.id, image_url: origin + '/assets/sample.png'}}),
      signal: AbortSignal.timeout(60000)
    });
    const result = await response.json();
    assert.equal(response.status, 200, 'render must return 200 for ' + frame.id);
    assert.equal(result.result.status, 200);
    assert(result.result.outputUrl.startsWith(origin + '/results/'));
    const image = await get(result.result.outputUrl);
    const bytes = Buffer.from(await image.arrayBuffer());
    assert.equal(bytes[0], 255); assert.equal(bytes[1], 216);
    fs.writeFileSync(new URL(frame.id + '.jpg', dir), bytes, {mode: 0o600});
    const record = {id: frame.id, render_status: response.status, image_status: image.status,
      jpeg_bytes: bytes.length, elapsed_ms: Date.now() - started};
    records.push(record); console.log(JSON.stringify(record));
  }
}
await Promise.all([work(), work(), work()]);
fs.writeFileSync(new URL('private/live-test-results.json', root), JSON.stringify(records, null, 2), {mode: 0o600});
console.log('PASS: 15 frames + legacy V6 alias rendered and downloaded as JPEG.');
