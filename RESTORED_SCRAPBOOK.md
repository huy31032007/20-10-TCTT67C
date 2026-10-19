# Khôi phục hiệu ứng sổ trước refactor — 19/10/2026

## Mới nhất: giấy vintage hòa với nền pastel và cơ chế lật theo con trỏ

Yêu cầu mới nhất cho phép caption viết tay và tông giấy vintage, sau đó chốt **đồng bộ với nền chính web**. Vì vậy nền pastel của sổ được giữ lại; mặt giấy dùng parchment `#E6DCCD`, bìa kraft `#D4C4B0`, nét graphite `#4A453E`, bút navy `#2C3A47`, mực sepia `#5A4636`. Các ghi nhận “không caption” hoặc màu bìa xanh bên dưới là lịch sử.

- Khung analog `#F5F0E6`, viền cũ, băng dính matte rách `rgba(235,225,205,.65)`. Bộ lọc sepia .15 / contrast .95 / brightness .97 chỉ áp dụng thumbnail; lightbox vẫn ảnh nguồn không filter. Caption factual “TCTT67C” và số thứ tự ảnh; không bịa ngày chụp. Font Caveat và Cormorant Garamond được lưu cục bộ bằng WOFF2 (5 subset, khoảng 187 KB), kèm OFL từ kho Google Fonts; không cần gọi dịch vụ font bên ngoài khi xem web.
- Thay sticker màu/hoa/trái tim bằng 8 sketch nét bút inline SVG: máy bay, cassette, guitar, xe đạp, giày vải, chồng vở, phim và nhóm bạn. Ghi chú có dòng kẻ, dấu bưu điện “20·10” chỉ dịp 20/10. Doodle/ghi chú multiply, opacity .75; không nhận thao tác. Grain .04 bằng SVG tile cache, vignette rất nhẹ; không có noise animation toàn màn hình.
- Tách điều khiển lật sang `usePageTurn.jsx`, toán kéo sang `page-turn.mjs`. Nút/mép giấy/ArrowLeft/Right hoạt động khi đang đọc tay. Pointer Events hỗ trợ kéo từ giấy/ảnh/mép: ngưỡng 8 px và hướng ngang rõ ràng mới bắt đầu; dùng pointer capture, progress theo con trỏ, thả ngắn/đổi hướng trả về, kéo đủ xa hoặc flick sẽ hoàn thành. Nhấp ảnh vẫn mở lightbox; click phát sinh sau kéo được chặn. Giữ cuộn dọc cho mobile.
- Chỉ commit trang đích khi chuyển động hoàn tất. Source vẫn đứng yên, destination lộ dưới nửa đang lật, hai mặt front/back độc lập, backface hidden và sai lệch Z .1 px để tránh z-fighting. Perspective 2200 px, easing `[.645,.045,.355,1]`; nâng nhẹ theo sin góc và bóng đổi dịch chuyển/độ mờ theo progress. Stage 3D không overflow hidden; clip chỉ nội dung mỗi mặt. Desktop lật quanh gáy giữa, mobile lật toàn tờ. Mép ngoài có gấp góc nhỏ khi hover/focus.
- Chặn lật chồng bằng ref đồng bộ; bỏ animation/timer CSS lật cũ. Resize/ẩn tab/rời sổ hủy phần lật dở; reduced motion đổi trang trực tiếp. Chỉ có trang hiện tại lúc nghỉ, preload trang sau ngoài DOM; khi lật thêm destination và hai mặt tạm, tối đa 12 ảnh tạm/trang cho chuyển giữa hai trang ba ảnh (không mount cả 43).
- Giữ hành trình cửa → tên → sổ 43 ảnh/24 trang → phong thư → vườn, backend/schema/D1, 60 thư, hoa, Photograph, cảm xúc chung và micro-SFX. `server/local.mjs` chỉ thêm MIME WOFF2 cho preview. Không đổi bytes 43 ảnh nguồn. Bản trước sửa: `/tmp/tctt67c-before-vintage/`.

Kiểm chứng thực tế: **32/32 tests pass**, không skipped (27 cũ + 5 cho biên trang, ý định kéo, progress, ngưỡng thả và đủ ID ảnh). Build và Cloudflare dry-run pass; đây không phải deploy. Trình duyệt kiểm tra 144 tổ hợp (24 trang × 320/360/390/768/1024/1280 px): đủ 43 ảnh/viewport, một kích thước giấy cố định/viewport, ảnh/caption trong giấy, không tràn ngang, mũi tên nhận thao tác, không giữ tờ tạm khi nghỉ. Đã thử click mũi tên/mép, bàn phím liên tiếp chỉ tiến một trang, counter vẫn source trong khi xoay, bóng/lighting có giá trị đổi theo góc, focus mép hiện gấp góc, lightbox 4 cảm xúc/ảnh không filter, bật/tắt nhạc đổi running/paused, rời sổ giữa lượt lật gỡ viewer/grain/leaf. Trình chiếu tự chạy từ trang 4 tới trang 12 và nút pause đổi trạng thái đúng. Font local trả HTTP 200/font/woff2, console QA không lỗi/cảnh báo tại thời điểm kiểm tra.

