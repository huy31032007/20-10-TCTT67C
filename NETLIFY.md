# Đưa vườn hoa lớp lên Netlify

1. Đưa **toàn bộ dự án** lên GitHub, bao gồm `package.json`, `package-lock.json`, `netlify.toml`, `netlify/functions/` và `server/garden-handler.mjs`. Không đưa `node_modules/`, `data/` hoặc `.env` lên Git.
2. Trong Netlify, chọn thêm dự án từ Git rồi chọn kho mã này. Nếu kho chỉ chứa dự án, để trống Base directory; nếu đặt trong thư mục con, chọn thư mục dự án làm Base directory.
3. Netlify đọc cấu hình có sẵn: build `npm run build`, publish `dist`, functions `netlify/functions`, Node 24. Chạy lần triển khai đầu tiên.
4. Chỉ trên một **site thử nghiệm riêng** hoặc máy chủ cục bộ, mở hai trình duyệt/thiết bị rồi nhập tên thử và hoàn thành thiệp. Hai bên phải thấy cùng các cụm hoa không bọc giấy, mặc định không hiện chữ, tên chỉ hiện khi hover/chạm/focus vào cụm hoa. Không gửi tên thử vào site production; các bản preview của cùng site cũng có thể dùng kho chung.
5. Gửi link trang chủ cho lớp. Người nhận sẽ thấy cửa đóng, tự nhập tên, mở thiệp rồi vào vườn chung.

Không chỉ kéo thả riêng `dist/` lên trang triển khai tĩnh: vườn chung cần Netlify Function được triển khai cùng website. Không cần nhập khóa cơ sở dữ liệu vào trình duyệt; Function dùng kho Blobs gắn với site Netlify.

Vườn trên Netlify bắt đầu trống. Dữ liệu kiểm thử cục bộ không được đưa lên. Nếu thử tên trên bản thật, tên thử cũng sẽ xuất hiện trong vườn thật; nên kiểm tra bằng máy chủ cục bộ hoặc một site Netlify thử nghiệm riêng. Các bản deploy của cùng site có thể dùng kho chung, nên không gửi tên giả từ Deploy Preview vào dữ liệu thật.

Dự án giới hạn 300 thành viên, mỗi tên tối đa 30 ký tự; hãy nhập họ tên để phân biệt các bạn cùng tên. Mọi người có link đều xem được vườn. Tên được lưu để tạo kiểu cụm hoa riêng và vẫn có trong dữ liệu máy chủ, và chỉ hiện khi người xem hover/chạm/focus vào hoa. Chưa có trang quản trị hoặc nút xóa thành viên.

Tài liệu: [Netlify Functions](https://docs.netlify.com/build/functions/get-started/) · [Netlify Blobs](https://docs.netlify.com/build/data-and-storage/netlify-blobs/).

## Màn hình không có chữ và huy hiệu hosting

Bản production được kiểm tra ngày 18/10/2026 đang có huy hiệu “Powered by Netlify” do hosting chèn. Để đáp ứng màn cửa/vườn không chữ, chủ dự án có thể vào **Project configuration → General → Powered by Netlify badge**, tắt và lưu. Theo [hướng dẫn chính thức](https://docs.netlify.com/manage/projects/powered-by-netlify-badge/), thay đổi này không cần deploy lại. Lượt sửa code này chưa thay đổi cài đặt trên Netlify.

Repository đã xác minh: `https://github.com/huy31032007/20-10-TCTT67C`. Code ở gốc repository; Base directory để trống khi nối Netlify. Chưa xác minh site production hiện tại đã liên kết với repository này. Không coi việc build local thành công là bằng chứng đã deploy.
