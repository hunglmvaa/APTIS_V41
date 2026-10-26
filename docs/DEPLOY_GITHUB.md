# Triển khai APTIS Practice Hub v4.1 lên GitHub Pages

Ứng dụng không cần chạy `npm`, Docker, PHP hay database.

1. **Sao lưu** repository GitHub hiện tại và mở app cũ để xuất bản sao lưu tiến độ nếu có.
2. Giải nén `APTIS_Practice_Hub_V4_1_B2_FullSource.zip`.
3. Mở thư mục bên trong `aptis-practice-hub-main/` và tải **các tệp/thư mục bên trong** lên root repository cũ, **không đặt nguyên một thư mục lồng mới** (trừ khi cấu hình Pages trỏ đúng thư mục đó).
4. Đảm bảo root chứa `index.html`, `app.js`, `teacher-features.js`, `submission.js`, `styles.css`, `sw.js`, `manifest.json`, thư mục `data/`, `assets/`, `docs/`.
5. GitHub → repository → **Settings → Pages** → **Build and deployment → Deploy from a branch** → branch `main`, folder `/(root)`, Save (nếu chưa bật).
6. Mở URL GitHub Pages của repository **đang dùng**, làm mới cứng bằng `Ctrl+F5`, kiểm tra thanh menu có **Bài thầy giao** và **Tạo bài tập**.
7. Kiểm tra ít nhất: Speaking Part 4 đủ 3 câu hỏi; Writing Part 3 ba ô; Reading Câu16-17; tạo một bài và xuất backup; cấp quyền mic và lưu âm thanh.

> CẢNH BÁO: ZIP này là mã nguồn sửa trên bản người dùng gửi; không tự thay đổi gì trên GitHub và không tự lấy tiến độ đã lưu ở thiết bị cũ. Cần commit/push bằng tài khoản có quyền vào đúng repository.

### Khi cập nhật bài thầy giao mới

- Cách nhanh: **Tạo bài tập**, lưu ở máy và làm ngay.
- Cách xuất bản: **Dữ liệu & Sao lưu → Xuất extra-packs.js cho GitHub** và tải tệp ra để thay `data/extra-packs.js` trong repository; giữ nguyên `data/builtin.js` và `data/teacher-homework.js`.
- Nội dung bài (không phải bài viết cá nhân) được đăng công khai nếu repository public; kiểm tra thông tin riêng tư trước khi commit.
- Bài lưu ở nhiều trình duyệt có thể không đồng nhất; dùng sao lưu JSON để gộp.

### Kiểm tra sau khi tải lên

- Nếu trang vẫn là V3: chờ GitHub Pages deploy và thử `Ctrl+F5`, kiểm tra `sw.js` / cache dịch vụ.
- Nếu ảnh/audio không hiện: kiểm tra đường dẫn tương đối và chữ hoa/chữ thường trong tên file.
- Nếu Listening Part 2 không nhúng được: dùng **Mở trang nguồn**, vì trang bên ngoài có thể chặn nhúng iframe.
- Nếu micro không bật: dùng HTTPS/localhost, trình duyệt Chrome/Edge được cấp quyền; trên Safari định dạng ghi âm có thể khác WebM.


## Cập nhật v4.1: xuất bài và ghi âm

- Dùng gói **GitHubPatch V4.1** nếu repository hiện tại đúng là v4 vừa nhận; sao lưu trước.
- File mới bắt buộc: `submission.js`. Nếu thiếu, phần tải ZIP không chạy.
- `sw.js` đã nâng version cache; sau khi upload hãy kiểm tra thông báo **v4.1** trên đầu trang và dùng `Ctrl + F5`.
- Sau khi cập nhật: mở **Speaking**, nhập ghi chú, ghi âm (cần quyền mic trên HTTPS), dừng và nghe lại. Mở **Xuất bài nộp**, điền họ tên/lớp, chọn bài và tải ZIP. Kiểm tra ZIP có `BAI_LAM.txt` và `GHI_AM.webm/m4a/...`.
- Dữ liệu âm thanh lưu cục bộ trong trình duyệt. Không push nội dung âm thanh/bài viết cá nhân lên repository public; hãy dùng chức năng ZIP riêng.
- App không tự gửi bài cho giáo viên và không tự tạo tệp MP3 từ WebM.
