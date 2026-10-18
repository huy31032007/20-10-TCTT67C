# Hoa mới, thử 30 bó và cơ chế vườn chung

## So với ảnh tham chiếu

| Nội dung | Trước cập nhật | Bản mới |
|---|---|---|
| Dáng hoa | Bàn phím chủ yếu lặp cúc/tulip; bó pha nhiều bông gần giống nhau | 13 dáng: cúc, tulip, mao lương, sao nhái, hồng, hướng dương, ly, cẩm tú cầu, cẩm chướng, lan, lavender, mẫu đơn, anemone |
| Sự khác nhau giữa người | Các bó chung bảng màu và hỗn hợp hình hoa | Tên quyết định nhóm loài chủ đạo, phối màu và nhánh. Có 12 nhóm phối, 8 bảng màu trong mã nguồn |
| Gốc trong vườn (mũi tên ảnh 3) | Cuống trải rộng, chân có dải cỏ dài | Cuống tụ về cùng vùng gốc như bó ở ảnh 2. Cỏ rất nhỏ quanh gốc; không giấy, không nơ |
| Cảm giác khu vườn | Cụm cách xa, khó thấy đủ 30 trên desktop | Các bó so le gần nhau thành hàng; 30 bó nằm đủ trong cảnh 1280×900. Điện thoại cuộn để xem hết |
| Chuyển động | Gió nhẹ | Gió nhẹ tự động; hover rung khoảng ±3° trong chu kỳ 0,55 giây, rồi trở về gió nhẹ. Chạm/Enter/Space cũng có phản hồi. Giảm chuyển động tắt cả hai |

Ảnh tham chiếu 1 có nền hồng đậm, hoa phẳng và mỗi phím là một chùm nhỏ. Giữ nền pastel vui tươi của web lớp; chỉ học sự đa dạng hình hoa và cách chụm gốc. Ảnh 4 gợi ý mật độ màu/các hàng hoa, không được dùng làm ảnh nền hoặc thêm hoa giả khi chưa có thành viên.

