import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const root=new URL('.',import.meta.url);
const read=(file)=>fs.readFileSync(new URL(file,root),'utf8');
const links=JSON.parse(read('private/links.json'));
const module=read('public'+new URL(links.module).pathname);
const urls=[...module.matchAll(/script-path=(https:\/\/[^\s,]+)/g)].map(m=>new URL(m[1]));
assert.equal(urls.length,3);
assert(module.includes('#!name=Locket Photobooth V7.1 Debug'));
const stable=read('public'+new URL(links.stable_module).pathname);
const baseUrls=[...stable.matchAll(/script-path=(https:\/\/[^\s,]+)/g)].map(m=>new URL(m[1]));
assert.equal(urls[0].href,baseUrls[0].href);
const original=read('public'+baseUrls[1].pathname);
const candidate=read('public'+urls[1].pathname);
const observer=read('public'+urls[2].pathname);
assert(!/\$httpClient|\$task|\bfetch\s*\(/.test(candidate+observer));
function run(code,body,response){
 let result,count=0;const logs=[];
 vm.runInNewContext(code,{
  $request:{url:'https://api.locketcamera.com/generateFilteredImage?token=PRIVATE_URL',body,
   headers:{Authorization:'PRIVATE_AUTH','Content-Type':'application/json','Content-Length':'123'}},
  $response:response,
  $done:value=>{result=value;count++;},console:{log:line=>logs.push(line)},
  ArrayBuffer,Uint8Array,TextDecoder
 });
 assert.equal(count,1);
 assert(!logs.join('\n').includes('PRIVATE_'));
 return {result:JSON.parse(JSON.stringify(result)),logs};
}
const config=JSON.parse(JSON.parse(read('public/config/v7.json')).entries.camera_filter_config);
for(const filter of config.remote_filters){
 for(const field of ['filter_id','filterId','filter_uid','filterUid','prompt']){
  const body=JSON.stringify({data:{[field]:filter.uid,image_url:'https://storage.googleapis.com/PRIVATE_IMAGE'}});
  const before=run(original,body);const after=run(candidate,body);
  assert.deepEqual(after.result,before.result);
  assert(after.logs.some(s=>s.includes('"rewritten":true')));
 }
}
for(const body of [undefined,null,'PRIVATE_INVALID_JSON',new Uint8Array([31,139,0]),
 JSON.stringify({data:{filter_id:'other',image:'PRIVATE_IMAGE'}}),
 new TextEncoder().encode('{"data":{"filter_id":"ai_winter"}}'),
 {data:{filter_id:'pb_vintage',image:'PRIVATE_IMAGE'}}]){
 const after=run(candidate,body);
 assert.deepEqual(after.result,run(original,body).result);
}
const failed=run(candidate,'PRIVATE_INVALID_JSON');
assert(failed.logs.some(s=>s.includes('"stage":"decode_error"')));
for(const status of [502,'HTTP/1.1 502 Bad Gateway']){
 const out=run(observer,undefined,{status,headers:{Server:'cloudflare','cf-ray':'PRIVATE_RAY','content-type':'text/html'},
  body:'Bad Gateway: upstream TLS error PRIVATE_RESPONSE'});
 assert.deepEqual(out.result,{});
 const log=JSON.parse(out.logs[0].replace('NAMDZDBG ',''));
 assert.equal(log.status,502);assert.equal(log.has_cf_ray,true);
 assert(log.markers.includes('bad gateway'));assert(log.markers.includes('tls'));
}
assert.deepEqual(run(observer,undefined,{statusCode:200,headers:{},body:'PRIVATE_IMAGE_URL'}).result,{});
// All stable module assets and Worker code must match the V7 snapshot.
for(const name of fs.readdirSync(new URL('../v7/public/modules/',root))){
 assert.deepEqual(fs.readFileSync(new URL('public/modules/'+name,root)),fs.readFileSync(new URL('../v7/public/modules/'+name,root)));
}
for(const name of ['index.ts','winter.ts','frames.ts'])assert.equal(read('src/'+name),read('../v7/src/'+name));
console.log('PASS: V7.1 matches V7 routing for 87 cases, never logs private fields or sends telemetry; response unchanged; stable V7 assets/code preserved.');
