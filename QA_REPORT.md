# Báo cáo kiểm tra website 20/10 — 18/10/2026

> Có bản cập nhật hoa và hover theo yêu cầu mới sau lượt kiểm tra này. Xem [FLOWER_GARDEN_NOTES.md](FLOWER_GARDEN_NOTES.md) và bộ bằng chứng `qa/floral-2026-10-18/`. Nội dung dưới đây ghi lại lượt QA trước đó, bao gồm quyết định bỏ tăng tốc hover lúc ấy.

## Kết luận và phạm vi

Đã sửa trên codebase local được dùng trong cuộc trò chuyện: `Documents/Workspace/Claude code/projects/20-10-gui-cau`. Đây là HTML/CSS/JavaScript thuần, không đổi framework hoặc dependency. Thư mục chưa có `.git`; repository remote và cách site production được gắn với repo chưa được xác minh.

Giữ luồng **cửa → mở khóa → nhập tên → phong bì/thiệp → chủ động hoàn thành → vườn**. Không khôi phục mood/nhặt sao. Không sửa lời chúc hoặc thay nhạc. Không sửa backend/schema, chạy migration, thêm dịch vụ, commit, push hay deploy.

## File thay đổi

- `script.js`: chặn tên trên 30 ký tự; tải lại media khi thử phát sau lỗi; chặn tiến độ fade âm lượng âm. Lỗi âm lượng âm được thấy trong console trước sửa; đã chạy lại kiểm tra sau sửa.
- `garden.js`: tính kích thước/khoảng cách cụm hoa theo số cụm trong hàng, chừa mép, không tăng kích thước vô hạn theo hàng; nhãn nút nhạc trong vườn đổi theo trạng thái bật/tắt.
- `garden.css`: bỏ tăng tốc đung đưa khi hover.
- `README.md`, `NETLIFY.md`: bổ sung kiểm tra, cảnh báo dùng dữ liệu thử đúng chỗ, hướng dẫn huy hiệu hosting và trạng thái triển khai.
- `QA_REPORT.md`, `qa/audit-2026-10-18/`: báo cáo, diff, ảnh và số đo kiểm tra. Build chỉ chép danh sách tài nguyên công khai đã có, không chép thư mục QA.

[Diff có thể review](qa/audit-2026-10-18/changes.patch).

## Dữ liệu thật và cách đồng bộ hiện có

`netlify/functions/garden.mjs` đang dùng `@netlify/blobs`, kho site `class-garden-v1`, tài liệu `members`, đọc strong consistency và ghi có điều kiện bằng etag. `/api/garden` xử lý GET/POST qua handler có sẵn. Trình duyệt đọc lại mỗi 5 giây khi vườn đang mở; không coi localStorage là dữ liệu chung.

Tên được chuẩn hóa Unicode/khoảng trắng và đối chiếu không phân biệt hoa/thường. Tên trùng trả thành viên cũ, giữ tên và ngày tham gia cũ; không ghi đè người khác. Hai người có họ tên đầy đủ giống hệt vẫn được coi là một thành viên — chưa có xác thực từng học sinh. Dữ liệu lưu gồm id suy ra từ tên, tên và thời điểm tham gia; không gửi tâm trạng hoặc thông tin liên hệ.

Trên local, adapter có sẵn dùng JSON trong thư mục tạm riêng. Đã xác nhận hai lượt mở web đọc chung và nhận thêm cụm qua polling thật. Đây là kiểm tra local, chưa phải kiểm tra ghi/lưu bền vững trên dịch vụ Netlify Blobs production.

## Test thực tế