**Giới hạn:** chưa kéo chuột/ngón tay thật hoặc hover bằng công cụ (browser hiện tại không cung cấp các thao tác đó); đã test phần toán kéo/thả, chưa xác nhận end-to-end bằng thiết bị. Chưa profile FPS/CPU hoặc đổi reduced-motion của hệ điều hành. Đây là lật 3D mô phỏng với ánh sáng, không phải mô phỏng vật lý giấy mềm. Không viết dữ liệu thử production, không commit/push/deploy.

File chỉnh: `src/album/AlbumApp.jsx`, `AlbumSheet.jsx`, `PolaroidCard.jsx`, `Decorations.jsx`; file mới `usePageTurn.jsx`, `page-turn.mjs`, `tests/page-turn.test.mjs`; `public/album.css`, bundle sinh `album.js`, 5 font WOFF2 + 2 OFL; MIME font trong `server/local.mjs` và tài liệu này.

Bằng chứng layout: `/tmp/tctt67c-recap-qa/vintage-layout-qa.json`; ảnh: `vintage-desktop.png`, `vintage-mobile.png`. Preview chính: http://127.0.0.1:2027/. Bước tiếp theo: duyệt tông màu và kéo thử mép giấy trên chuột/điện thoại ở preview.


## Mới nhất: giấy bằng nhau và khôi phục chuyển động qua gáy

Theo xác nhận mới của người dùng, mặt sổ chỉ giữ ảnh và trang trí: không caption, dấu ngày, thẻ thống kê hoặc hóa đơn. Giữ 43 ảnh / 24 trang và cách nhóm 1–3 ảnh; không thay đổi ảnh, bảng màu/nền hoặc nghiệp vụ thư/vườn/cảm xúc.

- Tất cả 24 trang dùng cùng khung giấy ở mỗi viewport, không còn tính chiều rộng/chiều cao theo từng ảnh. Desktop có hai vùng giấy bằng nhau; trang ba ảnh có một ảnh bên trái, hai ảnh dùng chung vùng giấy bên phải. Mobile xếp đôi theo chiều dọc, trang ba ảnh có ảnh chính phía trên và hai ảnh nhỏ bên dưới. Ảnh giữ tỉ lệ, vừa cả chiều rộng lẫn chiều cao ô và không kéo quá kích thước nguồn.
- `AlbumSpread` dùng chung hình học cho trang thật và hai mặt giấy tạm. Desktop lật nửa bên phải/trái quanh gáy ở giữa (0.68 s); mobile lật toàn trang (0.48 s). Mỗi mặt cắt đúng phần tương ứng của cùng một spread; không đổi khung khi lật từ một ảnh sang hai/ba ảnh.
- Khôi phục grain SVG cố định đúng opacity 0.04, pointer-events none, z-index 50. Noise nằm trong một ảnh SVG tile 128 px được trình duyệt cache, không chạy animation/filter noise toàn màn hình theo từng frame. Glass dùng màu giấy sẵn có 25%, viền 20%, blur 8 px.
- Polaroid nghiêng khác nhau, hover scale 1.03 và rotateX/Y ±5°, bóng nổi. Parent/child Framer variants tạo stagger 0.1 s, spring stiffness 260/damping 20. Băng dính rách, kẹp giấy, sticker hoa/nốt nhạc/trái tim SVG, sao nhấp nháy và bookmark quay lại; không nhận thao tác, nằm dưới nút bấm.
- Đĩa than 8 s/vòng và 5 thanh sóng theo trạng thái phát Photograph. Các trang trí dừng khi lật, mở lightbox, giữ/tạm dừng trình chiếu, ẩn tab hoặc reduced motion. Trang cuối có 14 hạt lấp lánh một lượt 2.4 s, gỡ sau 2.8 s hoặc khi rời/ẩn sổ. Không thêm màn hình hoặc dữ liệu mới.

File chỉnh lần này: `AlbumApp.jsx`, `AlbumSheet.jsx`, `PolaroidCard.jsx`, `Decorations.jsx`, `album-layout.mjs`, `public/album.css`, bundle sinh `public/album.js` và tài liệu này. Bản trước sửa: `/tmp/tctt67c-before-uniform-book/`. Các ghi nhận ở những mục bên dưới là lịch sử trước cập nhật này.

