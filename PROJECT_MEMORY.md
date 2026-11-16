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
