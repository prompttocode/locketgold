# V7.2 — thử request độc lập

Lịch sử: người dùng thử bốn lần đều không hiển thị được ảnh; log cho thấy Worker trả 200 nhưng đường early response chưa hoạt động với app. Không chọn bản này làm mặc định. Bản chốt là V7.4.

Log PacketTunnel 17/11/2026: lần lỗi dùng stream đã kết nối API Locket, rewrite URL rồi gửi ngay và nhận 502; lần thành công giữ pending data rồi mở kết nối tới Worker. Đây là bằng chứng nghiêng về lỗi đổi đích kết nối, chưa xác định chính xác gateway trả 502.

V7.2 thử cách gọi `$httpClient.post` tới Worker rồi trả `{response:{status,headers,body}}` trực tiếp cho request gốc. Không đổi URL của stream đang có. Chỉ chọn filter riêng như V7; giữ nguyên JSON phản hồi server và HTTP status, chỉ chuẩn hóa Content-Type/Cache-Control. Không chuyển Authorization/Cookie/Host/Content-Length của API Locket sang Worker. Không retry, không beacon log; log cục bộ `NAMDZDBG`, revision `7.2`.

Đây là bản thử: test Node kiểm tra adapter; chỉ thao tác thực tế trên iPhone mới kiểm chứng được tương thích `$httpClient` và phản hồi tổng hợp của Shadowrocket. V4 trước đây từng thử relay nhưng khác decoder, catalog và response server; không coi cách này là đã chứng minh sửa được lỗi.

Build: `python3 v7.2/build.py` sau khi có V7/V7.1 public cục bộ. Test: `node v7.2/test.mjs`. Deploy: `npx wrangler deploy --config v7.2/wrangler.jsonc`. Worker handler vẫn dùng nguồn V7.1 nguyên vẹn, assets gồm toàn bộ bản trước và module V7.2 mới. Module/khóa sinh vào public/private được Git bỏ qua.

Chỉ dùng một bản khi thử. Chuyển module, ngắt/kết nối lại Shadowrocket, đóng/mở Locket; không cần cài lại vì config/filter vẫn là V7. Thử Photobooth trước, sau đó AI; ghi nhận 3–4 lần liên tiếp. Khi lỗi cần dòng `relay_network_error`, `relay_invalid_response` hoặc `relay_response` trong PacketTunnel.
