# Gửi cậu · 20/10

Web tặng các bạn nữ trong lớp, với nội dung ở mức tình bạn.

## Mở web

Trong thư mục dự án, chạy:

```sh
npm ci
npm run dev
```

Mở URL local mà Wrangler in ra. Lệnh tự build giao diện, tạo bảng D1 local rồi chạy Cloudflare Worker giả lập. Dữ liệu thử nằm trong `.wrangler/`, không gửi lên database thật. Để chạy server Node cũ, dùng `npm start` tại http://127.0.0.1:2010; dữ liệu riêng của server này nằm trong `data/`.

Đăng lên Netlify theo [NETLIFY.md](NETLIFY.md), hoặc Cloudflare Worker + D1 theo [CLOUDFLARE.md](CLOUDFLARE.md). Dự án có cả giao diện và chức năng lưu tên dùng chung; cần triển khai API cùng website. Netlify và Cloudflare dùng hai kho dữ liệu riêng.

## Cấu trúc mã nguồn

```text
public/                    Giao diện, hoa SVG, nhạc và font
cloudflare/                Worker API, D1 store và schema
server/                    Logic dùng chung và server Node local
netlify/                   Backend Netlify tương thích
tests/                    Kiểm tra dữ liệu, API và build
wrangler.jsonc             Bản chính → class-garden
wrangler.preview.jsonc     Bản thử → class-garden-preview
build.mjs                  Chép tài nguyên từ public/ sang dist/
```

Làm theo [CLOUDFLARE.md](CLOUDFLARE.md) để đưa lên Cloudflare từ đầu. Lệnh `npm run deploy` tự build rồi deploy bản chính khi đã đăng nhập Cloudflare; không chạy lệnh này khi chỉ muốn thử local. `npm run check:cloudflare` chỉ kiểm tra đóng gói, không deploy.

## Hành trình

1. Hai cánh cửa phủ kín toàn bộ trang, không có chữ. Chỉ có ổ khóa ở giữa. Bấm ổ khóa hoặc Enter để mở cửa và bật Photograph.
2. Landing page có vùng hoa ban đầu hoàn toàn trống, bàn phím hoa ở phía dưới. Gõ bằng bàn phím thật hoặc chạm các phím hoa.
3. Mỗi chữ cái thêm một nhành có hoa chính, hoa nhỏ và lá. Hoa bay từ phím lên vùng kết hoa, cánh hoa tản nhẹ. Xóa chữ sẽ bớt nhành.
4. Nhấn OK hoặc Enter mới gói giấy và thắt nơ, rồi chuyển thẳng đến phong bì thiệp 20/10.
5. Bấm mở phong bì để xem thiệp 20/10. Có thể tải thiệp PNG hoặc làm lại.
6. Ở cuối thiệp, bấm **Hoàn thành · Vào vườn lớp**. Lúc này tên mới được gửi lên vườn chung. Vườn là cảnh minh họa toàn màn hình, mặc định không có chữ: mỗi bạn đã hoàn thành đóng góp một cụm hoa mọc trực tiếp trên cỏ, không giấy bọc hay nơ. Các cụm xếp sát, so le thành luống và đung đưa nhẹ theo gió. Khi chưa có thành viên, cảnh chỉ có cây, cỏ, hàng rào và lối đi; không có hoa mẫu hoặc hoa trang trí. Tên chỉ hiện khi hover, chạm hoặc focus vào cụm hoa; Escape hay bấm ra ngoài để ẩn. Không có số người, tiêu đề hay bảng tìm kiếm. Mỗi người đi hết phần của mình rồi thấy vườn; không phải chờ cả lớp tham gia mới xem được.
7. Vườn tự cập nhật mỗi 5 giây khi đang mở. Hai nút biểu tượng nhỏ cho phép quay lại thiệp hoặc bật/tắt nhạc. Có thể cuộn khi nhiều cụm hoa; bố cục tự điều chỉnh theo kích thước màn hình. Nếu mất kết nối, xuất hiện nút biểu tượng thử lại; thông báo chi tiết dành cho trình đọc màn hình.

Photograph dùng đúng file từ `thu/nhac`, âm lượng 16%, tăng dần trong 3,2 giây; có nút bật/tắt. Tên chỉ được gửi khi bấm hoàn thành ở cuối thiệp; tên và thời điểm tham gia được lưu để tạo vườn chung; tên hiển thị khi tương tác với cụm hoa tương ứng. Tên trùng nhau (không phân biệt hoa/thường, chuẩn hóa khoảng trắng) chỉ tạo một thành viên; nên nhập họ tên đầy đủ nếu có hai bạn cùng tên gọi. Hệ thống Giảm chuyển động sẽ tắt các hiệu ứng bay, bung nở và đung đưa.

## Bó hoa riêng cho từng tên

Web tự tạo hoa từ tên đầy đủ bằng mã băm có tính lặp lại: cùng tên sẽ cho cùng kiểu hoa, tên khác đổi cách phối loại hoa, màu, vị trí, giấy gói và nơ. Dấu tiếng Việt được giữ khi tính kiểu hoa. Chữ đầu các tên giống nhau có thể bắt đầu bằng nhành tương tự, những nhành sau và phần giấy gói được tạo riêng theo tên.

Nếu muốn chỉ định hoa cho một bạn, chỉnh `public/flower-profiles.js`. Ví dụ:

```js
window.FLOWER_PROFILES = {
  'Nguyễn Minh Anh': { flower: 'tulip', color: '#c1a5df', wrapping: '#d8c6ea' },
  'Trần Ngọc An': { flower: 'daisy', color: '#f0cb70', wrapping: '#c8ddcc' },
};
```

