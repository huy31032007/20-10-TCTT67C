# Khôi phục hiệu ứng sổ trước refactor — 19/10/2026

## Giao diện hiện tại

Khôi phục phần giấy và trang trí theo ảnh chụp cũ `components-final-desktop.png`: tờ giấy mang ảnh khi lật, ảnh nghiêng và hover 3D nhẹ, băng dính ở đầu ảnh, kẹp giấy, hoa/nốt nhạc ở góc, sao lấp lánh và dây đánh dấu đung đưa. Đĩa nhạc có lại ảnh ở tâm và tên Photograph; vẫn nằm ngoài sổ. Giữ nền pastel, giấy kem, bìa xanh, màu bookmark trước đây, 43 ảnh / 24 trang và nút “Tiếp tục”. Mặt sổ giữ ảnh cùng các điều khiển hiện có.

Không phải git reset: các hiệu ứng album trước refactor chưa từng được commit. Đã đối chiếu ảnh chụp cũ và khôi phục trong component hiện tại, giữ nguyên các tính năng được thêm sau đó. Bản trước sửa được lưu tại `/tmp/tctt67c-before-restore-paper/`.

## Cơ chế lật

- `AlbumSheet.jsx` dùng cùng khung ảnh/trang trí cho trang đang xem và hai mặt tờ đang lật.
- Mặt trước là ảnh trang cũ; mặt sau là ảnh trang kế. Lật qua gáy bằng rotateY, khoảng 0.68 s trên desktop và 0.48 s trên mobile.
- Khi nghỉ chỉ mount trang hiện tại. Trong lúc lật có thêm đúng hai mặt giấy tạm, tổng tối đa 6 ảnh trong phần trang/hiệu ứng (chưa tính ảnh nhỏ ở tâm đĩa nhạc). Lật xong unmount hai mặt tạm. Không dựng 43 ảnh hoặc 24 trang cùng lúc; tiếp tục preload một trang kế.
- Hai mặt tạm inert/aria-hidden, không nhận thao tác hoặc focus và nằm trong vùng cắt của giấy. Mũi tên vẫn ở hai cột riêng, z-index 30.
- Dây/sao/hoa góc dừng khi lật, mở ảnh lớn, giữ trình chiếu, ẩn tab hoặc giảm chuyển động. Rời album unmount toàn bộ viewer như trước. Không khôi phục lớp SVG turbulence toàn màn hình.

## Những phần mới giữ nguyên

Đối chiếu hash 17 file: PhotoReactions, effects.js, garden.js/css, script.js, dữ liệu ảnh, bouquet, API cảm xúc/vườn/thư, catalog 60 thư, Worker, D1 adapter/schema và palette gốc không thay đổi trong lần phục hồi này. Rule của reactions/lightbox và cánh hoa trong interactions.css được giữ nguyên; chỉ bỏ rule tờ giấy trống cũ để dùng kiểu lật có ảnh.

- 4 emoji trong lightbox, bộ đếm D1 dùng chung/poll khoảng 4 s.
- Âm giấy nhỏ và nút bật/tắt riêng, Photograph gốc.
- 18 cánh hoa mở thư trong 3 s; 5 cánh hoa khi tương tác vườn và lay nhẹ.
- Vườn không có nút Xóa hoa hoặc hộp mật khẩu; tên vẫn hiện khi chạm/rê.
- Luồng cửa → tên → sổ → phong bì → thư → vườn, 60 thư/vòng và các cụm hồng/ly theo chữ giữ nguyên.

## File đã sửa

`src/album/AlbumApp.jsx`, `AlbumSheet.jsx` (mới), `PolaroidCard.jsx`, `Decorations.jsx`, `VinylPlayer.jsx`, `public/album.css`, `public/interactions.css`, bundle tự sinh `public/album.js` và tài liệu. Không thêm dependency, đổi backend/schema hoặc sửa file nhạc/ảnh nguồn.

## Kiểm tra thực tế

- 27/27 tests hiện có pass (gồm 21 tests gốc và 6 tests cảm xúc), không skipped. Build và diff check pass.
- 24 trang × 6 viewport = 144 lượt đo, 320/360/390/768/1024/1280 px: đúng 43 ảnh khác nhau, ảnh nằm trong giấy, không tràn ngang, mũi tên vẫn nhận bấm. Sau mỗi lần lật không còn node tờ lật.
- 12 lượt lật tiến/lùi ở 6 kích thước: hai mặt có ảnh, transform matrix3d thay đổi và không tràn; dây đánh dấu paused trong lúc lật.
- Lightbox vẫn có 4 emoji và bộ đếm test đã có từ lần trước; đã thử chọn/bỏ ✨, counts đổi 0→1→0, heart giữ 2. Khi mở ảnh, dây/sao/hoa góc đều paused; Escape đóng ảnh.
- Tiếp tục tới phong bì: albumRoot không còn node con. Mở thư vẫn tạo 18 cánh, duration 3 s. Vào vườn và chạm hoa vẫn có 5 cánh, không còn nút/hộp xóa. Nút âm giấy có thể bật lại. Không thấy console error trong tab QA.
- Test UI dùng server riêng cổng 2028 với dữ liệu QA trước đó, không ghi dữ liệu production. Chưa commit/push/deploy bản này.
- Chưa profile FPS/CPU, thử hover/cử chỉ trên thiết bị thật hoặc đổi cài đặt reduced motion của hệ điều hành; không tuyên bố các kiểm tra đó đã làm.

Bằng chứng: `/tmp/tctt67c-recap-qa/restored-scrapbook-qa.json`, `restored-scrapbook-390.png`, `restored-scrapbook-1280.png`. Preview chính: http://127.0.0.1:2027/.
