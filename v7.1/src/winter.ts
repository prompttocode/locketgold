import {Buffer} from 'node:buffer';

export const WINTER_ID = 'ai_winter';
export const LUXURY_ID = 'ai_luxury';
export const GRAB_ID = 'ai_grab';
export const BEE_ID = 'ai_bee';
export const WINTER_MODEL = '@cf/black-forest-labs/flux-2-klein-4b';
export const WINTER_PROMPT = `Edit the supplied photograph into a convincing photorealistic winter scene. Treat the photograph as the source of truth, not as loose inspiration.
Preserve the same main subjects, number of people or animals, identity, facial structure, expression, pose, body proportions, clothing design and colors, objects, composition and camera angle as faithfully as possible. Do not beautify, age, replace, add or remove people or invent new facial details. Preserve readable existing text and logos where possible. Subject fidelity takes priority over dramatic changes.
Adapt to the actual content: portrait, group, landscape, room, object or pet. Transform the surroundings into a snowy winter environment while preserving the original setting and recognizable structure. For indoor scenes, keep the room intact and suggest winter through windows and natural cool light; do not implausibly bury an inhabited room in snow.
Use realistic settled snow on appropriate surfaces, subtle falling snow at multiple depths, cold atmospheric perspective and coherent winter lighting, shadows, reflections and perspective. If appropriate, place a light natural dusting on hair, shoulders, roofs or trees without hiding faces, clothing details or the subject. Keep skin tones believable.
Blend naturally with no cutout outlines, pasted backgrounds, artificial halos, cartoon rendering or excessive effects. Cinematic but natural winter photography, detailed textures, realistic snow particles and shadows. No added text, collage, decorative frame or watermark. Return one completed square photograph.`;

export const LUXURY_PROMPT = `Use the supplied photograph as the source image and upgrade only the people's clothing into photorealistic luxury fashion, keeping the exact original background and surroundings.
Preserve every person's identity, face, facial structure, distinctive features, apparent age, skin tone, hairstyle, expression, pose, body shape and proportions as faithfully as possible. Do not replace faces, beautify excessively, change facial anatomy, change the number of subjects, or turn anyone into a different person. Identity and original scene fidelity take priority over wardrobe enhancement.
Replace everyday clothing with refined, age-appropriate luxury formalwear, selected individually for each subject using visible styling and the original outfit rather than guessing gender identity. Suitable options include a beautifully tailored luxury suit with a white shirt, tie or bow tie and polished leather shoes; or an elegant evening gown or tasteful couture wedding dress with restrained jewelry and, where appropriate, a veil and matching formal shoes. For an ambiguous style, prefer elegant neutral tailoring. Do not force the same outfit onto everyone in a group.
Fit each new garment naturally to the original pose and body. Show realistic high-quality fabrics, seams, folds, drape, fastenings and contact shadows. Preserve hands, limbs, hair and subject proportions. Keep accessories tasteful and do not obscure faces.
BACKGROUND LOCK: Keep the original location, scenery, room, architecture, walls, furniture, plants, sky, ground, objects and their positions unchanged. Preserve the original camera angle, composition, perspective, depth of field, ambient lighting, background colors, shadows and reflections. Do not replace the background with a hotel, palace, wedding venue, fashion studio or any other setting. Do not add, remove, move, blur, beautify, recolor or regenerate surrounding objects. Only fit and light the new clothing to the existing photograph, with realistic local contact shadows and no pasted edges or artificial halos. Do not globally relight or restyle the scene.
If there are no people, leave the main object, animal, background and surroundings unchanged; do not invent people, human bodies or a different environment. Detailed realistic fabric and believable formalwear naturally integrated into the original photo. No added text, watermark, decorative frame or collage. Return one finished square photograph.`;

const UNIFORM_PHOTO_RULES = `The uploaded photograph is the source of truth. Change only the main foreground person's upper-body clothing to the described jacket; for a foreground group, fit that same jacket individually to each main subject. Preserve every person's identity, face, facial features, apparent age, skin tone, hairstyle, expression, pose, hands, body shape and proportions. Preserve the original pants, shoes and other visible accessories. Keep the original crop and viewpoint; do not invent a full body to display the jacket.
BACKGROUND LOCK: Keep the exact original background and surroundings, including scenery, architecture, furniture, objects, background people, their positions, ambient light, colors, camera angle and depth of field. Do not add a motorcycle, helmet, hat, delivery bag, street scene or a different setting. Adapt the jacket's fabric highlights, folds, perspective and local contact shadows to the existing photograph. Do not globally recolor or relight the image, redraw faces or hands, or create pasted edges or halos.
The result must look like the same person naturally photographed wearing the jacket at the same place and moment. Keep brand lettering confined to the garment, following its folds and perspective; no extra watermark, caption, frame or invented text. If no people are present, preserve the original image rather than inventing people or dressing objects. Return one photorealistic square photograph.`;

