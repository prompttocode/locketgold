// Fixed 16-slot cache on this device only; no account headers or renderer key.
// Slots expire after two minutes and are cleared when their response is seen.
function savePending(raw){
 try{
  if(typeof raw!=='string'||raw.length>65536)return '';
  if(typeof $persistentStore!=='object'||!$persistentStore||typeof $persistentStore.read!=='function'||typeof $persistentStore.write!=='function')return '';
  const now=Date.now(),start=Math.floor(Math.random()*16);
  for(let i=0;i<16;i++){
   const slot=(start+i)%16,key='namdz.v74.pending.'+slot;
   let old;try{old=JSON.parse($persistentStore.read(key)||'null');}catch(_){}
   if(old&&old.expires>now)continue;
   // Non-secret correlation ID, not an authentication token.
   const nonce=slot+':'+now.toString(36)+'.'+Math.random().toString(36).slice(2);
   const entry=JSON.stringify({nonce:nonce,expires:now+120000,body:raw});
   if($persistentStore.write(entry,key)===false)return '';
   if($persistentStore.read(key)!==entry)return '';
   return nonce;
  }
 }catch(_){}
 return '';
}
