import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const root=new URL('.',import.meta.url);
const read=name=>fs.readFileSync(new URL(name,root),'utf8');
const links=JSON.parse(read('private/links.json'));
const module=read('public'+new URL(links.module).pathname);
const urls=content=>[...content.matchAll(/script-path=(https:\/\/[^\s,]+)/g)].map(m=>m[1]);
const scripts=urls(module),stableScripts=urls(read('public'+new URL(links.stable_module).pathname));
assert.equal(scripts.length,3);assert.equal(scripts[0],stableScripts[0]);
assert(module.includes('V7.3 Warmup Test'));assert(module.includes('timeout=60'));
const code=read('public'+new URL(scripts[1]).pathname);
const original=read('public'+new URL(stableScripts[1]).pathname);
const observer=read('public'+new URL(scripts[2]).pathname);
assert(!code.includes('$httpClient.post'));assert(!code.includes('/v1/relay-report'));

function run(script,body,options={}){
 let result,count=0,callback,timer,probe,cleared=false;const logs=[];
 const context={
  $request:{url:'https://api.locketcamera.com/generateFilteredImage?PRIVATE_QUERY',method:'POST',body,
   headers:{Authorization:'PRIVATE_AUTH',Cookie:'PRIVATE_COOKIE','Content-Type':'application/json','Content-Length':'1788'}},
  $done:value=>{result=value;count++;},console:{log:line=>logs.push(line)},
  ArrayBuffer,Uint8Array,TextDecoder:options.noDecoder?undefined:TextDecoder,
  setTimeout(fn,ms){assert.equal(ms,3500);timer=fn;return 1;},
  clearTimeout(id){assert.equal(id,1);cleared=true;},
  $httpClient:{get(request,cb){
   assert(!probe,'Only one probe allowed');probe=request;callback=cb;
   assert.equal(request.url,'https://namdz-photobooth.namvu3121.workers.dev/health');
   assert.equal(request.timeout,3);
   assert.equal(request.body,undefined);
   assert.deepEqual(Object.keys(request.headers).sort(),['Accept','Cache-Control','X-Namdz-Route']);
   assert(!JSON.stringify(request).includes('PRIVATE_'));
   if(options.throw)throw new Error('PRIVATE_NETWORK_ERROR');
   if(options.sync)cb(null,{status:200},'PRIVATE_HEALTH_BODY');
  }}
 };
 if(options.noClient)delete context.$httpClient;
 if(options.noTimer){delete context.setTimeout;delete context.clearTimeout;}
 if(options.noRequest)delete context.$request;
 if(options.response)context.$response=options.response;
 vm.runInNewContext(script,context);
 if(callback&&!options.sync){
  if(options.watchdog){assert(timer);timer();}
  else if(!options.throw)assert.equal(count,0,'Must wait for probe before rewriting');
  callback(options.error||null,options.reply||{status:200},'PRIVATE_HEALTH_BODY');
  callback(null,{status:200},'PRIVATE_DUPLICATE_BODY');
 }
 assert.equal(count,1);assert(!logs.join('\n').includes('PRIVATE_'));
 if(probe&&!options.noTimer)assert(cleared,'Must clear watchdog');
 return {result:JSON.parse(JSON.stringify(result)),probe,logs};
}
let cases=0;
const camera=JSON.parse(JSON.parse(read('public/config/v7.json')).entries.camera_filter_config);
for(const filter of [...camera.remote_filters,{uid:'namdz_vintage'}]){
 for(const field of ['filter_id','filterId','filter_uid','filterUid','prompt']){
  const raw=JSON.stringify({data:{[field]:filter.uid,image_url:'https://storage.googleapis.com/PRIVATE_IMAGE',note:'Tuyết ❄️'}});
  const padded=new TextEncoder().encode('xx'+raw+'yy');
  for(const body of [raw,new TextEncoder().encode(raw),padded.subarray(2,-2),JSON.parse(raw)]){
   const after=run(code,body);assert(after.probe);assert.deepEqual(after.result,run(original,body).result);cases++;
  }
 }
}
const body='{"data":{"filter_id":"ai_winter"}}';
for(const options of [{error:'PRIVATE_ERROR'},{reply:{statusCode:503}},{reply:{status:'HTTP/1.1 200 OK'}},
 {throw:true},{sync:true},{watchdog:true},{noClient:true},{noTimer:true},{noDecoder:true}]){
 const input=options.noDecoder?new TextEncoder().encode(body):body;
 assert.deepEqual(run(code,input,options).result,run(original,input,options).result);
}
for(const input of [null,undefined,'PRIVATE_INVALID_JSON',JSON.stringify({data:{filter_id:'other'}})]){
 const actual=run(code,input);assert(!actual.probe);assert.deepEqual(actual.result,run(original,input).result);
}
assert.deepEqual(run(code,undefined,{noRequest:true}).result,{});
const observed=run(observer,undefined,{response:{status:502,headers:{Via:'PRIVATE_VIA','Content-Type':'text/plain'},body:'Bad Gateway PRIVATE_ERROR'}});
assert.deepEqual(observed.result,{});
const report=JSON.parse(observed.logs[0].replace('NAMDZDBG ',''));
assert.equal(report.revision,'7.3');assert.equal(report.status,502);assert.equal(report.has_via,true);
function preserve(directory,relative=''){
 for(const entry of fs.readdirSync(directory,{withFileTypes:true})){
  const name=relative+entry.name;
  if(entry.isDirectory())preserve(new URL(entry.name+'/',directory),name+'/');
  else assert.deepEqual(fs.readFileSync(new URL(entry.name,directory)),fs.readFileSync(new URL('public/'+name,root)),name+' changed');
 }
}
preserve(new URL('../v7.2/public/',root));
console.log(`PASS: ${cases} variants preserve V7 rewrite; one health probe, no payload/auth/render; timeout/error/duplicate fallback; console-only observer; older assets unchanged.`);