Kiểm chứng: 27/27 tests pass, không skipped. Đủ 144 tổ hợp trang/viewport ở 320, 360, 390, 768, 1024, 1280 px: mỗi kích thước có đúng một bộ chiều rộng/chiều cao khung và giấy xuyên suốt 24 trang; đủ 43 ảnh, mặt giấy không chữ, ảnh trong ô, không tràn ngang, mũi tên bấm được, không giữ node tờ lật sau hiệu ứng. 12 lượt lật tiến/lùi tại 6 kích thước giữ nguyên kích thước trong chuyển động; quan sát đủ 2 mặt, matrix3d và gốc xoay đúng cạnh gáy. Hover 3D thực tế vẫn giữ ảnh trong giấy. Quan sát stagger hai ảnh có opacity khác nhau; trình chiếu tự tiến và pause giữ nguyên trang. Bật/tắt nhạc đổi đĩa/sóng running → paused → running; lightbox giữ 4 emoji và dừng các trang trí; rời sổ không còn viewer/grain/hạt. Đã thấy 14 hạt một lượt và xác nhận bị gỡ. Chưa thử thiết bị thật, đổi reduced-motion của hệ điều hành hoặc profile FPS/CPU.

Bằng chứng: `/tmp/tctt67c-recap-qa/uniform-book-qa.json`, `uniform-book-1280.png`, `uniform-book-390.png`. Preview: http://127.0.0.1:2027/. Không ghi dữ liệu thử production; chưa commit/push/deploy thay đổi này.

## Mới nhất: ảnh phủ mặt giấy, có trang ghép ba ảnh

Ảnh nguồn được giữ nguyên. Đã đối chiếu 43 ảnh với thư mục lớp: kích thước bằng bản gốc; JPEG giữ nguyên pixel, những file khác giữ nguyên bytes. Một số nguồn chỉ rộng 480 px và không có bản lớn hơn trong thư mục đã cung cấp. Không thể bổ sung chi tiết thật bằng cách kéo ảnh lớn; giao diện mới giới hạn ảnh theo độ phân giải nguồn và đưa grain xuống lớp giấy phía sau khung ảnh để tránh phủ hạt lên ảnh.

- Vẫn 43 ảnh / 24 trang, mỗi ảnh xuất hiện đúng một lần: 10 trang ảnh lớn (nguồn ≥1000 px), 9 trang đôi, 5 trang ba ảnh.
- Bốn trang ghép một ảnh dọc với hai ảnh ngang; một trang ghép ba ảnh ngang. Tỉ lệ cột tính từ kích thước ảnh để các khung có chiều cao gần nhau. Trên mobile xếp dọc để ảnh giữ được chiều rộng.
- Bỏ chiều cao giấy cố định và khoảng trống gấp đôi của trang đơn trên mobile. Khung ảnh rộng theo mặt giấy, giữ toàn bộ nội dung và tỉ lệ nguồn. Canvas giới hạn theo kích thước ảnh; trang ảnh lớn cũng tính theo chiều cao viewport.
- Polaroid nghiêng khoảng 1–1.6°, hover 3D ±3°/scale 1.01. Giữ màu, băng dính/kẹp giấy/doodle, đĩa nhạc, lật giấy hai mặt, micro-SFX và lightbox cảm xúc.
- Planner riêng `src/album/album-layout.mjs` giữ nguyên ID ảnh (index + 1) cho API cảm xúc. Chỉ render trang hiện tại, preload một trang kế tiếp. Khi lật có thêm hai mặt giấy tạm, tối đa 9 ảnh trang/hiệu ứng cho chuyển cảnh giữa hai trang ba ảnh; lật xong gỡ hai mặt tạm.
- `server/local.mjs` bổ sung file grain vào allowlist và MIME PNG; đã kiểm tra HTTP 200, image/png, 2244 byte. Giữ dữ liệu và cấu hình khi khởi động lại preview 2027.

Các file chỉnh: `album-layout.mjs` (mới), `AlbumApp.jsx`, `AlbumSheet.jsx`, `PolaroidCard.jsx`, `public/album.css`, bundle sinh `public/album.js`, `server/local.mjs` và tài liệu này. Bản trước sửa lưu tại `/tmp/tctt67c-before-photo-layout/`. Hash ảnh và các file nghiệp vụ được đối chiếu tại `/tmp/tctt67c-photo-layout-protected.json`.

