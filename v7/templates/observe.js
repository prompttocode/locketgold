// Observe schema only. Never include URLs, image content, cookies or auth tokens.
(function(){
if(typeof $request==='undefined'||typeof $response==='undefined'){console.log('NAMDZ V5: no live response');$done({});return;}
let called=false;
function finish(){if(!called){called=true;$done({});}}
try{
 const raw=$response.body;
 const text=typeof raw==='string'?raw:JSON.stringify(raw);
 let parsed={};try{parsed=JSON.parse(text||'{}');}catch(_){}
 const keys=function(v){return v&&typeof v==='object'&&!Array.isArray(v)?Object.keys(v).filter(function(k){return /^[A-Za-z0-9_]{1,32}$/.test(k);}).slice(0,20):[];};
 const candidate=$response.status!==undefined?$response.status:$response.statusCode;
 const status=String(candidate||'').match(/\b([1-5][0-9]{2})\b/);
 const meta={stage:'native_response',status:status?Number(status[1]):0,json_status:typeof parsed.status==='number'?parsed.status:0,result_status:parsed.result&&typeof parsed.result.status==='number'?parsed.result.status:0,status_type:typeof candidate,body_type:typeof raw,body_length:(text||'').length,result_type:typeof parsed.result,root_keys:keys(parsed),result_keys:keys(parsed.result),data_keys:keys(parsed.result&&parsed.result.data)};
 const headers=$response.headers||{};meta.has_cf_ray=Object.keys(headers).some(function(k){return k.toLowerCase()==='cf-ray';});
 if(meta.status>=400&&meta.root_keys.length===0){meta.error_preview=String(text||'').replace(/https?:\/\/\S+/g,'[URL]').replace(/(?:Bearer|token|secret|password)[=: ]+\S+/gi,'[redacted]').replace(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g,'[IP]').replace(/[A-Za-z0-9_+=-]{20,}/g,'[id]').slice(0,180);}
 console.log('NAMDZ V6 native response: HTTP '+meta.status+' keys='+meta.root_keys.join(','));
 $httpClient.post({url:__SERVER__+'/v1/relay-report',headers:{'Content-Type':'application/json','X-Namdz-Key':__KEY__},body:JSON.stringify(meta),timeout:3},function(){finish();});
}catch(_){finish();}
})();
