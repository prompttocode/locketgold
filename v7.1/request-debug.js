// Wrap V7 without changing its routing decision, headers, method or body.
(function(){
 var request=typeof $request==='object'&&$request?$request:{};
 function header(name){var h=request.headers||{},key=Object.keys(h).find(function(k){return k.toLowerCase()===name;});return key?String(h[key]):'';}
 function classify(value,allowed){return allowed.includes(value.toLowerCase())?value.toLowerCase():(value?'other':'none');}
 var raw=request.body;
 var binary=typeof ArrayBuffer!=='undefined'&&(raw instanceof ArrayBuffer||ArrayBuffer.isView(raw));
 var bodyType=raw===null?'null':binary?'binary':typeof raw;
 var length=typeof raw==='string'?raw.length:binary?raw.byteLength:0;
 var host=String(request.url||'').replace(/^https?:\/\//,'').split(/[/?]/)[0];
 var known=['api.locketcamera.com','us-central1-locket-4252a.cloudfunctions.net','namdz-photobooth.namvu3121.workers.dev'];
 console.log('NAMDZDBG '+JSON.stringify({stage:'request',revision:'7.1',host:known.includes(host)?host:'other',body_type:bodyType,body_length:length,
   content_type:classify(header('content-type').split(';')[0],['application/json','application/octet-stream','application/grpc']),
   content_encoding:classify(header('content-encoding'),['gzip','br','deflate','identity'])}));
 var originalDone=$done;
 (function($done){
__NATIVE__
 })(function(result){
   console.log('NAMDZDBG '+JSON.stringify({stage:'decision',revision:'7.1',rewritten:!!(result&&result.url),
     changed_body:!!(result&&Object.prototype.hasOwnProperty.call(result,'body')),
     changed_method:!!(result&&Object.prototype.hasOwnProperty.call(result,'method'))}));
   originalDone(result);
 });
})();
