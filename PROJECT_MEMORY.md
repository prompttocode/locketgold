# Ghi nhớ dự án

## Đưa bộ asset đã build lên Git — 17/11/2026

- Người dùng hỏi thêm assets lên GitHub sau lần push sourceAI. Ảnh gốc đã có ở v7/frames, v7/ai và v7/static; bổ sung canonical `v7/public/assets/` để xem trực tiếp bộ phục vụ app.
- Có38 PNG, tổng14443263bytes (khoảng13,8MiB): khung chuẩn hóa, thumbnail, iconAI và ảnh mẫu màu trơn/blank. Không có ảnh chụp người dùng, key hoặc script trong bộ này. Các tên alias trùng nội dung được giữ để tương thích đường dẫn client.
- Bỏ đúng ignore v7/public/assets/. Các public/modules, public/config, private, env, credential, snapshot và bản sao public V7.1–V7.4/Minh vẫn bị Git bỏ qua. Không stage root public/src/experiments chưa theo dõi.
- Lượt này chỉ commit/push ảnh và tài liệu, không deploy hoặc đổi module/routing/backend. Các câu lịch sử “không đưa tài nguyên public sinh tự động” có ngoại lệ mới cho bộ PNG canonical này.

## Chốt push bổ sung AI — 17/11/2026

- Người dùng yêu cầu push trạng thái hiện tại lên GitHub: Sang trọng giữ cảnh gốc + vest.png trong suốt, Grab/Bee và bốn AI dùng chung quota; kèm nguồn triển khai độc lập cho tài khoản Minh.
- Chỉ đưa source, tài liệu, tests và các icon người dùng yêu cầu vào commit. Không đưa key/token, module đã nhúng key, private/, ảnh thử, log hoặc tài nguyên public sinh tự động vào Git. Không đưa các thử nghiệm root chưa theo dõi từ trước vào commit.
- Bộ kiểm tra19filters/95routes, prompt dispatch/quota/input, hồi phụcV7.4 300cặp, TypeScript và so sánh bản Minh đã pass ở lượt triển khai Grab/Bee. Chỉ push Git, không deploy lại hoặc đổi link module trong lượt này.
- Các câu “chưa push” ở các mục lịch sử bên dưới là trạng thái trước lần chốt này.

## Grab và Bee — 17/11/2026

- Người dùng yêu cầu thêm áo Grab, sau đó bổ sung áo be trong lúc đang làm; đã giữ cả hai yêu cầu và triển khai cùng lượt. Tên filter **Grab** (`ai_grab`) và **Bee** (`ai_bee`), icon từ `/Users/namdeptrai/Downloads/grab.jpg` và `/Users/namdeptrai/Downloads/bee.jpeg`, sao chép vào `v7/ai/`. Đã xem cả hai icon và ảnh áo trong hội thoại.
- GRAB_PROMPT mô tả áo gió xanh lá sáng + dải xanh rừng đậm giữa ngực/bắp tay, cổ đứng, khóa xanh, logo Grab trắng viền ở ngực trái và dọc cẳng tay, dải phản quang bạc gần khuỷu, cờ Việt Nam ở bắp tay phải. BEE_PROMPT mô tả thân/tay vàng, vai/ngực trên/cổ xanh royal/cobalt, khóa vàng, cổ tay/gấu xanh, hai túi khóa dọc viền xanh, chữ be vàng ngực trái, chữ be xanh cẳng tay, cờ Việt Nam ở bắp tay trái. Tên UI Bee nhưng chữ trên áo là `be`, không viết Bee.
- UNIFORM_PHOTO_RULES yêu cầu chỉ thay áo người/nhóm tiền cảnh, giữ danh tính/khuôn mặt/tư thế/tay/tỷ lệ/quần/giày và toàn bộ cảnh gốc; không tự thêm xe/mũ/đổi cảnh. Ảnh áo chỉ để viết mô tả, **không gửi làm tham chiếu thứ hai**. Icon cũng không dùng làm ảnh input. Prompt không bảo đảm chữ/logo hoặc mọi pixel chính xác tuyệt đối; chưa có portrait/UI test.
- Catalog hiện19 filters:7Photobooth+8Khung+4AI (Mùa đông, Sang trọng, Grab, Bee), đủ snake/camel/picker/remote aliases. AI_PROMPTS registry nhận4 ID; index/health tự đếm4AI. Bốn filter dùng chung80 lượt/ngày/account, không đổi model/schema/keys/module URLs hoặc V7.4 recovery templates.
- Prompt tiếng Việt để người dùng xem tại `v7/ai/uniform-prompts.md`; thực thi English tại v7/src/winter.ts và snapshotv7.1. Icon content-hash: ai-grab-icon-4818b3040799.png, ai-bee-icon-e7782eae70e7.png, mỗi256x256. File nguồn giữ nguyên bytes người dùng cung cấp.
- Build/test/check/main&Minh source comparison pass:95 routes, prompt dispatch/input/shared cap, regressionV7.4 300cặp và bộ khác. Deploy Nam `e505d500-5b40-4edd-b847-f42f21f0191c`, Minh `fd868a4f-79ca-4e77-bfef-f142580c90fb`.
- Live qua V7.4 response recovery với ảnh mẫu màu trơn: Grab trên Nam200/JPEG99037bytes,7835ms; Bee trên Minh200/JPEG135617bytes,18426ms; đúng1POST mỗi lượt. Module/3scripts hash,4AIrow và health19/icon fetch pass trên cả2server. Kiểm tra này xác nhận pipeline, không xác nhận độ chính xác áo trên người thật hoặc iPhone. Kết quả dưới private/ không commit. Chưa push source lượt này.
- Bối cảnh cập nhật Shadowrocket: người dùng nói nút Modules nhưng ảnh15:13 là menu tệp `.conf`; chứng chỉ/công tắc vẫn còn. Xóa module/thêm lại và chứng chỉ, cài lại Locket thì nhận cấu hình được. Chưa có PacketTunnel của lúc cập nhật hỏng để chốt cache/script/profile nào lỗi. Không khẳng định đổi link cần chứng chỉ mới hoặc cập nhật chắc chắn làm mất chứng chỉ. Filter mới cần Locket tải lại catalog; thay prompt backend áp dụng ngay cho ID đã có.

