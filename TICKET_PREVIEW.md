# Vé Coming soon sau vườn hoa

Hành trình: cửa → tên → sổ ảnh → thư → vườn hoa → vé Coming soon.

- Nút mũi tên cuối vườn mở vé theo thao tác của người dùng, nằm trên nút âm thanh giấy để tránh chồng nhau. Không tự chuyển khỏi vườn.
- Tích hợp mẫu Lunar Boarding Pass từ tệp người dùng cung cấp vào `src/components/ui/lunar-boarding-pass.tsx`; dùng React/esbuild sẵn có, không thêm dependency hay đổi framework. Các hướng dẫn dựng shadcn/Tailwind trong tài liệu mẫu không cần cho website hiện tại.
- `src/ticket/TicketApp.jsx` chỉ mount ở màn vé. Giữ mặt trăng halftone, SVG clarinet/rocket, lật 2 mặt, xé/gắn cuống và đóng dấu; thay nội dung bằng Coming soon/TCTT67C và tên người xem. Không bịa ngày, giờ hoặc địa điểm sự kiện.
- Chỉ hiển thị placeholder; không đặt vé, đăng ký hay gửi thêm dữ liệu. Quay lại vườn chỉ navigate, không POST thêm hoa. Backend/schema, danh sách 60 thư, ảnh, âm nhạc và album được giữ nguyên.
- Nền pastel hòa với web; mặt trước xanh trầm, mặt sau giấy kem. Mobile có tỉ lệ vé cao hơn và giản lược các trường chữ nhỏ.
- Tối đa 24 lần vẽ mặt trăng/giây; dừng khi ở mặt sau, ẩn tab, ra ngoài viewport, reduced motion hoặc unmount. Bấm liên tiếp không lật chồng; timer, observer, RAF và listener được dọn khi rời vé. Pointer cancel không xé cuống.

Các file khác chỉnh: `public/index.html`, `public/script.js` (thêm màn ticket), `public/ticket.css` (mới), `src/album/index.jsx` (mount thêm island), `public/album.js` (bundle sinh), `build.mjs` và allowlist CSS của `server/local.mjs`.

Kiểm chứng thực tế: 32/32 tests pass, không skipped; build và Cloudflare dry-run pass (không deploy). Kiểm tra front/back tại 320×740, 360×800, 390×844, 768×1024, 1024×768 và 1280×900: không tràn ngang; Coming soon trong khung; các nút trang vé ≥44 px và nhận bấm. Đã thử cả hành trình trên dữ liệu QA cục bộ riêng; bấm trực tiếp vé và nút đổi mặt; xé bằng nút, gắn lại bằng Enter; bật/tắt Photograph; quay về vườn bằng Enter/Escape và mở lại; Escape ở vườn giữ nguyên màn vườn. Vườn vẫn 1 người, revision 3 trước/sau lần quay lại; khi rời vé không còn component/canvas. Console QA không lỗi/cảnh báo. Không ghi dữ liệu thử production.

Giới hạn: chưa thử kéo cuống bằng chuột/ngón tay thật, thiết bị thật, bật reduced motion ở hệ điều hành hoặc profile FPS/CPU. Chưa commit/push/deploy.

Preview dữ liệu QA riêng: http://127.0.0.1:2028/. Ảnh và số đo tại `/tmp/tctt67c-ticket-qa/`.
