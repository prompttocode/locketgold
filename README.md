# locketgold

Mã nguồn thử nghiệm Photobooth và khung ảnh riêng: Cloudflare Workers ghép ảnh, còn module Shadowrocket đưa cấu hình và định tuyến yêu cầu ảnh từ ứng dụng.

Đọc [PROJECT_MEMORY.md](PROJECT_MEMORY.md) trước khi sửa hoặc triển khai. Tài liệu ghi rõ bản đang chạy, giới hạn đã biết và cách tránh triển khai nhầm mã nguồn cũ/mới.

Không đưa API key, chứng chỉ, cookie, dữ liệu người dùng hoặc script đã nhúng khóa truy cập lên Git. Module dùng trên điện thoại được tạo cục bộ từ mẫu và không nằm trong repo.

## Bản v7

- Xóa nhóm “Hiệu ứng AI 3D Hot” và “Trò chơi Locket”.
- Nhóm Photobooth mang tên “Photobooth”; bỏ hậu tố NAMDZ V3.
- Bỏ các filter cũ; giữ khung Vintage đã thử thành công và bổ sung ảnh người dùng cung cấp trong thư mục “Pb và khung”.
- Đổi tên hiển thị của Vintage, bỏ chữ Namdz.
- Giữ cách truyền ảnh của v6; lỗi xen kẽ thành công/thất bại chưa được sửa.
- Chưa triển khai AI/Gemini.

V7 có **7 Photobooth và 8 khung**. Mã nguồn và hướng dẫn build ở [v7/README.md](v7/README.md). Chỉ danh sách filter thay đổi; các cấu hình ngoài phạm vi được giữ nguyên.

Theo cập nhật tiếp theo, v7 tắt thêm nút tạo diện mạo riêng bằng các cờ `allows_custom_filters`; 15 mẫu preset vẫn được giữ.

Đã kiểm tra TypeScript, 75 trường hợp chọn filter/định tuyến, hai dạng ID dự án Firebase, và ghép thực tế đủ 15 mẫu trên server. Tất cả ảnh trả về JPEG 1080×1080; alias Vintage của v6 vẫn ghép được. Các ảnh thử có họa tiết kiểm soát cũng được kiểm tra để xác nhận Photobooth lặp bốn ô và khung chỉ phủ lên một ảnh. Chưa kiểm chứng danh sách v7 trên điện thoại ở thời điểm push.
