# Thêm bài tập mới vào APTIS Practice Hub v4

## Khuyên dùng: tạo bài qua giao diện

Chọn **Tạo bài tập** để tạo đề Speaking, Writing, Reading, Listening mà không cần biết JSON. Chi tiết: `HUONG_DAN_V4.md`.

## Nhập nhiều bài bằng JSON

Chọn **Dữ liệu & Sao lưu -> Import JSON**. Một pack hợp lệ gồm `schemaVersion=1`, `packId`, và ít nhất một `sections` có `items` không rỗng. `packId`, `section.id` và `item.id` chỉ được chứa chữ Latin, số, dấu `.`, `-`, `_`.

Ví dụ:

```json
{
  "schemaVersion": 1,
  "packId": "my-teacher-speaking-pack",
  "title": "Homework speaking",
  "sections": [{
    "id": "my-speaking-part4",
    "skill": "speaking",
    "part": "Part 4",
    "type": "speaking_prompt",
    "title": "Teamwork story",
    "teacherAssigned": true,
    "status": "custom",
    "settings": {"prepSeconds": 60, "speakSeconds": 120},
    "items": [{
      "id": "teamwork01",
      "prompt": "Talk about teamwork.",
      "questions": [
        "Tell me about a time you worked in a team.",
        "Why is teamwork important?",
        "Do younger and older people work well together?"
      ],
      "sample": "Today, I'd like to talk about...",
      "sampleAnswers": ["", "In my opinion...", "Yes, because..."]
    }]
  }]
}
```

### Dạng được hỗ trợ

- Listening: `external_iframe`, `listening_mcq`, `listening_speaker_match`, `listening_two_answers`, `listening_quiz`.
- Reading: `reading_order`, `reading_opinion`, `reading_headings`, `reading_quiz`.
- Speaking: `speaking_prompt`, `speaking_picture`, `speaking_compare`.
- Writing: `writing_short`, `writing_dual_email`, `writing_chat`.
- Grammar: có thể dùng `reading_quiz` với `skill: "grammar"`.

Các bài Listening/Reading tự nhập cần có KEY đúng và nội dung nguồn; đừng giả định một transcript thiếu audio là đề nghe chính thức.

### Media

- Ảnh/audio có thể dùng HTTPS hoặc đường dẫn tương đối, ví dụ `assets/audio/listening/p3.mp3`.
- Tải media lên GitHub đúng đường dẫn rồi mới tạo bài; app không tự upload bản MP3 lên GitHub.

### Đưa bài lên GitHub

1. Import JSON, thử mở/chấm bài trên trình duyệt.
2. Nhấn **Xuất extra-packs.js cho GitHub**.
3. Thay `data/extra-packs.js` trong repository và push.
4. Kiểm tra URL GitHub Pages sau cập nhật.

Lưu ý: pack import chỉ lưu trên thiết bị hiện tại; không có backend đồng bộ tự động.
