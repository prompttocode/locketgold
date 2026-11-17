// One frame regression + one AI request against our own synthetic sample.
import fs from 'node:fs';
import assert from 'node:assert/strict';
const root=new URL('.',import.meta.url);
const key=JSON.parse(fs.readFileSync(new URL('../.lab-secrets.json',root),'utf8')).LAB_KEY;
const origin='https://namdz-photobooth.namvu3121.workers.dev';
const health=await (await fetch(origin+'/health')).json();
assert.equal(health.filter_count,19);
const links=JSON.parse(fs.readFileSync(new URL('private/links.json',root),'utf8'));
const moduleResponse=await fetch(links.module);
assert.equal(moduleResponse.status,200);
const module=await moduleResponse.text();
for (const match of module.matchAll(/script-path=(https:\/\/[^\s,]+)/g)) {
  const script=await fetch(match[1]);
  assert.equal(script.status,200);
  assert((await script.text()).includes('ai_winter'));
}
assert.equal((await fetch(origin+'/assets/v7/ai-winter-icon.png')).status,200);
const records=[];
const reference = process.argv[2];
const aiFilter = process.argv[3] || 'ai_winter';
assert(['ai_winter','ai_luxury','ai_grab','ai_bee'].includes(aiFilter));
const filters = reference ? [aiFilter] : ['pb_vintage',aiFilter];
for (const id of filters) {
  const start=Date.now();
  const response=await fetch(origin+'/generateFilteredImage',{
    method:'POST',headers:{'Content-Type':'application/json','X-Namdz-Key':key,'X-Namdz-Route':'native-v7'},
    body:JSON.stringify({data:{filter_id:id,image_url:reference
      ? 'data:image/png;base64,'+fs.readFileSync(reference).toString('base64') : origin+'/assets/sample.png'}}),
    signal:AbortSignal.timeout(60000)
  });
  const result=await response.json();
  const record={filter:id,status:response.status,code:result.error?.code,elapsed_ms:Date.now()-start};
  if(response.status===200) {
    const image=await fetch(result.result.outputUrl);
    assert.equal(image.status,200);
    const bytes=Buffer.from(await image.arrayBuffer());
    assert.equal(bytes[0],255);assert.equal(bytes[1],216);
    fs.writeFileSync(new URL('private/'+id+'-live.jpg',root),bytes,{mode:0o600});
    record.jpeg_bytes=bytes.length;
  } else {
    assert(['ai_winter','ai_luxury','ai_grab','ai_bee'].includes(id));
    assert.equal(response.status,429);
    assert(['AI_DAILY_LIMIT','AI_CLOUDFLARE_QUOTA'].includes(result.error.code));
  }
  records.push(record);console.log(JSON.stringify(record));
}
fs.writeFileSync(new URL('private/ai-live-results.json',root),JSON.stringify(records,null,2),{mode:0o600});