## Sang trọng: PNG mới và giữ nguyên cảnh — 17/11/2026

- Người dùng yêu cầu thay icon vest cũ bằng `/Users/namdeptrai/Downloads/vest.png` và thêm yêu cầu giữ nguyên cảnh xung quanh. Đã xem ảnh PNG trong suốt; sao chép nguyên bản thành `v7/ai/vest.png`, bỏ bản nguồn icon `v7/ai/vest.jpg` khỏi dự án (không xóa ảnh gốc trong Downloads).
- Builder luxury giữ RGBA, thumbnail244×256 alpha0..255; icon mới có URL hash `ai-luxury-icon-9afd1628e1bf.png`,37656bytes. URL cũ `/assets/v7/ai-luxury-icon.png` cũng phục vụ cùng PNG mới để tương thích catalog đang lưu; không dùng icon làm ảnh tham chiếu AI.
- LUXURY_PROMPT ở v7/src và v7.1/src yêu cầu chỉ thay trang phục, giữ chính xác cảnh gốc, vật thể/vị trí/camera/màu/ánh sáng nền; bỏ yêu cầu tự chọn khách sạn/cung điện/studio. Trang phục mới khớp ánh sáng sẵn có, không relight toàn cảnh. Không bảo đảm đầu ra pixel-identical chỉ bằng prompt; không thêm mask/segmentation hoặc đổi provider. Winter, quota80 và V7.4 recovery templates không thay đổi.
- Tests/build/TypeScript và so sánh nguồn bản Minh pass; kiểm tra PNG alpha và legacy alias pass. Không chạy thêm inference AI trong lượt sửa prompt/icon này; test xác nhận prompt dispatch/background requirements, không khẳng định đã kiểm chứng giữ bối cảnh trên chân dung.
- Deploy cả hai server: Nam `fb59f3c7-c74d-4a9e-853b-4f614eb88cc2`; Minh `58ee0859-5357-4341-a5f7-f46e303d0dba`. Module URL/key/UID ai_luxury giữ nguyên. Remote module/3scripts được đối chiếu hash và icon mới/legacy bytes trùng nguồn trên cả hai account, đều200.
- Prompt mới áp dụng tại server cho các lượt Sang trọng tiếp theo, không cần cấu hình mới chỉ để đổi prompt. Icon có thể cần Locket nhận lại catalog hoặc hết cache; không bảo người dùng tạo lại chứng chỉ chỉ vì đổi icon/linkscript.

## AI Sang trọng — 17/11/2026

- Người dùng yêu cầu thêm filter **Sang trọng**, icon `/Users/namdeptrai/Downloads/vest.jpg`, prompt thay trang phục thành đồ dự tiệc cao cấp và cảnh sang trọng, ưu tiên bảo toàn khuôn mặt/danh tính/kiểu tóc/tư thế/tỷ lệ. Đã xem ảnh icon: ảnh áo ghi-lê, sao chép thành `v7/ai/vest.jpg`; chỉ làm icon, không dùng làm ảnh tham chiếu.
- Đã cập nhật cả bản Nam và bản Minh (đã thông báo phạm vi này trước khi làm). ID `ai_luxury`, cùng hàng AI với `ai_winter`, tổng17 filters. Mọi biến thể snake/camel, picker, remote_filters, native selector đều thêm ID mới. 15 mẫu frame/PB và prompt Mùa đông giữ nguyên.
- `v7/src/winter.ts` và `v7.1/src/winter.ts` có AI_PROMPTS, aiFilterId và LUXURY_PROMPT. Server chỉ chọn prompt cố định theo ID; không nhận prompt tùy ý. Prompt chọn trang phục theo phong cách hiển thị, không đoán danh tính giới. Không cam kết bảo toàn danh tính tuyệt đối; không tuyên bố xuất4K. Model vẫn FLUX.2 klein4B, tham chiếu512px, outputAI1024 rồi JPEG1080.
- Hai AI dùng chung một bộ đếm80 lượt/ngày trong D1 của mỗi tài khoản; không tăng quota và không đổi schema. `v7/src/index.ts`/snapshotV7.1 route cả hai AI qua cùng pipeline; health filter_count17. `v7.4/pending.js` và `recover.js` giữ nguyên; chỉ selector native thêm ID. Hai module URL/key giữ nguyên, script paths đổi hash để nhận mã mới.
- Build đầy đủ và bản Minh pass; test85 routes, prompt dispatch/multipart/ảnh tham chiếu/quota shared/cap/no implicit retry pass; V7.1/V7.2/V7.3/V7.4 regression (V7.4 270 cặp) pass, TypeScript và dry-run cả hai tài khoản pass. Test lúc đầu so prompt thất bại vì multipart chuẩn hóa LF thành CRLF; đã chuẩn hóa newline trong assertion, không sửa prompt để chữa test.
- Deploy Nam `50fd613d-1bb2-4d9d-9012-4d088e0d781b`, Minh `cde107c7-4631-42bf-8d72-d07a91c01c0b`. Không thay tài khoản, database, key hoặc giới hạn đã chốt.
- `node v7.4/live-luxury.mjs [minh1011]` kiểm tra module/3 scripts bằng hash, icon/config17, mô phỏng gateway502 qua response recovery thật với **ảnh mẫu màu trơn**, không ảnh người dùng. Nam200/JPEG215862bytes (~10,95s), Minh200/JPEG203790bytes (~7,08s); mỗi bản đúng1POST AI. Chỉ chứng minh pipeline/dispatch/tảiảnh, chưa chứng minh chỉnh trang phục trên chân dung hoặc UI trên iPhone. Kết quả cục bộ private/ bị Git bỏ qua.
- Cần người dùng cập nhật module, kết nối lại Shadowrocket để tải config mới rồi chọn AI → Sang trọng. Module link chính và link chia sẻ Minh giữ nguyên. Source của lượt bổ sung này chưa commit/push Git.

