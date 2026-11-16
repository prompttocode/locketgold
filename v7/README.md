# Photobooth v7

Hai nhóm: **Photobooth** (7 PNG tên `pb_`, một ảnh lặp bốn ô) và **Khung** (8 PNG còn lại, phủ lên một ảnh). Không có nhóm AI hoặc trò chơi trong danh sách filter v7.

Nút tạo diện mạo riêng bị tắt bằng `allows_custom_filters` / `allowsCustomFilters` trong camera config và `allows_custom_filters` ở cấp Remote Config. Giữ nguyên cờ bật bộ sưu tập custom filter để không tắt 15 mẫu preset.

Nguồn PNG ở `frames/`. File `catalog.json` ghi tên, nhóm và vùng ghép đã chuẩn hóa sang 1080×1080. Các PNG gốc 1024/1080/1254 được giữ nguyên; Worker co khung về 1080 khi ghép. Khung Sweet Memories và Sinh nhật Hello Kitty chỉ có một ô nên thuộc nhóm Khung.

`src/index.ts` dựa trên bản đang dùng sau đổi popup, chỉ mở rộng lựa chọn khung/vùng ghép. Giữ giao thức response và cách chuyển request của v6. Lỗi xen kẽ thành công/thất bại chưa được giải quyết.

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
