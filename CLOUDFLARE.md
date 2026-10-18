# Đưa website lên Cloudflare — hướng dẫn từ đầu

Dùng **Cloudflare Workers + D1** cho repository [huy31032007/20-10-TCTT67C](https://github.com/huy31032007/20-10-TCTT67C). Đây là hướng dẫn chính cho cấu trúc code mới, thay cho hướng dẫn Pages trước đây.

## 1. Cấp quyền GitHub cho đúng repository

1. Đăng nhập GitHub bằng tài khoản `huy31032007`.
2. Vào Settings → Applications → Installed GitHub Apps → Cloudflare Workers and Pages → Configure.
3. Trong Repository access, giữ Only select repositories.
4. Bấm Select repositories, tìm và chọn `20-10-TCTT67C`. Giữ nguyên các repository đã chọn khác.
5. Bấm Save.

Lượt kiểm tra trước thấy Cloudflare App chỉ được truy cập hai repository khác, chưa có repository website. Vì thế sửa code/push chưa đủ để Cloudflare tự build. Thao tác Save ở đây cấp quyền cho Cloudflare truy cập mã website. Không cần tạo API token rồi dán vào code.

## 2. Dùng tài nguyên đã được tạo

Trong đúng tài khoản Cloudflare đang có Worker:

| Tài nguyên | Tên |
|---|---|
| Worker chính | `20-10-tctt67c` |
| Database thật | `class-garden` |
| Database thử | `class-garden-preview` |
| Bảng ở cả hai database | `garden_state` |
| Binding trong code | `GARDEN_DB` |

Các tài nguyên và bảng trên đã được tạo trong lượt thiết lập trước. ID database đã điền trong hai file cấu hình. Dùng lại chúng, không cần chạy SQL hay tạo lại database. Theo lựa chọn của chủ dự án, vườn Cloudflare bắt đầu mới, không nhập dữ liệu từ Netlify.

Nếu dùng một tài khoản Cloudflare hoàn toàn khác: phải tạo hai D1 mới, chạy SQL trong `cloudflare/schema.sql` ở Console của từng database, rồi thay database_id trong hai file cấu hình. Đó là trường hợp khác với tài khoản hiện tại.

## 3. Mở đúng Worker và kết nối repository

Cloudflare Dashboard → Workers & Pages → chọn Worker `20-10-tctt67c` → Settings → Builds.

- Repository: `huy31032007/20-10-TCTT67C`.
- Production branch: `main`.
- Builds được bật (Disable builds = off).

Nếu còn thông báo disconnected sau bước 1, tải lại dashboard. Nếu phải kết nối lại Git, chọn tài khoản `huy31032007` và đúng repository này. Dùng lại Worker hiện tại, không cần tạo project Pages hay một Worker khác.

## 4. Điền cấu hình build

| Trường trong Cloudflare | Giá trị |
|---|---|
| Build command | `npm run build` |
| Deploy command | `npm run deploy` |
| Root directory | `/` (gốc repository) |
| Build variable | `NODE_VERSION` = `24` |

Lưu nếu dashboard có nút Save. Lệnh deploy tự build trước khi gọi Wrangler; chạy lại build trong pipeline không làm thay đổi dữ liệu D1. Wrangler được khóa phiên bản trong package-lock.json.

Giữ tên Worker là `20-10-tctt67c` để khớp cấu hình. Runtime binding D1 sẽ được deploy từ `wrangler.jsonc`, không cần dán khóa database vào frontend.

## 5. Chạy build mới

Vào Deployments → mở build lỗi → Retry build. Kiểm tra build đang dùng commit mới nhất của nhánh main trên GitHub.

Dấu hiệu đúng trong log:

- `Built static assets: .../dist/`.
- Assets được đọc từ `dist`, không phải gốc repository.
- Worker có binding `GARDEN_DB (class-garden)` và `ASSETS`.
- Deploy kết thúc thành công; không chỉ build thành công.

Nếu Git đã nối đúng, các lần push tiếp theo vào main có thể tự kích hoạt build theo cấu hình trên.

## 6. Kiểm tra URL thật

Mở URL workers.dev do Cloudflare hiển thị ở Worker. Trước tiên, kiểm tra website tải được, cửa phủ toàn màn hình và bấm khóa vào được màn tên.

Mở thêm `/api/garden` trên cùng domain. Vườn mới chưa có người cần trả JSON:

```json
{"revision":0,"members":[]}
```

Nếu đã có người tham gia thật, revision và members sẽ lớn hơn 0; không xóa dữ liệu chỉ để đưa về kết quả ví dụ.

Không nhập tên giả vào bản chính. Sau khi kiểm tra URL/API, gửi cùng một link Cloudflare cho lớp. Những lượt hoàn thành thiệp thật mới góp hoa vào D1. Tất cả người xem cùng domain sẽ nhận cùng danh sách; hover/chạm vào hoa hiện tên.

## 7. Cơ chế đồng bộ

Hoàn thành thiệp → POST `/api/garden` → Worker kiểm tra tên → lưu D1 → các màn vườn khác GET lại khoảng 5 giây/lần. Tab ẩn tạm ngừng hỏi; quay lại tab đọc mới. Đây là dữ liệu chung, không phải localStorage và chưa phải WebSocket hoặc danh sách đang online.

D1 giữ một tài liệu có revision. Cập nhật SQL có điều kiện tránh ghi đè khi nhiều bạn góp hoa đồng thời; mỗi request đọc primary qua session. Tên giống nhau sau chuẩn hóa chỉ có một bó. Dữ liệu D1 không mất khi deploy lại code.

## 8. Thử trên máy mà không đụng dữ liệu thật

Trong thư mục repository, dùng Node 24:

```sh
npm ci
npm run dev
```

Lệnh này tự tạo dist, tự tạo bảng local nếu thiếu và chạy Worker giả lập. Mở URL local mà Wrangler in ra. Dữ liệu ở `.wrangler/` trên máy, được Git bỏ qua; không gửi tên thử lên D1 thật.

Các lệnh khác:

| Lệnh | Tác dụng |
|---|---|
| `npm test` | Kiểm tra lưu chung, tên trùng, SQL, build và cấu hình |
| `npm run check:cloudflare` | Build và đóng gói thử, không deploy |
| `npm start` | Server Node local dự phòng, dữ liệu trong data/ |
| `npm run deploy` | Build và deploy Worker chính khi đã đăng nhập Wrangler |
| `npm run deploy:preview` | Build và deploy Worker thử với database riêng |

`wrangler.jsonc` chỉ dành cho bản chính. `wrangler.preview.jsonc` chỉ dành cho bản thử; không còn khối env preview trong cấu hình chính. Cấu hình riêng chỉ được dùng khi lệnh chọn file đó; version preview URL tự động của Workers không mặc nhiên dùng database thử.

## 9. Khi gặp lỗi

| Lỗi | Việc cần kiểm tra |
|---|---|
| Cloudflare disconnected / không thấy repo | Quyền GitHub App tại bước 1 và tài khoản Git đang nối |
| Asset too large, có node_modules trong log | Build có dùng code mới và assets.directory = ./dist không? |
| Worker name mismatch | Worker trên dashboard có tên 20-10-tctt67c không? |
| Database không tồn tại / không có quyền | Đúng tài khoản Cloudflare và Database ID đã điền không? |
| `/api/garden` trả HTML hoặc 404 | Đã deploy Worker mới hay chỉ tải file tĩnh? |
| API trả 503, log no such table | Bảng garden_state có trong đúng D1 đang bind chưa? |
| Nhập tên trên một link, link khác không thấy | Netlify và Cloudflare dùng hai kho riêng; cả lớp cần dùng cùng link |

## 10. Cấu trúc mới

```text
public/                     HTML, CSS, JS, SVG, fonts, nhac
cloudflare/worker.mjs        Entry point Worker và định tuyến API
cloudflare/d1-store.mjs      Đọc/ghi D1 có kiểm tra revision
cloudflare/schema.sql        Tạo bảng trống, không chứa tên mẫu
server/garden-handler.mjs    Kiểm tra tên và logic vườn dùng chung
server/local.mjs             Server Node dự phòng
netlify/                    Backend Netlify cũ vẫn tương thích
tests/                      Tests dữ liệu và deploy
wrangler.jsonc              Cấu hình bản chính, D1 thật
wrangler.preview.jsonc      Cấu hình bản thử, D1 riêng
build.mjs                   Tạo dist chỉ từ frontend đã cho phép
```

File nhạc và hình hoa không bị đổi nội dung trong lượt sắp xếp cấu trúc này. Netlify Blobs cũ giữ nguyên, không chuyển tên cũ sang D1. Không có lệnh xóa database hoặc xóa người tham gia trong quy trình deploy.

Nguồn chính thức: [Workers Builds](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/), [Workers static assets](https://developers.cloudflare.com/workers/static-assets/binding/), [D1 sessions](https://developers.cloudflare.com/d1/worker-api/d1-database/).

## Kết quả kiểm tra cấu trúc mới

- 9/9 tests qua, gồm build giữ nguyên file frontend, không đưa backend/config vào dist, dữ liệu đồng thời và cấu hình D1 riêng cho hai môi trường.
- Đối chiếu SHA-256 của 18 file frontend trước/sau chuyển vào public: nội dung không đổi.
- npm run check:cloudflare đóng gói thành công, đọc assets từ dist, có binding class-garden; không còn cảnh báo nhiều môi trường trong một file.
- npm run dev tự build và khởi tạo D1 local; API ban đầu trả revision 0 và members rỗng. Các URL package.json, server/garden-handler.mjs, wrangler.jsonc và .env trả 404 trên Worker local.
- Đã mở hành trình cửa → nhập tên → thiệp → vườn trên local. Hai tab thử độc lập dùng cùng D1 local; tên thử không gửi lên production. Xem kết quả API và trạng thái tab trước khi báo hoàn tất.
- Không thay schema, không chạy SQL trên database thật, không đổi quyền GitHub/Cloudflare và không deploy thủ công trong lượt sắp xếp cấu trúc. Chưa xác minh production.
