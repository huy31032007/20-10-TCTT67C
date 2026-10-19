# Sổ ảnh sau refactor — 19/10/2026

Trạng thái giao diện mới nhất: xem `RESTORED_SCRAPBOOK.md` (khôi phục tờ giấy có ảnh và trang trí trước refactor, giữ toàn bộ phần cảm xúc/âm thanh/cánh hoa mới). Các ghi nhận dưới đây lưu lịch sử những bước trước.

Cập nhật mới nhất về cảm xúc chung, lật giấy, âm thanh và bỏ nút xóa hoa: xem `REACTIONS_AND_EFFECTS.md`. Các kết quả 21 tests/144 lượt đo dưới đây ghi lại lần dọn bố cục trước đó; phiên bản mới giữ 21 tests cũ và thêm 6 tests cảm xúc.

## Phạm vi và mã nguồn

Phần album tiếp tục dùng React hiện có; không đổi framework hoặc thêm dependency. Cảm xúc mới dùng API riêng nối D1 hiện có, không migration hoặc deploy production.

| File | Trách nhiệm hiện tại |
| --- | --- |
| `src/album/AlbumApp.jsx` | Chỉ mount viewer ở màn album; chia 43 ảnh thành 24 trang, lật trang, trình chiếu tùy chọn, preload trang kế, lightbox; dọn listener/animation khi rời sổ |
| `src/album/PolaroidCard.jsx` | Ảnh theo tỷ lệ nguồn, nút mở ảnh lớn; không caption/ngày tháng, không nghiêng 3D |
| `src/album/Decorations.jsx` | Icon SVG và một miếng washi tĩnh cho mỗi ảnh |
| `src/album/VinylPlayer.jsx` | Cụm nhạc nhỏ bên ngoài sổ, liên kết nút Photograph hiện có |
| `src/album/ProgressBar.jsx` | 24 đoạn tiến độ; subscription được dọn khi rời trang/sổ |
| `public/album.css` | Một bộ CSS thống nhất, nút hai cột riêng z-index 30, giấy kem/bìa xanh/nền pastel cũ |
| `public/album.js` | Bundle tự sinh từ `src/album/index.jsx`; chạy `npm run build`, không sửa trực tiếp |

Đã xóa `MemoryReceipt.jsx`, FilmGrain, PaperClip, Doodle, StickerBadge, count-up, particles, ghost pages khi lật, caption/dấu ngày và các CSS/keyframes cũ không còn dùng. `src/album/index.jsx` vẫn là điểm gắn React vào `#albumRoot`.

## Hiển thị và hiệu năng

- 24 trang gồm 5 trang một ảnh và 19 trang hai ảnh: đủ 43 ảnh khác nhau, mỗi ảnh xuất hiện đúng một lần. Không thêm trang chữ hoặc hóa đơn để đủ số trang.
- Chỉ trang hiện tại nằm trong DOM (tối đa 2 ảnh; mở lightbox thêm một bản lớn của ảnh đang xem). Trang tiếp theo được preload bằng `Image` ngoài DOM; không dựng 24 trang hoặc tải đồng loạt 43 ảnh.
- Theo yêu cầu mới, chuyển trang dùng một tờ giấy 3D trống, thời lượng 0.56 s, không nhân đôi ảnh. Nút trước/sau vẫn ở cột riêng, giữa chiều cao sổ, z-index 30. CSS sổ cũ không thay đổi; hiệu ứng nằm riêng trong interactions.css.
- Ảnh nguồn và manifest không thay đổi, không nén/upscale hoặc cắt ảnh. Giới hạn độ nét của ảnh gốc vẫn còn; nhiều ảnh chỉ có chiều rộng 480 px. Khung ảnh không chèn dải trắng bằng object-fit/khung tỷ lệ giả.
- Chỉ một washi tĩnh ở góc mỗi ảnh; không thêm trang trí thứ hai tại góc đó. Trang trí có `pointer-events:none`, `user-select:none`. Đĩa nhạc/sóng âm nằm ở thanh công cụ ngoài vùng ảnh.
- Không còn SVG noise/grain toàn màn hình hoặc backdrop-filter trong album, kể cả lightbox. Chất liệu giấy dùng gradient CSS tĩnh.
- Đĩa/sóng chỉ chuyển động khi album đang hiển thị, nhạc đang phát, không lật trang, không mở ảnh lớn, không giữ, không ẩn tab và không bật giảm chuyển động. Sóng là hiệu ứng trang trí theo trạng thái phát, không phải phân tích phổ âm thanh.
- Trình chiếu tùy chọn khoảng 7 giây/trang; có pause, chuyển về lật tay, phím mũi tên và vuốt. Bấm ảnh luôn mở lightbox, kể cả trong trình chiếu. Khi giữ thì không mở ảnh ngoài ý muốn khi thả.
- Rời album: React unmount toàn bộ viewer, dừng control tiến độ, bỏ các audio/input/visibility listener và preload. Chỉ còn một listener nhỏ để biết lúc cần mount lại album. Lưu số trang trong bộ nhớ khi quay lại cùng tên; không chạy timer album ở phong bì/vườn.
- Có CSS `prefers-reduced-motion` và matchMedia để bỏ fade, đĩa xoay, sóng âm và chuyển động tiến độ. Nhạc vẫn dùng file Photograph cũ và cơ chế bật/tắt cũ.
- Bảng màu gốc và dòng nền album giữ nguyên; không thêm mã màu hex. Các file styles/experience/garden và business logic giữ nguyên hash so với trước refactor.

