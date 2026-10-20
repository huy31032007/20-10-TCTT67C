# Vườn hoa rải tự nhiên, chim và bướm — 20/10/2026

- Thay các hàng/cột bằng vị trí rải theo ID người tham gia. Cùng dữ liệu và cùng kích thước màn hình cho cùng bố cục khi tải lại hoặc đồng bộ, không chọn vị trí mới sau mỗi 5 giây.
- Theo yêu cầu bổ sung mới nhất, toàn bộ hoa nằm trong vùng cỏ phía trên dải cỏ tiền cảnh; không kéo thêm hoa xuống ngoài viewport. Khi số người tăng, vườn thu nhỏ và xếp lại để vừa khung. Vị trí cũ có thể thay đổi lúc này; không còn cam kết giữ nguyên vị trí khi thêm người.
- Mũi tên tròn 44px nằm ở vùng trời bên phải, không có chữ hiển thị, vẫn có nhãn cho trình đọc màn hình. Vùng hoa mở rộng đến trên dải cỏ tiền cảnh; các tán dùng ranh giới elip để xếp xen kẽ nhẹ ở mép, không che tâm. Có lớp trước/sau và kích thước khác nhau. Tooltip giữ tên đầy đủ, rộng vừa đọc và được căn lại khi sát mép màn hình.
- Bốn con chim SVG bay chậm trên trời. Tối đa sáu bướm SVG bay đến, nghỉ trên một bông hoa thật trong cụm rồi bay đi, ngoài hai bướm có sẵn trên cảnh nền. Chu kỳ lệch pha để nhiều con xuất hiện cùng lúc. Bướm gắn vào nhóm SVG của đầu hoa nên đung đưa cùng hoa, được bù kích thước trên điện thoại. Mỗi lần đậu, một trái tim nhỏ bay lên rồi tan trong khoảng 2 giây; dùng chung thời gian/độ trễ với chu kỳ đậu. Không thêm thư viện, ảnh mạng hay vòng lặp JS cho chuyển động này.
- Animation dừng khi rời vườn hoặc ẩn tab. Quy tắc `prefers-reduced-motion` hiện có tắt animation; chưa đổi thiết lập hệ điều hành để thử chế độ này thực tế.
- Backend D1/Blobs, API đồng bộ 5 giây, danh sách thành viên, dữ liệu thật, 43 ảnh, sổ ảnh và thư không thay đổi. Trang rỗng vẫn không có cụm hoa mẫu.
- Mục Đến trên cả vé Coming soon và cuống vé là “Các bạn nữ TCTT67C”. Dòng Từ giữ nguyên TCTT67C, hai cột có chỗ riêng để chữ không đẩy nhau.

Mã bố trí: `src/shared/garden-layout.mjs` → `public/garden-layout.js` qua build. Giao diện dùng helper từ `public/garden.js`; CSS chuyển động ở `public/garden.css`. `build.mjs`, `public/index.html` và allowlist của `server/local.mjs` đã nối tài nguyên mới. Nội dung vé tại `src/ticket/TicketApp.jsx`; class tuyến vé ở component `lunar-boarding-pass.tsx` và `public/ticket.css`.

Kiểm chứng: 42/42 tests pass, gồm bố trí 0/1/30/60 cụm, tán không che nhau, đúng ranh giới ở sáu kích thước và bố cục tái hiện được. Build/Cloudflare dry-run pass; không deploy. Trình duyệt QA riêng: 30 cụm tại 320×740, 360×800, 390×844, 768×1024, 1024×768, 1280×900 đều trong viewport và không giao với nút Tiếp tục, không tràn ngang; thấy bốn chim và sáu bướm (bốn bướm gắn vào đầu hoa, hai bướm bay trên cảnh nền). Đã thử tên bằng Enter, chuyển sang vé, lật mặt sau và đọc đúng hai mục Đến. Vườn một người có một bướm đậu; vườn rỗng không còn SVG hoa/bướm đậu. Đọc trạng thái chim khi rời vườn: paused. Console không lỗi/cảnh báo. Chưa profile FPS/CPU hoặc thử thiết bị thật.

Hai server preview 2028/2029 đã được khởi động lại để nhận allowlist mới; hash dữ liệu riêng của từng server giữ nguyên. Preview 2030 chỉ chứa 30 tên giả lập để xem bố cục; không ghi tên thử lên production.

- Preview hiện có: http://127.0.0.1:2028/
- Preview 30 cụm thử: http://127.0.0.1:2030/
- Bằng chứng tạm: `/tmp/tctt67c-natural-garden-qa/`. `final-*` là bản cuối với 4 chim/6 bướm. Các ảnh `bounded-*`/`30-*` là các bước trước.
- Kiểm tra bổ sung 30 cụm ở 768×420 và 768×560: chiều cao tài liệu bằng viewport, không cần kéo xuống. Cùng kết quả ở cả sáu viewport tiêu chuẩn. Khi khung nhỏ, cụm hoa sẽ thu nhỏ để tất cả vẫn nằm trọn khung.

