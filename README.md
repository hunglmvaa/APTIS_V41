# APTIS Practice Hub v4.2 — B2 | Song ngữ và bài thầy giao

Ứng dụng HTML/CSS/JavaScript không cần backend, triển khai trực tiếp bằng GitHub Pages. Kế thừa phiên bản v4.1 đã dùng tại repository `hunglmvaa/APTIS_V41`.

**Hướng dẫn V4.2:** [Dịch tiếng Việt, gợi ý bài, tạo/import bài và cập nhật GitHub](docs/HUONG_DAN_DICH_V4_2.md).

## Điểm mới V4.2

- **Dịch từng đoạn/câu hỏi/phương án/bài mẫu:** ưu tiên bản Việt sẵn có; cho phép bật/tắt hiển thị và dịch phần thiếu qua MyMemory theo sự đồng ý của người học.
- **Dịch toàn bài** cho các đoạn nằm trong giới hạn ký tự; tránh phụ thuộc vào bản dịch khi luyện thi thử.
- **Gợi ý làm bài theo dạng:** Speaking (3 câu Part 4), Writing (chat/email), Reading (matching, text cohesion, trắc nghiệm), Listening (nghe và từ khóa).
- **Tạo/sửa bài song ngữ:** ô tiếng Anh, ô tiếng Việt, nút dịch và gợi ý riêng của giáo viên; dữ liệu được lưu và xuất cùng bài.
- **Import JSON** có thể tự dịch một lượng giới hạn khi có Internet và đồng ý gửi dữ liệu; bài mới luôn có hướng dẫn theo dạng bài. Không làm sai đáp án khi dịch.
- **Sao lưu JSON** chứa thêm cache dịch để chuyển sang thiết bị khác; phần ghi âm vẫn xuất riêng thành ZIP nộp thầy.

## Chức năng V4.1 vẫn được giữ

- Giữ nguyên bộ câu hỏi gốc: Listening liên kết nguồn ngoài; 13 Reading Text Cohesion, 6 Reading Opinion Matching; 23 Speaking Part 1, 17 Speaking Part 4; 40 bài Writing.
- Bài thầy giao và công cụ tạo bài tập mới, các nhóm kỹ năng.
- Speaking có chuẩn bị 60 giây, nói 120 giây, ghi âm, nghe lại và lưu trong IndexedDB khi trình duyệt cho phép.
- Writing có đếm từ, lưu nháp. Reading/Listening chỉ chấm đáp án đã xác minh.
- **Xuất bài nộp cho giáo viên (.zip)**: TXT, HTML, ghi âm nếu có và tổng hợp bài đã chọn.
- Sao lưu/nhập dữ liệu, xuất `extra-packs.js` cho Github.

## Cách chạy và triển khai

1. Dùng ZIP mã nguồn đầy đủ hoặc **bản vá GitHub V4.2** nếu repository đã dùng V4.1.
2. Tải **các tệp trong ZIP** vào thư mục gốc của repository (`index.html` nằm ngay gốc).
3. GitHub Pages: **Settings → Pages → main → /(root)**; nếu đã thiết lập trước, không cần đổi.
4. Kiểm tra tab **Actions**; mở trang Pages để thử dịch và làm bài.
5. Sao lưu bài làm trong app trước khi sửa hoặc xóa dữ liệu website.

## Lưu ý về dịch máy và tài liệu gốc

- `data/builtin.js` và `data/teacher-homework.js` **giữ nguyên nội dung và đáp án gốc của V4.1**. `data/teacher-translations.js` tách riêng bản dịch bổ sung cho học tập.
- Bản dịch máy có thể sai và có hạn mức miễn phí. MyMemory nhận văn bản cần dịch qua Internet sau khi người dùng đồng ý. Không gửi tài liệu bí mật hoặc bài cá nhân nhạy cảm.
- Dịch máy không đảm bảo B2, không tự đánh giá Speaking/Writing theo CEFR; hãy sử dụng gợi ý để học và đối chiếu đề thầy.
- Không nhập được trực tiếp file DOCX/PDF hoặc URL Google Docs thành bài tập. Dán nội dung vào **Tạo bài tập** hoặc dùng pack JSON.
- Không đồng bộ tiến độ/audio giữa thiết bị. Sao lưu JSON không chứa ghi âm. Khi nộp Speaking cần tải ZIP có bản ghi âm.

**Changelog:** [V4.2](docs/CHANGELOG_V4_2.md) · [V4.1](docs/CHANGELOG_V4_1.md) · [V4](docs/CHANGELOG_V4.md).
