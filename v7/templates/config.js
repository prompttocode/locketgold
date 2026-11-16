// V7: the catalog is embedded; no additional config fetch is needed.
(function(){try{
 const url=String($request.url||'');
 if(!/^https:\/\/firebaseremoteconfig\.googleapis\.com\/v1\/projects\/(?:locket-4252a|641029076083)\/namespaces\/firebase(?::|%3A)fetch(?:[?]|$)/i.test(url)){$done({});return;}
 const entries=__ENTRIES__;
 const obj=JSON.parse($response.body||'{}');
 obj.entries=Object.assign({},obj.entries||{},entries);
 obj.state='UPDATE';obj.templateVersion=String(Date.now());
 console.log('PHOTOBOOTH V7: Photobooth + Khung catalog applied');
 $done({status:200,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'},body:JSON.stringify(obj)});
}catch(_){console.log('PHOTOBOOTH V7: config could not be read');$done({});}})();
