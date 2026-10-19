# Cảm xúc ảnh và hiệu ứng nhẹ — 19/10/2026

Trạng thái giao diện mới nhất: xem `RESTORED_SCRAPBOOK.md` (khôi phục tờ giấy có ảnh và trang trí trước refactor, giữ toàn bộ phần cảm xúc/âm thanh/cánh hoa mới). Các ghi nhận dưới đây lưu lịch sử những bước trước.

## Phạm vi mới nhất

Giữ Cửa → Tên → Sổ ảnh (43 ảnh / 24 trang) → Phong bì → Thư → Vườn. Không đổi bảng màu, ảnh nguồn, nhạc Photograph, 60 thư/vòng, chữ ký hoặc cách kết hoa theo tên. Không thêm badge, caption, lời nhắn vườn, thống kê hoặc upload.

- Lightbox có 4 emoji ❤️ 😂 🥺 ✨ và bộ đếm chung. Mặt sổ vẫn chỉ có ảnh, không thêm chữ hoặc nút emoji lên trang sổ.
- Âm thanh giấy tạo bằng Web Audio, không tải file ngoài hoặc đổi nhạc. Peak gain 0.018, khoảng 0.22 s khi lật trang và 0.38 s khi mở phong bì. Nút giấy ở góc dưới phải bật/tắt độc lập Photograph. Không phát trước tương tác; trình duyệt không hỗ trợ thì bỏ qua an toàn. Đây là âm thanh mô phỏng, không phải bản thu giấy thật.
- Khi phong bì mở: 18 cánh hoa hồng/ly, CSS và timer 3.000 ms, không lặp, không tạo lớp phủ kín viewport. Rời hành trình thư, ẩn tab hoặc bật reduced motion thì dọn sớm.
- Khi chạm/rê/Enter vào hoa: lay tối đa khoảng ±1.2°, một lượt 1.1 s; rơi 5 cánh tượng trưng trong 1.6 s, có cooldown 1.8 s và giới hạn số hạt. Gió nền nhẹ khoảng -0.9° đến 1°. Chuyển màn dọn timer và hạt.
- Bỏ nút Xóa hoa và hộp mật khẩu khỏi vườn. API/trang quản trị cũ vẫn giữ bảo vệ Secret để không phá tương thích; không có thao tác xóa trong hành trình người xem.
- Khôi phục lật giấy bằng một tờ giấy 3D nhẹ trong khung sổ, khoảng 0.56 s; không nhân đôi các ảnh hoặc cả trang. Mũi tên vẫn ở hai cột riêng, z-index 30. `public/album.css` giữ nguyên byte so với trước yêu cầu này; CSS mới nằm riêng trong `interactions.css`.

## Dữ liệu cảm xúc chung

`/api/reactions` dùng cùng `GARDEN_DB` và hàng `class` hiện có. Không thêm bảng, migration, dịch vụ, Secret hay dependency. Trường JSON `reactions` chỉ được tạo khi có lượt cảm xúc thật, bảo toàn `members`, `letters` bằng revision/CAS như hiện tại. Netlify adapter dùng Blobs hiện có, vẫn là kho riêng so với Cloudflare.

- `GET ?photo=1..43`: trả photo, revision và counts của 4 emoji; không trả danh sách người bấm hoặc khóa trình duyệt.
- `POST {photo,visitor,action:"read"}`: thêm trạng thái 4 emoji của trình duyệt hiện tại.
- `POST {photo,visitor,action:"set",emoji:0..3,active:boolean}`: bật/tắt một cảm xúc. Gửi lại cùng giá trị không tăng thêm lượt; không dùng thao tác toggle ở server để tránh nhân đôi khi retry.
- Poll mỗi 4 giây chỉ khi lightbox đang mở và tab hiển thị; đóng ảnh/rời sổ thì dừng timer và abort request. Đây là polling, không phải WebSocket hoặc cập nhật tức thì.
- localStorage chỉ giữ mã ẩn danh ngẫu nhiên và lựa chọn âm thanh, không giữ bộ đếm chung. Server băm mã trước khi lưu. Mỗi trình duyệt có thể chọn một lần mỗi emoji/ảnh rồi bỏ chọn. Không có tài khoản nên không xác minh được danh tính giữa hai thiết bị hoặc sau khi xóa dữ liệu trình duyệt.
- Chỉ nhận 43 ảnh đã biết, tối đa 500 mã trình duyệt/ảnh, payload ≤512 bytes. Chặn ghi khác origin, chống mất dữ liệu khi đồng thời và báo lỗi khi lưu/tải thất bại.

