# Lời nhắn trên 21 trang sổ — 20/10/2026

Áp dụng danh sách 21 trang mới nhất của người dùng, thay cho bản đánh số 24 trang trước đó. Bốn trang 16, 17, 19 và 20 không có lời nhắn mới. Trang 2 có hai lời riêng: quân sự ở bên trái, team building ở bên phải.

| Trang hiện tại | Lời nhắn |
| --- | --- |
| 1 | Noel đầu tiên nè |
| 2 | Đi quân sự vui nhờ <3 / Team building đời đầu là đâyy=)) |
| 3 | “Dòng người vội vàng bước qua…” |
| 4 | “Lớp mình hô cái gì bây giờ TT” |
| 5 | Giải ba cơ đấyy?!?! |
| 6 | 20/10 năm ngoái nè |
| 7 | Túi hoa đồ đó =)) |
| 8 | “Vỗ tay đi ơ kìaaa” |
| 9 | “Lớp mình ra ngoài chụp 1 tấm đii” |
| 10 | Say Hi:”) |
| 11 | “Kìa kìa chụp ảnh kìa” |
| 12 | “Chụp 1 tấm khonggg” |
| 13 | Bá khí khá bí |
| 14 | Báo cáo sĩ số đủ!! |
| 15 | Ninh Bình trip |
| 16 | — |
| 17 | — |
| 18 | Vui chưa kìa |
| 19 | — |
| 20 | — |
| 21 | To be continued…. |

Nguồn chỉnh nội dung: `src/album/album-captions.mjs`. Lời nhắn đi theo ID ảnh ổn định; ảnh gốc và số thứ tự cảm xúc không đổi. `AlbumSheet.jsx` dùng cùng lời nhắn trên trang tĩnh và hai mặt lật. Chữ nằm trên phần giấy với khoảng cách riêng, không đặt lên ảnh.

Đã bỏ tiêu đề hiển thị “Sổ kỷ niệm”, giữ tiêu đề ẩn cho trình đọc màn hình. Lời nhắn và chữ TCTT67C trên Polaroid dùng Mali; UI, nhạc và con số dùng Inter. Lời nhắn có viền trắng mảnh. Vì tiêu đề đã bỏ, không tải thêm Fraunces cho một thành phần không còn hiển thị. Font WOFF2 và OFL nằm trong `public/fonts/`, không gọi Google Fonts khi người xem mở web. Nguồn chính thức: [Mali](https://fonts.google.com/specimen/Mali), [Inter](https://fonts.google.com/specimen/Inter). Bảng màu và nền giữ nguyên.

QA cuối: 38/38 tests pass; build và Cloudflare dry-run pass, không deploy. Trình duyệt đã lật đủ 21 trang ở cả 320×740, 360×800, 390×844, 768×1024, 1024×768 và 1280×900 (126 lượt đo): đủ 43 ảnh, 18 lời nhắn, không tràn ngang, chữ/ảnh nằm trong giấy và không đè nhau hoặc nút điều hướng. Console không lỗi/cảnh báo. Hash của 43 ảnh gốc không đổi. Không thử lại drag trên thiết bị thật hoặc profile FPS trong lần này.

Preview local: http://127.0.0.1:2028/ sau khi tải lại trang. Dữ liệu đo/screenshot tại `/tmp/tctt67c-album-captions-qa/`. Chưa commit/push/deploy.
