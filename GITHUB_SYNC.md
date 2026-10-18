> Nhật ký lần đưa code lên GitHub trước đây. Cấu trúc và cách deploy hiện tại xem [README.md](README.md) và [CLOUDFLARE.md](CLOUDFLARE.md); frontend nay ở public/.

# GitHub và vườn hoa chung — 18/10/2026

Repository đã fetch và xác minh: https://github.com/huy31032007/20-10-TCTT67C (nhánh main). Trước lượt cập nhật này repository chỉ có commit 2a611e1 và .gitattributes; chưa có website. Checkout local nằm ở `20/10 TCTT67C/` bên trong thư mục bản sửa; mã được chép vào gốc checkout bằng danh sách file cụ thể, không di chuyển/xóa bản gốc.

## Phạm vi bản cập nhật

Đưa toàn bộ mã chạy, assets, package-lock, cấu hình Netlify, Function, server và tests vào Git. Không đưa node_modules, dist, .env, data local, ảnh/test fixture hay báo cáo chứa đường dẫn tạm vào Git. Mã SVG hoa đa dạng và chụm gốc là bản cập nhật trước; lượt này thêm nhãn tên khi hover, chạm hoặc focus. Escape/bấm ra ngoài ẩn tên. Tên được gán bằng textContent, không chèn tên vào HTML.

## Dữ liệu chung

GitHub chứa mã nguồn; không dùng GitHub để lưu người tham gia. Trên Netlify, POST /api/garden gọi Function và ghi Netlify Blobs (class-garden-v1, strong consistency, kiểm tra etag để tránh ghi đè khi thêm đồng thời). Trình duyệt khác ở màn vườn GET danh sách khoảng 5 giây/lần và vẽ hoa theo tên. Tab ẩn tạm ngừng đọc; quay lại tab sẽ đọc mới. Tên giống hệt sau chuẩn hóa được coi là một người. Không có đăng nhập hay trạng thái ai đang online.

GET production ngày 18/10/2026 trả HTTP 200, revision 1 và 1 thành viên. Không gửi tên thử lên production; chưa kiểm tra ghi thật trên Netlify. Kiểm thử local dùng dữ liệu tạm riêng, không phải localStorage và không được đưa vào Git.

## Netlify và Cloudflare

Netlify: repository có netlify.toml với build npm run build, publish dist, functions netlify/functions, Node 24. Nếu site hiện tại chưa nối GitHub, chủ site cần nối đúng repository này, để Base directory trống. Chưa xác minh liên kết Git với site hiện tại và chưa thao tác deploy riêng. Nếu đã bật continuous deployment trên main, push có thể kích hoạt build tự động.

Cloudflare: cần API server-side và kho dữ liệu chung; chỉ upload file tĩnh không chạy Netlify Function/Blobs. Có thể chuyển sang Pages Functions/Worker + D1 để vẫn hỏi định kỳ; nếu muốn cập nhật tức thì, cân nhắc Worker + Durable Object + WebSocket. Cần tạo tài nguyên/binding, chuyển API và xem xét di chuyển dữ liệu. Chưa tạo backend, đổi schema hoặc thêm dịch vụ Cloudflare trong lượt này.

Nguồn: https://developers.cloudflare.com/pages/functions/bindings/ và https://docs.netlify.com/build/data-and-storage/netlify-blobs/

## Kiểm thử trước khi commit

- npm test: 4/4 qua; npm run build và node --check garden.js thành công.
- Trình duyệt local: luồng cửa → nhập tên → thiệp → vườn; 30 bó, hover hiện đúng Nguyễn Minh Anh, Enter hiện tên, Escape và bấm ra ngoài ẩn tên.
- 320×844: nhãn tên nằm trong khung (x=21,92 đến 164,07), trang rộng đúng 320, không tràn ngang. 1280×720 cũng hiện đúng nhãn và hiệu ứng hover.
- Hai tab riêng cùng đọc 30 bó, thêm một tên giả qua API local trả HTTP 201; cả hai tự hiển thị 31 bó mà không reload. Console không có error/warn trong lần đọc. Không ghi tên thử lên production.
- Ảnh và dữ liệu test giữ ở qa/ trên máy local; không đưa vào repo hoặc bản deploy.