| Trường hợp | Kết quả và giới hạn |
|---|---|
| Cửa ban đầu | Toàn màn hình; chữ trong trang trống; media paused trước tương tác. |
| Mở khóa | Chuyển sang tên sau hiệu ứng, có thể dùng Enter. |
| Nhạc | Trạng thái phát sau tương tác, bật/tắt; nguồn Photograph giữ nguyên. Mô phỏng file tải lỗi rồi phục hồi: bấm nút phát lại thành công sau sửa. Không đánh giá chất lượng âm thanh bằng nghe. |
| Bàn phím | Gõ `An` bằng phím vào ô tên; bàn phím hoa tạo `AN`; nhập tên tiếng Việt có dấu, Enter để tiếp tục. Chưa test IME/keyboard điện thoại vật lý. |
| Tên trống/sai/dài | Tên trống và `123` có báo lỗi; tên 31 ký tự bị chặn với thông báo tối đa 30. |
| Thiệp và nút hoàn thành | Tới thiệp không lưu người; chỉ chủ động hoàn thành mới POST tên. Backend local trước hành động cuối có revision 0/members 0. |
| Vườn rỗng | Fixture QA trả danh sách rỗng và cố ý từ chối POST để không tự thêm người: 0 cụm, 0 hoa trang trí, không cánh hoa bay, không chữ nhìn thấy. Có biểu tượng thử lại do lỗi lưu được mô phỏng. |
| Một người | Sau khi phục hồi và bấm thử lại: đúng 1 cụm, `data-wrapped=false`, 0 giấy/nơ. |
| Tên trùng | POST local tên đã có, khác hoa/thường/khoảng trắng: `created=false`, số người/revision giữ nguyên, tên cũ không bị đổi. |
| Đồng bộ hai lượt mở | Người thứ hai hoàn thành trong tab khác; tab đầu tự nhận cụm thứ hai mà không bấm làm mới. |
| Nhiều người | Dữ liệu local 30 người; đủ 30 cụm, không giấy/nơ. Kiểm tra khung cụm nằm trong cảnh ở sáu viewport, cuộn bàn phím tới cụm cuối. |
| Lưu thất bại | POST 503 từ máy chủ QA: không báo thành công, có nút thử lại; phục hồi mới thêm 1 cụm. |
| Mất mạng/tải thất bại | Máy chủ QA đóng kết nối: giữ 2 cụm đã đọc, báo mất kết nối cho trình đọc màn hình, hiện thử lại; phục hồi đọc lại thành công. |
| Giảm chuyển động | **Mô phỏng riêng ở máy chủ QA**, ép nhánh JS reduced và CSS tương ứng. Cửa chuyển nhanh; animation hoa/mây/bướm/cánh hoa đều `none`. Thiết bị thật vẫn báo media query false; chưa kiểm tra bằng cách bật tùy chọn hệ điều hành. |
| Console | Phát hiện và sửa lỗi fade tạo volume âm. Lượt mới bật/tắt 12 lần, đi hết thiệp/vườn và tắt nhạc: không có error/warn mới. Các lỗi mạng cố ý được ghi riêng, không coi là lỗi sản phẩm chưa sửa. |

`npm test`: **4/4** kiểm tra có sẵn qua, gồm chuẩn hóa/trùng tên, nhiều handler ghi đồng thời trên store thử, input không hợp lệ và lưu qua khởi động lại server local. Chưa test ghi đồng thời trên dịch vụ Netlify thật.

`npm run build`: thành công. Bundle Netlify Function bằng esbuild: thành công. Không cài thêm gói.

## Sáu viewport đã xác nhận bằng DOM

Các bước cửa/tên/phong bì/thiệp/vườn đều được mở bằng UI và đo lại ở từng chiều rộng. Lượt đo đầu bị reset về 1280 được loại khỏi kết quả; bảng này dùng lượt chạy lại có `innerWidth` đúng yêu cầu.

| Viewport px | Tràn ngang ở các bước | Cụm hoa | Mép trái nhỏ nhất / phải lớn nhất px | Giao nhau lớn nhất giữa khung cụm |
|---|---|---|---|---|
| 320 × 844 | Không | 30 | 17.4 / 302.6 | 9.8% |
| 360 × 844 | Không | 30 | 20.2 / 339.8 | 9.8% |
| 390 × 844 | Không | 30 | 22.3 / 367.7 | 11.6% |
| 768 × 900 | Không | 30 | 48.8 / 717.5 | 9.3% |
| 1024 × 900 | Không | 30 | 67.5 / 957.3 | 9.4% |
| 1280 × 900 | Không | 30 | 85.6 / 1195.4 | 9.5% |

