# Sổ ảnh, 60 thiệp và vườn lớp

Trạng thái giao diện mới nhất: xem `RESTORED_SCRAPBOOK.md` (khôi phục tờ giấy có ảnh và trang trí trước refactor, giữ toàn bộ phần cảm xúc/âm thanh/cánh hoa mới). Các ghi nhận dưới đây lưu lịch sử những bước trước.

Cập nhật mới nhất: `REACTIONS_AND_EFFECTS.md` — cảm xúc dùng chung trong lightbox, âm giấy, cánh hoa một lượt, khôi phục lật giấy và bỏ UI xóa hoa.

## Nội dung đã thêm

- Cửa → nhập tên → sổ ảnh → phong bì → thiệp → góp hoa vào vườn.
- 43 ảnh người dùng cung cấp trong `public/photos/`, giữ JPEG/WebP gốc và nguyên độ phân giải. Gỡ metadata EXIF/XMP/IPTC mà không nén lại dữ liệu ảnh; đã so sánh điểm ảnh RGB với nguồn, 43/43 khớp. Giữ nguyên thư mục ảnh nguồn, không đưa file ZIP vào website. Tổng ảnh khoảng 4,3 MB.
- Sổ hiện tại: 43 ảnh / 24 trang (5 trang một ảnh, 19 trang hai ảnh). Chỉ mount trang đang xem, preload một trang kế. Không caption, ngày tháng, hóa đơn hoặc thống kê trên trang sổ. Giữ ảnh nguồn và bấm để xem lớn.
- Nút mũi tên ở hai cột ngoài sổ, z-index 30, căn giữa chiều cao. Nút tiếp theo có chữ “Tiếp tục”. Có phím mũi tên, vuốt và trình chiếu tùy chọn; phần sổ unmount khi rời màn hình.
- Sau lần bổ sung hiệu ứng, đã refactor theo yêu cầu mới: bỏ grain toàn màn hình, blur, bản sao ảnh khi lật, 3D tilt và trang trí chồng nhau. Giữ giấy kem, bìa xanh nhạt và nền pastel cũ. Chi tiết mã nguồn và kết quả QA mới nhất ở `ALBUM_COMPONENTS.md`.
- 60 lời nhắn gốc trong `server/letter-catalog.mjs`, bản dễ đọc ở `NOI_DUNG_THIEP.md`. Thay đoạn thư cũ, ký “Từ các bạn nam TCTT67C”.
- Phím G/R/V có cụm hoa hồng; K/L/Y có cụm hoa ly. Các chữ này cũng thêm loại hoa tương ứng vào bó hoa đang kết.
- Theo yêu cầu mới: chọn hoa chỉ hiện tên, lay nhẹ và rơi vài cánh; đã bỏ nút xóa và hộp mật khẩu trong vườn. API/trang quản trị cũ vẫn giữ Secret bảo vệ để tương thích.

## Cách phát thư dùng chung

`POST /api/letter`: `reserve` giữ một thư ngẫu nhiên trong 10 phút; `open` xác nhận sau khi thiệp đã hiển thị. Thư đã mở hoặc đang được giữ hợp lệ sẽ không được phát cho lượt mới trong cùng vòng. Thư bỏ dở hết hạn được đưa lại vào danh sách. Nếu các thư còn lại đều đang được giữ, API yêu cầu chờ/thử lại; không tự phát trùng.

Sau 60 thư đã được xác nhận mở, lượt mới bắt đầu vòng tiếp theo. Cùng tên trên cùng trình duyệt nhận lại thư cũ, không tiêu thụ thêm thư. Tên khác trên cùng trình duyệt có lượt riêng. Trình duyệt lưu một mã ngẫu nhiên; mã gửi lên server được băm cùng tên, server không lưu thêm tên trong dữ liệu phát thư. Không có tài khoản, nên không thể nhận diện chắc chắn cùng một người trên thiết bị khác hoặc sau khi xóa dữ liệu trình duyệt. localStorage chỉ giữ mã này, không quyết định danh sách thư chung hoặc danh sách hoa.