## Triển khai thêm tài khoản Minh để chia sẻ — 17/11/2026

- Người dùng yêu cầu thêm bản V7.4 trên `nguyendinhminh1011@gmail.com` để tách mức sử dụng của bạn bè khỏi tài khoản Nam. Không thay deployment gốc.
- Đã tạo OAuth profile `minh1011` qua Wrangler, người dùng xác nhận OAuth và xác minh email khi deploy bị chặn code10034. Profile chỉ active cho `deployments/minh1011`; default dự án gốc vẫn Nam. Không xuất/log OAuth token hoặc renderer key.
- Account mới `3af454bb633da80ba0e33d853e1aa4cc`, workers.dev `minh1011-locket`, Worker `locket-photobooth`, origin `https://locket-photobooth.minh1011-locket.workers.dev`. D1 mới `locket-photobooth-results`/`5e15b045-7c6e-4b1e-97ce-162d5ab7adbb`, đủ ba bảng results/diagnostic_events/ai_daily_usage.
- Source triển khai và tài liệu tại `deployments/minh1011/`. Build lấy V7.4 đã chốt, thay đúng origin/hostname/renderer key; kiểm tra mã sau thay biến bằng đối chiếu chính xác source và ảnh bằng hash. Chỉ xuất ba scripts/module V7.4 cho origin mới, giữ 16 filters. Test xác nhận regex response hook dùng hostname mới (đã sửa khác biệt escape dấu gạch ngang giữa Python/JS trước deploy).
- Renderer key độc lập được tạo cục bộ vào private/secrets.json (0600), upload Secret LAB_KEY trên account mới. Không chuyển key/counter/ảnh của account cũ sang. Toàn bộ public/private/dev.vars/wrangler-generated của bản mới bị Git bỏ qua.
- Publish ban đầu `08304512-8b7d-4267-8615-9469befec630`, secret upload tạo phiên bản đang chạy `fe502c3b-43f2-459c-ac1a-4882b65a02b2` (deployment `d1da71e9-09fb-4b1b-9d16-bc2a164a87c6`). Không nâng tài khoản trả phí.
- Live: module/3scripts hash pass, health200, key sai401; recovery Photobooth mô phỏng gateway→Worker mới200/body2054, tải JPEG226348bytes; AI thật với ảnh mẫu200/JPEG232691bytes,7779ms. D1 mới sau test có một lượt AI và hai ảnh kết quả. AI cap vẫn80/ngày cho cả bản chia sẻ, không phải mỗi người. Chưa có xác nhận iPhone dùng origin mới; hành vi source chỉ thay host/key, bản V7.4 gốc đã được user xác nhận.
- Link module mới: tra `deployments/minh1011/private/links.json` tại máy triển khai; không công bố URL tải module chứa key trong Git. Health account gốc bằng Node fetch200/16filters; không redeploy account gốc. Python urllib một lượt403 nhưng Node fetch200; không suy ra account gốc hỏng từ lượt urllib.

## Bản chốt người dùng xác nhận — V7.4, 17/11/2026

- Người dùng báo V7.4 đã chạy được và yêu cầu chốt, push lên GitHub. Hiểu “v4” trong tin nhắn cuối là V7.4 theo bản đang thử; không phải thử nghiệm V4 cũ.
- Giữ deployment `ab5c25c9-3f3b-4b12-a852-e735d02a6e08`, module V7.4 và V7 dự phòng nguyên vẹn. Lần chốt này chỉ cập nhật tài liệu, lệnh mặc định và Git; không triển khai thêm thay đổi routing/backend.
- `package.json` chuyển build/test/dev/deploy/check/types sang luồng V7.4; build cần tạo các tài nguyên V7–V7.3 làm đầu vào để giữ URL cũ. Các thử nghiệm V7.2/V7.3 được lưu source cùng trạng thái thất bại, không phải bản được chọn.
- Không khẳng định hết lỗi trong mọi điều kiện hoặc đã kiểm thử tải nhiều người dùng chỉ từ xác nhận này. Các giới hạn cache/nonce/TTL và điều kiện retry vẫn giữ trong README V7.4.

## V7.2 log đủ bốn lần và V7.4 — 17/11/2026

- Nguồn người dùng: `/Users/namdeptrai/Downloads/PacketTunnel-20261117135911.log`. Bốn lần relay_start đều đọc body 1788 ký tự, bốn relay_response đều HTTP 200/body 1928: 13:59:37.157 (2696ms), 13:59:45.413 (1940ms), 13:59:53.415 (2065ms), 14:00:02.471 (2313ms). Sau mỗi lần là `send early response to client`; không có GET `/results/` trong file. App phiên bản 2.73.0. Không log/copy Authorization, Cookie hoặc LAB_KEY trong tài liệu.
- Điều này xác nhận `$httpClient.post` của V7.2 tới Worker thành công trên iPhone cả bốn lần. Chưa biết raw HTTP/JSON Locket nhận thực tế, nên chỉ khoanh vùng đường trả early response/client parsing, chưa kết luận Content-Length/status/body hay engine bug nào cụ thể.
- Người dùng báo V7.3 vẫn xen kẽ. Không tiếp tục request mồi `/health`.
- Đã deploy thử riêng V7.4 `ab5c25c9-3f3b-4b12-a852-e735d02a6e08` từ `v7.4/wrangler.jsonc`, chỉ thêm ba assets. Handler V7.1 giữ nguyên, mọi assets cũ giữ byte-identical.
- V7.4: native rewrite V7 như cũ; request JSON dưới 65536 ký tự được giữ tạm trên thiết bị trong 16 slot cố định `$persistentStore`, TTL logic 120 giây; không lưu auth headers/cookie/key renderer. `X-Namdz-Pending` là nonce tương quan không bí mật. Response hook đọc đúng nonce, xóa slot trước async work; slot mất/hết hạn/tranh chấp thì không retry nhầm request.
- Chỉ một lần phục hồi nếu 502, text/plain, Via, thiếu Server/CF-Ray và body ngắn chứa Bad Gateway. Gọi Worker độc lập rồi trả `{status,headers,body}` trực tiếp từ http-response, tránh early response `{response:{...}}`. 200, 401/429, lỗi JSON Worker, 502 có CF-Ray giữ nguyên và xóa cache. Không có đảm bảo exactly-once phía backend nếu gateway khác làm mất headers.
- Kiểm tra 255 cặp filter/body, cache tiêu thụ/giới hạn/TTL/nonce, duplicate callback, giữ routing V7, không retry success/quota/JSON errors, không forward auth và mọi assets cũ bất biến: pass. V7.1/V7.2/V7.3 regression, TypeScript, deploy dry-run pass.
- Live Node mô phỏng gateway 502 rồi dùng Worker thật với ảnh mẫu: một POST phục hồi 200/body1928, GET JPEG 200/226348 byte, 808ms cho POST. Hash module/scripts V7, V7.3, V7.4 pass. Chưa kiểm chứng response hook, shared store/header hay hiển thị ảnh trên iPhone; cần thử bản V7.4. Console `pending_saved`, `native_response`, `recovery_start`, `recovery_response`, `pending_missing` hỗ trợ phân biệt.

