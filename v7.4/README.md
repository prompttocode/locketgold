# V7.4 — phục hồi tại response hook

**Bản chốt ngày 17/11/2026:** người dùng đã thử trên iPhone, xác nhận chạy được và yêu cầu đẩy bản này lên GitHub. Giữ V7 làm bản dự phòng; không tự thay đổi cấu hình đã chốt.

Log người dùng `/Users/namdeptrai/Downloads/PacketTunnel-20261117135911.log`: V7.2 nhận bốn HTTP 200, body 1928 ký tự (13:59:37, :45, :53 và 14:00:02). Mỗi lần Shadowrocket ghi `send early response to client`; không có GET ảnh `/results/`. Chưa có raw response thực tế tại client để biết lỗi là framing/body/status hay cách app đọc phản hồi. Không được khẳng định đã xác định nguyên nhân chi tiết.

V7.3 người dùng báo vẫn xen kẽ. V7.4 giữ native rewrite V7, thêm đúng một lần gọi độc lập từ **http-response**, trả `{status,headers,body}` cấp ngoài cùng; không dùng synthetic early response `{response:{...}}` của V7.2.

Chỉ phục hồi khi có đủ dấu hiệu như log cũ: 502 + text/plain + Via + thiếu Server và CF-Ray + body ngắn chứa Bad Gateway. Không retry 200, 401, 429, lỗi JSON của Worker hoặc lỗi 502 có CF-Ray. Đây là phục hồi có điều kiện, không bảo đảm request đầu chưa từng chạy tại backend nếu một gateway khác làm mất headers; không coi là cơ chế exactly-once phía server.

Để nối hai hook, giữ tạm JSON request (tối đa 65536 ký tự) trong 16 slot `$persistentStore` cố định, TTL 120s. Không lưu headers xác thực, cookie hoặc key renderer trong cache. Request có `X-Namdz-Pending` chứa ID tương quan không bí mật; response đọc lại đúng nonce và xóa nội dung slot trước khi gọi Worker. Nonce sai/slot bị ghi đè/hết hạn/không đọc được headers không dùng ảnh của request khác, đi tiếp với phản hồi gốc. Slot cố định tránh tạo vô hạn khóa; thời hạn ngăn đọc lại nhưng không tự xóa dữ liệu vật lý khi không có hook phản hồi, slot sẽ được ghi đè khi tái sử dụng.

Các context không có persistent store, request quá lớn hoặc hết slot hoạt động như V7. Cache không có giao dịch giữa nhiều JS context; khi tranh chấp có thể mất cơ hội retry nhưng kiểm tra nonce ngăn phục hồi nhầm ảnh. Retry không gửi Authorization/Cookie/Host của Locket. Log chỉ metadata `NAMDZDBG`, revision 7.4.

Build đầy đủ từ nguồn bằng `npm run build`; hoặc `python3 v7.4/build.py` nếu đã có các tài nguyên V7–V7.3 cục bộ. Test `node v7.4/test.mjs`; deploy `npx wrangler deploy --config v7.4/wrangler.jsonc`. Assets giữ toàn bộ phiên bản trước, handler V7.1 không đổi. Không cần cài lại Locket. Live test Node mô phỏng gateway 502 phục hồi qua Worker thật trả 200, tải JPEG 226348 byte; người dùng sau đó xác nhận bản V7.4 hoạt động trên iPhone.
