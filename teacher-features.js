/* Local assignment creation/management for a static GitHub Pages app.
   All records stay on this device unless explicitly exported. */
window.APT_FEATURES = function({state,sections,store,esc,render,page,toast,download}) {
  const $ = s => document.querySelector(s);
  const TYPES = [
    ['speaking4','Speaking Part 4 — 3 câu hỏi / 2 phút'],
    ['speaking_basic','Speaking Part 1–3 — 1 đề'],
    ['writing_short','Writing Part 1–2 / câu ngắn'],
    ['writing_chat','Writing Part 3 — 3 câu chat'],
    ['writing_dual_email','Writing Part 4 — 2 email'],
    ['reading_quiz','Reading — đọc và chọn đáp án'],
    ['listening_quiz','Listening — audio và chọn đáp án'],
    ['reading_order','Reading — sắp xếp câu'],
    ['reading_opinion','Reading — ghép 4 quan điểm']
  ];
  const groupOf = type => type.startsWith('speaking')?'speaking':type.startsWith('writing')?'writing':type.startsWith('listening')?'listening':'reading';
  const defaultPart = type => ({speaking4:'Part 4',speaking_basic:'Part 1',writing_short:'Part 2',writing_chat:'Part 3',writing_dual_email:'Part 4',reading_quiz:'Comprehension',listening_quiz:'Practice',reading_order:'Text Cohesion',reading_opinion:'Opinion Matching'})[type] || 'Practice';
  const isTeacher = s => !!s.teacherAssigned;
  const attr = x => esc(x==null?'':String(x));
  const textInput = (name,label,value='',placeholder='',required=false) => `<label class="formfield"><span>${esc(label)}</span><input type="text" name="${name}" value="${attr(value)}" placeholder="${attr(placeholder)}" ${required?'required':''}></label>`;
  const textArea = (name,label,value='',placeholder='',rows=4) => `<label class="formfield"><span>${esc(label)}</span><textarea name="${name}" rows="${rows}" placeholder="${attr(placeholder)}">${esc(value)}</textarea></label>`;
  const numberField = (name,label,value,min=1,max=500) => `<label class="formfield"><span>${esc(label)}</span><input type="number" name="${name}" min="${min}" max="${max}" value="${attr(value)}"></label>`;
  const pairedArea=(name,label,d,placeholder='',rows=3)=>`${textArea(name,label+' — tiếng Anh',d[name]||'',placeholder,rows)}<div class="study-edit-vi">${textArea(name+'_vi','Tiếng Việt — '+label,d[name+'_vi']||'','Bản dịch do anh tự kiểm tra hoặc sửa lại...',Math.max(2,Math.ceil(rows/2)))}<button type="button" class="btn small" data-study-en="${name}" data-study-vi="${name}_vi">🌐 Dịch tự động</button></div>`;
  const pairedInput=(name,label,d,placeholder='',required=false)=>`${textInput(name,label+' — tiếng Anh',d[name]||'',placeholder,required)}<div class="study-edit-vi">${textArea(name+'_vi','Tiếng Việt — '+label,d[name+'_vi']||'','Bản dịch tiếng Việt...',2)}<button type="button" class="btn small" data-study-en="${name}" data-study-vi="${name}_vi">🌐 Dịch tự động</button></div>`;

  function parseChoiceBlocks(raw){
    const blocks=String(raw||'').split(/\n\s*---\s*(?:\n|$)/).map(x=>x.trim()).filter(Boolean);
    return blocks.map((b,i)=>{
      const lines=b.split(/\n/).map(x=>x.trim()).filter(Boolean);
      let q='', opts=[], ans=null, explanation='';
      for(const line of lines){
        let m;
        if((m=line.match(/^(?:Q\s*:|Question\s*:|Câu\s*:)(.*)$/i)))q=m[1].trim();
        else if((m=line.match(/^([A-F])[).:]\s*(.+)$/i)))opts[m[1].toUpperCase().charCodeAt(0)-65]=m[2];
        else if((m=line.match(/^(?:ANSWER|KEY|ĐÁP ÁN)\s*:\s*([A-F?]|UNKNOWN)\s*$/i)))ans=/^[A-F]$/i.test(m[1])?m[1].toUpperCase().charCodeAt(0)-65:null;
        else if((m=line.match(/^(?:EXPLAIN|EXPLANATION|GIẢI THÍCH)\s*:\s*(.*)$/i)))explanation=m[1];
        else if(!q)q=line;
      }
      opts=opts.filter(x=>typeof x==='string');
      if(!q||opts.length<2)throw new Error('Câu '+(i+1)+': cần Q và ít nhất hai phương án A), B).');
      if(ans!==null && ans>=opts.length)throw new Error('Câu '+(i+1)+': ANSWER không có trong phương án.');
      return {prompt:q,options:opts,answer:ans,explanation};
    });
  }
  const DEFAULT_Q=`Q: Why did she join the club?\nA) To meet new people\nB) To learn English\nC) To buy a new computer\nANSWER: B\nEXPLAIN: The speaker says she wants to improve her English.`;
  function parseOpinionQuestions(raw){return String(raw||'').split('\n').map(l=>l.trim()).filter(Boolean).map((line,i)=>{
    const pos=line.lastIndexOf('|'); if(pos<0)throw new Error('Câu '+(i+1)+': dùng dấu | trước đáp án A/B/C/D.');
    const q=line.slice(0,pos).trim(),answer=line.slice(pos+1).trim().toUpperCase();
    if(!q||!['A','B','C','D'].includes(answer))throw new Error('Câu '+(i+1)+': đáp án phải là A, B, C hoặc D.');
    return {en:q,answer};
  })}
  function renderAssignments(){
    const list=sections().filter(isTeacher);
    const today=new Date(); today.setHours(0,0,0,0);
    const rows=list.map(s=>{
      const id=s.id,owned=state.assignments.some(a=>a.id===id),a=s.items?.[0],k=id+':'+(a?.id||'item');
      const done=state.progress[k],due=s.dueDate?new Date(s.dueDate+'T00:00:00'):null;
      const days=due?Math.round((due-today)/86400000):null;
      const dueLabel=due ? ('Hạn: '+esc(s.dueDate)+(days<0?' (quá hạn)':days===0?' (hôm nay)':'')) : 'Chưa đặt hạn';
      return `<div class="assignment-card">
        <div class="row between"><div class="row"><span class="pill ${owned||s.status==='practice'?'custom':'ok'}">${owned?'Tự tạo / lưu trên máy':s.status==='practice'?'Luyện bổ trợ':'Từ tài liệu thầy'}</span><span class="pill">${esc(s.skill.toUpperCase())} ${esc(s.part||'')}</span></div><span class="small ${days!==null&&days<0?'dangertext':'muted'}">${dueLabel}</span></div>
        <h3>${esc(s.title)}</h3><p class="muted small">${esc(s.sourceLabel||s.description||'')}</p>
        <div class="row between"><span class="small">${done?`Đã luyện ${Number(done.attempts)||1} lần`:'Chưa làm / chưa đánh dấu'}</span><div class="row"><button class="btn primary small" data-open-assignment="${attr(id)}">Mở bài tập</button>${owned?`<button class="btn small" data-edit-assignment="${attr(id)}">Sửa</button><button class="btn danger small" data-delete-assignment="${attr(id)}">Xóa</button>`:''}</div></div>
      </div>`;
    }).join('');
    $('#app').innerHTML=`<div class="pageintro"><span class="pill">Luyện theo yêu cầu giáo viên</span><h1>Bài thầy giao</h1><p>Chọn đề để làm trực tiếp, dùng đồng hồ / ghi âm hoặc soạn bài. Bộ mẫu thầy giữ nguyên nguồn; đề tự tạo chỉ lưu trên thiết bị cho đến khi bạn xuất tệp sao lưu.</p><div class="row"><button class="btn primary" onclick="APT.creatorNew()">+ Tạo bài tập mới</button><button class="btn" onclick="APT.exportAssignments()">Xuất các bài tự tạo (.json)</button><button class="btn good" onclick="APT.page('submission')">Xuất hồ sơ nộp thầy (.zip)</button></div></div><div class="assignment-list">${rows||'<div class="card">Chưa có bài tập.</div>'}</div>`;
    document.querySelectorAll('[data-open-assignment]').forEach(b=>b.onclick=()=>openAssignment(b.dataset.openAssignment));
    document.querySelectorAll('[data-edit-assignment]').forEach(b=>b.onclick=()=>editAssignment(b.dataset.editAssignment));
    document.querySelectorAll('[data-delete-assignment]').forEach(b=>b.onclick=()=>deleteAssignment(b.dataset.deleteAssignment));
  }
  function openAssignment(id){
    const s=sections().find(x=>x.id===id);if(!s){toast('Không tìm thấy bài tập');return}
    store.set('aptis_active_'+s.skill,s.id);page(s.skill);
  }
  function editAssignment(id){
    const s=state.assignments.find(x=>x.id===id);if(!s)return;
    state.creatorEditing=id;
    state.creatorDraft=sectionToDraft(s);
    page('creator');
  }
  function deleteAssignment(id){
    if(!window.confirm('Xóa bài tập tự tạo trên thiết bị này? Bản trên GitHub và các file đã xuất không bị ảnh hưởng.'))return;
    state.assignments=state.assignments.filter(x=>x.id!==id);
    if(!store.set('aptis_assignments_v4',state.assignments))toast('Không thể lưu thay đổi vào bộ nhớ trình duyệt');
    renderAssignments();
  }
  function creatorNew(){state.creatorEditing=null;state.creatorDraft={type:'speaking4',part:'Part 4'};page('creator')}
  function sectionToDraft(s){
    const it=s.items?.[0]||{},type=s.creatorType||({writing_chat:'writing_chat',writing_short:'writing_short',writing_dual_email:'writing_dual_email',reading_quiz:'reading_quiz',listening_quiz:'listening_quiz',reading_order:'reading_order',reading_opinion:'reading_opinion'}[s.type]||(s.part==='Part 4'?'speaking4':'speaking_basic'));
    const base={type,title:s.title,part:s.part,dueDate:s.dueDate||'',source:s.sourceLabel||'',instructions:s.description||'',...it};
    if(type==='speaking4'){(it.questions||[]).forEach((x,i)=>{base['q'+(i+1)]=x;base['q'+(i+1)+'_vi']=it.questions_vi?.[i]||''});(it.sampleAnswers||[]).forEach((x,i)=>{base['a'+(i+1)]=x;base['a'+(i+1)+'_vi']=it.sampleAnswers_vi?.[i]||''});base.sample=it.sample||'';base.variants=(it.variants||[]).join('\n')}
    if(type==='writing_chat'){(it.questions||[]).forEach((x,i)=>{base['q'+(i+1)]=x.prompt;base['q'+(i+1)+'_vi']=x.prompt_vi||'';base['a'+(i+1)]=x.sample;base['a'+(i+1)+'_vi']=x.sample_vi||''});}
    if(['reading_quiz','listening_quiz'].includes(type))base.quiz=(it.questions||[]).map(q=>['Q: '+q.prompt,...(q.options||[]).map((o,i)=>String.fromCharCode(65+i)+') '+o),'ANSWER: '+(Number.isInteger(q.answer)?String.fromCharCode(65+q.answer):'?'),'EXPLAIN: '+(q.explanation||'')].join('\n')).join('\n---\n');
    if(['reading_quiz','listening_quiz'].includes(type)&&(it.questions||[]).every(q=>q.prompt_vi&&(q.options_vi||[]).length===(q.options||[]).length))base.quiz_vi=(it.questions||[]).map(q=>['Q: '+(q.prompt_vi||''),...(q.options_vi||[]).map((o,i)=>String.fromCharCode(65+i)+') '+o),'ANSWER: '+(Number.isInteger(q.answer)?String.fromCharCode(65+q.answer):'?')].join('\n')).filter(x=>/Q: \S/.test(x)).join('\n---\n');
    if(type==='reading_order'){base.sentences=(it.sentences_en||[]).join('\n');base.sentences_vi=(it.sentences_vi||[]).join('\n');base.intro_en_vi=it.intro_vi||'';}
    if(type==='reading_opinion'){for(const c of ['A','B','C','D']){base['p'+c]=it.people?.[c]?.en||'';base['p'+c+'_vi']=it.people?.[c]?.vi||'';}base.opinions=(it.questions||[]).map(q=>q.en+' | '+q.answer).join('\n');base.opinions_vi=(it.questions||[]).filter(q=>q.vi).map(q=>q.vi+' | '+q.answer).join('\n')}
    return base;
  }
  function renderFields(t,d){
    if(t==='speaking4')return `<div class="notice">Nhập <b>đủ ba câu hỏi</b>. Phần gợi ý khi làm sẽ chỉ cách chia thời gian 2 phút cho cả ba câu. Thêm bản dịch từng câu để dễ ôn.</div>${[1,2,3].map(i=>pairedInput('q'+i,'Câu hỏi '+i,d,i===1?'Tell me about a time when...':'What do you think about...',true)).join('')}${pairedArea('sample','Bài mẫu câu 1',d,'Today, I would like to talk about...',7)}${pairedArea('a2','Bài mẫu câu 2',d,'In my opinion...',3)}${pairedArea('a3','Bài mẫu câu 3',d,'I believe...',3)}${textArea('variants','Các dạng đề muốn gộp (mỗi dòng một đề)',d.variants||'','worked as part of a team\nmade an important decision',4)}`;
    if(t==='speaking_basic')return `${pairedArea('prompt','Đề nói',d,'Describe a picture / Tell me about...',3)}${pairedArea('sample','Bài mẫu',d,'Sample answer...',6)}<div class="formrow">${numberField('prepSeconds','Chuẩn bị (giây)',d.prepSeconds||5,0,300)}${numberField('speakSeconds','Nói (giây)',d.speakSeconds||30,10,300)}</div>`;
    if(t==='writing_short')return `${pairedArea('prompt','Đề viết',d,'Why do you want to join the book club?',3)}${pairedArea('sample','Bài mẫu',d,'',5)}<div class="formrow">${numberField('minWords','Tối thiểu (từ)',d.minWords??20,0,500)}${numberField('maxWords','Tối đa (từ)',d.maxWords??30,1,1000)}</div>`;
    if(t==='writing_chat')return `${pairedArea('instructions','Yêu cầu chung',d,'Write 30–40 words for each reply.',2)}${[1,2,3].map(i=>`${pairedArea('q'+i,'Câu hỏi chat '+i,d,'Hi! What do you think about...',2)}${pairedArea('a'+i,'Bài mẫu câu '+i,d,'',3)}`).join('')}<div class="formrow">${numberField('minWords','Tối thiểu mỗi câu',d.minWords??30,1,500)}${numberField('maxWords','Tối đa mỗi câu',d.maxWords??40,1,500)}</div>`;
    if(t==='writing_dual_email')return `${pairedArea('scenario','Tình huống / email từ CLB',d,'You have received an email...',4)}<label class="formfield"><span>Loại tình huống</span><select name="kind"><option value="problem" ${d.kind!=='proposal'?'selected':''}>Vấn đề cần giải quyết</option><option value="proposal" ${d.kind==='proposal'?'selected':''}>Đề xuất ý tưởng</option></select></label>${pairedArea('informalSample','Mẫu email bạn bè (40–50 từ)',d,'Hi John,...',5)}${pairedArea('formalSample','Mẫu email quản lý (120–150 từ)',d,'Dear Sir or Madam,...',7)}`;
    if(t==='reading_quiz'||t==='listening_quiz')return `${t==='reading_quiz'?pairedArea('passage','Đoạn văn đọc hiểu',d,'Paste the passage here...',8):`${textInput('audio','Đường dẫn audio HTTPS / trong assets/',d.audio||'','assets/audio/listening/example.mp3')}${pairedArea('transcript','Transcript (mở sau khi nghe)',d,'Optional audio transcript...',5)}`}<label class="formfield"><span>Trắc nghiệm tiếng Anh: Q, A), B), ANSWER, EXPLAIN; mỗi câu cách nhau bằng ---</span><textarea name="quiz" class="codeentry" rows="13" placeholder="${attr(DEFAULT_Q)}">${esc(d.quiz??DEFAULT_Q)}</textarea></label>${textArea('quiz_vi','Bản dịch câu hỏi và các phương án (đúng thứ tự Q, A), B); có thể để trống rồi dùng nút Dịch VI khi làm bài',d.quiz_vi||'','Q: Tại sao cô ấy tham gia câu lạc bộ?\nA) Để gặp những người mới\nB) Để học tiếng Anh\nC) Để mua máy tính mới\nANSWER: B',7)}<button type="button" class="btn small" data-study-en="quiz" data-study-vi="quiz_vi">🌐 Dịch câu hỏi và các phương án</button><div class="notice warn">Giữ nguyên chữ A/B/C và ANSWER trong bản dịch để dữ liệu khớp. Nút Dịch tự động không tự sửa KEY; nếu chưa chắc đáp án, hãy dùng <b>ANSWER: ?</b>. Khi luyện, có thể dịch từng câu/phương án bằng nút Dịch VI.</div>`;
    if(t==='reading_order')return `${pairedArea('intro_en','Câu mở đầu cố định',d,'This story is about...',2)}${pairedArea('sentences','Các câu sắp xếp (mỗi dòng một câu đúng thứ tự)',d,'First sentence\nSecond sentence\nThird sentence',7)}<p class="muted small">Bản dịch của các câu phải đúng số dòng và cùng thứ tự với bản tiếng Anh; nhấn Dịch tự động có thể cần chỉnh dấu xuống dòng.</p>`;
    if(t==='reading_opinion')return `${['A','B','C','D'].map(x=>pairedArea('p'+x,'Quan điểm người '+x,d,'Person '+x+' thinks...',3)).join('')}${textArea('opinions','Câu hỏi và đáp án tiếng Anh — mỗi dòng: câu hỏi | A/B/C/D',d.opinions||'','Who likes outdoor sports? | A\nWho enjoys reading? | C',6)}${textArea('opinions_vi','Bản dịch câu hỏi — giữ nguyên đáp án sau dấu |',d.opinions_vi||'','Ai thích thể thao ngoài trời? | A\nAi thích đọc sách? | C',5)}<button type="button" class="btn small" data-study-en="opinions" data-study-vi="opinions_vi">🌐 Dịch các câu hỏi</button>`;
    return '<p>Chưa hỗ trợ mẫu bài tập này.</p>';
  }
  function renderCreator(){
    const d=state.creatorDraft||{type:'speaking4',part:'Part 4'},t=d.type||'speaking4';
    $('#app').innerHTML=`<div class="pageintro"><span class="pill custom">Biên soạn tại máy</span><h1>${state.creatorEditing?'Sửa bài tập':'Tạo bài tập mới'}</h1><p>Dán yêu cầu của thầy, bổ sung đáp án mẫu (nếu có) và lưu. Bài sẽ xuất hiện ở mục <b>Bài thầy giao</b> và đúng kỹ năng. Không cần chỉnh sửa JavaScript/JSON.</p></div>
    <form id="creatorForm" class="card creatorform" onsubmit="return false">
      <div class="formrow"><label class="formfield"><span>Loại bài tập</span><select name="type" onchange="APT.creatorType(this.value)">${TYPES.map(([v,l])=>`<option value="${v}" ${v===t?'selected':''}>${esc(l)}</option>`).join('')}</select></label><label class="formfield"><span>Phần thi</span><input type="text" name="part" value="${attr(d.part||defaultPart(t))}" placeholder="Part 4"></label></div>
      ${textInput('title','Tên bài tập',d.title||'','VD: Speaking Part 4 — gộp 6 đề',true)}
      <div class="formrow"><label class="formfield"><span>Hạn nộp (không bắt buộc)</span><input type="date" name="dueDate" value="${attr(d.dueDate||'')}"></label>${textInput('source','Nguồn (thầy / buổi học / trang)',d.source||'','Buổi 3 – bài tập về nhà')}</div>
      ${t==='writing_chat'?'':textArea('instructions','Ghi chú / yêu cầu',d.instructions||'','Ví dụ: 1 phút chuẩn bị, 2 phút trả lời.',2)}
      <div class="form-divider"></div>${renderFields(t,d)}
      <div class="form-divider"></div>${textArea('guide_vi','Gợi ý riêng của thầy / hướng dẫn triển khai (tiếng Việt)',d.guide_vi||'','Ví dụ: Câu 1 kể trải nghiệm với When/Where/Who/Action/Result; câu 2 nêu quan điểm + lý do; câu 3 đưa ví dụ xã hội...',5)}
      <div class="notice ok"><b>Dịch & gợi ý:</b> Có thể điền tiếng Việt thủ công hoặc nhấn <b>Dịch tự động</b> từng mục. Nếu chưa điền, khi mở bài vẫn có nút <b>Dịch VI</b> và hướng dẫn từng bước mặc định.</div>
      <div class="row"><button type="button" class="btn good" id="studyAutoFillForm">🌐 Dịch các ô còn thiếu tiếng Việt</button><span class="muted small" id="studyCreatorStatus" aria-live="polite">Chỉ dịch khi anh đồng ý gửi nội dung đến MyMemory; có giới hạn miễn phí.</span></div>
      <div class="row" style="margin-top:15px"><button type="button" class="btn primary" onclick="APT.creatorSave()">Lưu bài tập</button><button type="button" class="btn" onclick="APT.creatorNew()">Tạo bài khác</button><button type="button" class="btn" onclick="APT.page('assignments')">Danh sách bài tập</button></div>
      <p class="muted small">Dữ liệu lưu cục bộ trên trình duyệt. Dùng “Sao lưu toàn bộ” trong mục Dữ liệu để chuyển thiết bị hoặc tránh mất khi xóa cache.</p>
    </form>`;
    window.APT_STUDY.attachCreator($('#creatorForm'));
  }
  function captureCreator(){const form=$('#creatorForm');return form?Object.fromEntries(new FormData(form).entries()):{}}
  function creatorType(t){state.creatorDraft={...captureCreator(),type:t,part:defaultPart(t)};renderCreator()}
  function toAssignment(d,old){
    const title=String(d.title||'').trim();if(!title)throw new Error('Cần nhập tên bài tập.');
    const type=d.type||'speaking4',id=old?.id||'personal-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,6);
    const skill=groupOf(type),part=d.part?.trim()||defaultPart(type);
    let item={id:'item-'+id,guide_vi:String(d.guide_vi||'').trim()};let renderer=type;
    if(type==='speaking4'){
      const qs=[d.q1,d.q2,d.q3].map(x=>String(x||'').trim());if(qs.some(x=>!x))throw new Error('Speaking Part 4 cần nhập đủ ba câu hỏi.');
      item={...item,prompt:qs[0],questions:qs,sample:d.sample||'',sampleAnswers:[d.sample||'',d.a2||'',d.a3||''],sample_vi:d.sample_vi||'',questions_vi:[d.q1_vi||'',d.q2_vi||'',d.q3_vi||''],sampleAnswers_vi:[d.sample_vi||'',d.a2_vi||'',d.a3_vi||''],variants:String(d.variants||'').split('\n').map(s=>s.trim()).filter(Boolean),sampleSource:'Bài mẫu do người tạo nhập; không tự chấm mức B2.'}; renderer='speaking_prompt';
    } else if(type==='speaking_basic'){
      if(!d.prompt?.trim())throw new Error('Thiếu đề Speaking.');
      item={...item,prompt:d.prompt,prompt_vi:d.prompt_vi||'',sample:d.sample||'',sample_vi:d.sample_vi||''};renderer='speaking_prompt';
    } else if(type==='writing_short'){
      if(!d.prompt?.trim())throw new Error('Thiếu đề Writing.');
      item={...item,prompt:d.prompt,prompt_vi:d.prompt_vi||'',sample:d.sample||'',sample_vi:d.sample_vi||'',minWords:Number(d.minWords),maxWords:Number(d.maxWords)};
    } else if(type==='writing_chat'){
      const qs=[1,2,3].map(i=>({prompt:String(d['q'+i]||'').trim(),prompt_vi:String(d['q'+i+'_vi']||'').trim(),sample:String(d['a'+i]||'').trim(),sample_vi:String(d['a'+i+'_vi']||'').trim()}));if(qs.some(x=>!x.prompt))throw new Error('Writing Part 3 cần ba câu hỏi.');
      item={...item,club:title,instructions:d.instructions||'',instructions_vi:d.instructions_vi||'',questions:qs,minWords:Number(d.minWords),maxWords:Number(d.maxWords)};
    } else if(type==='writing_dual_email'){
      if(!d.scenario?.trim())throw new Error('Thiếu tình huống Writing Part 4.');
      item={...item,title,scenario:d.scenario,scenario_vi:d.scenario_vi||'',kind:d.kind==='proposal'?'proposal':'problem',informalSample:d.informalSample||'',informalSample_vi:d.informalSample_vi||'',formalSample:d.formalSample||'',formalSample_vi:d.formalSample_vi||'',informalTarget:50,formalMinWords:120,formalMaxWords:150};
    } else if(type==='reading_quiz'||type==='listening_quiz'){
      const qs=parseChoiceBlocks(d.quiz);if(!qs.length)throw new Error('Hãy nhập ít nhất một câu trắc nghiệm.');
      if(String(d.quiz_vi||'').trim()){
        const vs=parseChoiceBlocks(d.quiz_vi);
        if(qs.length!==vs.length||qs.some((q,i)=>q.options.length!==vs[i].options.length))throw new Error('Bản dịch trắc nghiệm phải có số câu và số phương án giống tiếng Anh.');
        qs.forEach((q,i)=>{q.prompt_vi=vs[i].prompt;q.options_vi=vs[i].options;});
      }
      item={...item,title,passage:d.passage||'',passage_vi:d.passage_vi||'',audio:d.audio||'',transcript:d.transcript||'',transcript_vi:d.transcript_vi||'',questions:qs};
      if(type==='reading_quiz'&&!item.passage)throw new Error('Thiếu đoạn văn cho Reading.');
      if(type==='listening_quiz'&&!item.audio)throw new Error('Listening cần đường dẫn audio; nếu chỉ có transcript hãy dùng Reading.');
    } else if(type==='reading_order'){
      const ss=String(d.sentences||'').split('\n').map(x=>x.trim()).filter(Boolean);if(ss.length<3)throw new Error('Cần ít nhất 3 câu để sắp xếp.');
      const sv=String(d.sentences_vi||'').split('\n').map(x=>x.trim()).filter(Boolean);
      if(sv.length&&sv.length!==ss.length)throw new Error('Bản dịch sắp xếp câu phải có đúng '+ss.length+' dòng (hiện có '+sv.length+').');
      item={...item,intro_en:d.intro_en||'',intro_vi:d.intro_en_vi||'',sentences_en:ss,sentences_vi:sv};
    } else if(type==='reading_opinion'){
      const people=Object.fromEntries(['A','B','C','D'].map(letter=>[letter,{en:String(d['p'+letter]||'').trim(),vi:String(d['p'+letter+'_vi']||'').trim()}]));
      if(Object.values(people).some(x=>!x.en))throw new Error('Cần đủ 4 quan điểm A–D.');
      item={...item,title_en:title,people,questions:parseOpinionQuestions(d.opinions)};
      if(String(d.opinions_vi||'').trim()){
        const vs=parseOpinionQuestions(d.opinions_vi);
        if(vs.length!==item.questions.length)throw new Error('Số câu hỏi Opinion Matching tiếng Việt phải bằng tiếng Anh.');
        item.questions.forEach((q,i)=>{q.vi=vs[i].en;});
      }
      if(!item.questions.length)throw new Error('Cần ít nhất 1 câu hỏi Opinion Matching.');
    } else throw new Error('Loại bài tập chưa hỗ trợ.');
    if(['writing_short','writing_chat'].includes(type) && (!Number.isFinite(item.minWords)||!Number.isFinite(item.maxWords)||item.minWords<0||item.maxWords<item.minWords))throw new Error('Giới hạn số từ không hợp lệ.');
    return {id,creatorType:type,skill,part,title,type:renderer,status:'custom',teacherAssigned:true,sourceLabel:d.source?.trim()||'Bài tập tự tạo trên thiết bị',dueDate:d.dueDate||'',description:d.instructions||'',settings: type==='speaking4'?{prepSeconds:60,speakSeconds:120}:type==='speaking_basic'?{prepSeconds:Number(d.prepSeconds)||5,speakSeconds:Number(d.speakSeconds)||30}:undefined,items:[item]};
  }
  function creatorSave(){
    try{
      const d=captureCreator(),old=state.assignments.find(a=>a.id===state.creatorEditing);const item=toAssignment(d,old);
      if(!old && sections().some(s=>s.id===item.id))throw new Error('Mã bài tập bị trùng. Hãy thử lưu lại.');
      state.assignments=old?state.assignments.map(x=>x.id===old.id?item:x):[...state.assignments,item];
      if(!store.set('aptis_assignments_v4',state.assignments))throw new Error('Bộ nhớ trình duyệt đã đầy hoặc bị chặn. Hãy xuất sao lưu và xóa dữ liệu không cần thiết.');
      state.creatorEditing=null;state.creatorDraft={type:'speaking4',part:'Part 4'};
      toast('Đã lưu bài tập');page('assignments');
    } catch(e){alert('Không lưu được bài tập: '+e.message)}
  }
  function exportAssignments(){
    const pack={schemaVersion:1,packId:'my-homework-export-'+new Date().toISOString().slice(0,10),title:'Bài tập tự tạo',sections:state.assignments};
    download('aptis-bai-tap-tu-tao.json',JSON.stringify(pack,null,2));
  }
  function exportBackup(){
    const data={schemaVersion:4,app:'APTIS Practice Hub',exportedAt:new Date().toISOString(),progress:state.progress,drafts:state.drafts,assignments:state.assignments,customPacks:state.customPacks,translations:window.APT_STUDY.exportCache(),lang:state.lang};
    download('aptis-hub-backup-'+new Date().toISOString().slice(0,10)+'.json',JSON.stringify(data,null,2));
  }
  async function importBackup(file){
    if(!file)return;
    try{
      if(file.size>10*1024*1024)throw new Error('Tệp quá lớn (giới hạn 10 MB).');
      const x=JSON.parse(await file.text());if(!x||typeof x!=='object'||Array.isArray(x))throw new Error('File không đúng định dạng.');
      const has=['progress','drafts','assignments','customPacks'].some(k=>k in x);if(!has)throw new Error('Không tìm thấy dữ liệu sao lưu APTIS.');
      if(x.assignments!==undefined&&(!Array.isArray(x.assignments)||x.assignments.some(a=>!a?.id||!/^[A-Za-z0-9][A-Za-z0-9._-]{0,100}$/.test(a.id)||!a?.type||!Array.isArray(a.items)||a.items.some(i=>!i?.id||!/^[A-Za-z0-9][A-Za-z0-9._-]{0,100}$/.test(i.id)))))throw new Error('Danh sách bài tập chứa mã ID không hợp lệ.');
      if(x.customPacks!==undefined&&(!Array.isArray(x.customPacks)||x.customPacks.some(p=>!p.packId||!/^[A-Za-z0-9][A-Za-z0-9._-]{0,100}$/.test(p.packId)||!Array.isArray(p.sections)||p.sections.some(s=>!s?.id||!/^[A-Za-z0-9][A-Za-z0-9._-]{0,100}$/.test(s.id)||!Array.isArray(s.items)||s.items.some(i=>!i?.id||!/^[A-Za-z0-9][A-Za-z0-9._-]{0,100}$/.test(i.id))))))throw new Error('Custom packs không hợp lệ.');
      if(x.progress!==undefined&&(!x.progress||typeof x.progress!=='object'||Array.isArray(x.progress)))throw new Error('Progress không hợp lệ.');
      if(x.drafts!==undefined&&(!x.drafts||typeof x.drafts!=='object'||Array.isArray(x.drafts)))throw new Error('Drafts không hợp lệ.');
      if(!confirm('Nhập và GỘP dữ liệu vào trình duyệt này? Các bài trùng mã sẽ được lấy từ file sao lưu. Nên xuất bản sao hiện tại trước.'))return;
      const mergeList=(a,b,key)=>[...new Map([...a,...b].map(x=>[x[key],x])).values()];
      const ns={progress:{...state.progress,...(x.progress||{})},drafts:{...state.drafts,...(x.drafts||{})},assignments:mergeList(state.assignments,x.assignments||[],'id'),customPacks:mergeList(state.customPacks,x.customPacks||[],'packId')};
      if(!store.set('aptis_progress_v3',ns.progress)||!store.set('aptis_drafts_v3',ns.drafts)||!store.set('aptis_assignments_v4',ns.assignments)||!store.set('aptis_custom_packs',ns.customPacks))throw new Error('Không đủ bộ nhớ cục bộ để nhập dữ liệu.');
      Object.assign(state,ns);window.APT_STUDY.importCache(x.translations);toast('Đã nhập và gộp sao lưu');render();
    }catch(e){alert('Không nhập được sao lưu: '+e.message)}
  }
  return {renderAssignments,openAssignment,editAssignment,deleteAssignment,renderCreator,creatorNew,creatorType,creatorSave,exportAssignments,exportBackup,importBackup};
};
