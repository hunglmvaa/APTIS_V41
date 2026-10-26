# HƯỚNG DẪN APTIS PRACTICE HUB V4.2 – HỌC SONG NGỮ & GỢI Ý LÀM BÀI

Ngày cập nhật: 26/10/2026. Mục tiêu: APTIS ESOL General B2. Nội dung tiếng Anh và đáp án nguồn giữ nguyên.

## 1. Dịch trong lúc học

1. Vào **Bài thầy giao** hoặc chọn kỹ năng (Reading, Speaking, Writing, Listening).
2. Khi mở bài, thanh màu xanh nhạt nằm ngay dưới tiêu đề bài:
   - **Hiện tiếng Việt**: mở những bản dịch đã có (kể cả các bản đã lưu trong cache).
   - **Ẩn tiếng Việt**: tắt bản dịch để luyện trong điều kiện như khi thi.
   - **Dịch toàn bài**: bổ sung dịch máy cho những đoạn chưa có, trong giới hạn ký tự miễn phí.
3. Bên dưới mỗi câu hỏi, đoạn văn, phương án hoặc bài mẫu có nút **Dịch VI** hoặc **Hiện VI**. Có thể chỉ dịch đoạn cần đọc.
4. Mục **💡 Gợi ý làm bài chi tiết** nêu các bước phù hợp với dạng đề, câu khung, thứ tự trả lời và những điều cần tự kiểm tra. Đây không phải đáp án hay kết quả chấm B2.
5. Bản dịch từ thầy/tài liệu đã có được ưu tiên. Bản dịch tự động gắn nhãn *Dịch máy (tham khảo)*. Khi dịch máy có lỗi, hãy xem lại bản tiếng Anh và tự sửa ở phần tạo/sửa bài.

### Ví dụ Speaking Part 4

- Dịch từng câu hỏi tiếng Anh sang tiếng Việt.
- Xem gợi ý: câu kể trải nghiệm, câu nêu quan điểm, câu nói về tình huống chung.
- Ghi 5–7 từ khóa trong 1 phút chuẩn bị; trả lời cả ba câu trong 2 phút.
- Sau khi luyện, ghi âm và **Xuất bài + ghi âm (.zip)** như V4.1.

### Ví dụ Reading

- Các đoạn dài tách thành các đoạn nhỏ có nút **Dịch VI** riêng.
- Khi luyện thi thử, nên ẩn tiếng Việt trước để tự làm, chỉ mở sau khi hoàn tất.
- Nếu chưa xác minh đáp án, app không tự đánh dấu đúng/sai dựa trên suy đoán.

## 2. Tạo bài tập có bản dịch

1. Nhấn **Tạo bài tập** → chọn dạng: Speaking Part 4, Writing Part 3/4, Reading, Listening, v.v.
2. Nhập *tiếng Anh* vào đúng ô gốc.
3. Mỗi phần chính có ô **Tiếng Việt** đặt liền dưới và nút **🌐 Dịch tự động**.
4. Có thể nhập bản dịch thủ công; đây là cách nên dùng nếu đã có bản dịch từ thầy. Không nhấn dịch lại để tránh ghi đè nội dung đã kiểm chứng.
5. Nhập **Gợi ý riêng của thầy / hướng dẫn triển khai** để bổ sung lời khuyên cụ thể theo đề.
6. Nhấn **Lưu bài tập**. Bài và bản dịch sẽ xuất hiện tại **Bài thầy giao**. Nhấn **Sửa** để hiệu đính về sau.

**Reading / Listening trắc nghiệm:** có thể thêm `quiz_vi` theo định dạng giữ nguyên `Q:`, `A)`, `B)` và `ANSWER: A/B/...`. Nút **Dịch câu hỏi và các phương án** chỉ dịch phần nội dung, không sửa đáp án. Nếu chưa có đáp án đáng tin cậy, dùng `ANSWER: ?`.

**Reading sắp xếp câu:** bản dịch phải có đúng số dòng và giữ đúng thứ tự so với câu tiếng Anh gốc.

## 3. Import bài mới bằng JSON

