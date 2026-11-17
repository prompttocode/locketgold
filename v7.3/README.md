# V7.3 — thử request mồi

Lịch sử: người dùng xác nhận vẫn lỗi xen kẽ. Không chọn bản này làm mặc định. Bản chốt là V7.4.

Theo yêu cầu thử của người dùng, giữ cách rewrite native V7 (V7.2 relay bị lỗi cả bốn lần trên iPhone), thêm một GET `/health` tới server riêng trước khi trả quyết định rewrite. Probe không mang ảnh, token Locket, dữ liệu request hay khóa renderer; không tạo ảnh hoặc ghi D1. Chờ tối đa 3,5 giây nếu có timer; client timeout 3 giây. Callback lỗi, throw, thiếu client hoặc watchdog đều tiếp tục theo V7, không gửi lại ảnh thật bằng `$httpClient`.

Đây chỉ là warm-up trên HTTP client của script. Nó **không** gửi request giả trên cùng socket của Locket, không giả số lần chụp và không đảm bảo đóng hoặc thay kết nối upstream cũ. Chưa có API engine đã kiểm chứng để thao tác socket đó. Có thể vẫn lỗi xen kẽ; cần thử iPhone. Không gọi bước mồi là bằng chứng đã sửa lỗi hoặc tương đương bấm chụp hai lần.

Config, filter, body, method và headers của quyết định rewrite giữ nguyên V7. Console `NAMDZDBG`, revision `7.3`: `prime_start`, `prime_done` và request/decision/response observer. Không beacon log, không tự retry render/AI. Chỉ thêm một request health cho mỗi request chọn filter riêng.

Build `python3 v7.3/build.py`; test `node v7.3/test.mjs`; deploy `npx wrangler deploy --config v7.3/wrangler.jsonc`. Assets kế thừa toàn bộ V7/V7.1/V7.2; handler vẫn là V7.1. Không thay link các phiên bản cũ, không đổi SQLite/catalog. Chọn riêng module V7.3, ngắt/kết nối Shadowrocket và đóng/mở Locket, không cần cài lại.