Dùng cùng D1 và hàng `class` hiện có, thêm trường `letters` vào JSON khi có lượt mở. Không đổi bảng, không migration, không thêm dịch vụ. Join/xóa hoa bảo toàn dữ liệu thư và ngược lại bằng cùng cơ chế revision/CAS. API vườn chỉ trả revision/members, không trả mã lượt nhận thư. Giới hạn 3.000 mã nhận thư để dữ liệu không tăng vô hạn. Không cần reset vườn khi deploy.

Netlify có thêm function `/api/letter` với cùng cơ chế trong Blobs, nhưng vẫn là dữ liệu riêng với Cloudflare. API xóa hoa trên Netlify chưa được nối.

## Quản trị cũ (không còn UI xóa trong vườn)

Trang quản trị cũ vẫn cần Secret runtime `GARDEN_ADMIN_TOKEN` ít nhất 32 ký tự trên Worker. Không đặt mật khẩu trong frontend hoặc Git. Nếu Worker chưa nhận Secret, đổi giao diện không thể tự làm mật khẩu tồn tại.

Cloudflare → Workers & Pages → `20-10-tctt67c` → Settings → **Variables and Secrets ngoài phần Build** → Add → Secret → `GARDEN_ADMIN_TOKEN` → nhập giá trị → Deploy/Save and deploy. Secret trong Build chỉ dùng khi build.

## Kiểm thử ngày 19/10/2026

- 21 tests backend/build pass: gồm 60 lượt giữ đồng thời không trùng, xác nhận mở, vòng thứ hai, hết hạn, từ chối yêu cầu không hợp lệ, D1 SQLite và bảo toàn dữ liệu hoa/thư.
- Kiểm tra cú pháp frontend và Cloudflare deploy dry-run pass; không deploy production.
- Trình duyệt local: cửa, nhập tên có dấu, sổ ảnh, mở thiệp với nội dung trả từ API, góp hoa. Xóa bằng mật khẩu sai bị từ chối và input được xóa; mật khẩu đúng xóa hoa thử local cuối cùng.
- Đã đo chiều rộng thật 320/360/390/768/1024/1280: album và hộp xóa không tràn ngang, hộp thoại nằm trong viewport. Đã xem ảnh album 390 và 1280. Đây không phải xác nhận toàn bộ hành trình đã được duyệt hình ảnh ở cả sáu kích thước.
- Có CSS và kiểm tra matchMedia để giảm chuyển động, chưa đổi cài đặt hệ điều hành và thử thao tác vuốt trên thiết bị cảm ứng thật.
- Không ghi/xóa dữ liệu production, không sửa Secret hoặc deploy production trong lần làm này.
- Đã GET API quản trị production không kèm mật khẩu: trả 401, thay cho 503 ở lần kiểm tra trước. Theo code, Worker hiện đã có token runtime đủ độ dài. Chưa thử xác thực bằng mật khẩu thật hoặc xóa hoa thật.

Ảnh QA local ở `/tmp/tctt67c-recap-qa/` (có thể được hệ thống dọn). Preview local dùng cổng 2027 khi chạy thủ công; xem README về cách chạy lại.

## QA mới nhất sau khi refactor sổ

Xem `ALBUM_COMPONENTS.md`: 21/21 tests, 24 trang × 6 viewport = 144 lượt đo; 43 ảnh khác nhau; không tràn ngang hoặc đè nút; xác minh dừng hiệu ứng và unmount khi rời sổ. Các ghi nhận ở mục kiểm thử phía trên là lịch sử các lần làm trước.

## Tham khảo biên soạn và thiết kế

- [Hallmark — encouragement messages](https://ideas.hallmark.com/articles/encouragement-ideas/encouragement-messages-what-to-write-in-an-encouragement-card/): tham khảo cách viết động viên cụ thể, nội dung tiếng Việt trong dự án được biên soạn mới.
- [Spotify — The Look Behind the Sound](https://newsroom.spotify.com/2026-04-23/spotify-design-history/): tham khảo cách trình bày recap bằng màu sắc và câu chuyện hình ảnh, không sao chép giao diện nguyên mẫu.