Khung bàn phím web nằm trong màn hình tại cả sáu kích thước. Không khung cụm nào bị cắt bởi biên cảnh; độ giao nhau trên là diện tích hộp bao (không phải diện tích từng cánh hoa). Với nhiều người, vườn kéo dài để cuộn; không tuyên bố 30 người đều nằm trong một viewport. Đã dùng End tới cuối; cụm cuối có đáy 811 px trong viewport cao 900 px sau khi cuộn ổn định.

Đây là kiểm tra trong trình duyệt của ứng dụng, không thay thế kiểm tra Safari/iOS/Android và máy thật. Chưa kiểm tra tải 300 người, hiệu năng thiết bị yếu, xuất ảnh thiệp hoặc toàn bộ hành vi reader màn hình.

## Preview

- [Vườn 30 người, 1280 px](qa/audit-2026-10-18/garden-1280.jpg)
- [Vườn 30 người, 390 px](qa/audit-2026-10-18/garden-390.jpg)
- [Vườn rỗng trong fixture lỗi lưu](qa/audit-2026-10-18/empty-garden.jpg)
- [Nhập tên ở 320 px](qa/audit-2026-10-18/name-320.jpg)
- [Số đo viewport](qa/audit-2026-10-18/viewports-corrected.json), [quan sát các luồng](qa/audit-2026-10-18/observations.json).

Preview đã chạy cục bộ tại `http://127.0.0.1:2014/`, qua máy chủ QA tại `http://127.0.0.1:2015/`. Máy chủ được dừng sau kiểm tra; các ảnh/JSON ở trên là preview lưu lại, không phải URL public đang chạy. Muốn xem tương tác trên dữ liệu local của bạn, chạy `npm start` tại thư mục dự án và mở `http://127.0.0.1:2010/`. Mở bằng `file://` không có API vườn chung.

## Production và việc còn lại

Đã đọc `https://mellow-biscuit-e73f40.netlify.app/` và GET `/api/garden`: HTTP 200, API JSON revision 0/members 0 tại thời điểm kiểm tra. Đã mở trang thật bằng trình duyệt, thấy cửa và nhạc chưa phát. Không mở khóa, nhập tên hay POST lên production. HTML production khác local ở nhãn aria vườn; không kết luận production đã chứa bản sửa mới từ việc URL tải được.

Trình duyệt thấy iframe huy hiệu **Powered by Netlify** trên production. Vì yêu cầu mở đầu/vườn không chữ, đây là phần còn chưa đạt ở site thật. [Netlify hướng dẫn tắt huy hiệu trong Project configuration → General → Powered by Netlify badge](https://docs.netlify.com/manage/projects/powered-by-netlify-badge/), không cần deploy lại. Lượt này chưa thay đổi cài đặt hosting.

File `nhac/photograph.mp3` trùng SHA-256 với file Photograph bạn đã cung cấp trong `thu/nhac`, 4.148.483 bytes. Vị trí/nguồn file đã xác minh; trong project chưa có thông tin xác nhận quyền phát hành nhạc công khai, nên chủ dự án cần xác minh phần đó trước phát hành. Không tải nhạc khác.

Chưa xác minh: ghi/lưu bền vững production; giảm chuyển động trên thiết bị thật; browser/IME vật lý; repository remote và cấu hình Git gắn với site. Không thay đổi dữ liệu production để test các mục này.

**Bước tiếp theo:** duyệt ảnh và diff của bản local; trước một lần triển khai được cho phép riêng, xác nhận repository/quy trình Netlify, kiểm tra huy hiệu hosting và các giới hạn phát hành nói trên.