export const GRAB_PROMPT = `Edit the supplied photograph so the main person naturally wears this specific Vietnamese Grab motorbike rider windbreaker, matching all garment details below.
A lightweight, slightly lustrous woven nylon/polyester zip-front jacket with a relaxed practical fit and long sleeves. The main body, shoulder/upper-chest yoke and lower sleeves are vivid Grab emerald/grass green. A broad contrasting dark forest-green panel runs across the mid-chest and upper arms; its lower edge dips slightly toward the center front zipper. The lower body returns to bright green. A tall bright-green stand-up collar has a narrow black inner fastening detail. The full-length center-front zipper is green with a small silver-colored pull. Include subtle vertical hand-pocket seams and gathered elasticated green cuffs, with realistic seams, creases and fabric drape.
Place a small white outlined Grab wordmark on the wearer's LEFT chest (viewer-right in a front-facing view). Place large white outlined Grab lettering lengthwise down the outside of both forearms. Use the correctly spelled Grab continuous double-stroke outline logotype, not a generic block-letter label. A narrow silver-gray reflective band encircles each sleeve near the elbow. On the wearer's RIGHT upper sleeve (viewer-left in a front-facing view), above the reflective band, place a small rectangular Vietnamese flag patch: a red field with one centered yellow five-pointed star. Do not swap the chest logo and flag sides. Do not turn the jacket into a suit, vest, T-shirt or sleeveless uniform.
${UNIFORM_PHOTO_RULES}`;

export const BEE_PROMPT = `Edit the supplied photograph so the main person naturally wears this specific Vietnamese be motorbike rider windbreaker, matching all garment details below. The filter display name is Bee, but the actual garment logo must read lowercase be.
A lightweight woven nylon/polyester long-sleeved jacket with a vivid golden-yellow main body and yellow sleeves. A broad royal/cobalt-blue yoke covers the shoulders and upper chest, with a nearly straight lower edge across the chest. The high stand-up collar is royal blue. A full-length YELLOW center-front zipper divides the blue yoke and yellow lower body and has a small dark/silver pull. The cuffs are gathered elastic in royal blue, and the lower hem has a narrow royal-blue band. There are two slim vertical hand pockets low on the front, with royal-blue zipper trim and small silver pulls. Show realistic stitching, natural folds, a slightly lustrous practical windbreaker texture and a relaxed fit.
Put a large rounded lowercase yellow be logo on the wearer's LEFT chest (viewer-right in a front-facing view), fully inside the royal-blue chest panel. Put large royal-blue lowercase be lettering lengthwise on the yellow outside forearms of both sleeves. On the wearer's LEFT upper sleeve (viewer-right in a front-facing view), place a small rectangular Vietnamese flag patch with a red background and one centered yellow five-pointed star. Keep the spelling be rather than Bee on the garment itself. Do not add Grab lettering, green color panels or silver reflective sleeve bands that are absent from this design.
${UNIFORM_PHOTO_RULES}`;

export const AI_PROMPTS = {[WINTER_ID]: WINTER_PROMPT, [LUXURY_ID]: LUXURY_PROMPT, [GRAB_ID]: GRAB_PROMPT, [BEE_ID]: BEE_PROMPT} as const;
export type AiFilterId = keyof typeof AI_PROMPTS;
export function aiFilterId(value: unknown): AiFilterId | undefined {
  return typeof value === 'string' && Object.hasOwn(AI_PROMPTS,value) ? value as AiFilterId : undefined;
}

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

export function winterRequest(bytes: Uint8Array, prompt: string = WINTER_PROMPT) {
  const form = new FormData();
  form.append('prompt', prompt);
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

export async function generateWinter(bytes: Uint8Array, env: Env, filter: AiFilterId = WINTER_ID): Promise<Uint8Array> {
  const input = winterRequest(bytes, AI_PROMPTS[filter]);
  // Atomic, account-wide budget shared by all AI filters. Failed attempts count too;
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
