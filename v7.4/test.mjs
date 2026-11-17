import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const root=new URL('.',import.meta.url),read=name=>fs.readFileSync(new URL(name,root),'utf8');
const links=JSON.parse(read('private/links.json'));
const urls=content=>[...content.matchAll(/script-path=(https:\/\/[^\s,]+)/g)].map(m=>m[1]);
const scripts=urls(read('public'+new URL(links.module).pathname));
const stableScripts=urls(read('public'+new URL(links.stable_module).pathname));
assert.equal(scripts.length,3);assert.equal(scripts[0],stableScripts[0]);
const native=read('public'+new URL(scripts[1]).pathname),recover=read('public'+new URL(scripts[2]).pathname);
const original=read('public'+new URL(stableScripts[1]).pathname);
const success=JSON.stringify({result:{status:200,outputUrl:'https://example.invalid/PRIVATE_RESULT'}});
const gateway={status:502,headers:{Via:'gateway','Content-Type':'text/plain'},body:'Bad Gateway'};
const body='{"data":{"filter_id":"pb_vintage","image_url":"https://storage.googleapis.com/PRIVATE_IMAGE","note":"Tuyết ❄️"}}';
function store(){const map=new Map();return {map,read:key=>map.get(key)||'',write(value,key){map.set(key,value);return true;}};}
function request(body,persistence=store(),code=native){
 let result,count=0;const logs=[];
 vm.runInNewContext(code,{$request:{url:'https://api.locketcamera.com/generateFilteredImage',method:'POST',body,
  headers:{'Content-Type':'application/json',Authorization:'PRIVATE_AUTH',Cookie:'PRIVATE_COOKIE'}},
  $persistentStore:persistence,$done(value){count++;result=value;},console:{log:line=>logs.push(line)},ArrayBuffer,Uint8Array,TextDecoder});
 assert.equal(count,1);assert(!logs.join('\n').includes('PRIVATE_'));
 return {result:JSON.parse(JSON.stringify(result)),persistence,logs};
}
async function response(prepared,upstream=gateway,options={}){
 let result,count=0,calls=0,sent;const logs=[];
 vm.runInNewContext(recover,{$request:{url:'https://namdz-photobooth.namvu3121.workers.dev/generateFilteredImage',headers:options.headers||prepared.result.headers||{}},
  $response:upstream,$persistentStore:prepared.persistence,
  $httpClient:{post(value,cb){calls++;sent=value;
   assert.equal(value.url,'https://namdz-photobooth.namvu3121.workers.dev/generateFilteredImage');
   assert.equal(value.timeout,55);assert.equal(value.headers.Authorization,undefined);assert.equal(value.headers.Cookie,undefined);
   assert.equal(value.headers['X-Namdz-Pending'],undefined);
   if(options.throw)throw new Error('PRIVATE_ERROR');
   queueMicrotask(()=>{
    cb(options.error||null,options.response||{status:200},options.output===undefined?success:options.output);
    cb(null,{status:200},success);
   });
  }},
  $done(value){count++;result=value;},console:{log:line=>logs.push(line)},ArrayBuffer,Uint8Array,TextDecoder});
 await new Promise(resolve=>setImmediate(resolve));
 assert.equal(count,1);assert(calls<=1);assert.equal(result.response,undefined,'Response hook must use top-level fields');
 assert(!logs.join('\n').includes('PRIVATE_'));
 return {result:JSON.parse(JSON.stringify(result)),calls,sent,logs};
}
let cases=0;
const camera=JSON.parse(JSON.parse(read('public/config/v7.json')).entries.camera_filter_config);
for(const filter of [...camera.remote_filters,{uid:'namdz_vintage'}]){
 for(const field of ['filter_id','filterId','filter_uid','filterUid','prompt']){
  const raw=JSON.stringify({data:{[field]:filter.uid,image_url:'https://storage.googleapis.com/PRIVATE_IMAGE',note:'Tuyết ❄️'}});
  for(const value of [raw,new TextEncoder().encode(raw),JSON.parse(raw)]){
   const prepared=request(value),before=request(value,undefined,original);
   assert(prepared.result.headers['X-Namdz-Pending']);
   const comparable=JSON.parse(JSON.stringify(prepared.result));delete comparable.headers['X-Namdz-Pending'];
   assert.deepEqual(comparable,before.result);
   assert.equal(prepared.result.body,undefined);assert.equal(prepared.result.method,undefined);
   const result=await response(prepared);
   assert.equal(result.calls,1);assert.equal(result.result.status,200);assert.equal(result.result.body,success);
   assert.equal(result.sent.body,raw);assert([...prepared.persistence.map.values()].every(v=>!v));
   const duplicate=await response(prepared);assert.equal(duplicate.calls,0);assert.deepEqual(duplicate.result,{});cases++;
  }
 }
}
for(const upstream of [
 {status:200,headers:{},body:success},
 {...gateway,status:401},{...gateway,status:429},
 {...gateway,headers:{...gateway.headers,'CF-Ray':'PRIVATE_CF_RAY'}},
 {...gateway,headers:{...gateway.headers,Server:'cloudflare'}},
 {...gateway,headers:{Via:'gateway','Content-Type':'application/json'}},
 {...gateway,headers:{'Content-Type':'text/plain'}},
 {...gateway,body:'Internal error'},{...gateway,body:'Bad Gateway'+'x'.repeat(4096)}]){
 const prepared=request(body),result=await response(prepared,upstream);
 assert.equal(result.calls,0);assert.deepEqual(result.result,{});assert([...prepared.persistence.map.values()].every(v=>!v));
}
for(const options of [{error:'PRIVATE_ERROR'},{throw:true},{output:'not JSON'},{output:'null'},{output:'[]'},{output:'x'.repeat(65537)}]){
 const result=await response(request(body),gateway,options);assert.deepEqual(result.result,{});assert.equal(result.calls,1);
}
for(const status of [401,429,502]){
 const output=JSON.stringify({error:{message:'PRIVATE_SERVER_ERROR'}});
 const result=await response(request(body),gateway,{response:{statusCode:status},output});
 assert.equal(result.result.status,status);assert.equal(result.result.body,output);
}
for(const input of [undefined,null,'PRIVATE_INVALID_JSON',JSON.stringify({data:{filter_id:'other'}})]){
 const result=request(input);assert.deepEqual(result.result,request(input,undefined,original).result);assert.equal(result.persistence.map.size,0);
}
{
 const full=store();for(let i=0;i<16;i++)full.map.set('namdz.v74.pending.'+i,JSON.stringify({expires:Date.now()+100000}));
 const result=request(body,full);assert.equal(result.result.headers['X-Namdz-Pending'],undefined);assert.equal(full.map.size,16);
}
{
 const result=request(body,null);assert.equal(result.result.headers['X-Namdz-Pending'],undefined);
}
{
 const result=request(JSON.stringify({data:{filter_id:'pb_vintage',image:'x'.repeat(65536)}}));assert.equal(result.result.headers['X-Namdz-Pending'],undefined);
}
for(const mutation of ['expired','replaced']){
 const prepared=request(body),key=[...prepared.persistence.map.keys()][0];
 const entry=JSON.parse(prepared.persistence.map.get(key));
 if(mutation==='expired')entry.expires=1;else entry.nonce='different';
 prepared.persistence.map.set(key,JSON.stringify(entry));
 const actual=await response(prepared);assert.equal(actual.calls,0);assert.deepEqual(actual.result,{});
}
{
 const prepared=request(body),actual=await response(prepared,gateway,{headers:{}});assert.equal(actual.calls,0);assert.deepEqual(actual.result,{});
}
function preserve(directory,relative=''){
 for(const entry of fs.readdirSync(directory,{withFileTypes:true})){
  const name=relative+entry.name;
  if(entry.isDirectory())preserve(new URL(entry.name+'/',directory),name+'/');
  else assert.deepEqual(fs.readFileSync(new URL(entry.name,directory)),fs.readFileSync(new URL('public/'+name,root)),name+' changed');
 }
}
preserve(new URL('../v7.3/public/',root));
console.log(`PASS: ${cases} filter/body pairs; V7 routing preserved; one response-hook recovery; success/quota/JSON errors never retried; cache bounded/consumed/correlated; no private logs or credential forwarding; older assets unchanged.`);