Tự vẽ SVG dựa trên đặc trưng loài và cách phối bó. Nguồn tra cứu: [RHS — cut flowers](https://www.rhs.org.uk/plants/for-places/cut-flowers-growing), [bó hỗn hợp tulip/hồng/đồng tiền/cẩm chướng/cẩm tú cầu](https://www.laxmi-creations.com/product-page/hand-bouquet-hb-2205). Không tải, sao chép ảnh sản phẩm vào website. Mã SVG dùng lại hình đầu hoa bằng `defs/use` để giảm node; không thêm dependency.

## Khi một bạn góp hoa, bạn khác thấy bằng cách nào?

1. **Gõ tên:** chỉ vẽ bó riêng trong trình duyệt; chưa gửi tên lên vườn.
2. **Xem thiệp và bấm Hoàn thành:** trình duyệt POST tên tới `/api/garden` của site.
3. **Lưu chung:** Netlify Function có sẵn chuẩn hóa tên, kiểm tra trùng, thêm người và lưu JSON trong Netlify Blobs. Ghi có kiểm tra phiên bản để tránh lượt thêm sau đè lượt trước.
4. **Người khác đang xem vườn:** trang hỏi API lại sau khoảng 5 giây kể từ lượt đọc trước; khi nhận danh sách mới sẽ tạo thêm bó. Đây là polling, chưa có WebSocket/push tức thì. Độ trễ thường từ chờ lượt hỏi 0–5 giây cộng thời gian mạng/xử lý; không cam kết giới hạn tuyệt đối.
5. **Hình hoa:** mỗi máy vẽ SVG từ cùng tên và cùng phiên bản code, nên loài/màu/nhánh khớp nhau. Bố cục có thể xếp khác giữa điện thoại và máy tính để vừa màn hình. Không cần gửi cả ảnh lên máy chủ.

Store hiện dùng `consistency: strong`; [tài liệu Netlify Blobs](https://docs.netlify.com/build/data-and-storage/netlify-blobs/) giải thích chế độ này cho việc đọc bản cập nhật mới nhất. Strong consistency không tự gửi thông báo tới trình duyệt; polling trong code vẫn là bước cần thiết.

Chỉ hỏi định kỳ khi ở màn vườn; tab bị ẩn sẽ tạm bỏ qua lượt đọc. Quay lại tab sẽ đọc mới. Số hoa đã lưu khác số người đang online. Ví dụ giả sử 30 người cùng mở vườn liên tục: 30 × 60 / 5 ≈ 360 GET/phút, khoảng 21.600 GET/giờ trước khi tính thời gian xử lý. Một người đang xem vườn có 30 hoa vẫn chỉ là một người hỏi API, không phải 30 người. Phí phụ thuộc gói, lượt truy cập, compute và bandwidth; không mặc định là miễn phí. [Netlify usage/billing](https://docs.netlify.com/build/functions/usage-and-billing/).

Tên đầy đủ trùng nhau được coi là một người: không tạo thêm bó và không ghi đè tên cũ. Chưa có đăng nhập hay cơ chế phân biệt hai học sinh có họ tên giống hệt. Không thay đổi schema/backend trong lượt này.

## Nên dùng Netlify hay Cloudflare?

**Đề xuất cho bản 20/10 hiện tại: giữ Netlify.** Code đã có Function + Blobs, lượng người một lớp và việc chờ vài giây phù hợp với góp hoa, nên không cần di chuyển dữ liệu/API chỉ để đổi chỗ host.

| Phương án | Phù hợp |
|---|---|
| Netlify + Function/Blobs hiện tại | Giữ bản hiện có, ít việc triển khai lại. Cập nhật theo lượt hỏi khoảng 5 giây |
| Cloudflare Workers + Durable Objects + WebSocket | Khi thật sự cần đồng bộ gần tức thì hoặc nhiều người xem lâu. Durable Object có thể giữ các kết nối và gửi cập nhật khi có lượt tham gia, thay vì mỗi máy hỏi liên tục |

[Cloudflare Durable Objects/WebSockets](https://developers.cloudflare.com/durable-objects/best-practices/websockets/) có cơ chế hibernation để giữ kết nối lúc object nghỉ; chi phí thực tế vẫn theo [quy định giá/giới hạn](https://developers.cloudflare.com/durable-objects/platform/pricing/). Đây là lựa chọn kiến trúc, không phải benchmark khẳng định Cloudflare nhanh/rẻ hơn trong mọi tình huống.

Chỉ đưa file tĩnh sang Cloudflare Pages không tự đem API/kho Blobs của Netlify sang. Phương án Workers/Durable Objects cần chuyển API, lưu trữ và kết nối realtime, đồng thời xem xét dữ liệu đang có. Chưa thực hiện thay đổi đó, chưa tạo dịch vụ mới và chưa deploy.

## Bằng chứng của lần thử này

- Fixture local gồm 30 tên minh họa, không phải danh sách lớp xác nhận. Dữ liệu trong thư mục tạm, không được gửi vào production.
- Thực tế 30 bó: 30 profile và 30 tập nhánh khác nhau; 11 nhóm phối, 7 bảng màu, đủ 13 hình hoa xuất hiện. Các họ tên khác có thể dùng thêm các nhóm/bảng màu còn lại.
- Đối chiếu bó `Nguyễn Minh Anh` ở màn nhập và vườn: profile, family, bảng màu và danh sách nhánh khớp hoàn toàn. Gốc cuống gom trong vùng rộng 12 đơn vị SVG; không có lớp giấy/nơ.
- 30 lượt POST đồng thời vào một server local sạch: 30 trả HTTP 201; GET sau đó có 30 id duy nhất/revision 30. Đây không phải đo độ trễ hay kiểm tra ghi trên Netlify production.
- Đã mở luồng cửa → tên → thiệp → vườn. Đo bố cục tại 320, 360, 390, 768, 1024, 1280 px, chiều rộng thực được xác minh; không tràn ngang, không cắt khung bó bởi biên cảnh. Màn hình nhỏ dùng cuộn dọc.
- Hover thật: `:hover=true`, hiệu ứng chạm đã hết nhưng animation vẫn `garden-hover-shake`. Đưa chuột sang nút nhạc: `:hover=false`, trở lại `garden-bouquet-breeze`. Enter ở bó đã focus cũng bật rung.
- Fixture vườn rỗng: 0 bó, 0 hoa trong cảnh, không cánh hoa bay. POST bị chặn có chủ ý trong fixture để giữ danh sách rỗng.
- Giảm chuyển động: fixture ép nhánh CSS/JS để test, kể cả đang hover/chạm vẫn `animation:none`. Media query thiết bị thật đang false; chưa bật cài đặt trên máy thật, chưa test cảm ứng vật lý/thiết bị yếu.
- Build thành công; 4/4 test dữ liệu có sẵn qua. Console luồng bình thường không có error/warn trong lần đọc.

Ảnh và số đo: [30 bó desktop](qa/floral-2026-10-18/garden-30-desktop.jpg), [mobile](qa/floral-2026-10-18/garden-30-mobile.jpg), [bó nhập tên](qa/floral-2026-10-18/name-bouquet.jpg), [vườn rỗng](qa/floral-2026-10-18/garden-empty.jpg), [metrics](qa/floral-2026-10-18/metrics.json), [30 POST đồng thời](qa/floral-2026-10-18/concurrent-30.json).

File sửa chính: `bouquet.js`, `script.js`, `garden.js`, `garden.css`; cập nhật chú thích `flower-profiles.js` và hướng dẫn. Không đổi nhạc, lời chúc, backend/schema hoặc dependency. Giữ trạng thái chưa commit/push/deploy. Huy hiệu Netlify trên site thật vẫn cần chủ site xử lý riêng như ghi trong QA_REPORT.md.
