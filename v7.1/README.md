# V7.1 chẩn đoán

Module riêng với log `NAMDZDBG` ngay trong Shadowrocket. Không gửi request log mạng, không thay cách chọn filter/rewrite URL, headers, method/body của V7. Observer response chỉ đọc metadata/marker lỗi cố định và `$done({})` để giữ nguyên phản hồi. Không log ảnh, token, cookie, nội dung request/response hoặc URL chứa dữ liệu người dùng.

Nguồn Worker `src/` là snapshot của bản V7 đã chạy AI thành công; không sửa mã ghép/AI trong bản chẩn đoán. Build sao chép tài nguyên V7 để link/script cũ tiếp tục hoạt động, rồi thêm module và scripts V7.1. V7 không bị thay đổi. Tạo bản mới: `python3 v7.1/build.py`; kiểm tra `node v7.1/test.mjs`; deploy bằng `npx wrangler deploy --config v7.1/wrangler.jsonc`.

Luồng chẩn đoán: `request` ghi kiểu/kích thước dữ liệu; `decode_error` khi không đọc được body; `decision` cho biết có rewrite hay không; `response` ghi HTTP status, Content-Type, Server và dấu hiệu gateway/TLS. Nếu thiếu response log có thể lỗi xảy ra trước giai đoạn response hook; không suy ra ngay backend lỗi.

Chỉ chọn bản V7.1 khi thử, không bật đồng thời module V7/V7.1 trong cùng cấu hình. Nếu đang dùng profile cấu hình, giữ nguyên thiết lập kết nối và chứng chỉ. Không cần cài lại Locket khi chỉ đổi log/routing của module.