## V7.3 thử request mồi — 17/11/2026

- Người dùng thử V7.2 bốn lần đều thất bại, quay lại V7, sau đó yêu cầu thử riêng V7.3 với phương pháp fake/mồi. Không coi relay V7.2 là đã chạy được trên iPhone.
- V7.3 deploy `9daa082a-4285-4240-bbdc-5285cc63c426` từ `v7.3/wrangler.jsonc`, chỉ thêm ba assets module/native/observer. Handler vẫn dùng nguyên `v7.1/src/index.ts`; mọi tài nguyên cũ giữ byte-identical, V7 vẫn có thể chọn lại.
- Cách thử: `$httpClient.get` tới `/health` trước, timeout 3 giây/watchdog 3,5 giây khi có timer, rồi tiếp tục quyết định native rewrite V7 nguyên vẹn. Probe không mang ảnh, dữ liệu request, token Locket hay khóa renderer; không dùng Images/AI hoặc ghi D1. Chỉ một probe, không fake ảnh hoặc retry render/AI. Log cục bộ revision `7.3`, `prime_start`/`prime_done` và observer như V7.1.
- Giới hạn cần nói rõ: GET chạy trên client riêng, không chứng minh thao tác được cùng socket upstream của Locket hoặc tương đương bấm chụp hai lần. Đây chỉ là thí nghiệm warm-up; chưa biết có sửa được xen kẽ. Khi probe lỗi/timeout/thiếu client vẫn tiếp tục theo V7 để không chặn ảnh thật.
- Kiểm tra 340 biến thể filter/body giữ nguyên quyết định V7, watchdog/callback trùng/lỗi mạng/thiếu client/UTF-8, không gửi dữ liệu ảnh/credentials vào probe và mọi assets cũ bất biến: pass. V7.1/V7.2 regression pass; deploy dry-run pass.
- Live Node mô phỏng thứ tự: health 200 rồi một POST ảnh mẫu Photobooth 200, GET JPEG 200/226348 byte. Không kiểm chứng engine hoặc tái sử dụng kết nối trên iPhone. Module/scripts V7, V7.1, V7.2, V7.3 được đối chiếu hash trên server, pass.

## V7.2 relay độc lập — 17/11/2026

- Đã deploy `2042080b-7129-45f3-8a7c-721446a6579c` bằng `v7.2/wrangler.jsonc`. Chỉ thêm hai assets: module V7.2 và relay script. Handler vẫn trỏ nguyên nguồn `v7.1/src/index.ts`; tất cả assets V7/V7.1 giữ byte-identical.
- Script dùng `$httpClient.post` gửi JSON gốc cho Worker, rồi `$done({response:{status,headers,body}})`; không rewrite URL của kết nối API Locket. Chỉ xử lý filter riêng, không gửi Authorization/Cookie/Host/Content-Length của Locket sang Worker. Chỉ một POST mỗi lần gọi, không retry hay request log. Console revision `7.2`, các stage `relay_start`, `relay_response`, `relay_network_error`, `relay_invalid_response`.
- Kiểm tra 340 biến thể filter/body, UTF-8 khi không có TextDecoder, HTTP status/statusCode/status-line, lỗi mạng/response không hợp lệ, duplicate callback, không lộ dữ liệu log và giữ nguyên mọi assets cũ: pass. V7.1 tests 87 trường hợp và TypeScript pass; deploy dry-run pass.
- Live test mô phỏng `$httpClient` bằng Node fetch với ảnh mẫu màu trơn: một POST 200, JSON 1928 ký tự, JPEG tải 200/226348 byte, tổng 693ms. Đã kiểm tra module/scripts V7, V7.1, V7.2 trên server bằng hash. Đây không phải kiểm chứng engine Shadowrocket/iPhone; chưa khẳng định hết lỗi xen kẽ.
- Khi thử chỉ chọn V7.2, ngắt/kết nối lại Shadowrocket và đóng/mở Locket; không cần cài lại vì catalog/config giữ nguyên V7. Thử 3–4 lần Photobooth trước AI.

## Đối chiếu PacketTunnel đầy đủ — 17/11/2026, 11:32

