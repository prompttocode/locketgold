import fs from 'node:fs';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
const root=new URL('.',import.meta.url);
const links=JSON.parse(fs.readFileSync(new URL('private/links.json',root),'utf8'));
const hash=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
for(const [name,url] of [['stable',links.stable_module],['diagnostic',links.module]]){
 const response=await fetch(url,{signal:AbortSignal.timeout(15000)});
 assert.equal(response.status,200);
 const body=await response.text();
 if(name==='stable')assert.equal(hash(body),links.stable_sha256);
 const urls=[...body.matchAll(/script-path=(https:\/\/[^\s,]+)/g)].map(m=>m[1]);
 for(const script of urls){
  const scriptResponse=await fetch(script,{signal:AbortSignal.timeout(15000)});
  assert.equal(scriptResponse.status,200);
  const bytes=Buffer.from(await scriptResponse.arrayBuffer());
  assert.equal(hash(bytes),hash(fs.readFileSync(new URL('public'+new URL(script).pathname,root))));
 }
 console.log(JSON.stringify({module:name,status:response.status,scripts:urls.length,verified:true}));
}
console.log('V7.1 module: '+links.module);
