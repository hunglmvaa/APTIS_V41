/* V4.2: Vietnamese learning translations, separately authored.
   Original teacher English questions and samples in teacher-homework.js are unchanged.
   Source: DERIVED_TRANSLATION_FOR_LEARNING (not an official answer key). */
(function(){
 const sections=(window.APTIS_TEACHER_PACKS||[]).flatMap(p=>p.sections||[]);
 const item=(s,id)=>sections.find(x=>x.id===s)?.items?.find(x=>x.id===id);
 const team=item('teacher-p4-six-topics','teacher-p4-six');
 if(team){
   team.questions_vi=[
     'Hãy kể về một lần bạn làm việc với những người ở các độ tuổi khác nhau để đạt được một mục tiêu.',
     'Những khó khăn nào mọi người có thể gặp phải khi làm việc nhóm?',
     'Bạn có nghĩ người trẻ và người lớn tuổi nên làm việc cùng nhau thường xuyên hơn không? Vì sao?'
   ];
   team.sampleAnswers_vi=[
     team.sample_vi||'',
     'Các thành viên có thể có ý tưởng hoặc phong cách làm việc khác nhau. Theo tôi, lắng nghe cẩn thận và lập kế hoạch rõ ràng sẽ giúp mọi người làm việc hiệu quả hơn.',
     'Có. Người lớn tuổi có kinh nghiệm quý giá, trong khi người trẻ thường mang đến ý tưởng mới và năng lượng. Họ có thể học hỏi rất nhiều từ nhau.'
   ];
   team.guide_vi='Câu 1 (khoảng 65–75 giây): kể hoàn cảnh, ông 70 tuổi và các bạn trẻ, khó khăn, quyết định tái sử dụng vật liệu, kết quả hoàn thành sân chơi. Câu 2 (20–25 giây): khác biệt ý tưởng và cách phối hợp; giải pháp là lắng nghe, phân công rõ. Câu 3 (20–25 giây): kinh nghiệm của người lớn + năng lượng/ý tưởng của người trẻ. Đây là gợi ý phân bổ thời gian; không phải quy tắc chấm điểm cố định.';
 }
 const dec=item('teacher-p4-decision','b3-decision');
 if(dec){
   dec.questions_vi=[
     'Kể về một quyết định quan trọng khi bạn phải lựa chọn giữa hai phương án.',
     'Bạn có nghĩ việc lựa chọn giữa hai phương án là khó khăn không?',
     'Có nhiều lựa chọn hơn trong cuộc sống có tốt hơn không?'
   ];
   dec.sampleAnswers_vi=['',
     'Có, tôi nghĩ lựa chọn giữa hai phương án khá khó, đặc biệt khi cả hai đều có lợi thế rõ ràng. Khi đó, chúng ta nên so sánh lợi ích, rủi ro và kết quả lâu dài trước khi quyết định cuối cùng.',
     'Theo tôi, có nhiều lựa chọn vừa hữu ích vừa khó khăn. Điều đó mang lại tự do hơn nhưng cũng có thể khiến ta thấy quá tải. Vì vậy, nên bình tĩnh và chọn phương án phù hợp nhất với mục tiêu.'
   ];
   dec.guide_vi='Câu 1: nêu hai phương án xây dựng ứng dụng di động phức tạp hoặc web đơn giản; so sánh nguồn lực và hạn chót; quyết định chọn web; giải thích kết quả. Bài gốc rất dài, cần rút còn vừa đủ thời gian để trả lời câu 2–3. Câu 2: nêu lý do lựa chọn khó. Câu 3: đánh giá cả ưu và nhược điểm của nhiều lựa chọn.';
 }
 const book=item('teacher-writing-p2-book','w2-book');
 if(book){
   book.prompt_vi='Bạn là thành viên mới của một câu lạc bộ sách. Hãy kể về thời gian rảnh và sở thích của bạn.';
   book.sample_vi='Trong thời gian rảnh, tôi rất thích đọc tiểu thuyết hư cấu. Cuốn tiểu thuyết yêu thích của tôi là Harry Potter và tôi thường đọc sách cùng con trai vào cuối tuần.';
 }
 const tech=item('teacher-writing-p3-tech','w3-tech-chat');
 if(tech){
   tech.instructions_vi='Bạn là thành viên câu lạc bộ công nghệ. Hãy trả lời ba thành viên trong phòng chat. Viết 30–40 từ cho mỗi câu trả lời.';
   const vis=[
     ['Tôi rất thích những phát minh công nghệ. Bạn có thể kể về một công nghệ mới mà bạn biết không?', 'Rất vui được gặp bạn! Gần đây tôi đã tìm hiểu về trí tuệ nhân tạo. Nó giúp mọi người tìm kiếm thông tin, lên kế hoạch trong ngày và luyện tiếng Anh. Tôi nghĩ nó hữu ích, nhưng chúng ta luôn nên kiểm tra câu trả lời của nó.'],
     ['Bạn sử dụng công nghệ để học tiếng Anh như thế nào?', 'Rất vui được trò chuyện với bạn! Tôi thường nghe các podcast tiếng Anh ngắn và luyện nói bằng công cụ trực tuyến. Chúng giúp tôi cải thiện phát âm. Tuy nhiên, mỗi ngày tôi cũng ôn từ mới trong sổ tay.'],
     ['Bạn có nghĩ trẻ em nên dùng điện thoại thông minh ở trường không?', 'Đó là một câu hỏi thú vị. Tôi nghĩ điện thoại có thể giúp học sinh tra cứu thông tin và học kỹ năng mới. Tuy nhiên, giáo viên nên đặt quy định rõ ràng vì một số em có thể dùng điện thoại để chơi game hoặc vào mạng xã hội.']
   ];
   tech.questions.forEach((q,i)=>{q.prompt_vi=vis[i][0];q.sample_vi=vis[i][1]});
   tech.guide_vi='Đây là ba lượt chat riêng: (1) công nghệ bạn biết và công dụng; (2) công nghệ bạn dùng để học tiếng Anh và tác dụng; (3) quan điểm về điện thoại ở trường, lợi ích và nguy cơ. Mỗi câu 30–40 từ; mở đầu ngắn gọn, có lý do và ví dụ.';
 }
 const email=item('teacher-writing-p4-tech','w4-tech-comments');
 if(email){
   email.scenario_vi='Bạn là thành viên của một câu lạc bộ công nghệ. Các thành viên thường đăng bài lên trang web, nhưng gần đây có người để lại bình luận tiêu cực về bài viết của người khác. Hãy viết cho một người bạn và sau đó viết cho người quản lý câu lạc bộ về vấn đề này cùng các đề xuất của bạn.';
   email.guide_vi='Email thân mật: thông báo có bình luận tiêu cực, thể hiện cảm xúc, đề nghị quản trị viên duyệt bình luận/quy tắc ứng xử, hỏi ý kiến bạn. Email trang trọng: nêu mục đích, đưa hai giải pháp kèm lợi ích cụ thể (ví dụ quy định rõ, báo cáo bình luận, kiểm duyệt), kết thư lịch sự. Bài mẫu của thầy được giữ nguyên; bản dịch và gợi ý chỉ phục vụ hiểu đề.';
 }
 const city=sections.find(s=>s.id==='teacher-reading-16-17');
 if(city)for(const exercise of city.items||[]){
   if(exercise.id==='teacher-r16'&&exercise.questions?.length){exercise.questions[0].prompt_vi='Điều gì đã xảy ra với bộ phim truyền hình này?';exercise.questions[0].options_vi=['Bộ phim không được đầu tư đủ ở giai đoạn đầu.','Bộ phim bị các nhà phê bình bỏ qua.','Bộ phim thu hút sự chú ý của khán giả ngay từ đầu.'];exercise.questions[1].prompt_vi='Theo chuyên gia, bộ phim có tiềm năng gì?'}
 }
})();
