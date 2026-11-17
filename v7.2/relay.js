// Independent HTTP call for our own filters; never rewrite the original connection.
(function(){
 const SERVER=__SERVER__,KEY=__KEY__,SUPPORTED=__SUPPORTED__;
 let finished=false;
 function log(stage,metadata){console.log('NAMDZDBG '+JSON.stringify(Object.assign({revision:'7.2',stage:stage},metadata||{})));}
 function done(value){if(finished)return;finished=true;$done(value);}
 function fail(code,message){done({response:{status:502,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'},body:JSON.stringify({error:{status:code,message:message}})}});}
 function text(raw){
  if(typeof raw==='string')return raw;
  if(typeof ArrayBuffer!=='undefined'&&(raw instanceof ArrayBuffer||ArrayBuffer.isView(raw))){
   const bytes=raw instanceof ArrayBuffer?new Uint8Array(raw):new Uint8Array(raw.buffer,raw.byteOffset,raw.byteLength);
   if(typeof TextDecoder!=='undefined')return new TextDecoder('utf-8').decode(bytes);
   let value='';for(let i=0;i<bytes.length;i++)value+=String.fromCharCode(bytes[i]);
   return decodeURIComponent(escape(value));
  }
  if(raw&&typeof raw==='object')return JSON.stringify(raw);
  throw new Error('Missing JSON');
 }
 if(typeof $request!=='object'||!$request||!$request.url){log('manual_test');done({});return;}
 // Do not intercept the script's own Worker call, even if a broader rule is installed.
 if(!/^https:\/\/(api\.locketcamera\.com|us-central1-locket-4252a\.cloudfunctions\.net)\/generateFilteredImage(?:[/?]|$)/.test($request.url)){done({});return;}
 let raw,body,data,selected;
 try{
  raw=text($request.body);body=JSON.parse(raw);data=body.data||body;
  const id=data.filter_id||data.filterId||data.filter_uid||data.filterUid||data.prompt;
  selected=SUPPORTED.includes(id)||SUPPORTED.some(function(value){return JSON.stringify(data).indexOf(JSON.stringify(value))>=0;});
 }catch(_){log('decode_error');done({});return;}
 if(!selected){done({});return;}
 const original=$request.headers||{};
 const encodingName=Object.keys(original).find(function(k){return k.toLowerCase()==='content-encoding';});
 const encoding=encodingName?String(original[encodingName]).trim().toLowerCase():'';
 if(encoding&&encoding!=='identity'){log('unsupported_encoding');fail('UNAVAILABLE','Unsupported input encoding');return;}
 if(typeof $httpClient!=='object'||!$httpClient||typeof $httpClient.post!=='function'){log('client_unavailable');fail('UNAVAILABLE','Independent HTTP client unavailable');return;}
 const started=Date.now();
 log('relay_start',{body_length:raw.length});
 try{
  $httpClient.post({url:SERVER+'/generateFilteredImage',timeout:55,
   headers:{'Content-Type':'application/json','Accept':'application/json','X-Namdz-Key':KEY,'X-Namdz-Route':'relay-v7.2'},body:raw},
   function(error,response,value){
    if(finished)return;
    if(error||!response){log('relay_network_error',{elapsed_ms:Date.now()-started});fail('UNAVAILABLE','Image server connection failed');return;}
    try{
     const statusField=response.status!==undefined?response.status:response.statusCode;
     const match=String(statusField===undefined?'':statusField).match(/\b[2-5][0-9]{2}\b/);
     if(!match)throw new Error('Missing status');
     const status=Number(match[0]),output=text(value);
     if(output.length>65536)throw new Error('Unexpected size');
     const parsed=JSON.parse(output);
     if(!parsed||typeof parsed!=='object'||Array.isArray(parsed))throw new Error('Unexpected JSON');
     log('relay_response',{status:status,body_length:output.length,elapsed_ms:Date.now()-started});
     done({response:{status:status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'},body:output}});
    }catch(_){log('relay_invalid_response',{elapsed_ms:Date.now()-started});fail('UNAVAILABLE','Invalid image server response');}
   });
 }catch(_){if(!finished){log('relay_client_error');fail('UNAVAILABLE','Image server request failed');}}
})();