Loại hoa hỗ trợ: `mix`, `daisy`, `tulip`, `ranunculus`, `cosmos`, `rose`, `sunflower`, `lily`, `hydrangea`, `carnation`, `orchid`, `lavender`, `peony`, `anemone`. Không phân biệt tên hoa/thường; nên nhập tên đầy đủ để phân biệt các bạn có cùng tên gọi. Danh sách để trống vẫn chạy tự động.

## Dùng bàn phím

- Gõ tên trực tiếp; trên máy tính ô tên tự nhận focus. Nếu đã bấm ra ngoài, chỉ cần gõ chữ để tiếp tục nhập. Các phím hoa sáng theo phím thật.
- Hỗ trợ dấu tiếng Việt, dấu cách, Backspace và các thao tác chọn/sửa/dán văn bản thông thường trong ô tên.
- Enter: đi tiếp từ ô tên, từ tiêu đề bước hiện tại, hoặc mở thư khi ở bước phong bì.
- Esc: quay lại bước trước.
- Tab / Shift+Tab: di chuyển qua các nút; Enter / Space kích hoạt nút đang chọn theo hành vi chuẩn của trình duyệt.

## Chỉnh nội dung

- Lời chúc chung: phần `letter-body` và `letter-sign` trong `public/index.html`.
- Màu chủ đạo: các biến trong `:root` ở `public/styles.css`.
- Hoa riêng theo người: `public/flower-profiles.js`.
- Cửa toàn màn hình và landing page: `public/experience.css`.
- Hình vẽ và mật độ hoa: `public/bouquet.js`. Minh họa SVG tự vẽ, không tải ảnh hoa bên ngoài khi chạy web.
- Nhạc: `public/nhac/photograph.mp3`; âm lượng và thời gian vào nhạc trong `public/script.js`.
- Bộ font: Be Vietnam Pro và Itim, phân phối theo SIL Open Font License; bản giấy phép đi kèm trong `public/fonts/`.

Phong bì lấy cảm hứng từ template `thu` của bạn. Bản này dùng minh họa SVG vẽ bằng code và nội dung dành cho bạn bè trong lớp.

Bố cục hoa tham khảo: [Delicate Daisy — Tulip bouquet](https://delicatedaisy.co.uk/product/tulip-bouquet/) và [Beautiful Blossoms — Beautiful](https://beautifulblossomsph.com/product/beautiful/), với hoa cúc, tulip, hoa nhỏ, lá bạch đàn và giấy gói nhiều lớp. Không sao chép ảnh sản phẩm vào dự án.

## Vườn chung và kiểm tra

- Trên Cloudflare, Worker `/api/garden` đọc/ghi D1 dùng chung. Trên Netlify, Function cùng đường dẫn dùng Netlify Blobs. Trình duyệt không chứa khóa quản trị.
- Hoa có cách phối riêng theo tên; mọi người xem cùng danh sách đã lưu. Khi nhiều bạn tham gia cùng lúc, cập nhật có kiểm tra phiên bản và thử lại để tránh mất tên.
- Khi mất mạng, giao diện có biểu tượng thử lại và thông báo cho trình đọc màn hình; không báo tham gia thành công nếu máy chủ chưa lưu.
- `npm test`: kiểm tra lưu/đọc giữa nhiều khách, tên trùng, cập nhật đồng thời, dữ liệu không hợp lệ và lưu qua lần khởi động lại.
- `npm run build`: tạo `dist/` chỉ chứa tài nguyên công khai. Netlify triển khai thêm Function từ `netlify/functions/` theo cấu hình có sẵn.

## Kết quả kiểm tra 18/10/2026

Xem [QA_REPORT.md](QA_REPORT.md) cho phạm vi đã kiểm thử, sáu viewport thực tế, ảnh preview và các giới hạn còn lại. Code sửa tối thiểu để các cụm hoa có khoảng riêng, tên dài được chặn rõ ràng, nhạc có thể thử lại sau lỗi tải và âm lượng không vượt giới hạn của trình duyệt. Kết quả ở đây là kiểm thử local; xem GITHUB_SYNC.md để biết repository và bước đưa lên hosting.

Vườn chung cần mở qua máy chủ HTTP (`npm start`), không mở trực tiếp bằng đường dẫn `file://`. Dữ liệu thử trong `qa/` chỉ là bằng chứng kiểm tra; không được đưa vào kho người tham gia thật hoặc public build.

## Bổ sung hoa và tương tác

Xem [FLOWER_GARDEN_NOTES.md](FLOWER_GARDEN_NOTES.md) để so sánh với ảnh tham chiếu, xem thử 30 bó, các nguồn tham khảo và giải thích đồng bộ/hosting. Hoa được vẽ SVG tại chỗ; không lấy ảnh ngoài lúc chạy. Có 13 dáng hoa, 12 nhóm phối và 8 bảng màu; cùng tên tạo cùng bó ở màn nhập tên và vườn. Mỗi cuống gom về gốc hẹp, không bọc giấy/nơ trong vườn.

Bình thường hoa đung đưa nhẹ; hover trên máy có chuột, Enter/Space hoặc chạm sẽ rung rõ hơn. Điểm xoay ở gốc. `prefers-reduced-motion` tắt các animation này. Những kết quả kiểm tra ở tài liệu mới bổ sung cho lượt QA trước; chưa deploy bản thay đổi này.

## Xóa hoa thử (chủ website)

Sau khi đặt Secret runtime `GARDEN_ADMIN_TOKEN` trên Cloudflare, mở `/admin.html`, nhập mật khẩu và xóa từng hoa có xác nhận. Người không có mật khẩu bị backend từ chối. Hướng dẫn đầy đủ tại mục Quản trị trong [CLOUDFLARE.md](CLOUDFLARE.md). Mật khẩu không nằm trong code; API Netlify cũ chưa có chức năng quản trị.