Kiểm tra: 27/27 tests pass; kiểm tra planner đủ 43 ID không lặp, 24 trang, tối đa ba ảnh/trang và ảnh bổ sung không bị bỏ sót. Đã kiểm tra đủ 144 tổ hợp trang/viewport ở 320, 360, 390, 768, 1024, 1280 px: không tràn ngang, ảnh nằm trong giấy, đúng tỉ lệ và không phóng quá chiều rộng nguồn, hai mũi tên bấm được, không còn mặt lật lúc nghỉ. Lightbox vẫn đủ bốn emoji với đúng ảnh; hai mặt lật có đủ ảnh, đĩa nhạc tạm dừng; rời sổ gỡ viewer/grain. Console QA không có cảnh báo/lỗi. Không ghi dữ liệu thử vào production hoặc vườn preview chính. Chưa thử điện thoại thật, thay cài đặt reduced motion của hệ điều hành hoặc đo FPS.

Bằng chứng: `/tmp/tctt67c-recap-qa/dense-photo-layout-qa.json`, `dense-photo-collage-1280.png`, `dense-photo-collage-390.png`, `dense-photo-row-1280.png`. Preview: http://127.0.0.1:2027/. Chưa commit/push/deploy thay đổi này.

## Cập nhật: ảnh lớn hơn và chất liệu scrapbook

- Khung sổ rộng 1068 px tại viewport 1280 px (trước: 964 px). Nâng giới hạn chiều cao ảnh từ 440 lên 490 px trên desktop, từ 29 lên 31 svh trên mobile; giữ tỉ lệ và file ảnh nguồn.
- Polaroid có góc nghiêng cố định khác nhau từ −2.1° đến +2.3° và độ lệch dọc −6 đến +6 px. Không dùng margin âm hoặc đặt ảnh absolute. Hai mặt tờ đang lật dùng cùng tư thế của ảnh thật.
- Hover nghiêng 3D ±5°, phóng 1.02 lần, phối cảnh 2400 px và bóng mềm. Đã giảm độ phóng/phối cảnh sau khi phát hiện góc ảnh nhô khỏi giấy ở tablet. Chế độ reduced motion bỏ nghiêng/hover và chuyển động như trước.
- Grain đúng opacity 0.04, dùng tile PNG tĩnh 128 × 128, 2244 byte. Không chạy feTurbulence hoặc animation noise toàn màn hình. Lớp grain chỉ mount trong album, không nhận thao tác và được gỡ khi rời sổ.
- Điều khiển và mini-player dùng màu giấy hiện có ở opacity 25%, blur 8 px. Giữ palette/nền. Băng dính có mép rách không đều, kẹp giấy và doodle SVG tiếp tục nằm ngoài nội dung ảnh; mũi tên 44 × 44 px nằm ở hai cột riêng.
- Đĩa than và 5 thanh sóng chạy theo trạng thái phát Photograph; dừng khi tắt nhạc, mở ảnh lớn hoặc lật trang. Không thêm nhạc, dependency, backend hay schema.

File thay đổi trong lần cập nhật này: `AlbumApp.jsx`, `PolaroidCard.jsx`, `Decorations.jsx`, `public/album.css`, `public/paper-grain.png`, bundle sinh `public/album.js`, `build.mjs` (đóng gói tile) và tài liệu này. Đối chiếu hash 19 file bảo vệ: palette gốc, dữ liệu ảnh, thư, vườn, reactions, effects, Worker/schema không đổi. Bản trước sửa: `/tmp/tctt67c-before-larger-polaroids/`.

Kiểm tra bản cuối: 24 trang × 6 viewport (320 × 740, 360 × 800, 390 × 844, 768 × 1024, 1024 × 768, 1280 × 900) = 144 lượt đo; mỗi viewport đủ 43 ảnh khác nhau, ảnh trong giấy, không tràn ngang, mũi tên nhận bấm, chỉ 1–2 ảnh trang chính và không còn mặt lật sau hiệu ứng. Đã quan sát matrix3d hover thực tế trên tablet, lật có 2 mặt chứa ảnh, đĩa/sóng đổi chạy → dừng → chạy theo nút nhạc, lightbox đủ 4 emoji và counts QA cũ, rời sổ gỡ grain/vinyl/viewer. Console tab QA không có lỗi/cảnh báo. Dữ liệu QA dùng cổng 2028 riêng; không ghi production. Chưa profile FPS/CPU, thử trên điện thoại thật hoặc thay cài đặt reduced motion của hệ điều hành.

Bằng chứng mới: `/tmp/tctt67c-recap-qa/larger-polaroids-qa.json`, `larger-polaroids-1280.png`, `larger-polaroids-390.png`. Preview: http://127.0.0.1:2027/. Chưa commit/push/deploy cập nhật này.

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
