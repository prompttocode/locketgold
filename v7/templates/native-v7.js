// Preserve the original HTTP body; explicitly set the new authority.
(function(){
const SERVER=__SERVER__,KEY=__KEY__;
if(typeof $request==='undefined'||!$request||!$request.url){console.log('PHOTOBOOTH V7: manual Test has no live request');$done({});return;}
function kind(v){if(v===null)return 'null';if(typeof ArrayBuffer!=='undefined'&&(v instanceof ArrayBuffer||ArrayBuffer.isView(v)))return 'arraybuffer';return typeof v;}
function decode(raw){
 if(typeof raw==='string')return JSON.parse(raw);
 if(kind(raw)==='arraybuffer'){
  const bytes=raw instanceof ArrayBuffer?new Uint8Array(raw):new Uint8Array(raw.buffer,raw.byteOffset,raw.byteLength);
  let text;if(typeof TextDecoder!=='undefined')text=new TextDecoder('utf-8').decode(bytes);else{let s='';for(let i=0;i<bytes.length;i++)s+=String.fromCharCode(bytes[i]);try{text=decodeURIComponent(escape(s));}catch(_){text=s;}}
  return JSON.parse(text);
 }
 if(raw&&typeof raw==='object')return raw;
 throw new Error('No JSON body');
}
let body,data,selected=false;
try{body=decode($request.body);data=body.data||body;const id=data.filter_id||data.filterId||data.filter_uid||data.filterUid||data.prompt;selected=__SELECT_FILTER__;}catch(_){}
let completed=false;
function finish(){
 if(completed)return;completed=true;
 if(!selected){$done({});return;}
 const original=$request.headers||{},headers={};
 const allowed=['content-type','content-length','content-encoding','user-agent','accept','accept-language'];
 Object.keys(original).forEach(function(name){if(allowed.includes(name.toLowerCase()))headers[name]=original[name];});
 headers.Host=SERVER.replace(/^https?:\/\//,'').split('/')[0];
 headers['X-Namdz-Key']=KEY;headers['X-Namdz-Route']='native-v7';
 console.log('PHOTOBOOTH V7: selected request routed with explicit Host and unchanged body');
 // Do not reserialize or replace method/body: preserve the original byte length.
 $done({url:SERVER+'/generateFilteredImage',headers:headers});
}
finish();
})();