- Nguồn: `/Users/namdeptrai/Downloads/PacketTunnel-20261117113142.log`. Chỉ trích metadata kết nối, không sao chép headers xác thực hoặc nội dung ảnh vào tài liệu.
- Stream 196 kết nối ban đầu tới `api.locketcamera.com:443` / `34.110.244.57:443` lúc 11:31:49 (dòng 80), rồi tái sử dụng cho nhiều API Locket.
- Lần lỗi 11:32:09: body JSON đọc được, dài 1788, selected và rewritten đều đúng; script giữ body/method. Sau rewrite URL tới Worker, dòng 710 gửi ngay qua remote đang có; không có lookup/connect Worker mới trước phản hồi. Dòng 716 ghi 502, text/plain, body 52, có Via, không có Server/CF-Ray. Log không chứa nguyên nội dung phản hồi 52 ký tự hay giá trị Via, nên chưa xác định được chính xác gateway phát sinh 502.
- Lần thành công 11:32:18: cùng kiểu/body length, rewrite đúng; dòng 770 giữ pending data, dòng 779 mở kết nối tới Worker, dòng 797 kết nối `172.67.222.116:443`, dòng 798 gửi pending data. Dòng 829 nhận 200 JSON, Server Cloudflare, có CF-Ray; tiếp theo ứng dụng GET ảnh kết quả.
- Bằng chứng nghiêng mạnh về đường kết nối upstream cũ không được đổi đích đúng ở lần lỗi. Chưa chứng minh chi tiết nội bộ engine Shadowrocket/SNI hoặc thành phần trả 502. Giả thuyết decode body thất bại không áp dụng cho cặp thử này.
- Hướng thử tiếp: cô lập việc gọi server riêng khỏi upstream connection của Locket, thay vì chỉ đổi URL trên stream cũ. Chưa triển khai cách này; không tự retry AI vì có thể tốn thêm quota. Giữ nguyên V7 và V7.1 hiện tại.

## V7.1 chẩn đoán riêng — 17/11/2026

- Đã deploy `c0dd8411-cb1e-452a-a3e7-2d0397e51007` bằng `v7.1/wrangler.jsonc`; handler giữ nguyên snapshotV7, chỉ thêm3staticassetdebug. V7modulevàscriptsvẫnđượcgiữ.

- Người dùng yêu cầu tách V7.1 và giữ V7 đang ổn. Nguồn nằm ở `v7.1/`, Worker src snapshot byte-identical V7; chỉ thêm module/request wrapper/response observer log cục bộ. Không sửa thuật toán, headers, body/method, chọn filter hoặc response củaV7.
- `v7.1/build.py` copy union tài nguyên `v7/public`, giữ mọiURL V7, tạoURLmodule `Locket-Photobooth-v7.1-*` riêng. `v7.1/private/links.json` ghi link và hash stable; public/private/dev.vars bỏ quaGit. Chỉ build sau khi có tài nguyên V7 cục bộ.
- Console prefix `NAMDZDBG`: request (body type/length, MIME/encoding), decode_error, decision(rewritten), response(status,header markers). Không log ảnh, URL ảnh, querytoken, request/response body, Authorization, Cookie. Không cóHTTPbeacon. Observer `$done({})` giữresponse.
- `v7.1/test.mjs` xác nhận87 trường hợp quyết định/body/method/headers giốngV7, responsekhôngđổi, khôngròsentinel, khônggọiHTTP, mọiassetV7khôngđổi. TypeScript và testV7pass.
- LogConsole mới người dùng gửi11:14:21: taskE914… timeout70s, gửi1695bytebody, HTTP502sau283ms,response_bytes237,FilterClient.FilterError0ngaysauđó. Lầnkếtiếpbackendlưuảnh11:15:07,234.797bytes. Chưa xác địnhnguồn502; khôngđượcgọiđâylàtimeoutAI. Không thấyPOST11:14trongdashboardHTTPrequests khiđốichiếu; cầnclientdebugphânbiệtparse/rewrite/gateway.

## Điều tra lỗi xen kẽ và push AI — 17/11/2026

- Đã push bản AI hiện tại lên `origin/main`, commit `49ca5cc08a62b5ad900a1b506f4315ca5e9cb2be`. Secret scan đối chiếu LAB_KEY với cả 15 file commit (gồm PNG) pass; không push module chứa khóa hoặc ảnh thử/private.
- Người dùng xác nhận thử 2 lần: lần đầu lỗi, lần sau được.
- Dashboard Observability dataset HTTP requests, lọc Path=/generateFilteredImage và làm mới: lần client mới nhất thấy POST lúc 10:59:44 VN trả 200; GET JPEG kết quả lúc10:59:51 trả200. D1 cùng thời điểm lưu273.473bytes. Không đọc/nạp ảnh người dùng để phân tích; chỉ dùng metadata.
- Từ10:58 đến11:00 chỉ thấy một POST tạo ảnh vào server. GET script native v7 lúc10:59:23 trả200, có thể liên quan lần lỗi nhưng chưa có bằng chứng xác định. Không lấy việc thiếu log làm chứng minh tuyệt đối request chưa tới server. Worker execution logs đang sampling10%; tokenWrangler thiếu quyền Workers Observability Write nên truy vấnAPI lịch sử403. Dashboard cóHTTP requests dataset để đối chiếu.
- Source suspect cụ thể: `v7/templates/native-v7.js` dòng17 bắt mọi lỗi decode mà không log; selectedfalse ởdòng21 dẫn `$done({})`, request đi tiếp vềAPI gốc. Điều này có thể giải thích lỗi không xuất hiện ởbackend nếu requestbody thay đổi định dạng/không đọcđược, nhưng chưa xác nhận đó là lỗi lần này. Cần log console Shadowrocket của đúng lầnlỗi để phân biệt decodefail, nonmatchingID hoặc lỗiđổiđíchkết nối. Chưa sửa routing/deploy để tránh làm mất bảnđangdùngđược.
- Các ghi chú bên dưới nói AI chưapush là lịch sử trướccommit49ca5cc.

## Mới nhất: chuyển AI sang Cloudflare miễn phí — 17/11/2026

