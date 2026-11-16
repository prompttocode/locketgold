# Ghi nhớ dự án

Tài liệu được lập trước khi bắt đầu v7, theo yêu cầu của người dùng. Cập nhật ngày 16/11/2026, múi giờ Việt Nam.

## Mục tiêu và phạm vi

Tự xử lý Photobooth và khung PNG của người dùng trên Cloudflare. SQLite Remote Config chỉ là cấu hình giao diện/filter, không thực thi mã ghép ảnh. Module Shadowrocket sửa phản hồi Firebase; Firebase SDK trong ứng dụng ghi cấu hình vào cơ sở dữ liệu cục bộ. Khi bỏ chặn cập nhật, cấu hình có thể bị máy chủ ghi đè.

Không cần Gemini cho khung PNG. AI là hạng mục tương lai; nếu triển khai, API key chỉ lưu bằng Cloudflare Secret, không nhúng vào module điện thoại hay SQLite.

## Bản đang hoạt động trước v7

- Worker: `namdz-photobooth`.
- Origin: `https://namdz-photobooth.namvu3121.workers.dev`.
- Bản v6 gốc: `8d8e9759-9673-452a-86d0-fa93b7aa7c12`, triển khai lúc 19:20 ngày 16/11/2026.
- Bản đang chạy sau sửa popup: `0e0d7649-4491-4499-80c3-dc6d16077d01`.
- Mã Worker của bản sửa popup giống từng byte với v6 gốc. Chỉ cấu hình popup và URL tải lại config script thay đổi.
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

Có 15 PNG: 9 Photobooth gồm Vintage, Cortis, Denim, Holo, Mèo, Strawberry, Superman, Cute và Hello Kitty sinh nhật; cùng 6 khung gồm Bá khí, Hello Kitty pastel, không gian xanh, Shin-chan, ngôi sao hồng, xanh vẽ tay. Cách chia nhóm chính xác phải dựa vào nội dung ảnh thay vì chỉ tên file.

Yêu cầu giao diện: bỏ nhóm AI 3D Hot, Trò chơi Locket và filter cũ; Photobooth không có hậu tố NAMDZ V3; giữ Vintage thử nghiệm và bỏ chữ Namdz; bổ sung các ảnh mới. Giữ caption, poll, người xem ảnh và những cấu hình không liên quan.

## Quy tắc Git và triển khai

- Remote do người dùng chỉ định: `https://github.com/prompttocode/locketgold.git`.
- Push tài liệu ghi nhớ trước khi bắt đầu triển khai v7.
- Tuyệt đối không commit `.dev.vars`, `.lab-secrets.json`, raw log, module đã nhúng khóa, snapshot hoặc cache Wrangler.
- Chỉ commit template dùng placeholder, nguồn Worker và dữ liệu cấu hình đã rà soát.
- Trước deploy: kiểm tra kiểu TypeScript, kiểm thử chọn filter và vùng ghép, kiểm tra rằng các cấu hình ngoài phạm vi không đổi.
- Sau deploy: kiểm tra HTTP cho module/script/frame; thử ghép server; báo rõ phần nào đã kiểm chứng và phần nào đang chờ thử trên điện thoại.
- Tên v7 không được ghi đè link v6. Giữ tài nguyên v6 để có đường quay lại.
