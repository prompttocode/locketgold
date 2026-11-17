import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createRequire} from 'node:module';
import {transformSync} from 'esbuild';

const code = transformSync(fs.readFileSync(new URL('src/winter.ts', import.meta.url),'utf8'), {
  loader:'ts',format:'cjs',target:'es2022'
}).code;
const exports = {};
const module = {exports};
let mode = 'success', calls = 0, permitted = true;
const sample = fs.readFileSync(new URL('public/assets/sample.png', import.meta.url));
const sandbox = {exports, module, require:createRequire(import.meta.url), Buffer, FormData, Blob, Response,
  console:{error() {}},Date,Error};
vm.runInNewContext(code,sandbox);
const {winterRequest,winterOutput,generateWinter} = module.exports;
const request = winterRequest(sample);
const readForm = value => new Response(value.multipart.body,{headers:{'content-type':value.multipart.contentType}}).formData();
assert((await readForm(request)).get('prompt').includes('identity'));
assert.throws(()=>winterRequest(Buffer.from('invalid')),e=>e.code==='AI_INVALID_INPUT');
assert.throws(()=>winterOutput({image:'invalid'}),e=>e.code==='AI_INVALID_INPUT');
assert.throws(()=>winterOutput({}),e=>e.code==='AI_NO_IMAGE');
const env = {
  RESULTS:{prepare(sql){
    assert(sql.includes('WHERE attempts<80 RETURNING attempts'));
    return {bind(day){assert.match(day,/^\d{4}-\d{2}-\d{2}$/);return {async first(){return permitted?{attempts:1}:null;}};}};
  }},
  AI:{run: async (model, input) => {
    calls++;
    assert.equal(model,'@cf/black-forest-labs/flux-2-klein-4b');
    const form = await readForm(input);
    assert.equal(form.get('width'),'1024');
    assert.equal(form.get('height'),'1024');
    assert.deepEqual(Buffer.from(await form.get('input_image_0').arrayBuffer()),sample);
    assert.equal(form.get('input_image_1'),null);
    if (mode === 'quota') throw new Error('429 quota exceeded private detail');
    if (mode === 'timeout') throw new Error('network private detail');
    if (mode === 'blocked') return {};
    return {image:sample.toString('base64')};
  }}
};
assert.deepEqual(Buffer.from(await generateWinter(sample,env)),sample);
for (const [next,code,status] of [['quota','AI_CLOUDFLARE_QUOTA',429],['timeout','AI_CLOUDFLARE_FAILED',502],['blocked','AI_NO_IMAGE',422]]) {
  mode=next;
  const before=calls;
  await assert.rejects(()=>generateWinter(sample,env),e=>e.code===code&&e.status===status&&!e.message.includes('private'));
  assert.equal(calls,before+1,'AI must not silently retry paid generations');
}
permitted=false;
const before=calls;
await assert.rejects(()=>generateWinter(sample,env),e=>e.code==='AI_DAILY_LIMIT'&&e.status===429);
assert.equal(calls,before,'Daily cap must stop before inference');
console.log('PASS: Workers AI multipart/reference image, output, refusal/quota/network errors, daily cap, no implicit retries.');