- Người dùng đã yêu cầu chuyển khỏi Gemini vì không muốn trả phí. Worker đang chạy `e55717f8-59f4-4814-b6ba-e720cb4d5e2d`, có binding `AI`.
- `generateWinter` dùng `@cf/black-forest-labs/flux-2-klein-4b`, multipart có ảnh binary `input_image_0`; Images thu ảnh xuống 512×512 trước inference, output AI 1024 rồi chuẩn hóa JPEG 1080. Hai tác vụ Images cho một AI; quota khác Workers AI 10.000 neurons/ngày.
- Không gọi Google, không cần thêm key. Không tự nâng tài khoản hay fallback provider. Google secret cũ còn ở server nhưng không được code đọc.
- D1 `ai_daily_usage` giới hạn nguyên tử 80 lượt gọi/ngày, gồm lượt lỗi, reset00:00 UTC/07:00 Việt Nam. Ước tính 80×109,57 neurons = 8.765,6 neurons nếu 512px input/1024px output; tài khoản có thể dùng chung quota với ứng dụng AI khác.
- Live test: Vintage 200/226.348 bytes; AI mẫu màu trơn 200/~6giây, JPEG261.567bytes. Ảnh màu trơn không chứng minh giữ chủ thể. Test tiếp bằng Ice.png (phong cảnh do người dùng cung cấp) 200/~7,3giây, JPEG327.707bytes, đã xem ảnh kết quả giữ cảnh đèn/cây/lối đi. Chưa có portrait thật hoặc thao tác chụp trên Locket, không tuyên bố đã kiểm chứng danh tính/khuôn mặt.
- Test cấu hình 80 tuyến, adapter multipart + quota/no-retry và TypeScript pass. Link module v7 không đổi; cập nhật module/biên dịch để nhận hàng AI và routing mới.
- Nguồn AI chưa commit/push Git. Các ghi chú Gemini dưới đây là lịch sử.

## Cập nhật mới nhất: AI Mùa đông — 17/11/2026

- Đã deploy Worker `0f8cd7de-1968-4e06-961b-def1dbf8a68d` từ `v7/wrangler.jsonc`; module v7 giữ cùng URL nhưng script config/native đổi hash.
- Thêm hàng AI với `ai_winter` / Mùa đông, icon từ `v7/ai/Ice.png`; giữ 15 Photobooth/Khung. Không dùng icon làm ảnh tham chiếu, chỉ gửi ảnh chụp người dùng.
- `v7/src/winter.ts`: Gemini REST với model `gemini-nano-banana-2.1`, prompt cố định ưu tiên bảo toàn chủ thể; ảnh 1K, sau đó chuẩn hóa JPEG 1080 qua Images. Timeout Google 45 giây, không tự retry; API key chỉ lưu ở Worker Secret `GEMINI_API_KEY`, không ghi vào Git/module/SQLite.
- Khóa do người dùng cung cấp gọi list models được HTTP 200. Tạo ảnh thật trả 429 RESOURCE_EXHAUSTED, quota Free Tier input token bằng 0. Google image API không có Free Tier cho model này. Chưa tạo thành công ảnh AI; chưa được kiểm chứng trên điện thoại. Không tự bật billing.
- Test cấu hình/80 tuyến + test adapter Gemini và TypeScript pass. Live regression `pb_vintage` trả JPEG 200; `ai_winter` trả mã đã xử lý `AI_GOOGLE_429`, không làm hỏng khung cũ.
- Người dùng muốn phương án AI miễn phí thay Google; đang xem Workers AI FLUX.2 klein. Chưa đổi provider khi chưa kiểm tra điều kiện/quota.
- Những thay đổi AI này chưa commit/push Git tại thời điểm cập nhật tài liệu.

Tài liệu được lập trước khi bắt đầu v7, theo yêu cầu của người dùng. Cập nhật ngày 16/11/2026, múi giờ Việt Nam.

## Mục tiêu và phạm vi

Tự xử lý Photobooth và khung PNG của người dùng trên Cloudflare. SQLite Remote Config chỉ là cấu hình giao diện/filter, không thực thi mã ghép ảnh. Module Shadowrocket sửa phản hồi Firebase; Firebase SDK trong ứng dụng ghi cấu hình vào cơ sở dữ liệu cục bộ. Khi bỏ chặn cập nhật, cấu hình có thể bị máy chủ ghi đè.

Không cần Gemini cho khung PNG. AI là hạng mục tương lai; nếu triển khai, API key chỉ lưu bằng Cloudflare Secret, không nhúng vào module điện thoại hay SQLite.

## Bản đang hoạt động trước v7

- Worker: `namdz-photobooth`.
- Origin: `https://namdz-photobooth.namvu3121.workers.dev`.
- Bản v6 gốc: `8d8e9759-9673-452a-86d0-fa93b7aa7c12`, triển khai lúc 19:20 ngày 16/11/2026.
- Bản đang chạy sau sửa popup: `0e0d7649-4491-4499-80c3-dc6d16077d01`.
- Mã Worker của bản sửa popup được đối chiếu byte với bản tải về làm nền tại thời điểm phục hồi; phiên bản `0e0d...` là mốc người dùng đã xác nhận còn dùng được. Không suy ra chỉ từ endpoint `content/v2` rằng nội dung tải về chắc chắn là mã của phiên bản rollback: API nội dung có thể theo lần upload mới nhất. Dùng mốc `0e0d...` và snapshot đã kiểm tra làm nền cho v7.
- Popup: bỏ ảnh, tiêu đề phụ “Locket vip by hnamhastheblues”, nội dung phụ để trống.
- Người dùng xác nhận v6 có thể ghép ảnh nhưng còn xen kẽ một lần lỗi/một lần thành công. Không được coi đây là lỗi đã sửa.
- V5 cũng từng có thành công thực tế. Đã nhiều lần khôi phục phiên bản, vì vậy tên tệp trên Mac không đủ để suy ra mã đang chạy trên Cloudflare.

## Cảnh báo quan trọng về mã nguồn cục bộ

Thư mục gốc `src/`, `public/`, `wrangler.jsonc` có thể chứa các thay đổi thử nghiệm sau v6. Trước v7, KHÔNG chạy deploy mù từ cấu hình gốc.

Bản v6 sau đổi popup đã được trích xuất chính xác tại `rollback-snapshots/v6-popup-hnam/`. Thư mục này bị Git bỏ qua vì có bản sao module chứa khóa. `index.js` là mã Worker đã triển khai; `index.js.map` có thể dùng khôi phục TypeScript gốc. `public/` tại đây là các tài nguyên khớp bản đã chạy, gồm config script và script native/observe v6.

