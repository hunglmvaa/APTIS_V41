# Ghi nhận phiên bản - APTIS Practice Hub v4 (26/10/2026)

## Những gì được giữ nguyên

- Nguồn `data/builtin.js` giữ nguyên toàn bộ nội dung, không đụng câu hỏi/đáp án.
- Các bài luyện gốc Listening Part 2 online, Reading Text Cohesion/Opinion Matching, Speaking Part 1/4, Writing Part 1-4.
- Khóa localStorage `aptis_progress_v3`, `aptis_drafts_v3`, `aptis_custom_packs` vẫn dùng lại để không tự làm mất dữ liệu cũ.

## Những gì sửa và bổ sung

1. Thêm module tạo và quản lý bài thầy giao, lưu bài riêng `aptis_assignments_v4`.
2. Thêm nguồn từ tài liệu học: bài gộp 6 đề; BTVN Speaking buổi 3; Writing Part 2/3/4; Reading Câu 16–17. Những câu mới biên soạn hoặc KEY thiếu nguồn đều được gắn nhãn.
3. Speaking Part 4 hiện đủ 3 câu hỏi, timer, ghi chú, nhiều biến thể câu 1, tải file ghi âm.
4. Writing Part 3 có ba ô trả lời, Writing Part 4 có mục tiêu 40–50 từ và 120–150 từ.
5. Có Reading/Listening multi-choice với KEY chưa xác minh có thể bỏ trống; thêm Grammar & Vocabulary generated practice.
6. Sửa lỗi `Number('')===0` trong Heading Matching làm đáp án để trống bị tính đúng.
7. Sửa việc nhúng văn bản vào `onclick` cho TTS; lọc URL nghiêm ngặt hơn; cải thiện vòng đời ghi âm khi chuyển trang.
8. Thêm xuất bài làm TXT, xuất/gộp sao lưu JSON, xuất extra-packs.js để publish dữ liệu cá nhân (không gồm nháp/tiến độ).
9. Cập nhật service worker cache sang V4 và ưu tiên tải bản mã mới khi có mạng.

## Kiểm thử đã thực hiện

- Kiểm tra cú pháp với `node --check` tất cả JS chính.
- Kiểm tra logic với Node VM: tạo/sửa/xóa bài; đọc 3 câu Speaking; ghi nhận Writing chat; quiz không chấm đáp án không xác minh; xuất tệp JSON/JS; đọc lại dữ liệu tiến độ.
- Chromium trên giao diện test nội tuyến: Desktop 1200px, mobile 390px; chuyển tab, chọn đề, dùng timer, ẩn/hiện bài mẫu, tạo/sửa bài thực tế, nhập 3 ô Writing, chấm Reading, không báo lỗi JavaScript; không tràn ngang ở kích thước thử.
- Chưa thể kiểm tra micro bằng thiết bị thật, chất lượng giọng TTS của hệ điều hành, hoạt động offline trên GitHub Pages đang chạy, khả năng iframe của nguồn Listening bên ngoài và độ chính xác toàn bộ đáp án so với audio gốc.

## Ranh giới sản phẩm

- Các số liệu phần nghe là nguồn ngoài; không tự đóng gói audio.
- Không phải nền tảng chấm điểm Aptis B2 chính thức.
- Không có đồng bộ tài khoản/đăng nhập; sử dụng backup khi đổi thiết bị.
