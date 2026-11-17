import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
const root=new URL('.',import.meta.url);
const links=JSON.parse(fs.readFileSync(new URL('private/links.json',root),'utf8'));
const key=JSON.parse(fs.readFileSync(new URL('private/secrets.json',root),'utf8')).LAB_KEY;
const hash=value=>crypto.createHash('sha256').update(value).digest('hex');
const response=await fetch(links.module,{signal:AbortSignal.timeout(20000)});assert.equal(response.status,200);
const module=await response.text();assert.equal(hash(module),hash(fs.readFileSync(new URL('public'+new URL(links.module).pathname,root))));
const scripts=[...module.matchAll(/script-path=(https:\/\/[^\s,]+)/g)].map(m=>m[1]),code=[];
for(const url of scripts){
 const response=await fetch(url,{signal:AbortSignal.timeout(15000)});assert.equal(response.status,200);
 const source=await response.text();assert.equal(hash(source),hash(fs.readFileSync(new URL('public'+new URL(url).pathname,root))));code.push(source);
}
console.log(JSON.stringify({test:'module_assets',status:200,scripts:code.length,verified:true}));
const health=await fetch(links.origin+'/health',{signal:AbortSignal.timeout(15000)});assert.equal(health.status,200);
assert.equal((await health.json()).filter_count,19);
const denied=await fetch(links.origin+'/generateFilteredImage',{method:'POST',headers:{'X-Namdz-Key':'invalid-isolation-test','Content-Type':'application/json'},body:'{}',signal:AbortSignal.timeout(15000)});
assert.equal(denied.status,401);await denied.arrayBuffer();
console.log(JSON.stringify({test:'health_and_auth',health_status:200,invalid_key_status:401}));
const input=JSON.stringify({data:{filter_id:'pb_vintage',image_url:links.origin+'/assets/sample.png'}});
const map=new Map(),persistence={read:key=>map.get(key)||'',write(value,key){map.set(key,value);return true;}};
let rewritten;
vm.runInNewContext(code[1],{$request:{url:'https://api.locketcamera.com/generateFilteredImage',headers:{'Content-Type':'application/json'},body:input},
 $persistentStore:persistence,$done:value=>rewritten=value,console:{log(){}},ArrayBuffer,Uint8Array,TextDecoder});
assert(rewritten.headers['X-Namdz-Pending']);
let calls=0;
const recovered=await new Promise((resolve,reject)=>{
 vm.runInNewContext(code[2],{$request:{url:rewritten.url,headers:rewritten.headers},$response:{status:502,headers:{Via:'test','Content-Type':'text/plain'},body:'Bad Gateway'},$persistentStore:persistence,
  $httpClient:{post(options,callback){calls++;(async()=>{
   try{const response=await fetch(options.url,{method:'POST',headers:options.headers,body:options.body,signal:AbortSignal.timeout(options.timeout*1000)});callback(null,{status:response.status},await response.text());}
   catch(_){callback('network_error',null,null);}
  })().catch(reject);}},$done:resolve,console:{log:line=>console.log(line)},ArrayBuffer,Uint8Array,TextDecoder});
});
assert.equal(calls,1);assert.equal(recovered.status,200);assert.equal(recovered.response,undefined);
const photobooth=JSON.parse(recovered.body);assert.equal(photobooth.result.status,200);
async function checkImage(url){
 assert.equal(new URL(url).origin,links.origin);
 const response=await fetch(url,{signal:AbortSignal.timeout(20000)});assert.equal(response.status,200);
 const bytes=new Uint8Array(await response.arrayBuffer());assert.equal(bytes[0],255);assert.equal(bytes[1],216);return bytes.length;
}
console.log(JSON.stringify({test:'photobooth_recovery',status:200,image_status:200,jpeg_bytes:await checkImage(photobooth.result.outputUrl),recovery_posts:calls}));
const started=Date.now();
const filter=process.argv[2]||'ai_winter';
assert(['ai_winter','ai_luxury','ai_grab','ai_bee'].includes(filter));
const ai=await fetch(links.origin+'/generateFilteredImage',{method:'POST',headers:{'Content-Type':'application/json','X-Namdz-Key':key,'X-Namdz-Route':'deploy-validation'},
 body:JSON.stringify({data:{filter_id:filter,image_url:links.origin+'/assets/sample.png'}}),signal:AbortSignal.timeout(60000)});
const aiBody=await ai.json();
if(ai.status!==200){console.log(JSON.stringify({test:filter,status:ai.status,code:aiBody.error?.code||'unknown'}));process.exitCode=1;}
else{
 assert.equal(aiBody.result.status,200);
 console.log(JSON.stringify({test:filter,status:200,image_status:200,jpeg_bytes:await checkImage(aiBody.result.outputUrl),elapsed_ms:Date.now()-started}));
}
console.log('Module: '+links.module);
