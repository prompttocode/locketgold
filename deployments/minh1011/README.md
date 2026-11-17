# V7.4 — bản chia sẻ trên tài khoản Minh

Cập nhật thêm cùng ngày: hàng AI có Grab (`ai_grab`, grab.jpg) và Bee (`ai_bee`, bee.jpeg), tổng19 filters. Bốn AI dùng chung80 lượt/ngày; chỉ thay áo, giữ người/cảnh gốc. Chữ thương hiệu trên áo Bee là `be`. Link module và khóa không thay đổi.

Cập nhật 17/11/2026: bổ sung **AI → Sang trọng** (`ai_luxury`, icon vest.png trong suốt thay vest.jpg), tổng cộng 17 filters. Prompt Sang trọng yêu cầu giữ nguyên cảnh xung quanh, chỉ thay trang phục. Mùa đông giữ nguyên; cả hai AI dùng chung giới hạn 80 lượt/ngày trên bản chia sẻ. Backend chung đã thêm lựa chọn prompt bằng ID, vẫn giữ cơ chế phục hồi V7.4.

- Tài khoản Cloudflare: `nguyendinhminh1011@gmail.com`, ID `3af454bb633da80ba0e33d853e1aa4cc`.
- Auth profile cục bộ: `minh1011`, chỉ được gắn với thư mục này; tài khoản mặc định của dự án gốc giữ nguyên.
- Worker: `locket-photobooth`, origin `https://locket-photobooth.minh1011-locket.workers.dev`.
- Database riêng: `locket-photobooth-results`, ID `5e15b045-7c6e-4b1e-97ce-162d5ab7adbb`.
- Khóa riêng ở `private/secrets.json` và Cloudflare Secret `LAB_KEY`; không dùng khóa của tài khoản gốc. Mọi URL own-server trong module, scripts, config và icons trỏ về origin mới.
- Source hành vi giữ nguyên V7.4 đã chốt ở commit `c1096f2`; chỉ thay origin/hostname và key khi build. Worker handler dùng chung snapshot source `../../v7.1/src/index.ts`, nhưng bindings AI/Images/D1 nằm trên tài khoản mới.

Chạy trong thư mục này: `python3 build.py`, `node test.mjs`, `npx wrangler deploy --config wrangler.jsonc`, `npx wrangler secret bulk private/secrets.json --config wrangler.jsonc`. Nếu máy chưa có profile: tạo profile `minh1011`, xác nhận đúng email rồi `wrangler auth activate minh1011 <thư-mục-này>`. Không dùng profile của tài khoản gốc để triển khai bản này.

Lần triển khai 17/11/2026: email đã được người dùng xác minh; publish `08304512-8b7d-4267-8615-9469befec630`, sau đó secret upload tạo phiên bản đang chạy `fe502c3b-43f2-459c-ac1a-4882b65a02b2`. Handler, khung ảnh, AI và điều kiện phục hồi V7.4 không thay đổi. Không nâng gói trả phí.

`node live-check.mjs` đã kiểm tra module + ba script bằng hash, health 200, khóa sai 401, mô phỏng gateway 502 phục hồi qua Worker thật trả 200, JPEG 226348 byte. AI Mùa đông qua Workers AI trên tài khoản mới trả 200/JPEG232691 byte trong 7779ms. Hai ảnh thử dùng ảnh mẫu của server, không dùng ảnh người dùng. D1 mới có một lượt AI sau bài kiểm tra; giới hạn vẫn là 80 lượt AI/ngày cho toàn bộ bản chia sẻ, không phải mỗi người dùng.

Link module và mapping nằm trong `private/links.json`; `.dev.vars`, private/, public/ và .wrangler/ đều bị Git bỏ qua. Lần triển khai này không thay đổi hoặc redeploy server gốc của Nam; kiểm tra health gốc bằng Node fetch vẫn 200/16 filters.
