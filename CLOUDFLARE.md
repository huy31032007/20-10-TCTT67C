# Cloudflare Worker + D1

Bản Cloudflare dùng Worker `20-10-tctt67c` đã được tạo trong tài khoản của chủ dự án, không phải Cloudflare Pages. Worker phục vụ giao diện từ `dist/` và xử lý API `/api/garden` với D1. Cấu hình được lưu trong `wrangler.jsonc`.

## Build và deploy

- Build command trong Cloudflare: `npm run build`.
- Deploy command: `npx wrangler deploy` (dùng phiên bản Wrangler đã khóa trong package-lock).
- Root: gốc repository; Node 24.
- `assets.directory` phải là `./dist`. Không đổi thành `.` vì sẽ lấy cả mã nguồn và node_modules làm tài nguyên công khai.
- Entry point: `cloudflare/worker.mjs`.
- `GARDEN_DB` dùng database D1 `class-garden` trên bản chính.
- `cloudflare/schema.sql` là cấu trúc bảng cần khởi tạo một lần. Bảng trống tương ứng 0 người, không tự thêm tên mẫu.

Hai database D1 và bảng đã được tạo qua dashboard ngày 18/10/2026. ID trong cấu hình là định danh tài nguyên, không phải secret. Không cần đưa API token vào trình duyệt hay repository.

## Cơ chế vườn chung

Khi người xem hoàn thành thiệp, frontend POST tên đến API cùng domain. Worker tái sử dụng logic kiểm tra tên, tên trùng và giới hạn 300 người. D1 lưu một tài liệu có revision; SQL chỉ ghi khi revision hiện tại khớp lượt đọc, tránh hai lượt tham gia ghi đè nhau. Các lượt cạnh tranh được logic chung thử lại.

Mỗi request bắt đầu D1 session `first-primary` để đọc dữ liệu mới. Người đang ở màn vườn hỏi API lại khoảng 5 giây/lần, tab ẩn tạm ngưng, quay lại tab đọc mới. Đây chưa phải cập nhật đẩy tức thì hay danh sách đang online.

Tên và thời điểm tham gia được lưu trên D1 dùng chung, không dùng localStorage để giả lập đồng bộ. Tên hiện khi hover/chạm/focus vào bó hoa. Tên trùng sau chuẩn hóa là cùng một người, chưa có đăng nhập để phân biệt hai người có họ tên giống hệt.

## Kiểm thử

Chạy `npm ci`, `npm test`, `npm run build`.

Khởi tạo và chạy môi trường local riêng:

```sh
npx wrangler d1 execute class-garden --local --file=cloudflare/schema.sql
npm run dev:cloudflare
```

Không thêm `--remote` khi thử tên. Dữ liệu mô phỏng trong `.wrangler/` được Git bỏ qua. Tests bổ sung thực thi SQL của adapter trên SQLite, kiểm tra ghi đua, tên trùng và định tuyến Worker. Kiểm thử tích hợp riêng đã dùng workerd/D1 local, 30 POST đồng thời trả 201, giữ đủ 30 tên và tên lặp trả 200 không thêm bó.

Môi trường `--env preview` cấu hình Worker riêng `20-10-tctt67c-preview` và database `class-garden-preview`. Chỉ khi chạy lệnh có `--env preview` thì kết nối này được dùng. Các version preview URL/branch build mặc định của Workers không tự được chuyển sang database thử chỉ vì có khối env này. Chưa coi môi trường remote preview đã deploy nếu không có URL kiểm chứng.

Không nhập tên giả vào API production. Sau deploy chỉ GET để xác minh vườn; bài thử ghi ở local hoặc Worker preview dùng database riêng.

## Dữ liệu Netlify

Backend Netlify vẫn có sẵn, không bị xóa. Netlify Blobs và Cloudflare D1 là hai kho riêng. Push/deploy không tự chuyển dữ liệu giữa hai nơi; việc chuyển tên cũ cần được xác nhận riêng. D1 mới bắt đầu trống nếu chưa chuyển dữ liệu. Chỉ gửi một URL hosting thống nhất cho lớp sau khi chốt nơi sử dụng.

Tài liệu: [Workers assets](https://developers.cloudflare.com/workers/static-assets/binding/), [D1 sessions](https://developers.cloudflare.com/d1/worker-api/d1-database/), [Node compatibility](https://developers.cloudflare.com/workers/runtime-apis/nodejs/).
