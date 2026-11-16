# locketgold

Mã nguồn thử nghiệm Photobooth và khung ảnh riêng: Cloudflare Workers ghép ảnh, còn module Shadowrocket đưa cấu hình và định tuyến yêu cầu ảnh từ ứng dụng.

Đọc [PROJECT_MEMORY.md](PROJECT_MEMORY.md) trước khi sửa hoặc triển khai. Tài liệu ghi rõ bản đang chạy, giới hạn đã biết và cách tránh triển khai nhầm mã nguồn cũ/mới.

Không đưa API key, chứng chỉ, cookie, dữ liệu người dùng hoặc script đã nhúng khóa truy cập lên Git. Module dùng trên điện thoại được tạo cục bộ từ mẫu và không nằm trong repo.

## Công việc v7

- Xóa nhóm “Hiệu ứng AI 3D Hot” và “Trò chơi Locket”.
- Nhóm Photobooth mang tên “Photobooth”; bỏ hậu tố NAMDZ V3.
- Bỏ các filter cũ; giữ khung Vintage đã thử thành công và bổ sung ảnh người dùng cung cấp trong thư mục “Pb và khung”.
- Đổi tên hiển thị của Vintage, bỏ chữ Namdz.
- Giữ cách truyền ảnh của v6; lỗi xen kẽ thành công/thất bại chưa được sửa.
- Chưa triển khai AI/Gemini.
