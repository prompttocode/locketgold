// Node simulation verifies ordering and the real service, not iPhone sockets.
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';

const root=new URL('.',import.meta.url);
const links=JSON.parse(fs.readFileSync(new URL('private/links.json',root),'utf8'));
const hash=value=>crypto.createHash('sha256').update(value).digest('hex');
let native;
for(const [name,url] of [['v7',links.stable_module],['v7.1',links.diagnostic_module],['v7.2',links.relay_module],['v7.3',links.module]]){
 const response=await fetch(url,{signal:AbortSignal.timeout(15000)});
 assert.equal(response.status,200);
 const module=await response.text();
 assert.equal(hash(module),hash(fs.readFileSync(new URL('public'+new URL(url).pathname,root),'utf8')));
 if(name==='v7')assert.equal(hash(module),links.stable_sha256);
 const scripts=[...module.matchAll(/script-path=(https:\/\/[^\s,]+)/g)].map(m=>m[1]);
 for(const script of scripts){
  const fetched=await fetch(script,{signal:AbortSignal.timeout(15000)});
  assert.equal(fetched.status,200);
  const code=await fetched.text();
  assert.equal(hash(code),hash(fs.readFileSync(new URL('public'+new URL(script).pathname,root),'utf8')));
  if(name==='v7.3'&&new URL(script).pathname.includes('/native-v7.3-'))native=code;
 }
 console.log(JSON.stringify({module:name,status:200,scripts:scripts.length,verified:true}));
}
assert(native);
const input=JSON.stringify({data:{filter_id:'pb_vintage',image_url:'https://namdz-photobooth.namvu3121.workers.dev/assets/sample.png'}});
let probes=0,completions=0;
const result=await new Promise((resolve,reject)=>{
 vm.runInNewContext(native,{
  $request:{url:'https://api.locketcamera.com/generateFilteredImage',method:'POST',headers:{'Content-Type':'application/json'},body:input},
  $httpClient:{get(options,callback){
   probes++;
   (async()=>{
    try{
     const response=await fetch(options.url,{headers:options.headers,signal:AbortSignal.timeout(options.timeout*1000)});
     await response.arrayBuffer();
     assert.equal(response.status,200);
     callback(null,{status:response.status});
    }catch(error){callback('network_error',null);reject(error);}
   })().catch(reject);
  }},
  $done(value){completions++;resolve(value);},console:{log:line=>console.log(line)},
  ArrayBuffer,Uint8Array,TextDecoder,setTimeout,clearTimeout
 });
});
assert.equal(probes,1);assert.equal(completions,1);
assert.equal(result.body,undefined);assert.equal(result.method,undefined);
const response=await fetch(result.url,{method:'POST',headers:result.headers,body:input,signal:AbortSignal.timeout(45000)});
assert.equal(response.status,200);
const body=await response.json();
assert.equal(body.result.status,200);
const image=await fetch(body.result.outputUrl,{signal:AbortSignal.timeout(15000)});
assert.equal(image.status,200);
const bytes=new Uint8Array(await image.arrayBuffer());
assert.equal(bytes[0],255);assert.equal(bytes[1],216);
console.log(JSON.stringify({test:'health_then_synthetic_photobooth',health_requests:probes,render_requests:1,status:200,image_status:200,jpeg_bytes:bytes.length,iphone_verified:false}));
console.log('V7.3 module: '+links.module);