Cần triển khai bản Worker/frontend mới thì tính năng cảm xúc mới xuất hiện trên website công khai. Lần này chỉ sửa code, build và dry-run; không push/deploy hoặc ghi dữ liệu production.

## File thay đổi

- Thêm `server/reaction-handler.mjs`, `netlify/functions/reactions.mjs`, nối route tại `cloudflare/worker.mjs`, `server/local.mjs`.
- Thêm `src/album/PhotoReactions.jsx`; chỉnh `AlbumApp.jsx` để mount cảm xúc trong lightbox và một tờ giấy lật. `public/album.js` được build lại.
- Thêm `public/effects.js`, `public/interactions.css`, nối tại `public/index.html`, thêm assets vào `build.mjs`.
- `public/script.js`: phát âm/cánh hoa tại lúc mở phong bì; bỏ confetti 40 hạt cũ để không chạy hai đợt cùng lúc.
- `public/garden.js`, `public/garden.css`: bỏ UI xóa, giảm lay, thêm tương tác cánh hoa có giới hạn và cleanup.
- Thêm `tests/reactions.test.mjs`, bổ sung test route D1 vào `tests/cloudflare.test.mjs`.

## Kiểm chứng thực tế

- 27/27 tests pass, không skipped: đủ 21 tests cũ và 6 tests mới. Có 60 lượt cảm xúc đồng thời, idempotency/retry, bỏ chọn chỉ của mã hiện tại, tách ảnh/emoji, bảo toàn vườn/thư, validation/giới hạn, lỗi storage và route D1 SQLite.
- Build, kiểm tra cú pháp JS và Cloudflare dry-run pass. Không deploy.
- UI QA dùng server riêng cổng 2028, thư mục `/tmp/tctt67c-effects-qa-Ylwu1n`, không dùng dữ liệu production hoặc vườn preview hiện có.
- Bấm tim trong UI lên 1; một visitor test độc lập ghi thêm tim và UI tự cập nhật lên 2. Bỏ chọn trong UI xuống 1; chọn lại lên 2. Tạm dừng server: hiện lỗi tải và nút thử lại; chạy lại server với cùng dữ liệu: tự khôi phục counts 2 và trạng thái đã chọn.
- Lật đủ 24 trang: đúng 43 URL ảnh khác nhau, mỗi lần chỉ có 1 trang và tối đa 2 ảnh; không tràn ngang.
- 320/360/390/768/1024/1280 px: lightbox có đủ 4 nút emoji, ảnh và nút đóng trong viewport; 12 lượt lật tiến/lùi không tràn ngang, mũi tên vẫn nhận bấm. Cả 6 kích thước lúc mở thư có 18 cánh hoa, duration 3 s, không tràn ngang, album đã unmount. Vườn ở đủ 6 kích thước không tràn và không còn nút xóa.
- Đo chờ DOM tự dọn: cánh vườn biến mất sau khoảng 1.7 s kể từ khi quan sát; cánh mở thư sau khoảng 2.9 s kể từ khi đã xuất hiện (timer bắt đầu trước lúc công cụ quan sát). Kiểm tra cuối đều còn 0 hạt, không chạy lặp.
- Nút âm giấy đã thử bật/tắt độc lập nhạc; không tuyên bố đã nghe/đo loa thật. Không thấy console error trong lượt UI cuối sau reload.
- Chưa profile FPS/CPU, chưa thử trên điện thoại thật hoặc đổi cài đặt giảm chuyển động ở hệ điều hành. Có guard reduced motion trong source/CSS.

Bằng chứng: `/tmp/tctt67c-recap-qa/effects-qa.json`, `reactions-lightbox-1280.png`, `opening-petals-320.png`, `garden-gentle-petals-1280.png`. Preview chính vẫn ở http://127.0.0.1:2027/.
