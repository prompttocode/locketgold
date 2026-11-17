import fs from 'node:fs';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import crypto from 'node:crypto';
const root=new URL('.',import.meta.url),repo=new URL('../../',root);
const read=(name,base=root)=>fs.readFileSync(new URL(name,base),'utf8');
const links=JSON.parse(read('private/links.json'));
const originalKey=JSON.parse(read('.lab-secrets.json',repo)).LAB_KEY;
const key=JSON.parse(read('private/secrets.json')).LAB_KEY;
assert.notEqual(key,originalKey);
const oldOrigin=links.source_module.split('/modules/')[0],oldHost=new URL(oldOrigin).hostname,newHost=new URL(links.origin).hostname;
const escape=value=>value.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const rebase=value=>value.replaceAll(oldOrigin,links.origin).replaceAll(escape(oldHost),escape(newHost)).replaceAll(oldHost,newHost).replaceAll(originalKey,key);
const code=[];
for(const mapping of links.mapping){
 const source=read('v7.4/public/modules/'+new URL(mapping.source).pathname.split('/').at(-1),repo);
 const target=read('public'+new URL(mapping.target).pathname);
 assert.equal(target,rebase(source),'Only origin/domain/key substitution is allowed');
 assert(!target.includes(originalKey));assert(!target.includes(oldHost));
 code.push(target);
}
assert.equal(code.length,3);
const module=read('public'+new URL(links.module).pathname);
const scripts=[...module.matchAll(/script-path=(https:\/\/[^\s,]+)/g)].map(m=>m[1]);
assert.deepEqual(scripts,links.mapping.map(m=>m.target));
assert(module.includes(escape(newHost)),'Response hook must match the new Worker hostname');
assert(!module.includes(oldHost));
const camera=JSON.parse(JSON.parse(read('public/config/v7.json')).entries.camera_filter_config);
assert.equal(camera.remote_filters.length,19);
assert.equal(camera.remote_filters.find(filter=>filter.uid==='ai_luxury').name,'Sang trọng');
assert.equal(camera.remote_filters.find(filter=>filter.uid==='ai_grab').name,'Grab');
assert.equal(camera.remote_filters.find(filter=>filter.uid==='ai_bee').name,'Bee');
const map=new Map(),persistence={read:key=>map.get(key)||'',write(value,key){map.set(key,value);return true;}};
let rewritten;
vm.runInNewContext(code[1],{$request:{url:'https://api.locketcamera.com/generateFilteredImage',headers:{},body:'{"data":{"filter_id":"pb_vintage"}}'},
 $persistentStore:persistence,$done:value=>rewritten=value,console:{log(){}},ArrayBuffer,Uint8Array,TextDecoder});
assert.equal(rewritten.url,links.origin+'/generateFilteredImage');
assert.equal(rewritten.headers.Host,newHost);assert.equal(rewritten.headers['X-Namdz-Key'],key);
let result,calls=0;
vm.runInNewContext(code[2],{$request:{url:rewritten.url,headers:rewritten.headers},
 $response:{status:502,headers:{Via:'gateway','Content-Type':'text/plain'},body:'Bad Gateway'},$persistentStore:persistence,
 $httpClient:{post(options,cb){calls++;assert.equal(options.url,links.origin+'/generateFilteredImage');assert.equal(options.headers['X-Namdz-Key'],key);cb(null,{status:200},'{"result":{"status":200}}');}},
 $done:value=>result=value,console:{log(){}},ArrayBuffer,Uint8Array,TextDecoder});
assert.equal(calls,1);assert.equal(result.status,200);assert.equal(result.response,undefined);
const hash=value=>crypto.createHash('sha256').update(value).digest('hex');
function images(directory,relative=''){
 for(const entry of fs.readdirSync(directory,{withFileTypes:true})){
  const name=relative+entry.name;
  if(entry.isDirectory())images(new URL(entry.name+'/',directory),name+'/');
  else assert.equal(hash(fs.readFileSync(new URL(entry.name,directory))),hash(fs.readFileSync(new URL('public/assets/'+name,root))));
 }
}
images(new URL('v7.4/public/assets/',repo));
console.log('PASS: only origin/key changed from V7.4; 19 filters and images preserved; native/recovery both use new server/key.');
