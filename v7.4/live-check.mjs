// Simulates the captured gateway 502; does not claim to exercise Shadowrocket.
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
const root=new URL('.',import.meta.url);
const links=JSON.parse(fs.readFileSync(new URL('private/links.json',root),'utf8'));
const hash=value=>crypto.createHash('sha256').update(value).digest('hex');
const scriptsByVersion={};
for(const [name,url] of [['v7',links.stable_module],['v7.3',links.previous_module],['v7.4',links.module]]){
 const response=await fetch(url,{signal:AbortSignal.timeout(15000)});assert.equal(response.status,200);
 const module=await response.text();
 assert.equal(hash(module),hash(fs.readFileSync(new URL('public'+new URL(url).pathname,root),'utf8')));
 if(name==='v7')assert.equal(hash(module),links.stable_sha256);
 const scripts=[...module.matchAll(/script-path=(https:\/\/[^\s,]+)/g)].map(m=>m[1]);
 scriptsByVersion[name]=[];
 for(const url of scripts){
  const fetched=await fetch(url,{signal:AbortSignal.timeout(15000)});assert.equal(fetched.status,200);
  const code=await fetched.text();
  assert.equal(hash(code),hash(fs.readFileSync(new URL('public'+new URL(url).pathname,root),'utf8')));
  scriptsByVersion[name].push(code);
 }
 console.log(JSON.stringify({module:name,status:200,scripts:scripts.length,verified:true}));
}
const input=JSON.stringify({data:{filter_id:'pb_vintage',image_url:'https://namdz-photobooth.namvu3121.workers.dev/assets/sample.png'}});
const map=new Map(),persistence={read:key=>map.get(key)||'',write(value,key){map.set(key,value);return true;}};
let rewritten;
vm.runInNewContext(scriptsByVersion['v7.4'][1],{
 $request:{url:'https://api.locketcamera.com/generateFilteredImage',method:'POST',headers:{'Content-Type':'application/json'},body:input},
 $persistentStore:persistence,$done:value=>{rewritten=value;},console:{log:line=>console.log(line)},ArrayBuffer,Uint8Array,TextDecoder
});
assert(rewritten.headers['X-Namdz-Pending']);
let calls=0,completions=0;
const result=await new Promise((resolve,reject)=>{
 vm.runInNewContext(scriptsByVersion['v7.4'][2],{
  $request:{url:rewritten.url,headers:rewritten.headers},
  $response:{status:502,headers:{Via:'synthetic-gateway','Content-Type':'text/plain'},body:'Bad Gateway'},
  $persistentStore:persistence,
  $httpClient:{post(options,callback){
   calls++;
   (async()=>{
    try{
     const response=await fetch(options.url,{method:'POST',headers:options.headers,body:options.body,signal:AbortSignal.timeout(options.timeout*1000)});
     callback(null,{status:response.status},await response.text());
    }catch(_){callback('network_error',null,null);}
   })().catch(reject);
  }},
  $done(value){completions++;resolve(value);},console:{log:line=>console.log(line)},ArrayBuffer,Uint8Array,TextDecoder
 });
});
assert.equal(calls,1);assert.equal(completions,1);assert.equal(result.response,undefined);assert.equal(result.status,200);
assert([...map.values()].every(value=>!value));
const body=JSON.parse(result.body);assert.equal(body.result.status,200);
const image=await fetch(body.result.outputUrl,{signal:AbortSignal.timeout(15000)});assert.equal(image.status,200);
const bytes=new Uint8Array(await image.arrayBuffer());assert.equal(bytes[0],255);assert.equal(bytes[1],216);
console.log(JSON.stringify({test:'synthetic_gateway_502_recovery',recovery_posts:calls,status:200,image_status:200,jpeg_bytes:bytes.length,iphone_verified:false}));
console.log('V7.4 module: '+links.module);