## Kiểm chứng thực tế

- `npm test`: 21/21 pass, 0 skipped. Đây là bộ kiểm thử backend/build hiện có, không tuyên bố là 21 bài UI.
- Cloudflare `deploy --dry-run` pass; không triển khai lên tài khoản hoặc ghi dữ liệu production.
- Lật đủ 24 trang trên trình duyệt ở 320/360/390/768/1024/1280 px: 144 lượt đo. Đúng 43 URL ảnh khác nhau, tối đa 1 trang/2 ảnh trong DOM. Không tràn ngang, ảnh nằm trong giấy, hai mũi tên ở giữa cao độ sổ, z-index 30, nhận bấm và không giao với ảnh. Không có chữ trong trang ảnh.
- Lightbox được mở và đo tại cả 6 kích thước; ảnh/nút đóng trong viewport; Escape đóng ảnh và vẫn ở album. Khi mở, đĩa và 5 thanh sóng paused, trang và giá trị tiến độ không đổi.
- Trình chiếu tự tiến trang đã được quan sát; pause giữ nguyên trang/tiến độ sau hơn 39 giây. Phím ArrowRight chuyển trang; đo ngay khi chuyển thấy vẫn 1 trang/2 ảnh, đĩa paused.
- Tắt nhạc: đĩa và cả 5 thanh sóng paused. Rời album khi trình chiếu đang chạy: không còn node con/ảnh trong `#albumRoot`; sau hơn 22 giây vẫn ở phong bì, không bị timer kéo sang trang khác.
- Luồng local: mở cửa → nhập tên có dấu bằng bàn phím và phím G trên web → album → phong bì → thư có chữ ký đúng → chủ động góp hoa. Mật khẩu sai không xóa hoa và ô mật khẩu được xóa; mật khẩu local đúng chỉ xóa cụm QA vừa tạo. Cụm đã có từ trước vẫn còn.
- Cửa kín toàn viewport, không chữ ở đủ 6 kích thước. Đã đo tên, phong bì, thư và vườn ở đủ 6 kích thước, không tràn ngang. Không thấy console error trong tab kiểm thử cuối.
- Chưa profile FPS/CPU hoặc thử trên điện thoại thật. Chưa đổi cài đặt giảm chuyển động của hệ điều hành; nhánh đó mới được kiểm tra trong source, không tuyên bố đã kiểm thử thiết bị.

Bằng chứng local: `/tmp/tctt67c-recap-qa/clean-layout-checks.json`, `clean-album-390.png`, `clean-album-1280.png`. Preview: http://127.0.0.1:2027/ (server local cần đang chạy). Chưa commit/push/deploy bản refactor này.
