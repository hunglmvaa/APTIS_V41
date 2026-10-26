# APTIS Practice Hub v4.1 — Ôn thi B2 và bài tập thầy giao

Ứng dụng web tĩnh (HTML/CSS/JavaScript), dùng được trên GitHub Pages, không cần backend, cơ sở dữ liệu hoặc công đoạn build.

## Bắt đầu sử dụng

1. Đọc [Hướng dẫn sử dụng v4](docs/HUONG_DAN_V4.md) và [Hướng dẫn xuất bài nộp v4.1](docs/HUONG_DAN_NOP_BAI_V4_1.md).
2. Đưa **các tệp bên trong** thư mục `aptis-practice-hub-main/` lên **thư mục gốc** của repository GitHub hiện có.
3. Cấu hình GitHub Pages theo [Hướng dẫn triển khai](docs/DEPLOY_GITHUB.md).
4. Mở ứng dụng qua HTTPS → chọn **Bài thầy giao** hoặc **Tạo bài tập**.
5. Định kỳ vào **Dữ liệu & Sao lưu → Sao lưu toàn bộ** để lưu bài làm và tiến độ.

## Ngân hàng đề cũ — được giữ nguyên

- Listening Part 2: 1 mục liên kết đến 12 bộ online (nguồn bên ngoài, cần Internet).
- Reading: 13 bài Text Cohesion và 6 bài Opinion Matching.
- Speaking: 23 chủ đề Part 1 và 17 chủ đề Part 4.
- Writing: 10 câu Part 1, 8 câu Part 2, 5 câu Part 3, 17 tình huống Part 4.

## Chức năng bổ sung trong v4/v4.1

- **Bài thầy giao:** xem danh sách bài, hạn nộp, mở, sửa/xóa bài tự tạo, theo dõi đã luyện.
- **Tạo bài bằng giao diện:** Speaking Part 4 (3 câu), Speaking Part 1–3, Writing Part 1–2, Writing chat Part 3 (3 câu), Writing Part 4 (2 email), Reading/Listening trắc nghiệm, Reading Order và Opinion Matching.
- **Speaking Part 4:** 60 giây chuẩn bị + 120 giây trả lời, nghe đề bằng TTS (nếu trình duyệt hỗ trợ), biến thể gộp đề, ghi chú, ghi âm và tải bản ghi.
- **Writing:** tự lưu bài đang viết, đếm từ, xem/ẩn bài mẫu, xuất bài làm `.txt` để gửi thầy.
- **Reading/Listening:** chấm câu có đáp án xác minh; câu `ANSWER: ?` không bị tính đúng hoặc sai.
- **Grammar & Vocabulary:** 10 câu luyện thêm có nhãn `GENERATED_PRACTICE` — không phải đề thi chính thức.
- **Sao lưu:** xuất/nhập tiến độ, bản nháp, bài tập tự tạo, pack tùy chỉnh; xuất `extra-packs.js` để đưa bài mới lên GitHub.
- **Xuất hồ sơ nộp thầy (v4.1):** chọn một hoặc nhiều bài Speaking/Writing và tải một ZIP gồm câu hỏi, câu trả lời/ghi chú cá nhân, tài liệu HTML/TXT và bản ghi âm (nếu có).
- **Lưu ghi âm bằng IndexedDB (v4.1):** mở lại bài vẫn thấy bản ghi trên cùng trình duyệt; có thể đính kèm MP3/M4A/WebM/WAV/OGG đã lưu trước đây.
- **PWA:** lưu bộ khung ứng dụng cho việc mở lại khi mất mạng; nguồn Listening và media bên ngoài vẫn cần Internet.

## Dữ liệu và giới hạn quan trọng

- `data/builtin.js` được **giữ nguyên** từ ZIP cũ, không sửa câu hỏi/đáp án.
- `data/teacher-homework.js` chứa các bài tham khảo từ ảnh bài mẫu và tài liệu buổi 3, 4, 7; nội dung tự biên soạn được ghi nguồn riêng, không mạo nhận là bài mẫu nguyên văn của thầy hoặc đề thi Aptis chính thức.
- Ứng dụng không tự kết luận trình độ B2 hay chấm phát âm/ngữ pháp Speaking/Writing bằng AI.
- Chưa tự động phân tích tệp DOCX/PDF hoặc liên kết Google Docs thành bài tập: hãy sao chép nội dung vào **Tạo bài tập**, hoặc nhập pack JSON.
- `localStorage` gắn với từng tên miền, trình duyệt và thiết bị. Nội dung tạo/làm trên laptop **không tự đồng bộ** sang điện thoại. Cần dùng bản sao lưu để chuyển thiết bị.
- Ghi âm cần quyền micro trên HTTPS hoặc localhost. V4.1 cố gắng lưu bản ghi trong IndexedDB trên thiết bị; có thể mất khi xóa dữ liệu trang hoặc chế độ riêng tư chặn lưu. **Hãy xuất ZIP/tải audio và lưu bên ngoài ngay khi hoàn thành**.
- **Không tự gửi thầy** và **không tự đồng bộ âm thanh** giữa thiết bị. Sao lưu JSON v4 không bao gồm audio.
- Âm thanh giữ nguyên định dạng đầu vào/trình duyệt, không tự chuyển sang MP3. Nếu giáo viên yêu cầu MP3, hãy kiểm tra quy định trước khi nộp.
- Môi trường kiểm thử tự động không cho Chromium tải trang nên **chưa xác minh đầy đủ micro thật và bố cục trực quan trên thiết bị**; chức năng tạo ZIP đã được kiểm thử với Python zipfile.

## Các tệp chính

| Tệp/thư mục | Vai trò |
|---|---|
| `index.html`, `styles.css`, `app.js` | Giao diện và engine đã nâng cấp |
| `teacher-features.js` | Tạo/sửa/xóa bài tập và sao lưu |
| `submission.js` | Lưu ghi âm và tạo ZIP nộp bài trực tiếp trong trình duyệt |
| `data/builtin.js` | Ngân hàng đề v3 nguyên bản |
| `data/teacher-homework.js` | Bài thầy giao, bài luyện bổ sung có nhãn nguồn |
| `data/extra-packs.js` | Pack xuất bản thêm trên GitHub |
| `sw.js`, `manifest.json` | Hỗ trợ PWA |
| `docs/` | Hướng dẫn sử dụng, triển khai và nguồn |

Ngày cập nhật: 26/10/2026. Thay đổi kỹ thuật: [CHANGELOG_V4.md](docs/CHANGELOG_V4.md) và [CHANGELOG_V4_1.md](docs/CHANGELOG_V4_1.md).
