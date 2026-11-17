// Retry only the observed non-Cloudflare plaintext gateway response. This runs
// in http-response, avoiding V7.2's request-stage synthetic early response.
(function(){
 const SERVER=__SERVER__,KEY=__KEY__;
 let finished=false;
 function log(stage,data){console.log('NAMDZDBG '+JSON.stringify(Object.assign({revision:'7.4',stage:stage},data||{})));}
 function done(value){if(finished)return;finished=true;$done(value);}
 function header(headers,name){const key=Object.keys(headers||{}).find(function(k){return k.toLowerCase()===name;});return key?String(headers[key]):'';}
 function status(response){const value=response&&(response.status!==undefined?response.status:response.statusCode);const match=String(value===undefined?'':value).match(/\b[2-5][0-9]{2}\b/);return match?Number(match[0]):0;}
 function text(raw){
  if(typeof raw==='string')return raw;
  if(typeof ArrayBuffer!=='undefined'&&(raw instanceof ArrayBuffer||ArrayBuffer.isView(raw))){
   const bytes=raw instanceof ArrayBuffer?new Uint8Array(raw):new Uint8Array(raw.buffer,raw.byteOffset,raw.byteLength);
   if(typeof TextDecoder!=='undefined')return new TextDecoder('utf-8').decode(bytes);
   let value='';for(let i=0;i<bytes.length;i++)value+=String.fromCharCode(bytes[i]);
   return decodeURIComponent(escape(value));
  }
  if(raw&&typeof raw==='object')return JSON.stringify(raw);
  return '';
 }
 let entry,cacheKey;
 try{
  const request=typeof $request==='object'&&$request?$request:{};
  const response=typeof $response==='object'&&$response?$response:{};
  const nonce=header(request.headers,'x-namdz-pending');
  const match=/^([0-9]|1[0-5]):[A-Za-z0-9._-]{6,80}$/.exec(nonce);
  if(!match){log('pending_missing',{status:status(response)});done({});return;}
  cacheKey='namdz.v74.pending.'+match[1];
  if(typeof $persistentStore!=='object'||!$persistentStore){log('cache_unavailable');done({});return;}
  try{entry=JSON.parse($persistentStore.read(cacheKey)||'null');}catch(_){}
  if(!entry||entry.nonce!==nonce||entry.expires<=Date.now()||typeof entry.body!=='string'||entry.body.length>65536){log('pending_expired_or_replaced');done({});return;}
  // Consume before any asynchronous work, including successful responses.
  if($persistentStore.write('',cacheKey)===false||$persistentStore.read(cacheKey)){log('cache_consume_failed');done({});return;}
  const headers=response.headers||{},code=status(response);
  const type=header(headers,'content-type').split(';')[0].trim().toLowerCase();
  const raw=typeof response.body==='string'?response.body:'';
  const gateway=code===502&&type==='text/plain'&&!header(headers,'cf-ray')&&!header(headers,'server')&&!!header(headers,'via')&&raw.length<=4096&&/bad gateway/i.test(raw);
  log('native_response',{status:code,gateway_retry:gateway});
  if(!gateway){done({});return;}
  if(typeof $httpClient!=='object'||!$httpClient||typeof $httpClient.post!=='function'){log('retry_client_unavailable');done({});return;}
  const started=Date.now();
  log('recovery_start');
  $httpClient.post({url:SERVER+'/generateFilteredImage',timeout:55,
   headers:{'Content-Type':'application/json','Accept':'application/json','X-Namdz-Key':KEY,'X-Namdz-Route':'recover-v7.4'},body:entry.body},
   function(error,response,raw){
    if(finished)return;
    if(error||!response){log('recovery_network_error');done({});return;}
    try{
     const code=status(response),body=text(raw);
     if(!code||body.length>65536)throw new Error('Invalid response');
     const parsed=JSON.parse(body);
     if(!parsed||typeof parsed!=='object'||Array.isArray(parsed))throw new Error('Invalid JSON');
     log('recovery_response',{status:code,body_length:body.length,elapsed_ms:Date.now()-started});
     // Top-level response-hook fields, not {response:{...}} early response.
     done({status:code,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'},body:body});
    }catch(_){log('recovery_invalid_response');done({});}
   });
 }catch(_){log('recovery_exception');done({});}
})();