`rollback-snapshots/active-deployment.json` ghi phiên bản đang hoạt động. Mỗi lần deploy/rollback phải cập nhật lại. Bản dự phòng chỉ nên dùng để đối chiếu hoặc rollback; không đẩy nguyên thư mục này lên Git.

## Kiến trúc

1. Ứng dụng gọi Firebase Remote Config cho dự án `locket-4252a` hoặc số dự án `641029076083`.
2. Script cấu hình trả các giá trị đã chọn, `state = UPDATE`, và `templateVersion` mới.
3. `camera_filter_config` chứa danh sách filter và nhóm hiển thị. Có cả khóa snake_case và camelCase; phải giữ đồng bộ các biến thể.
4. Script request chỉ nhận những ID filter của bộ ghép riêng; các yêu cầu khác được đi tiếp bình thường.
5. Với filter riêng, request được chuyển đến `/generateFilteredImage` trên Worker. Không gửi Authorization của Locket sang máy chủ ghép riêng.
6. Worker tải ảnh đầu vào hợp lệ, ghép vào các vùng của khung, xuất JPEG và lưu tạm trong D1.
7. Worker trả URL ảnh theo bao phản hồi ứng dụng đang dùng. Ứng dụng GET ảnh kết quả.

Giữ `functions_domains` là API chính thức của ứng dụng. Đổi toàn bộ miền Cloud Functions từng làm hỏng tính năng xem người đã xem ảnh. Chỉ định tuyến endpoint ghép ảnh cần thiết.

## Các endpoint và dữ liệu

- `GET /health`: kiểm tra dịch vụ.
- `POST /generateFilteredImage`: ghép ảnh, yêu cầu khóa riêng của bộ ghép.
- `POST /v1/render`: đường thử độc lập.
- `POST /v1/relay-report`: báo cáo chẩn đoán đã lược bỏ dữ liệu nhạy cảm.
- `GET /results/<id>.jpg`: ảnh JPEG tạm, ID ngẫu nhiên khó đoán.
- D1 binding `RESULTS`, database `namdz-photobooth-results`.
- Images binding `IMAGES`; static assets binding `ASSETS`.
- Bảng `results`: ảnh tồn tại khoảng 15 phút; cron dọn mỗi 5 phút.
- Các bản mới hơn v6 từng bổ sung bảng `diagnostic_events` giữ tóm tắt lỗi 2 giờ. Không mặc định rằng bản v6 cũ đã có đầy đủ phần này.

Không lưu ảnh lâu dài, không log ảnh/base64, cookie, token, Authorization hay URL chứa thông tin truy cập ảnh. Không công khai khóa `LAB_KEY`. Truy cập ảnh kết quả là truy cập qua URL tạm, không phải album công khai.

## Giao thức ảnh đã kiểm chứng

ID thử trước v7: `pb_vintage`, prompt `namdz_vintage`. ID nội bộ không bắt buộc trùng tên hiển thị.

Vintage 2×2 dùng một ảnh lặp lại vào bốn ô; chưa có luồng chụp bốn ảnh riêng trong ứng dụng. Tọa độ cho ảnh vuông 1080:

```text
x=70,  y=62,  w=445, h=440
x=568, y=63,  w=443, h=439
x=70,  y=562, w=445, h=441
x=568, y=563, w=443, h=440
```

Các khung mới phải đọc kích thước và alpha riêng; không dùng bốn tọa độ này cho mọi PNG. Khung một ô và Photobooth nhiều ô cần sơ đồ vùng riêng.

Bao phản hồi thành công có `result.status = 200`, `result.data` chứa URL và các bí danh `output`, `outputUrl`, `output_url`, `url`, `imageUrl`, `image_url`. Trên ngoài cũng có status và URL để tương thích. Không sửa bao phản hồi trong thay đổi chỉ nhằm dọn giao diện.

## Giới hạn và lỗi đã quan sát

- Một số lần thành công thực sự có POST ghép trả 200 rồi ứng dụng GET JPEG 200.
- Một số lần lỗi từng thấy HTTP 502 với phản hồi 52 byte không phải JSON; chưa xác định nguyên nhân chắc chắn.
- Từng có phản hồi logic 431 bên trong HTTP 200, chưa đủ nội dung để kết luận.
- Dữ liệu log trước đây có sampling và phiên tail cũ; thiếu dòng log không chứng minh chắc chắn request chưa đến server.
- Thay đổi chuỗi phản hồi và dùng phản hồi giả qua script từng không tương thích. V6 dùng rewrite HTTP trực tiếp.
- Không sửa thêm cách chuyển request/response trong v7 nếu không cần cho việc chọn khung mới. Người dùng chấp nhận lỗi xen kẽ hiện tại.
- Việc Locket hiển thị mục mới phải thử trên điện thoại. Tạo ảnh thành công ở server không đồng nghĩa ứng dụng đã dùng được.

## Shadowrocket và làm mới cấu hình

Các tệp trên trang Cấu hình là những cấu hình riêng; thấy v5/v6 cùng trong danh sách không đồng nghĩa bật đồng thời. Dấu tích xanh cho biết cấu hình đang chọn.

Sau khi thay đổi URL hoặc nội dung script, dùng “Sử dụng cấu hình / Biên dịch cấu hình” để nạp lại tài nguyên. Chỉ tải thử script hoặc bật/tắt kết nối có thể chưa biên dịch lại. Việc cập nhật cả cấu hình có thể ghi đè thiết lập cục bộ/chứng chỉ; không yêu cầu tạo lại CA khi chưa có bằng chứng.

MITM chỉ giới hạn ở Firebase Remote Config, endpoint API lọc ảnh và miền bộ ghép cần thiết. Không cần giải mã mọi miền trên điện thoại.

## Nguồn khung cho v7

Thư mục người dùng: `/Users/namdeptrai/Downloads/Pb và khung` (tên Unicode có thể ở dạng NFD).

