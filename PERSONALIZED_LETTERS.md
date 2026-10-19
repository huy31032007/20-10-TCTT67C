# 30 lời chúc cá nhân hóa — 19/10/2026

- Dùng 30 bản người dùng đã chỉnh, chỉ sửa nhẹ lỗi gõ/dấu câu. Ký “Từ các bạn nam TCTT67C”. Danh sách đọc được: `NOI_DUNG_THIEP.md`; nguồn chạy: `server/letter-catalog.mjs`.
- Mỗi lần bấm mở thư, `/api/letter` chọn ngẫu nhiên độc lập trong cả 30 bản. Có thể trùng giữa các bạn hoặc các lần mở; không cần xác nhận mở, không giữ chỗ, không đếm vòng, không gửi tên/mã người xem để phát thư.
- API thư không đọc/ghi D1, Blobs hoặc dữ liệu vườn. Dữ liệu phân phối thư cũ được để nguyên và không còn sử dụng; không có migration/reset. Client cũ đang cache có thể xác nhận ID 1–60 mà không bị lỗi hoặc tiêu thụ thư.
- Tên trong lời chúc và phong bì dùng hai từ cuối, viết hoa đầu từ: “Nguyễn Thu Phương” → “Thu Phương”; “Lương đan lê” → “Đan Lê”. Một từ giữ một từ. Tên đầy đủ vẫn dùng cho hoa, vườn và vé.
- Logic tên nằm tại `src/shared/personalization.mjs`, build ra `public/personalization.js`. Frontend điền bằng `textContent`, không đưa tên vào HTML thô.
- Garden/reaction API, schema, 43 ảnh, nhạc và vé Coming soon được giữ. Vườn/cảm xúc vẫn cần backend dùng chung; việc chọn lời chúc không cần database.

Kiểm tra thực tế: 37/37 tests pass; build và Cloudflare dry-run pass, chưa deploy. Gửi 90 yêu cầu thư đồng thời tới API local: 90 phản hồi 200, ID đều 1–30, có lặp; hash dữ liệu vườn trước/sau không đổi. Trình duyệt: nhập “Nguyễn Thu Phương”, phong bì/lời chúc hiển thị “Thu Phương”; mở thư ba lần nhận ba nội dung khác nhau trong lượt QA này (không có cam kết chống trùng). Nhập “Lương đan lê”: thư hiển thị “Đan Lê”, góp hoa vào vườn QA riêng vẫn mang tên đầy đủ “Lương đan lê”. Console không có lỗi/cảnh báo. Hai ví dụ tên và toàn bộ placeholder trong 30 thư cũng được kiểm tra tự động.

Preview local: http://127.0.0.1:2028/. QA cục bộ riêng tại cổng 2029; không gửi tên thử lên production. Chưa commit/push/deploy.
