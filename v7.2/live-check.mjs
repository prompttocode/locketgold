// Real backend round-trip using a synthetic sample; $httpClient is emulated with
// Node fetch. This checks the relay envelope, not Shadowrocket/iPhone behavior.
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';

const root=new URL('.',import.meta.url);
const links=JSON.parse(fs.readFileSync(new URL('private/links.json',root),'utf8'));
const hash=value=>crypto.createHash('sha256').update(value).digest('hex');
let relay;
for(const [name,url] of [['v7',links.stable_module],['v7.1',links.diagnostic_module],['v7.2',links.module]]){
 const response=await fetch(url,{signal:AbortSignal.timeout(15000)});
 assert.equal(response.status,200);
 const module=await response.text();
 const local=fs.readFileSync(new URL('public'+new URL(url).pathname,root),'utf8');
 assert.equal(hash(module),hash(local));
 if(name==='v7')assert.equal(hash(module),links.stable_sha256);
 const scripts=[...module.matchAll(/script-path=(https:\/\/[^\s,]+)/g)].map(m=>m[1]);
 for(const script of scripts){
  const fetched=await fetch(script,{signal:AbortSignal.timeout(15000)});
  assert.equal(fetched.status,200);
  const text=await fetched.text();
  assert.equal(hash(text),hash(fs.readFileSync(new URL('public'+new URL(script).pathname,root),'utf8')));
  if(name==='v7.2'&&new URL(script).pathname.includes('/relay-v7.2-'))relay=text;
 }
 console.log(JSON.stringify({module:name,status:200,scripts:scripts.length,verified:true}));
}
assert(relay);
let calls=0,completions=0;
const started=Date.now();
const result=await new Promise((resolve,reject)=>{
 vm.runInNewContext(relay,{
  $request:{url:'https://api.locketcamera.com/generateFilteredImage',body:JSON.stringify({data:{filter_id:'pb_vintage',image_url:'https://namdz-photobooth.namvu3121.workers.dev/assets/sample.png'}}),headers:{'Content-Type':'application/json'}},
  $httpClient:{post(options,callback){
   calls++;
   (async()=>{
    try{
     const response=await fetch(options.url,{method:'POST',headers:options.headers,body:options.body,signal:AbortSignal.timeout(options.timeout*1000)});
     const text=await response.text();callback(null,{status:response.status},text);
    }catch(_){callback('network_error',null,null);}
   })().catch(reject);
  }},
  $done(value){completions++;resolve(value);},console:{log:line=>console.log(line)},ArrayBuffer,Uint8Array,TextDecoder
 });
});
assert.equal(calls,1);assert.equal(completions,1);
assert.equal(result.url,undefined);assert.equal(result.response.status,200);
const body=JSON.parse(result.response.body);
assert.equal(body.result.status,200);
const image=await fetch(body.result.outputUrl,{signal:AbortSignal.timeout(15000)});
assert.equal(image.status,200);
const bytes=new Uint8Array(await image.arrayBuffer());
assert.equal(bytes[0],255);assert.equal(bytes[1],216);
console.log(JSON.stringify({test:'synthetic_photobooth_relay',post_calls:calls,status:200,image_status:200,jpeg_bytes:bytes.length,elapsed_ms:Date.now()-started,iphone_verified:false}));
console.log('V7.2 module: '+links.module);