Có 15 PNG. Theo xác nhận mới của người dùng, 7 tên bắt đầu bằng `pb_` là Photobooth: Vintage, Cortis, Denim, Holo, Mèo, Strawberry, Superman. Cả bảy có bốn ô trống và dùng một ảnh lặp bốn lần. 8 ảnh còn lại là Khung, gồm Bá khí, Hello Kitty pastel, không gian xanh, Shin-chan, ngôi sao hồng, xanh vẽ tay, Sweet Memories và Hello Kitty sinh nhật; cả tám phủ lên một ảnh duy nhất.

Yêu cầu giao diện: bỏ nhóm AI 3D Hot, Trò chơi Locket và filter cũ; Photobooth không có hậu tố NAMDZ V3; giữ Vintage thử nghiệm và bỏ chữ Namdz; bổ sung các ảnh mới. Giữ caption, poll, người xem ảnh và những cấu hình không liên quan.

## Quy tắc Git và triển khai

- Remote do người dùng chỉ định: `https://github.com/prompttocode/locketgold.git`.
- Push tài liệu ghi nhớ trước khi bắt đầu triển khai v7.
- Tuyệt đối không commit `.dev.vars`, `.lab-secrets.json`, raw log, module đã nhúng khóa, snapshot hoặc cache Wrangler.
- Chỉ commit template dùng placeholder, nguồn Worker và dữ liệu cấu hình đã rà soát.
- Trước deploy: kiểm tra kiểu TypeScript, kiểm thử chọn filter và vùng ghép, kiểm tra rằng các cấu hình ngoài phạm vi không đổi.
- Sau deploy: kiểm tra HTTP cho module/script/frame; thử ghép server; báo rõ phần nào đã kiểm chứng và phần nào đang chờ thử trên điện thoại.
- Tên v7 không được ghi đè link v6. Giữ tài nguyên v6 để có đường quay lại.

## Trạng thái sau khi làm v7

- Commit ghi nhớ ban đầu `d1a7b77` đã được push trước khi bắt đầu viết v7.
- Nguồn triển khai chính thức cho thay đổi này: `v7/src/index.ts`, `v7/wrangler.jsonc`; các lệnh npm mặc định đã chuyển sang cấu hình v7.
- Phiên bản Worker đã deploy: `53a4d8cf-c33a-4b3e-a5e4-eae8c93295dd`.
- Danh sách chỉ còn Photobooth (7) và Khung (8). Giữ Vintage đầu tiên; không có chữ Namdz trong tên/nhóm filter.
- `base-config.json` là mốc đối chiếu. Test xác nhận chỉ `camera_filter_config` thay đổi, không thay các cờ khác.
- `build.py` dò bốn vùng alpha lớn cho Photobooth, chuẩn hóa tọa độ về 1080, và giữ nguyên tọa độ Vintage đã được thử. PNG có một ô dùng ảnh nền full canvas rồi phủ khung, không nhân ảnh thành bốn.
- Module v7 có script config và native riêng. Chỉ mở rộng danh sách ID được native-v6 chuyển tiếp và đổi nhãn phiên bản; không thay cách giữ body/method/Host của v6.
- Giữ các URL/tài nguyên v6 trong deployment. Server hỗ trợ alias `namdz_vintage` cho phiên bản cũ.
- 15/15 mẫu đã ghép và tải JPEG 1080 thành công trên server; alias cũ cũng thành công. Đã xem ảnh ghép thử tổng hợp và ảnh họa tiết kiểm soát để xác nhận crop/lặp ảnh/khung.
- Lần kiểm tra cuối chưa bao gồm thao tác chụp thực tế của người dùng với v7. Không tuyên bố đã sửa lỗi xen kẽ.
- Các module đã sinh, đường dẫn module riêng và file chứa khóa đều bị Git bỏ qua. Chỉ đẩy template có placeholder, nguồn Worker, manifest và các PNG người dùng cung cấp.

## Cập nhật v7: ẩn nút tạo diện mạo

- Người dùng yêu cầu bỏ nút tạo diện mạo riêng, giữ bộ sưu tập preset hiện có.
- Đặt `camera_filter_config.allows_custom_filters` và `allowsCustomFilters` thành false; cờ Remote Config cấp ngoài `allows_custom_filters` thành chuỗi `false`.
- Giữ `custom_filters_enabled` và cờ mở bộ chọn filter, để không vô tình tắt toàn bộ 15 mẫu preset.
- Module v7 giữ nguyên đường dẫn; script config dùng tên mới theo hash nội dung để điện thoại có thể tải bản đã sửa sau khi cập nhật module.
- Worker version: `44714d3f-f591-45c9-993d-73b1bb355268`. Mã renderer, native và observer không sửa.
- Kiểm tra bộ test cấu hình/định tuyến và phản hồi config thực tế trên server; thao tác UI trong Locket vẫn do người dùng thử.

## Cập nhật v7: bỏ hai request chẩn đoán

- Theo yêu cầu người dùng, script native v7 chuyển request ngay, không POST báo cáo trước khi chuyển tiếp; module v7 bỏ hẳn rule response observer.
- Giữ nguyên rewrite Host, các header được phép, method/body gốc, danh sách 15 preset và cờ ẩn tạo diện mạo.
- Luồng thành công thông thường còn khoảng hai request chính (ghép và GET ảnh), không tính cấu hình, ảnh khung, retry hoặc client cũ còn dùng script trước đó.
- Giữ endpoint `/v1/relay-report` và các script v6 để không làm hỏng client cũ/rollback. Log của client cũ vẫn có thể xuất hiện; điều đó không chứng minh v7 mới còn gửi beacon.
- Script request v7 dùng hash nội dung trong tên để tránh điện thoại dùng bản đã biên dịch cũ khi cập nhật module.
- Worker version: `bcd7f7ca-a9a8-4592-88e7-bc488ecfc497`; phần renderer không thay đổi.
- Bộ test 75 trường hợp xác nhận không gọi HTTP chẩn đoán. Module/script đã triển khai cũng được tải lại và chạy kiểm tra tương tự.
