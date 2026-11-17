// One real AI inference using a synthetic sample, through V7.4 recovery.
// This validates the pipeline, not portrait identity or the iPhone UI.
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
const repo=new URL('../',import.meta.url);
const shared=process.argv[2]==='minh1011';
const filterId=process.argv[3]||'ai_luxury';
assert(['ai_winter','ai_luxury','ai_grab','ai_bee'].includes(filterId));
const root=new URL(shared?'deployments/minh1011/':'v7.4/',repo);
const read=name=>fs.readFileSync(new URL(name,root),'utf8');
const links=JSON.parse(read('private/links.json'));
const origin=new URL(links.module).origin;
const key=shared?JSON.parse(read('private/secrets.json')).LAB_KEY:JSON.parse(fs.readFileSync(new URL('.lab-secrets.json',repo),'utf8')).LAB_KEY;
const hash=value=>crypto.createHash('sha256').update(value).digest('hex');
const response=await fetch(links.module,{signal:AbortSignal.timeout(15000)});assert.equal(response.status,200);
const module=await response.text();assert.equal(hash(module),hash(read('public'+new URL(links.module).pathname)));
const scripts=[];
for(const match of module.matchAll(/script-path=(https:\/\/[^\s,]+)/g)){
 const response=await fetch(match[1],{signal:AbortSignal.timeout(15000)});assert.equal(response.status,200);
 const source=await response.text();assert.equal(hash(source),hash(read('public'+new URL(match[1]).pathname)));scripts.push(source);
}
assert.equal(scripts.length,3);
let configResponse;
vm.runInNewContext(scripts[0],{$request:{url:'https://firebaseremoteconfig.googleapis.com/v1/projects/locket-4252a/namespaces/firebase:fetch'},
 $response:{body:'{"entries":{}}'},$done:value=>configResponse=value,console:{log(){}}});
const config=JSON.parse(JSON.parse(configResponse.body).entries.camera_filter_config);
assert.deepEqual(Array.from(config.sheet_filters[2].filter_ids),['ai_winter','ai_luxury','ai_grab','ai_bee']);
const filter=config.remote_filters.find(f=>f.uid===filterId);
assert.equal(filter.name,({ai_winter:'Mùa đông',ai_luxury:'Sang trọng',ai_grab:'Grab',ai_bee:'Bee'})[filterId]);
const icon=await fetch(filter.iconUrl,{signal:AbortSignal.timeout(15000)});assert.equal(icon.status,200);
assert.equal(new URL(filter.iconUrl).origin,origin);await icon.arrayBuffer();
const health=await(await fetch(origin+'/health')).json();assert.equal(health.filter_count,19);
const map=new Map(),persistence={read:key=>map.get(key)||'',write(value,key){map.set(key,value);return true;}};
let rewritten;
const input=JSON.stringify({data:{filter_id:filterId,image_url:origin+'/assets/sample.png'}});
vm.runInNewContext(scripts[1],{$request:{url:'https://api.locketcamera.com/generateFilteredImage',headers:{'Content-Type':'application/json'},body:input},
 $persistentStore:persistence,$done:value=>rewritten=value,console:{log(){}},ArrayBuffer,Uint8Array,TextDecoder});
assert.equal(rewritten.url,origin+'/generateFilteredImage');assert(rewritten.headers['X-Namdz-Key']===key,'Renderer key must match deployment');
assert(rewritten.headers['X-Namdz-Pending']);
let calls=0;const started=Date.now();
const output=await new Promise((resolve,reject)=>{
 vm.runInNewContext(scripts[2],{$request:{url:rewritten.url,headers:rewritten.headers},
  $response:{status:502,headers:{Via:'test','Content-Type':'text/plain'},body:'Bad Gateway'},$persistentStore:persistence,
  $httpClient:{post(options,cb){calls++;(async()=>{
   try{const response=await fetch(options.url,{method:'POST',headers:options.headers,body:options.body,signal:AbortSignal.timeout(options.timeout*1000)});cb(null,{status:response.status},await response.text());}
   catch(_){cb('network_error',null,null);}
  })().catch(reject);}},$done:resolve,console:{log:line=>console.log(line)},ArrayBuffer,Uint8Array,TextDecoder});
});
assert.equal(calls,1);assert.equal(output.response,undefined);
if(output.status!==200){
 console.log(JSON.stringify({test:'ai_recovery',filter:filterId,account:shared?'minh1011':'nam',status:output.status||0,code:output.body?JSON.parse(output.body).error?.code:undefined}));
 process.exitCode=1;
}else{
 const data=JSON.parse(output.body);assert.equal(data.result.status,200);assert.equal(new URL(data.result.outputUrl).origin,origin);
 const image=await fetch(data.result.outputUrl,{signal:AbortSignal.timeout(15000)});assert.equal(image.status,200);
 const bytes=Buffer.from(await image.arrayBuffer());assert.equal(bytes[0],255);assert.equal(bytes[1],216);
 fs.writeFileSync(new URL('private/'+filterId+'-live.jpg',root),bytes,{mode:0o600});
 console.log(JSON.stringify({test:'ai_recovery',filter:filterId,account:shared?'minh1011':'nam',status:200,image_status:200,jpeg_bytes:bytes.length,recovery_posts:calls,elapsed_ms:Date.now()-started,iphone_verified:false}));
}
console.log('Module: '+links.module);