- Vào **Dữ liệu & Sao lưu → Import JSON**, chọn tệp pack đúng định dạng ứng dụng.
- Tùy chọn **Dịch tự động ... khi nhập JSON** mặc định *tắt*: khi bật, ứng dụng xin phép gửi nội dung tiếng Anh tới dịch vụ dịch bên ngoài; chỉ dịch một phần dung lượng giới hạn nhằm tránh vượt hạn mức miễn phí. Các phần còn thiếu vẫn có nút Dịch VI khi mở bài.
- Bất kể có bật hay không, bài nhập mới luôn được hiển thị mục **Gợi ý làm bài chi tiết** theo kỹ năng.
- Pack có trường `_vi` sẵn được ưu tiên giữ lại; không tự ghi đè bản dịch có sẵn.
- Để đưa các bài đã tự tạo và pack đã nhập lên GitHub, dùng **Xuất extra-packs.js cho GitHub** rồi thay `data/extra-packs.js`, sau khi sao lưu tệp cũ.
- V4.2 *chưa* nhập DOCX/PDF/đường dẫn Google Docs để tự phân tích thành bài; hãy sao chép văn bản sang **Tạo bài tập**, hoặc chuyển nó thành pack JSON trước.

## 4. Dịch tự động: quyền riêng tư và giới hạn

- Dịch máy sử dụng MyMemory qua HTTPS *chỉ sau khi bạn nhấn dịch và chấp thuận*; không chứa API key hay backend. Bản tiếng Anh gửi sang dịch vụ bên thứ ba; không nên gửi tài liệu nhạy cảm/chưa được phép chia sẻ.
- Theo tài liệu MyMemory, truy vấn tối đa **500 byte/lần** và mức sử dụng miễn phí ẩn danh **5.000 ký tự/ngày**. Ứng dụng chia đoạn trước khi gửi nhưng vẫn có thể gặp lỗi, CORS, hết hạn mức hoặc dịch thiếu chính xác. Chức năng dịch máy cần Internet.
- Bản dịch có sẵn và bản dịch đã lưu cache có thể đọc lại không cần dịch máy. Cache dịch và bài tự tạo lưu trên trình duyệt hiện tại; không đồng bộ qua các thiết bị.
- **Sao lưu toàn bộ JSON** trong mục Dữ liệu sẽ xuất cả các bản dịch cache, bài tự tạo, pack và bài viết. Bản ghi âm lưu riêng bằng IndexedDB: cần **Xuất bài nộp (.zip)** hoặc tải audio riêng. Sao lưu JSON không kèm audio.

Nguồn: https://mymemory.translated.net/doc/spec.php và https://mymemory.translated.net/doc/usagelimits.php

## 5. Cập nhật GitHub Pages APTIS_V41 → V4.2

1. Sao lưu ZIP mã nguồn hiện tại và xuất sao lưu bài làm trong app.
2. Tải `APTIS_V42_GitHubPatch.zip`; giải nén.
3. Mở `https://github.com/hunglmvaa/APTIS_V41` → **Add file → Upload files**. Kéo **các tệp và thư mục bên trong** bản vá, sao cho `index.html`, `app.js`, `study-support.js`, v.v. nằm ở thư mục gốc của repository. Các thư mục `data/` và `docs/` phải ở đúng cấp.
4. Lưu ý: bản vá *không có* `data/extra-packs.js` hoặc `data/builtin.js`, nên không ghi đè bộ bài tự thêm hoặc ngân hàng đề gốc.
5. Commit `Upgrade APTIS Practice Hub to v4.2 - bilingual study`.
6. Vào **Actions** kiểm tra Pages deploy hoàn thành. Mở `https://hunglmvaa.github.io/APTIS_V41/`; thử Ctrl+F5 nếu còn cache cũ.
7. Vào một đề Speaking/Reading → thử hiện bản dịch có sẵn, sau đó tự bấm dịch một câu mới và xem gợi ý.
8. Nếu muốn quản lý phiên bản: **Releases → Draft a new release**, tag `v4.2.0` theo nhánh `main` sau khi deploy thành công.

**Lưu ý:** GitHub repository Public là nơi công khai mã nguồn và các bài được xuất vào `extra-packs.js`. Bài viết cá nhân, file âm thanh, và bản sao lưu có thông tin riêng nên nộp cho thầy riêng, không đưa vào repository công khai.
