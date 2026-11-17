import {FRAME_DEFINITIONS} from './frames';
import {Buffer} from 'node:buffer';
import {AI_PROMPTS, aiFilterId, WINTER_MODEL, WinterError, generateWinter} from './winter';

type FrameId = keyof typeof FRAME_DEFINITIONS;

function frameId(value: unknown): FrameId | undefined {
  if (value === 'namdz_vintage') return 'pb_vintage'; // Preserve V1–V6 clients.
  return typeof value === 'string' && Object.hasOwn(FRAME_DEFINITIONS, value) ? value as FrameId : undefined;
}
const MAX_IMAGE = 6 * 1024 * 1024;
const MAX_BODY = 34 * 1024 * 1024;
const TTL = 15 * 60;

class ClientError extends Error {
  constructor(message: string, readonly status = 400) { super(message); }
}

function json(value: unknown, status = 200): Response {
  return Response.json(value, {status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
}

async function limitedBody(stream: ReadableStream<Uint8Array> | null, limit: number): Promise<ArrayBuffer> {
  if (!stream) throw new ClientError('Thiếu dữ liệu ảnh.');
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  let length = 0;
  try {
    while (true) {
      const {value, done} = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > limit) { await reader.cancel(); throw new ClientError('Dữ liệu vượt giới hạn.',413); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(length);
  let position = 0;
  for (const chunk of chunks) { bytes.set(chunk, position); position += chunk.byteLength; }
  return bytes.buffer;
}

function object(value: unknown): Record<string,unknown> {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) throw new ClientError('Cần JSON object.');
  return value as Record<string,unknown>;
}

async function sourceImage(value: unknown, origin: string, env: Env): Promise<Blob> {
  if (typeof value !== 'string') throw new ClientError('Ảnh phải là URL HTTPS hoặc data URL.');
  if (value.startsWith('data:image/')) {
    const matched = /^data:image\/(?:jpeg|png|webp);base64,([A-Za-z0-9+/=\r\n]+)$/.exec(value);
    if (!matched || matched[1].length > MAX_IMAGE * 4 / 3 + 4) throw new ClientError('Data URL không hợp lệ hoặc quá 6 MB.');
    // Native Images decoding avoids a JavaScript base64 decoding loop.
    const bytes = new TextEncoder().encode(matched[1]);
    return new Blob([bytes]);
  }
  let url: URL;
  try { url = new URL(value); } catch { throw new ClientError('URL ảnh không hợp lệ.'); }
  const ownSample = url.origin === origin && url.pathname === '/assets/sample.png' && !url.search;
  const allowedStorage = ['firebasestorage.googleapis.com','storage.googleapis.com'].includes(url.hostname);
  if (url.protocol !== 'https:' || url.username || url.password || url.port || (!ownSample && !allowedStorage)) {
    throw new ClientError('Chỉ nhận ảnh từ Firebase Storage, Google Storage hoặc ảnh mẫu của server.');
  }
  const response = ownSample ? await env.ASSETS.fetch(url) : await fetch(url, {redirect:'manual', signal:AbortSignal.timeout(12000)});
  if (!response.ok) throw new ClientError('Không tải được ảnh đầu vào.',422);
  const declared = Number(response.headers.get('Content-Length'));
  if (declared > MAX_IMAGE) { await response.body?.cancel(); throw new ClientError('Ảnh lớn hơn 6 MB.',413); }
  const bytes = await limitedBody(response.body, MAX_IMAGE);
  return new Blob([bytes]);
}

async function checkKey(request: Request, env: Env): Promise<void> {
  const expected = env.LAB_KEY;
  const actual = request.headers.get('X-Namdz-Key') || '';
  if (!expected || !actual) throw new ClientError('Thiếu khóa thử nghiệm.',401);
  const encoder = new TextEncoder();
  const [a,b] = await Promise.all([actual,expected].map(s=>crypto.subtle.digest('SHA-256',encoder.encode(s))));
  if (!crypto.subtle.timingSafeEqual(a,b)) throw new ClientError('Khóa thử nghiệm không đúng.',401);
}

async function render(request: Request, env: Env): Promise<Response> {
  await checkKey(request, env);
  const raw = await limitedBody(request.body, MAX_BODY);
  let body: Record<string,unknown>;
  try { body = object(JSON.parse(new TextDecoder().decode(raw))); }
  catch (error) { if (error instanceof ClientError) throw error; throw new ClientError('JSON không hợp lệ.'); }
  const data = body.data === undefined ? body : object(body.data);
  const requested = data.filter_id ?? data.filterId ?? data.filter_uid ?? data.filterUid ?? data.prompt ?? 'pb_vintage';
  const selectedAi = aiFilterId(requested);
  const selectedFrame = frameId(requested);
  const selected = selectedAi ?? selectedFrame;
  if (!selected) throw new ClientError('Không có khung này trong bộ sưu tập.',422);
  const source = data.images ?? data.image_url ?? data.imageUrl ?? data.input_image_url ?? data.inputImageUrl ?? data.image;
  const images = Array.isArray(source) ? source : source ? [source] : [];
  const origin = new URL(request.url).origin;
  if (selectedAi) {
    if (images.length !== 1 || typeof images[0] !== 'string') throw new ClientError('AI cần đúng một ảnh đầu vào.',422);
    const blob = await sourceImage(images[0], origin, env);
    const input = images[0].startsWith('data:')
      ? Buffer.from(await blob.text(), 'base64') : new Uint8Array(await blob.arrayBuffer());
    // The Workers AI FLUX.2 endpoint requires references at most 512px.
    const reference = await env.IMAGES.input(new Blob([new Uint8Array(input)]).stream())
      .transform({width:512,height:512,fit:'contain'})
      .output({format:'image/jpeg',quality:95,background:'#ffffff'});
    const referenceBytes = new Uint8Array(await limitedBody(reference.response().body,1_800_000));
    const generated = await generateWinter(referenceBytes, env, selectedAi);
    const output = await env.IMAGES.input(new Blob([new Uint8Array(generated)]).stream())
      .transform({width:1080,height:1080,fit:'cover'})
      .output({format:'image/jpeg',quality:92,background:'#ffffff'});
    const bytes = await limitedBody(output.response().body,1_800_000);
    return storeResult(request, env, selected, bytes);
  }
  if (!selectedFrame) throw new ClientError('Không có khung này trong bộ sưu tập.',422);
  const layout = FRAME_DEFINITIONS[selectedFrame];
  if (images.length !== 1 && images.length !== layout.slots.length) {
    // Return field names only, never tokens, image contents or user IDs.
    return json({error:{status:'INVALID_ARGUMENT',message:'Số ảnh không phù hợp với khung đã chọn.',received_fields:Object.keys(data).slice(0,30)}},422);
  }
  const background = await env.ASSETS.fetch(new URL('/assets/blank.png',origin));
  const frame = await env.ASSETS.fetch(new URL(layout.asset,origin));
  if (!background.ok || !background.body || !frame.ok || !frame.body) throw new Error('Missing deployed frame asset');
  let image = env.IMAGES.input(background.body);
  const sources = new Map<string,Promise<Blob>>();
  for (let i=0;i<layout.slots.length;i++) {
    const source = images.length === 1 ? images[0] : images[i];
    if (typeof source !== 'string') throw new ClientError('Ảnh phải là URL HTTPS hoặc data URL.');
    let task = sources.get(source);
    if (!task) { task = sourceImage(source,origin,env); sources.set(source,task); }
    const blob = await task;
    const [x,y,width,height] = layout.slots[i];
    const options = typeof source === 'string' && source.startsWith('data:') ? {encoding:'base64' as const} : undefined;
    image = image.draw(env.IMAGES.input(blob.stream(), options).transform({width,height,fit:'cover',gravity:'center'}),{left:x,top:y});
  }
  const overlay = layout.width === 1080 && layout.height === 1080
    ? env.IMAGES.input(frame.body)
    : env.IMAGES.input(frame.body).transform({width:1080,height:1080,fit:'cover'});
  const output = await image.draw(overlay,{left:0,top:0}).output({format:'image/jpeg',quality:92,background:'#ffffff'});
  const result = output.response();
  const bytes = await limitedBody(result.body,1_800_000);
  return storeResult(request, env, selected, bytes);
}

async function storeResult(request: Request, env: Env, selected: string, bytes: ArrayBuffer): Promise<Response> {
  const origin = new URL(request.url).origin;
  const signature = new Uint8Array(bytes,0,Math.min(2,bytes.byteLength));
  if (signature.length !== 2 || signature[0] !== 0xff || signature[1] !== 0xd8) throw new Error('Image service did not return JPEG bytes');
  const id = crypto.randomUUID().replaceAll('-','');
  await env.RESULTS.prepare('INSERT INTO results(id,image,expires_at) VALUES (?,?,?)').bind(id,bytes,Math.floor(Date.now()/1000)+TTL).run();
  const outputUrl = `${origin}/results/${id}.jpg`;
  if (new URL(request.url).pathname === '/generateFilteredImage') {
    // Match the URL/status envelope observed on the reference filter endpoint.
    // Membership-related fields are not part of this custom frame renderer.
    const urls = {output:outputUrl,outputUrl,output_url:outputUrl,url:outputUrl,imageUrl:outputUrl,image_url:outputUrl};
    const route = request.headers.get('X-Namdz-Route') || '';
    console.log(JSON.stringify({event:'render_complete',filter:selected,bytes:bytes.byteLength,response_shape:'locket-status-url-envelope',transport:['native-v5','native-v6','native-v7'].includes(route)?route:'relay'}));
    return json({result:{...urls,status:200,data:urls},...urls,status:200});
  }
  return json({result:{output:outputUrl,output_url:outputUrl,outputUrl,image_url:outputUrl,imageUrl:outputUrl,width:1080,height:1080,expires_in:TTL}});
}

export default {
  async fetch(request, env, ctx): Promise<Response> {
    const url = new URL(request.url);
    try {
      if (request.method === 'GET' && url.pathname === '/health') return json({status:'ok',renderer:'photobooth-v7',filter_count:Object.keys(FRAME_DEFINITIONS).length+Object.keys(AI_PROMPTS).length,ai_model:WINTER_MODEL,ai_daily_limit:80,locket_compatibility:'experimental'});
      if (request.method === 'POST' && url.pathname === '/v1/relay-report') {
        await checkKey(request,env);
        const input = object(JSON.parse(new TextDecoder().decode(await limitedBody(request.body,2048))));
        const textField = (key: string, allowed: readonly string[]): string => typeof input[key] === 'string' && allowed.includes(input[key]) ? input[key] : 'unknown';
        const numeric = (key: string, max: number): number => typeof input[key] === 'number' && Number.isFinite(input[key]) ? Math.max(0,Math.min(input[key],max)) : 0;
        const keys = (key: string): string[] => Array.isArray(input[key]) ? input[key].filter((v): v is string=>typeof v==='string' && /^[A-Za-z0-9_]{1,32}$/.test(v)).slice(0,20) : [];
        const errorPreview = typeof input.error_preview === 'string' ? input.error_preview.replace(/https?:\/\/\S+/g,'[URL]').replace(/(?:Bearer|token|secret|password)[=: ]+\S+/gi,'[redacted]').replace(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g,'[IP]').replace(/[A-Za-z0-9_+=-]{20,}/g,'[id]').slice(0,180) : '';
        const diagnostic = {event:'relay_report',observer_revision:textField('observer_revision',['v5-errors-1']),method:textField('method',['GET','POST','HEAD','OPTIONS','PUT','PATCH','DELETE']),stage:textField('stage',['received','upstream_error','decode_error','native_response','native_request']),
          body_type:textField('body_type',['string','object','arraybuffer','null','undefined']),
          status_type:textField('status_type',['string','number','undefined']),
          result_type:textField('result_type',['string','object','undefined']),
          status:numeric('status',599),json_status:numeric('json_status',999),result_status:numeric('result_status',999),body_length:numeric('body_length',500000),elapsed_ms:numeric('elapsed_ms',60000),selected:input.selected===true,decode_ok:input.decode_ok===true,has_cf_ray:input.has_cf_ray===true,error_preview:errorPreview,root_keys:keys('root_keys'),result_keys:keys('result_keys'),data_keys:keys('data_keys')};
        console.log(JSON.stringify(diagnostic));
        ctx.waitUntil(env.RESULTS.prepare('INSERT INTO diagnostic_events(id,created_ms,details) VALUES (?,?,?)')
          .bind(crypto.randomUUID(),Date.now(),JSON.stringify(diagnostic)).run().catch(()=>{console.error('diagnostic_store_failed');}));
        return json({ok:true});
      }
      if (request.method === 'POST' && ['/generateFilteredImage','/v1/render'].includes(url.pathname)) return await render(request,env);
      const match = /^\/results\/([a-f0-9]{32})\.jpg$/.exec(url.pathname);
      if (request.method === 'GET' && match) {
        const record = await env.RESULTS.prepare('SELECT image FROM results WHERE id=? AND expires_at>?').bind(match[1],Math.floor(Date.now()/1000)).first<{image:ArrayBuffer|number[]}>();
        if (!record) return json({error:'Ảnh không tồn tại hoặc đã hết hạn.'},404);
        const image = Array.isArray(record.image) ? Uint8Array.from(record.image) : new Uint8Array(record.image);
        return new Response(image,{headers:{'Content-Type':'image/jpeg','Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});
      }
      if (request.method === 'GET') return env.ASSETS.fetch(request);
      return json({error:'Không tìm thấy đường dẫn.'},404);
    } catch (error) {
      if (error instanceof WinterError) {
        console.error(JSON.stringify({event:'ai_failed',code:error.code}));
        return json({error:{message:error.message,code:error.code}},error.status);
      }
      if (error instanceof ClientError) return json({error:{message:error.message}},error.status);
      const code = error && typeof error === 'object' && 'code' in error ? String(error.code) : 'RENDER_FAILED';
      console.error(JSON.stringify({event:'render_failed',code}));
      const detail = error instanceof Error ? error.message.replace(/https?:\/\/\S+/g,'[URL]').slice(0,240) : 'Unknown error';
      return json({error:{message:'Server chưa xử lý được ảnh.',code,detail}},502);
    }
  },
  async scheduled(_event, env): Promise<void> {
    await env.RESULTS.batch([
      env.RESULTS.prepare('DELETE FROM results WHERE expires_at<=?').bind(Math.floor(Date.now()/1000)),
      env.RESULTS.prepare('DELETE FROM ai_daily_usage WHERE day<?').bind(new Date(Date.now()-2*86400000).toISOString().slice(0,10)),
      env.RESULTS.prepare('DELETE FROM diagnostic_events WHERE created_ms<=?').bind(Date.now()-2*60*60*1000)
    ]);
  }
} satisfies ExportedHandler<Env>;
