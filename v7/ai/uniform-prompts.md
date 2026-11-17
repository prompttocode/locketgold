# Grab và Bee

Hai filter nằm trong hàng AI, dùng ảnh người chụp làm ảnh tham chiếu duy nhất. `grab.jpg` và `bee.jpeg` chỉ là icon. Prompt thực thi tiếng Anh nằm ở `GRAB_PROMPT`, `BEE_PROMPT` và `UNIFORM_PHOTO_RULES` trong `src/winter.ts`; dưới đây là nội dung tiếng Việt tương ứng để kiểm tra.

## Grab

Cho người chính trong ảnh mặc áo khoác gió tài xế Grab Việt Nam: chất vải nylon/polyester nhẹ, hơi bóng, tay dài, dáng thoải mái. Cổ đứng, vai/ngực trên và thân dưới xanh lá Grab sáng; mảng xanh lá đậm chạy ngang giữa ngực và bắp tay, mép dưới hơi chúc xuống phía khóa kéo giữa. Khóa kéo dọc thân màu xanh, đầu kéo nhỏ màu bạc; cổ có chi tiết nẹp đen bên trong, cổ tay xanh bo chun. Giữ các đường may, nếp vải và túi tay kín đáo tự nhiên.

Logo Grab nét viền trắng nhỏ nằm trên ngực trái người mặc; chữ Grab viền trắng lớn chạy dọc mặt ngoài hai cẳng tay. Mỗi tay có một dải phản quang xám bạc ngang gần khuỷu. Tay phải người mặc có miếng cờ Việt Nam hình chữ nhật: nền đỏ, một ngôi sao vàng năm cánh ở giữa, nằm phía trên dải phản quang. Nhìn chính diện, logo ngực ở bên phải ảnh và cờ ở tay bên trái ảnh. Không biến áo thành vest hoặc áo phông.

## Bee

Tên hiển thị filter là Bee, chữ trên áo là **be** viết thường. Cho người chính mặc áo khoác gió be Việt Nam: thân và tay áo vàng tươi; mảng xanh dương hoàng gia/cobalt phủ vai và phần ngực trên, mép dưới gần ngang. Cổ đứng xanh dương; khóa kéo giữa màu vàng chạy suốt thân. Cổ tay bo chun xanh và gấu áo có dải xanh hẹp. Hai túi khóa dọc ở phần thân dưới có viền khóa xanh và đầu kéo bạc.

Logo be vàng, nét tròn lớn nằm trên ngực trái, trong mảng ngực xanh; chữ be xanh chạy dọc mặt ngoài hai cẳng tay vàng. Cờ Việt Nam nhỏ, nền đỏ và một ngôi sao vàng năm cánh, đặt trên bắp tay trái. Nhìn chính diện, logo ngực và cờ nằm phía bên phải ảnh. Không thêm chữ Grab, mảng xanh lá hoặc dải phản quang bạc không có trong mẫu.

## Quy tắc chung

Chỉ thay áo của người chính hoặc từng người trong nhóm tiền cảnh. Giữ khuôn mặt, danh tính, kiểu tóc, biểu cảm, dáng người, tỷ lệ, tư thế và bàn tay; giữ quần, giày và phụ kiện đang có. Không dựng thêm toàn thân khi ảnh chỉ chụp nửa người.

Giữ nguyên cảnh xung quanh, đồ vật, người ở hậu cảnh, vị trí, màu sắc, ánh sáng và góc máy. Không tự thêm xe máy, mũ bảo hiểm, túi giao hàng hoặc chuyển sang đường phố. Áo mới phải khớp phối cảnh, nếp vải, ánh sáng và bóng tiếp xúc của ảnh gốc. Logo nằm trên áo và đi theo nếp vải, không thành watermark ngoài ảnh. Không tự thêm người nếu ảnh không có người.

Prompt không bảo đảm mô hình tái tạo chính xác tuyệt đối chữ/logo hay giữ mọi pixel của ảnh. Hiện không gửi ảnh áo làm tham chiếu thứ hai và không dùng mask/segmentation. Bốn AI dùng chung giới hạn 80 lượt/ngày trên mỗi tài khoản triển khai, giữ nguyên cơ chế phục hồi V7.4.
