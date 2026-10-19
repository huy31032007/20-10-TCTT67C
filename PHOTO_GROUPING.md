# Gom ảnh nhỏ trên cùng mặt giấy — 19/10/2026

- Xếp ảnh 33–34 chung mặt trái, ảnh 35 ở mặt phải như ảnh người dùng chỉ. Áp dụng tương tự với 28–29/30 và 41–42/43. Giữ trình tự các ảnh và các nhóm khác.
- Sổ còn 21 lượt xem, đủ 43 ảnh, mỗi ảnh xuất hiện đúng một lần. Số thứ tự ảnh không đổi nên cảm xúc dùng chung vẫn gắn đúng ảnh cũ.
- Chỉ sửa bố trí trong `src/album/album-layout.mjs`, thêm quy tắc `.album-layout-compact` ở `public/album.css`, cập nhật kiểm tra nhóm ảnh. `public/album.js` là bundle được build lại. Không sửa logic lật giấy, lightbox, trang trí, nhạc hay backend trong phần gom ảnh này.
- Desktop: hai ảnh xếp dọc trên cùng một mặt giấy. Mobile: ba ảnh xếp một cột, giữ tỉ lệ và khung giấy cùng chiều cao với các trang khác. Không crop ảnh, vẫn bấm xem lớn được.

QA: 37/37 tests pass. Trình duyệt đã lật tới nhóm 33–35, mở ảnh 33 trong lightbox và thấy đủ bốn nút cảm xúc. Đo nhóm ảnh này ở 320×740, 360×800, 390×844, 768×1024, 1024×768 và 1280×900: không tràn ngang, ảnh nằm trong giấy và không chạm hai nút mũi tên. Có screenshot desktop/mobile. Không phải kiểm tra lại toàn bộ 21 trang tại mọi viewport; chưa thử drag trên thiết bị thật hoặc profile FPS.

Ảnh gốc giữ nguyên byte. Bằng chứng QA tại `/tmp/tctt67c-personal-letters-qa/` (thư mục tạm có thể bị hệ thống dọn). Preview http://127.0.0.1:2028/ sau khi tải lại trang. Chưa commit/push/deploy.
