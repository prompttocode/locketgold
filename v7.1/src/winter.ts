import {Buffer} from 'node:buffer';

export const WINTER_ID = 'ai_winter';
export const WINTER_MODEL = '@cf/black-forest-labs/flux-2-klein-4b';
export const WINTER_PROMPT = `Edit the supplied photograph into a convincing photorealistic winter scene. Treat the photograph as the source of truth, not as loose inspiration.
Preserve the same main subjects, number of people or animals, identity, facial structure, expression, pose, body proportions, clothing design and colors, objects, composition and camera angle as faithfully as possible. Do not beautify, age, replace, add or remove people or invent new facial details. Preserve readable existing text and logos where possible. Subject fidelity takes priority over dramatic changes.
Adapt to the actual content: portrait, group, landscape, room, object or pet. Transform the surroundings into a snowy winter environment while preserving the original setting and recognizable structure. For indoor scenes, keep the room intact and suggest winter through windows and natural cool light; do not implausibly bury an inhabited room in snow.
Use realistic settled snow on appropriate surfaces, subtle falling snow at multiple depths, cold atmospheric perspective and coherent winter lighting, shadows, reflections and perspective. If appropriate, place a light natural dusting on hair, shoulders, roofs or trees without hiding faces, clothing details or the subject. Keep skin tones believable.
Blend naturally with no cutout outlines, pasted backgrounds, artificial halos, cartoon rendering or excessive effects. Cinematic but natural winter photography, detailed textures, realistic snow particles and shadows. No added text, collage, decorative frame or watermark. Return one completed square photograph.`;

export class WinterError extends Error {
  constructor(message: string, readonly code: string, readonly status = 502) { super(message); }
}

function record(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown> : {};
}

export function imageMime(bytes: Uint8Array): string {
  if (bytes[0] === 0xff && bytes[1] === 0xd8) return 'image/jpeg';
  if (bytes.length >= 8 && Buffer.from(bytes.subarray(0, 8)).equals(Buffer.from([137,80,78,71,13,10,26,10]))) return 'image/png';
  if (bytes.length >= 12 && Buffer.from(bytes.subarray(0,4)).toString() === 'RIFF' && Buffer.from(bytes.subarray(8,12)).toString() === 'WEBP') return 'image/webp';
  throw new WinterError('AI chỉ nhận ảnh JPEG, PNG hoặc WebP hợp lệ.', 'AI_INVALID_INPUT', 422);
}

export function winterRequest(bytes: Uint8Array) {
  const form = new FormData();
  form.append('prompt', WINTER_PROMPT);
  form.append('width', '1024');
  form.append('height', '1024');
  form.append('input_image_0', new Blob([new Uint8Array(bytes)], {type:imageMime(bytes)}), 'reference');
  const response = new Response(form);
  if (!response.body) throw new WinterError('Không tạo được dữ liệu AI.', 'AI_INVALID_INPUT',422);
  return {multipart:{body:response.body,contentType:response.headers.get('content-type')!}};
}

export function winterOutput(payload: unknown): Uint8Array {
  const root = record(payload);
  if (typeof root.image === 'string') {
      const data = root.image.replace(/^data:image\/(?:png|jpeg|webp);base64,/, '');
      if (data.length > 12 * 1024 * 1024 || !/^[A-Za-z0-9+/=\r\n]+$/.test(data)) {
        throw new WinterError('Ảnh AI không hợp lệ hoặc quá lớn.', 'AI_INVALID_IMAGE');
      }
      const bytes = Buffer.from(data, 'base64');
      imageMime(bytes);
      return bytes;
  }
  // Never expose provider text: it could contain input or request details.
  throw new WinterError('AI chưa tạo được ảnh; ảnh có thể bị từ chối hoặc không có kết quả.', 'AI_NO_IMAGE', 422);
}

export async function generateWinter(bytes: Uint8Array, env: Env): Promise<Uint8Array> {
  const input = winterRequest(bytes);
  // Atomic, account-wide budget for this filter. Failed attempts count too;
  // never retry automatically or switch to another paid provider.
  const day = new Date().toISOString().slice(0,10);
  const budget = await env.RESULTS.prepare(`INSERT INTO ai_daily_usage(day,attempts) VALUES (?,1)
    ON CONFLICT(day) DO UPDATE SET attempts=attempts+1 WHERE attempts<80 RETURNING attempts`)
    .bind(day).first<{attempts:number}>();
  if (!budget) throw new WinterError('Đã hết 80 lượt AI hôm nay. Hạn mức đặt lại lúc 07:00 giờ Việt Nam.', 'AI_DAILY_LIMIT',429);
  let result: unknown;
  try {
    result = await env.AI.run(WINTER_MODEL, input);
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    const quota = /quota|daily|neurons|rate.?limit|429|7505|limit exceeded/i.test(message);
    console.error(JSON.stringify({event:'workers_ai_failed',quota}));
    throw new WinterError(quota ? 'Workers AI đã hết hạn mức hoặc đang quá tải.' : 'Workers AI chưa xử lý được ảnh.',
      quota ? 'AI_CLOUDFLARE_QUOTA' : 'AI_CLOUDFLARE_FAILED',quota ? 429 : 502);
  }
  return winterOutput(result);
}
