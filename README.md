# locketgold

Mã nguồn thử nghiệm Photobooth và khung ảnh riêng: Cloudflare Workers ghép ảnh, còn module Shadowrocket đưa cấu hình và định tuyến yêu cầu ảnh từ ứng dụng.

Đọc [PROJECT_MEMORY.md](PROJECT_MEMORY.md) trước khi sửa hoặc triển khai. Tài liệu ghi rõ bản đang chạy, giới hạn đã biết và cách tránh triển khai nhầm mã nguồn cũ/mới.

Không đưa API key, chứng chỉ, cookie, dữ liệu người dùng hoặc script đã nhúng khóa truy cập lên Git. Module dùng trên điện thoại được tạo cục bộ từ mẫu và không nằm trong repo.

## Bản chốt: V7.4

Ngày 17/11/2026, người dùng xác nhận V7.4 đã chạy được trên iPhone và chọn bản này. Mã nguồn, giới hạn và hướng dẫn nằm trong [v7.4/README.md](v7.4/README.md).

V7.4 giữ cấu hình/filter và native rewrite của V7. Khi gặp đúng mẫu lỗi gateway 502 đã ghi nhận, response script gọi Worker độc lập một lần rồi thay phản hồi lỗi bằng kết quả. Không gửi request mồi; không dùng đường early response của V7.2. Phản hồi thành công, lỗi quota và lỗi JSON của Worker không bị thử lại.

Các lệnh mặc định dùng V7.4: `npm run build`, `npm test`, `npm run check`, `npm run deploy`. Build lần lượt tạo tài nguyên V7 → V7.1 → V7.2 → V7.3 → V7.4 để giữ nguyên các URL cũ; V7.2/V7.3 chỉ được lưu làm lịch sử thử nghiệm. Các tệp sinh có khóa vẫn bị Git bỏ qua. Worker handler hiện tại là snapshot tại `v7.1/src/`.

Đã kiểm tra adapter/cache và phục hồi có điều kiện bằng test tự động, thử phục hồi với server thật bằng ảnh mẫu, và được người dùng xác nhận hoạt động trong Locket. Điều này không bảo đảm mọi điều kiện mạng hoặc mọi trường hợp sử dụng; xem giới hạn cache và điều kiện thử lại trong tài liệu V7.4.

## Bản v7

- Xóa nhóm “Hiệu ứng AI 3D Hot” và “Trò chơi Locket”.
- Nhóm Photobooth mang tên “Photobooth”; bỏ hậu tố NAMDZ V3.
- Bỏ các filter cũ; giữ khung Vintage đã thử thành công và bổ sung ảnh người dùng cung cấp trong thư mục “Pb và khung”.
- Đổi tên hiển thị của Vintage, bỏ chữ Namdz.
- Giữ cách truyền ảnh của v6; lỗi xen kẽ thành công/thất bại chưa được sửa.
- Bổ sung hàng **AI → Mùa đông**, dùng Workers AI FLUX.2 klein 4B trên Cloudflare. Đã tạo/tải JPEG thành công ở server; giới hạn 80 lượt gọi/ngày cho cả dịch vụ. Chưa kiểm chứng thao tác trong Locket hoặc độ giữ khuôn mặt.

V7 có **7 Photobooth, 8 khung và 1 filter AI**. Mã nguồn và hướng dẫn build ở [v7/README.md](v7/README.md). Các cấu hình ngoài phạm vi được giữ nguyên.

Theo cập nhật tiếp theo, v7 tắt thêm nút tạo diện mạo riêng bằng các cờ `allows_custom_filters`; 15 mẫu preset vẫn được giữ.

V7 đã bỏ hai request log chẩn đoán ở phía Shadowrocket. Tên script request có hash nội dung để bản module đã cập nhật tải đúng mã mới; giữ endpoint chẩn đoán trên server và tài nguyên v6 cho các client cũ.

Đã kiểm tra TypeScript, 75 trường hợp chọn filter/định tuyến, hai dạng ID dự án Firebase, và ghép thực tế đủ 15 mẫu trên server. Tất cả ảnh trả về JPEG 1080×1080; alias Vintage của v6 vẫn ghép được. Các ảnh thử có họa tiết kiểm soát cũng được kiểm tra để xác nhận Photobooth lặp bốn ô và khung chỉ phủ lên một ảnh. Chưa kiểm chứng danh sách v7 trên điện thoại ở thời điểm push.
