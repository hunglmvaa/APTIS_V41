# APTIS Practice Hub v4.1 - Xuất bài nộp cho giáo viên

Ngày 26/10/2026

## Đã thêm

- Tab **Xuất bài nộp**: điền họ tên/lớp, tự động liệt kê những bài Writing/Speaking đã có văn bản hoặc ghi âm, chọn nhiều bài để xuất một ZIP.
- Nút xuất ZIP ngay trên từng bài Writing và Speaking.
- File ZIP bao gồm `HUONG_DAN.txt`, `TONG_HOP.txt`, thư mục cho từng bài với `BAI_LAM.txt` (UTF-8 BOM) và `BAI_LAM.html`, file `GHI_AM.<định dạng>` khi có bản ghi.
- Thêm ô để người học tự nhập nội dung bài Speaking (không phải chức năng speech-to-text).
- Ghi âm lưu riêng trong IndexedDB theo mã bài; mở lại đúng bài trên cùng thiết bị có thể nghe lại. Có thể gắn tệp âm thanh MP3/WAV/M4A/OGG/WebM tải từ V4.
- Module `submission.js` tự tạo ZIP32 không nén, không cần CDN hoặc thư viện bổ sung; gói ZIP được kiểm tra bằng Python `zipfile`.
- Cập nhật service worker cache từ v4 sang v4.1 để giảm nguy cơ giữ JS cũ.

## Giữ nguyên

- `data/builtin.js`, `data/teacher-homework.js`, các bài mẫu, ngân hàng đề cũ.
- Dữ liệu bài tự tạo và bài viết lưu localStorage từ V4, không di chuyển key hoặc ghi đè.

## Giới hạn / kiểm chứng

- Không tự gửi email, không truy cập Google Classroom/Zalo; người dùng tự tải gói ZIP và nộp.
- Không tự chuyển âm thanh sang MP3. Bản ghi dùng định dạng do trình duyệt hỗ trợ, phổ biến WebM/Opus hoặc MP4/M4A.
- Âm thanh lưu riêng trong IndexedDB, không có trong file sao lưu JSON cũ. V4 không lưu bền audio, nên các bản ghi đã mất trước khi cập nhật không khôi phục được; hãy đính kèm file đã tải xuống nếu còn.
- Tệp không tự đồng bộ qua GitHub Pages/giữa trình duyệt. Trình duyệt có thể xóa dữ liệu trang khi thiếu dung lượng, nên luôn giữ file ZIP và audio ở nơi khác.
- Đã kiểm tra cú pháp JS, xuất nhiều gói ZIP gồm văn bản + audio giả lập và đọc được qua Python zipfile. Test giao diện bằng Playwright/Chromium bị môi trường chặn truy cập, nên chưa tuyên bố test ghi âm thực tế/trực quan đạt.
