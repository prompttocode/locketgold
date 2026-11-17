// Experimental warm-up only: this cannot promise to reset the original socket.
function prime(){
 if(!selected){finish();return;}
 let resumed=false,timer;
 function resume(reason,status){
  if(resumed)return;resumed=true;
  if(timer!==undefined&&typeof clearTimeout==='function')clearTimeout(timer);
  console.log('NAMDZDBG '+JSON.stringify({revision:'7.3',stage:'prime_done',reason:reason,status:status||0}));
  finish();
 }
 if(typeof $httpClient!=='object'||!$httpClient||typeof $httpClient.get!=='function'){resume('client_unavailable');return;}
 console.log('NAMDZDBG '+JSON.stringify({revision:'7.3',stage:'prime_start'}));
 try{
  if(typeof setTimeout==='function')timer=setTimeout(function(){resume('watchdog');},3500);
  // No image, original request fields, account credentials or renderer key.
  // /health has no Images/AI/D1 writes and is outside the interception pattern.
  $httpClient.get({url:SERVER+'/health',headers:{Accept:'application/json','Cache-Control':'no-cache','X-Namdz-Route':'prime-v7.3'},timeout:3},
   function(error,response){
    const match=String(response&&(response.status!==undefined?response.status:response.statusCode)||'').match(/\b[1-5][0-9]{2}\b/);
    resume(error?'network_error':'completed',match?Number(match[0]):0);
   });
 }catch(_){resume('client_error');}
}
prime();
