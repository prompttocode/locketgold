import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const root=new URL('.',import.meta.url);
const read=name=>fs.readFileSync(new URL(name,root),'utf8');
const links=JSON.parse(read('private/links.json'));
const module=read('public'+new URL(links.module).pathname);
const scripts=[...module.matchAll(/script-path=(https:\/\/[^\s,]+)/g)].map(m=>m[1]);
assert.equal(scripts.length,2);
assert(module.includes('timeout=60'));
assert(module.includes('V7.2 Relay Test'));
const code=read('public'+new URL(scripts[1]).pathname);
const responseBody=JSON.stringify({result:{outputUrl:'https://example.invalid/PRIVATE_RESULT',status:200}});

async function run(body,options={}){
 let calls=0,completions=0,result,requestOptions;const logs=[];
 const context={
  $request:{url:options.url||'https://api.locketcamera.com/generateFilteredImage',method:'POST',body,
   headers:{Authorization:'PRIVATE_AUTH',Cookie:'PRIVATE_COOKIE',Host:'api.locketcamera.com','Content-Length':'9999','Content-Type':'application/json',...(options.headers||{})}},
  $httpClient:{post(request,callback){calls++;requestOptions=request;
   assert(!('Authorization' in request.headers));assert(!('Cookie' in request.headers));
   assert(!('Host' in request.headers));assert(!('Content-Length' in request.headers));
   assert.equal(request.url,'https://namdz-photobooth.namvu3121.workers.dev/generateFilteredImage');
   assert.equal(request.timeout,55);
   if(options.throwBefore)throw new Error('PRIVATE_ERROR');
   queueMicrotask(()=>{
    callback(options.error||null,options.response===null?null:options.response||{status:200},options.output===undefined?responseBody:options.output);
    // A duplicate callback must not deliver a second response or retry the POST.
    if(options.duplicate)callback(null,{status:200},responseBody);
   });
  }},
  $done(value){completions++;result=value;},console:{log:line=>logs.push(line)},
  ArrayBuffer,Uint8Array,TextDecoder:options.noDecoder?undefined:TextDecoder
 };
 if(options.noRequest)delete context.$request;
 if(options.noClient)delete context.$httpClient;
 vm.runInNewContext(code,context);
 await new Promise(resolve=>setImmediate(resolve));
 assert.equal(completions,1);assert(calls<=1);
 assert(!logs.join('\n').includes('PRIVATE_'));
 assert.equal(result.url,undefined,'Must never rewrite the original upstream URL');
 return {calls,result:JSON.parse(JSON.stringify(result)),requestOptions,logs};
}
const camera=JSON.parse(JSON.parse(read('public/config/v7.json')).entries.camera_filter_config);
let cases=0;
for(const filter of [...camera.remote_filters,{uid:'namdz_vintage'}]){
 for(const field of ['filter_id','filterId','filter_uid','filterUid','prompt']){
  const text=JSON.stringify({data:{[field]:filter.uid,image_url:'https://example.invalid/PRIVATE_INPUT',note:'Tuyết ❄️'}});
  const padded=new Uint8Array(new TextEncoder().encode('xx'+text+'yy'));
  for(const body of [text,new TextEncoder().encode(text),padded.subarray(2,-2),JSON.parse(text)]){
   const actual=await run(body,{duplicate:true});
   assert.equal(actual.calls,1);assert.equal(actual.requestOptions.body,text);
   assert.equal(actual.result.response.status,200);assert.equal(actual.result.response.body,responseBody);cases++;
  }
 }
}
const body='{"data":{"filter_id":"ai_winter","note":"Tuyết ❄️"}}';
const bytes=new TextEncoder().encode(body);
assert.equal((await run(bytes,{noDecoder:true})).requestOptions.body,body);
for(const response of [{status:200},{statusCode:200},{status:'HTTP/1.1 200 OK'}]){
 for(const output of [responseBody,JSON.parse(responseBody),new TextEncoder().encode(responseBody)]){
  const actual=await run(body,{response,output});assert.equal(actual.result.response.body,responseBody);
 }
}
for(const [status,error] of [[401,'UNAUTHENTICATED'],[429,'RESOURCE_EXHAUSTED'],[502,'UNAVAILABLE']]){
 const output=JSON.stringify({error:{status:error,message:'PRIVATE_SERVER_ERROR'}});
 const actual=await run(body,{response:{status},output});
 assert.equal(actual.result.response.status,status);assert.equal(actual.result.response.body,output);assert.equal(actual.calls,1);
}
for(const options of [{error:'PRIVATE_ERROR',duplicate:true},{response:null},{throwBefore:true},{response:{}},
 {output:'Bad Gateway PRIVATE_UPSTREAM'},{output:'null'},{output:'[]'},{output:'x'.repeat(65537)},{noClient:true}]){
 const actual=await run(body,options);assert.equal(actual.result.response.status,502);
 assert(!JSON.stringify(actual.result).includes('PRIVATE_'));
}
for(const input of [undefined,null,'not json',JSON.stringify({data:{filter_id:'other'}})]){
 const actual=await run(input);assert.equal(actual.calls,0);assert.deepEqual(actual.result,{});
}
for(const url of ['https://namdz-photobooth.namvu3121.workers.dev/generateFilteredImage','https://api.locketcamera.com/other']){
 const actual=await run(body,{url});assert.equal(actual.calls,0);assert.deepEqual(actual.result,{});
}
assert.equal((await run(body,{noRequest:true})).calls,0);
const encoded=await run(body,{headers:{'Content-Encoding':'gzip'}});
assert.equal(encoded.calls,0);assert.equal(encoded.result.response.status,502);

// Preserve every V7.1 asset, including all stable V7 scripts, config and images.
function preserve(directory,relative=''){
 for(const entry of fs.readdirSync(directory,{withFileTypes:true})){
  const name=relative+entry.name;
  if(entry.isDirectory())preserve(new URL(entry.name+'/',directory),name+'/');
  else assert.deepEqual(fs.readFileSync(new URL(entry.name,directory)),fs.readFileSync(new URL('public/'+name,root)),name+' changed');
 }
}
preserve(new URL('../v7.1/public/',root));
assert.equal(scripts[0],[...read('public'+new URL(links.stable_module).pathname).matchAll(/script-path=(https:\/\/[^\s,]+)/g)][0][1]);
console.log(`PASS: ${cases} filter/body variants; async response/status/errors; exactly one call/completion; no credential forwarding, URL rewrite or telemetry; all V7/V7.1 assets preserved.`);
