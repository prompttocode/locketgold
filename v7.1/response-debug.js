// Console-only observer. Does not change the response or send telemetry.
(function(){
 try{
  var response=typeof $response==='object'&&$response?$response:{};
  var headers=response.headers||{};
  function header(name){var key=Object.keys(headers).find(function(k){return k.toLowerCase()===name;});return key?String(headers[key]):'';}
  var status=String(response.statusCode||response.status||'').match(/\b[1-5][0-9]{2}\b/);
  var code=status?Number(status[0]):0;
  var raw=response.body,body='';
  if(typeof raw==='string')body=raw;
  else if(typeof ArrayBuffer!=='undefined'&&(raw instanceof ArrayBuffer||ArrayBuffer.isView(raw))&&typeof TextDecoder!=='undefined'){
   var bytes=raw instanceof ArrayBuffer?new Uint8Array(raw):new Uint8Array(raw.buffer,raw.byteOffset,raw.byteLength);
   body=new TextDecoder().decode(bytes.subarray(0,2048));
  }
  // Inspect only a bounded prefix of error responses, output fixed markers only.
  var preview=code>=400?body.slice(0,2048).toLowerCase():'';
  var vocabulary=['bad gateway','upstream','connect','connection refused','connection reset','tls','ssl','certificate','cloudflare','shadowrocket','timed out','timeout'];
  var server=header('server').toLowerCase();
  var type=header('content-type').split(';')[0].toLowerCase();
  var request=typeof $request==='object'&&$request?$request:{};
  var host=String(request.url||'').replace(/^https?:\/\//,'').split(/[/?]/)[0];
  console.log('NAMDZDBG '+JSON.stringify({stage:'response',revision:'7.1',status:code,
   host:['api.locketcamera.com','us-central1-locket-4252a.cloudfunctions.net','namdz-photobooth.namvu3121.workers.dev'].includes(host)?host:'other',
   body_type:raw===null?'null':typeof raw,body_length:typeof raw==='string'?raw.length:raw&&raw.byteLength||0,
   content_type:['application/json','text/html','text/plain','application/octet-stream'].includes(type)?type:'other',
   server:server==='cloudflare'?'cloudflare':server==='shadowrocket'?'shadowrocket':server?'other':'none',
   has_cf_ray:!!header('cf-ray'),has_via:!!header('via'),markers:vocabulary.filter(function(v){return preview.indexOf(v)>=0;})}));
 }catch(_){console.log('NAMDZDBG '+JSON.stringify({stage:'observer_error',revision:'7.1'}));}
 $done({});
})();
