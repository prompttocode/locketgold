# Photobooth v7

Ba nhóm hiện tại: **Photobooth** (7 PNG tên `pb_`, một ảnh lặp bốn ô), **Khung** (8 PNG phủ lên một ảnh) và **AI** (Mùa đông). Không có nhóm AI 3D cũ hoặc trò chơi trong danh sách filter v7.

## Bổ sung AI Mùa đông — 2026-11-17

Danh sách mới có thêm hàng **AI**, filter `ai_winter` tên **Mùa đông**, dùng `ai/Ice.png` làm icon. 15 mẫu Photobooth/Khung cũ giữ nguyên. Ảnh icon chỉ để hiển thị; đầu vào tạo ảnh là ảnh người dùng vừa chụp.

`src/winter.ts` dùng Cloudflare Workers AI binding, model `@cf/black-forest-labs/flux-2-klein-4b`. Prompt cố định ưu tiên danh tính, số người, trang phục, bố cục; thêm môi trường mùa đông hợp lý với cả cảnh trong nhà. Không bảo đảm giữ chi tiết chính xác tuyệt đối vì đây là ảnh do mô hình sinh lại.

Không cần key Google. Ảnh đầu vào chỉ xử lý trên Cloudflare, không gửi token/Authorization của Locket. Giới hạn ảnh vào 6 MB; dùng Images thu ảnh tham chiếu về 512×512 theo yêu cầu FLUX, xuất AI 1024×1024 rồi chuẩn hóa JPEG 1080 và lưu tạm 15 phút. Mỗi lần AI hiện có hai tác vụ Images (ảnh vào và ảnh ra); hạn mức Images và Workers AI tách riêng.

Giới hạn nội bộ 80 lượt gọi AI/ngày dùng chung dịch vụ, đếm cả lượt lỗi, đặt lại 00:00 UTC (07:00 Việt Nam). Bảng `ai_daily_usage` cập nhật nguyên tử bằng UPSERT RETURNING. Không tự retry, không chuyển sang provider khác và không tự nâng gói. Chi phí lý thuyết 512px vào +1024px ra khoảng 109,57 neurons/lượt; 80 lượt dưới 10.000 neurons, nhưng hạn mức tài khoản còn dùng chung các ứng dụng AI khác.

Triển khai bảng trước khi chạy: `npx wrangler d1 execute namdz-photobooth-results --remote --config v7/wrangler.jsonc --file v7/ai/schema.sql`. Kiểm tra: `npm test`, `npm run check`, `node v7/live-ai.mjs`. Live test xác nhận khung Vintage 200 và AI 200, JPEG tải được, thời gian 6–8 giây. Đã xem kết quả từ ảnh phong cảnh tham chiếu; chưa kiểm chứng bảo toàn khuôn mặt hoặc thao tác chụp thực tế trong Locket. Ảnh thử chỉ lưu vào `private/` bị Git bỏ qua.

Lịch sử: Gemini từng nhận key nhưng tạo ảnh lỗi 429, quota Free Tier bằng 0. Đã chuyển hoàn toàn sang Workers AI theo yêu cầu dùng miễn phí; Google secret cũ không còn được mã đang chạy đọc.

Nút tạo diện mạo riêng bị tắt bằng `allows_custom_filters` / `allowsCustomFilters` trong camera config và `allows_custom_filters` ở cấp Remote Config. Giữ nguyên cờ bật bộ sưu tập custom filter để không tắt 15 mẫu preset.

Nguồn PNG ở `frames/`. File `catalog.json` ghi tên, nhóm và vùng ghép đã chuẩn hóa sang 1080×1080. Các PNG gốc 1024/1080/1254 được giữ nguyên; Worker co khung về 1080 khi ghép. Khung Sweet Memories và Sinh nhật Hello Kitty chỉ có một ô nên thuộc nhóm Khung.

`src/index.ts` dựa trên bản đang dùng sau đổi popup, chỉ mở rộng lựa chọn khung/vùng ghép. Giữ giao thức response và phần rewrite Host/body/method của v6. V7 hiện không gửi request chẩn đoán trước khi chuyển tiếp, đồng thời không cài response observer gửi log. Luồng bình thường còn một request ghép và một request tải ảnh, chưa tính tải cấu hình/khung hoặc retry. Lỗi xen kẽ trước đây không được coi là đã sửa bằng thay đổi này.

## Build và kiểm tra

Chạy từ thư mục gốc repository:

```sh
npm ci
python3 -m pip install -r v7/requirements.txt
python3 v7/build.py
npx wrangler types --config v7/wrangler.jsonc v7/worker-configuration.d.ts
npx tsc --project v7/tsconfig.json
node v7/test.mjs
npx wrangler deploy --config v7/wrangler.jsonc --dry-run
```

Build cần file cục bộ `.lab-secrets.json` chứa `LAB_KEY` của bộ ghép. Khi tự dựng dịch vụ riêng, tạo khóa mới và đặt cùng khóa đó bằng Cloudflare Secret. Không commit khóa, module đã sinh hoặc chứng chỉ. Đường dẫn module riêng được ghi ở `private/links.json`.

Build tự tạo tài nguyên cần thiết của v7 từ PNG gốc, `static/` và các template. Khi có snapshot cục bộ, build còn bảo toàn các tài nguyên/link v6 của dịch vụ đang chạy. Khởi tạo một dịch vụ riêng từ repo cần đổi origin, cấu hình Cloudflare và thông tin D1 theo tài khoản của mình trước khi deploy.

`base-config.json` là cấu hình gốc để đối chiếu; `camera_filter_config` thay đổi danh sách và quyền tạo diện mạo, cùng cờ `allows_custom_filters` ở cấp Remote Config được đặt false. Các cờ khác, caption, poll, popup đã đổi tên và miền API chính thức được giữ nguyên. ID nội bộ vẫn dùng các ID client đã biết; tên hiển thị không phụ thuộc ID. Sinh nhật Hello Kitty dùng lại ID `khung_hello_kitty_pastel_ng_t_ng_o` để tương thích client.

## Áp dụng trên điện thoại

Cài/chọn module v7, nạp lại bằng Sử dụng cấu hình/Biên dịch cấu hình và kết nối Shadowrocket. Locket cần nhận lại Remote Config để đổi danh sách. Nếu vẫn dùng cấu hình cũ do cache thì dùng quy trình cài lại mà người dùng đang thử. V6 giữ đường dẫn riêng để quay lại.