Chưa commit/push/deploy.

## Điều chỉnh độ đầy theo yêu cầu tiếp theo

Các kết quả bên dưới là lịch sử đợt giảm khoảng cách trước khi tăng kích thước và chuyển nút thành mũi tên.

Giảm khoảng đệm giữa các tán hoa từ 8/10px xuống 4/5px, vẫn giữ ranh giới tán không chồng nhau. Với 30 tên giả lập ở preview 2030, kích thước cụm trung bình tăng từ 82,5 lên 91,4px tại 1280×900; khoảng cách mép tán gần nhất trung bình giảm từ 18,9 xuống 12,5px. Tại 390×844, kích thước tăng từ 42 lên 47,1px và khoảng cách giảm từ 15,6 xuống 9,9px.

Đã chạy lại 42/42 tests và build. Đã kiểm tra thực tế 30 cụm ở 320×740, 360×800, 390×844, 768×1024, 1024×768 và 1280×900: không tràn ngang/dọc, không cắt cụm, không giao nút Tiếp tục, console không lỗi/cảnh báo. Bằng chứng mới: `denser-1280.png`, `denser-390.png`, `denser-viewports.json`, `density-metrics.json` trong thư mục QA tạm phía trên. Không thay dữ liệu hay cơ chế đồng bộ; chưa commit/push/deploy.

## Bản hiện tại: hoa lớn, mũi tên nhỏ, bướm và trái tim

Vùng trồng hoa từ khoảng 40% chiều cao đến trên 91%/cách đáy ít nhất 60px. Với 30 tên thử, kích thước cụm trung bình tại 1280×900 tăng từ 91,4 lên 123,1px; tại 390×844 từ 47,1 lên 63,2px. Bố cục vẫn rải tự nhiên theo ID. Test giới hạn phần giao góc của hai khung tán dưới 15%, tâm/tán elip tách biệt; bổ sung kiểm tra không thu hoa quá nhỏ.

43/43 tests và build pass. Đã kiểm tra 30 cụm trong trình duyệt ở sáu viewport tiêu chuẩn phía trên, thêm 768×420/560: không tràn, không cắt cụm, không đụng mũi tên. Mũi tên chỉ có icon, vùng chạm 44px. Đã mở vé bằng mũi tên, quan sát sáu bướm đang hoạt động, đọc trái tim hiện khi bướm ở vị trí đậu rồi lên cao và opacity về 0. Khi rời vườn, cả bướm/trái tim đều paused. Chưa bật reduced-motion của hệ điều hành; CSS hiện có tắt chuyển động và trái tim có opacity nền 0. Không sửa backend hoặc dữ liệu thật. Chưa commit/push/deploy.

Bằng chứng cuối: `finished-1280.png`, `finished-390.png`, `finished-viewports.json`, `heart-states.json`, `larger-metrics.json` trong thư mục QA tạm. Các tệp `larger-*`, `latest-*` là bước kiểm tra trước lần làm bướm rõ hơn.

## Bù hoa cho tên ngắn, giữ cụm đã đầy

`public/bouquet.js` bù những tên có dưới 12 nhành chính lên tán đầy 12 nhành. Tên đã đủ 12 nhành trở lên giữ nguyên hình vẽ, loại hoa và vị trí cũ. Trong vườn, tối đa 4 nhành bù dùng vị trí điểm xuyết riêng; đây là phần bù chỗ thiếu, không cộng thêm lên cụm đã đầy. Tên rất ngắn có thêm nhành nền để đạt cùng độ dày. Những nhành theo chữ cái vẫn đứng đầu danh sách, nên thao tác gõ/phím hoa, G/R/V hoa hồng và K/L/Y hoa ly không đổi.

Áp dụng ngay khi vẽ lại tên đã lưu; không ghi thêm hoa hoặc thành viên vào database. 30 tên thử trong preview vẫn cùng ID/revision/dữ liệu. Đã so sánh hình vẽ cũ/mới cho Nguyễn Thu Phương và Nguyễn Hoàng Minh Anh: giữ nguyên hình vẽ (ngoại trừ thuộc tính phân loại SVG phục vụ xác định nhành chữ/nhành bù). Đã kiểm tra tên ngắn An và phím G trên giao diện.

48/48 tests và build pass; có 5 tests mới trong `tests/bouquet-density.test.mjs` cho độ dày, không thêm vào cụm đầy, phím hoa, Unicode và nhành chữ giữ nguyên. Browser kiểm tra 30 cụm tại 320×740, 360×800, 390×844, 768×1024, 1024×768, 1280×900: đủ 12 nhành mỗi cụm, không tràn/cắt cụm/giao mũi tên, console không lỗi/cảnh báo. Bằng chứng: `fullness-1280.png`, `fullness-390.png`, `fullness-viewports.json`, `fullness-counts.json`, `full-short-name.png`. Chưa commit/push/deploy; không ghi dữ liệu production.
