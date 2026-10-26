# HƯỚNG DẪN SỬ DỤNG - APTIS PRACTICE HUB V4

## 1. Ôn tập theo tài liệu của thầy

1. Chọn **Bài thầy giao** trong thanh menu.
2. Chọn bài *Gộp 6 đề*, *BTVN buổi 3 - lựa chọn quan trọng*, *Book Club*, *Technology Club*, hoặc *Câu 16-17*.
3. Bấm **Mở bài tập**. Với Speaking Part 4, đọc đủ **3 câu hỏi**, sau đó bấm **Chuẩn bị 60s** và **Nói 120s**.
4. Ghi 5-7 từ khóa; sử dụng **Ghi âm** nếu trình duyệt được phép. Bấm **Dừng**, nghe lại và **Tải bản ghi** khi cần.
5. Chọn **Xem/ẩn bài mẫu** để đối chiếu. Trong đề gộp 6 dạng, đổi **Chọn một dạng đề gộp** để tập trả lời đúng câu chuyện theo trọng tâm.
6. Chọn **Đánh dấu đã luyện** sau khi đã thực sự làm xong.

Câu 2 và 3 của Speaking Part 4 không bị thay thế bằng một bài nói thuộc lòng. Phải trả lời câu hỏi thực tế hiện trên màn hình. Chỉ phần câu chuyện cốt lõi có thể tái sử dụng.

## 2. Tạo bài Speaking Part 4 mới

1. Vào **Tạo bài tập**, loại **Speaking Part 4 - 3 câu hỏi / 2 phút**.
2. Nhập tên bài, nguồn (ví dụ *BTVN buổi 8*), hạn nộp tùy chọn.
3. Nhập **đủ 3 câu hỏi** tiếng Anh.
4. Dán bài mẫu câu 1, câu trả lời ngắn câu 2 và 3 (nếu có), bản dịch/ghi chú tiếng Việt.
5. Nếu muốn gộp nhiều đề, nhập một dạng đề trên mỗi dòng, ví dụ `worked as part of a team`.
6. Bấm **Lưu bài tập**. Mở tại **Bài thầy giao** hoặc menu Speaking.

## 3. Tạo bài Writing

- **Part 1-2:** nhập đề và giới hạn từ; app có ô trả lời và bộ đếm.
- **Part 3:** nhập 3 câu chat (A/B/C). Bài làm có 3 ô riêng, mỗi ô mặc định 30-40 từ, có nút xem mẫu.
- **Part 4:** dán tình huống email CLB, có 2 ô trả lời: email thân mật 40-50 từ, email trang trọng 120-150 từ.
- Sau khi viết, bấm **Tải bài làm (.txt)** để xuất thành văn bản có câu hỏi/đề bài và phần trả lời tự viết.

Đếm từ và đánh dấu đã luyện không thay thế việc chấm về ngữ pháp, bố cục, từ vựng, tính phù hợp với đề hay tiêu chí B2.

## 4. Tạo bài Reading hoặc Listening trắc nghiệm

Chọn **Reading - đọc và chọn đáp án** hoặc **Listening - audio và chọn đáp án**. Với Listening, phải có link audio HTTPS (hoặc tệp audio đã được tải vào thư mục `assets/` trên GitHub).

Trong ô **Các câu trắc nghiệm**, nhập theo mẫu (mỗi câu cách nhau bởi `---`):

```
Q: Why did the person join the club?
A) To get a job
B) To study English
C) To visit family
ANSWER: B
EXPLAIN: The speaker says that they want to improve their English.
---
Q: What is the speaker's name?
A) Sarah
B) Helen
C) Liz
ANSWER: ?
EXPLAIN: Audio gốc chưa có, không tự chấm câu này.
```

**Quan trọng:** Nếu chưa có đáp án đã xác minh từ thầy hoặc từ nguồn gốc, nhập `ANSWER: ?`. App sẽ cho làm nhưng không tính vào mẫu số điểm. Không được tự gán đáp án vì một câu nghe có thể có nhiều lựa chọn gần đúng.

**Reading Order:** nhập 3 câu trở lên theo thứ tự đúng; app tự đảo câu khi làm bài.

**Reading Opinion Matching:** nhập nội dung A, B, C, D và các câu hỏi theo định dạng `Who likes reading? | C` mỗi dòng.

## 5. Sao lưu, chuyển thiết bị và đưa bài lên GitHub

- Vào **Dữ liệu & Sao lưu** → **Sao lưu toàn bộ** để xuất JSON (bài viết, điểm, bài tự tạo, pack đã nhập).
- Dùng **Nhập/Gộp sao lưu** trên thiết bị khác để khôi phục; kiểm tra kỹ trước khi nhập.
- Muốn đưa các bài mới vào repository và hiện trên thiết bị khác sau khi mở trang: bấm **Xuất extra-packs.js cho GitHub**, thay tệp `data/extra-packs.js` trong repository. Tệp này chứa nội dung đề, **không chứa bài viết nháp và tiến độ cá nhân**.
- Sau khi GitHub Pages cập nhật, dùng `Ctrl+F5` trên máy tính hoặc làm mới trang trên điện thoại. Đừng xóa cache trước khi sao lưu.

## 6. Những gì app chưa tự động làm

- Không tải và bóc tách hoàn toàn DOCX, PDF hoặc Google Docs khi người dùng chỉ dán URL; phải sao chép đề vào biểu mẫu, hoặc chuẩn bị JSON.
- Không đồng bộ bài làm qua tài khoản: dữ liệu giữ trên thiết bị hiện tại.
- Không tự động đánh giá CEFR B2 / chấm phát âm hoặc ngữ pháp Speaking/Writing.
- Không ghi âm vào cloud; cần bấm Tải bản ghi để lưu file audio về máy.
- Không đưa media gốc chưa có bản quyền/nguồn xác minh vào kho luyện nghe.
