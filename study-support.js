/* APTIS V4.2 study aids. Existing English/teacher source is never rewritten.
   Machine translations are opt-in, third-party and best-effort only. */
window.APT_STUDY = (function(){
  'use strict';
  const CACHE_KEY='aptis_vi_cache_v42', VISIBLE_KEY='aptis_vi_visible_v42';
  const encoder=new TextEncoder();
  const e=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let cached={};try{const c=JSON.parse(localStorage.getItem(CACHE_KEY)||'{}');if(c&&typeof c==='object'&&!Array.isArray(c))cached=c;}catch{}
  let visible=localStorage.getItem(VISIBLE_KEY)==='true';
  let consent=false, entries=[], active=0;
  const bytes=s=>encoder.encode(s).length;
  function hash(text){let h=2166136261;for(let i=0;i<text.length;i++){h^=text.charCodeAt(i);h=Math.imul(h,16777619)}return (h>>>0).toString(16)+'-'+text.length;}
  function cacheGet(text){const x=cached[hash(text)];return x?.en===text?x.vi:null;}
  function cacheSet(text,vi){const id=hash(text);cached[id]={en:text,vi,at:Date.now()};const a=Object.entries(cached);if(a.length>220){a.sort((x,y)=>x[1].at-y[1].at);cached=Object.fromEntries(a.slice(-200));}try{localStorage.setItem(CACHE_KEY,JSON.stringify(cached));}catch{ /* Skip quota failure; retain current translation in memory */ }}
  function exportCache(){return cached;}
  function importCache(newData){if(!newData||typeof newData!=='object'||Array.isArray(newData))return;for(const [k,v] of Object.entries(newData).slice(0,250)){if(v?.en&&typeof v.vi==='string'&&k===hash(v.en)&&v.en.length<12000&&v.vi.length<22000)cacheSet(v.en,v.vi)}}
  function chunks(text){
    // MyMemory documents a 500-byte maximum for each query. Leave a margin.
    const max=460,parts=[];
    for(const line of String(text||'').split(/\n/)){
      if(!line.trim()){parts.push('');continue;}
      let piece='';
      const words=line.match(/\S+\s*/g)||[];
      for(let word of words){
        if(bytes(word)>max){
          if(piece.trim()){parts.push(piece.trim());piece=''}
          let cur='';for(const c of word){if(bytes(cur+c)>max){parts.push(cur);cur=''}cur+=c;}if(cur)parts.push(cur.trim());
        } else if(bytes(piece+word)>max){if(piece.trim())parts.push(piece.trim());piece=word;}else piece+=word;
      }
      if(piece.trim())parts.push(piece.trim());
      parts.push('\n');
    }
    if(parts[parts.length-1]==='\n')parts.pop();
    return parts;
  }
  function decodeEntities(s){const area=document.createElement('textarea');area.innerHTML=s;return area.value;}
  async function apiChunk(text){
    const q=new URLSearchParams({q:text,langpair:'en|vi'});
    const controller=new AbortController();const t=setTimeout(()=>controller.abort(),14000);
    try{
      const response=await fetch('https://api.mymemory.translated.net/get?'+q.toString(),{signal:controller.signal,mode:'cors',credentials:'omit',cache:'no-store'});
      if(!response.ok)throw new Error('Máy chủ dịch trả lỗi HTTP '+response.status);
      const data=await response.json();
      if(Number(data.responseStatus)!==200||!data.responseData?.translatedText)throw new Error(data.responseDetails||'Dịch máy không trả kết quả');
      const vi=decodeEntities(String(data.responseData.translatedText)).trim();
      if(!vi||/^(?:QUERY LENGTH LIMIT EXCEEDED|MYMEMORY WARNING)/i.test(vi))throw new Error('Dịch máy đã hết hạn mức hoặc không trả lời');
      return vi;
    }finally{clearTimeout(t)}
  }
  function askConsent(){
    if(consent)return true;
    const yes=confirm('DỊCH TRỰC TUYẾN (MyMemory)\n\nNội dung tiếng Anh được gửi đến dịch vụ bên thứ ba để tạo bản dịch tiếng Việt. Dịch máy có thể sai và dịch vụ miễn phí có giới hạn/ngưng hoạt động.\n\nKhông gửi đề/bài riêng tư nếu không được phép. Bản dịch đã có vẫn dùng được khi ngoại tuyến.\n\nĐồng ý gửi nội dung để dịch trong phiên này?');
    if(yes)consent=true;return yes;
  }
  async function translate(text,{skipConsent=false}={}){
    text=String(text||'').trim();if(!text)return '';
    const old=cacheGet(text);if(old)return old;
    if(bytes(text)>6100)throw new Error('Đoạn quá dài (>6.100 byte). Hãy dịch từng đoạn ngắn để tránh vượt hạn mức miễn phí.');
    if(!skipConsent&&!askConsent())throw new Error('Chưa cho phép gửi văn bản đến dịch vụ dịch máy.');
    if(!navigator.onLine)throw new Error('Thiết bị đang ngoại tuyến; hãy nhập bản dịch thủ công hoặc kết nối Internet.');
    const out=[];for(const chunk of chunks(text)){
      if(chunk==='\n'){out.push('\n');continue}
      const prev=cacheGet(chunk);const vi=prev||await apiChunk(chunk);
      if(!prev)cacheSet(chunk,vi);
      out.push(vi);
    }
    const translated=out.join(' ').replace(/\s*\n\s*/g,'\n').replace(/\s+([.,;!?])/g,'$1').trim();
    cacheSet(text,translated);return translated;
  }
  function guideData(sec,item){
    const type=sec.type||'generic',part=sec.part||'',answer=item?.answer;
    const general=['Đọc đề 2 lần; gạch chân động từ yêu cầu và từ khóa quan trọng.','Trả lời đúng câu hỏi trước, sau đó thêm lý do và ví dụ cụ thể.','Dùng từ nối đơn giản, tự kiểm tra thì của động từ, chủ ngữ và lỗi chính tả.'];
    let steps=[],frame=[];
    if(type.startsWith('speaking')){
      if(/part\s*4/i.test(part)||((item?.questions||[]).length>=3)){
        steps=['1 phút chuẩn bị: ghi WHEN–WHERE–WHO–PROBLEM–ACTION–RESULT; đừng viết nguyên bài.','Câu 1: kể một trải nghiệm có bối cảnh, việc đã làm, khó khăn, kết quả và cảm xúc.','Câu 2: trả lời quan điểm trực tiếp, nêu 1–2 lý do và ví dụ ngắn.','Câu 3: mở rộng nhận xét sang mọi người/xã hội, so sánh hai góc nhìn nếu phù hợp.','Trong 2 phút, dành thời gian cho cả 3 câu; không đọc thuộc bài nếu câu hỏi khác trọng tâm.'];
        frame=["Today, I'd like to talk about a time when...","At first, ..., so we decided to...","In my opinion, ... because ...","For example, ... / As a result, ...","Looking back, I learned that ..."];
      }else{
        steps=['Nêu ý chính ngay ở câu đầu; không vòng vo.','Mô tả 2 chi tiết cụ thể theo đề (người, nơi chốn, hành động hoặc hình ảnh).','Thêm lý do hoặc cảm nhận cá nhân; nói theo thời gian của phần thi.'];
        frame=['I would say that ...','One reason is that ...','For example, ...','Overall, I think ...'];
      }
    }else if(type==='writing_short'){
      steps=['Xác định người đọc và yêu cầu chính.','Trả lời trực tiếp bằng 2–3 câu rõ ý, thêm một chi tiết cụ thể.','Kiểm tra số từ theo yêu cầu bài (không kéo dài không cần thiết).'];
      frame=['I enjoy ... because ...','In my free time, I usually ...','For example, last weekend I ...'];
    }else if(type==='writing_chat'){
      steps=['Cần trả lời đủ 3 câu chat, mỗi câu đúng trọng tâm người hỏi.','Mỗi câu dùng: lời đáp ngắn → quan điểm/kinh nghiệm → lý do → ví dụ.','Viết thân mật, đúng thì, đủ số từ yêu cầu mỗi câu; không sao chép cùng một đoạn cho cả ba.'];
      frame=['That is an interesting question.','Personally, I think ... because ...','For example, ...','What about you?'];
    }else if(type==='writing_dual_email'){
      steps=['Đọc tình huống và xác định vấn đề/đề xuất, đối tượng nhận email.','Email bạn bè (khoảng 40–50 từ): chào → nêu thông tin → cảm xúc/ý kiến → hỏi bạn.','Email trang trọng (khoảng 120–150 từ): mục đích → 2 đề xuất + lý do → lợi ích → kết thư lịch sự.','Kiểm tra lời chào, giọng văn, dấu câu, từ nối và độ dài của hai email riêng biệt.'];
      frame=['Hi ..., I just heard about ...','Personally, I think we should ...','Dear Club Manager, I am writing to ...','Firstly, I suggest ... because ...','I look forward to your reply.'];
    }else if(type==='reading_order'){
      steps=['Tìm câu mở đầu: thường giới thiệu chủ đề và ít nhắc điều chưa xuất hiện.','Ghép các từ tham chiếu (this/these/they/it) với danh từ ở câu trước.','Theo dõi chuỗi thời gian và từ nối (first, then, however, as a result).','Đọc lại toàn bộ sau khi sắp xếp để kiểm tra sự liên kết.'];
      frame=['This/These/It → điều được nhắc ở câu trước','However → tương phản','As a result → kết quả','Finally → kết thúc'];
    }else if(type==='reading_opinion'){
      steps=['Đọc từng người A–D và ghi một cụm mô tả quan điểm của họ.','Gạch từ khóa trong câu hỏi; tìm từ đồng nghĩa trong các đoạn.','Không chọn chỉ vì thấy một từ giống nhau; đối chiếu đúng ý/tình huống.','Kiểm tra lại các cặp dễ nhầm, rồi mới chấm.'];
      frame=['like/enjoy/prefer: sở thích','although/however: ý trái chiều','because/due to: nguyên nhân'];
    }else if(type==='reading_quiz'||type==='reading_headings'){
      steps=['Đọc câu hỏi/heading trước; xác định thông tin cần tìm.','Quét đoạn văn để tìm từ khóa, từ đồng nghĩa và câu chứng minh.','Loại phương án không có chứng cứ, nói quá mức hoặc trái nội dung.','Chỉ xem lời giải/đáp án sau khi đã tự chọn; câu chưa xác minh không nên học thuộc key.'];
      frame=['According to the text ...','The writer suggests that ...','Evidence: look for a matching idea, not only matching words.'];
    }else if(type.startsWith('listening')){
      steps=['Đọc nhanh câu hỏi trước khi nghe; đoán loại thông tin cần bắt.','Lần 1: nghe ý chính; lần 2: chú ý số liệu, đối lập, phủ định và từ đồng nghĩa.','Không suy đoán khi thiếu audio; đối chiếu transcript chỉ sau khi đã thử nghe.'];
      frame=['however/but: đổi ý','not/never: phủ định','finally/actually: kết luận hoặc sửa thông tin'];
    }else steps=general;
    const custom=String(item?.guide_vi||sec?.guide_vi||'').trim();
    return {steps,frame,custom};
  }
  function renderGuide(sec,item){
    const data=guideData(sec,item);return `<details class="study-guide" id="studyGuide"><summary>💡 Gợi ý làm bài chi tiết (không phải đáp án)</summary>
      ${data.custom?`<div class="study-custom-guide"><b>Gợi ý riêng cho bài này:</b><div>${e(data.custom)}</div></div>`:''}
      <b>Cách triển khai:</b><ol>${data.steps.map(x=>`<li>${e(x)}</li>`).join('')}</ol>
      ${data.frame.length?`<b>Cụm câu / dấu hiệu nên nhớ:</b><ul>${data.frame.map(x=>`<li>${e(x)}</li>`).join('')}</ul>`:''}
      <p class="muted small">Đây là chiến lược ôn tập B2. Gợi ý tự động không thay thế lời giảng hoặc đáp án chính thức của giáo viên.</p></details>`;
  }
  function setVisible(next){visible=!!next;try{localStorage.setItem(VISIBLE_KEY,String(visible))}catch{}for(const x of entries){x.force=null;apply(x)}document.dispatchEvent(new CustomEvent('aptis-translation-visibility',{detail:{visible}}));document.querySelectorAll('.translation').forEach(el=>{el.hidden=!visible||!!el.closest('.sample,.orderitem,.person,.qrow');});}
  function apply(x){
    const translation=x.vi||cacheGet(x.en);const show=x.force===null?visible:x.force;
    if(translation)x.output.textContent=translation;else x.output.textContent='';
    x.output.hidden=!(show&&translation);
    x.output.dataset.source=x.vi?'Bản dịch có sẵn':'Dịch máy (tham khảo)';
    x.button.textContent=translation?(show?'Ẩn VI':'Hiện VI'):'Dịch VI';
    x.button.setAttribute('aria-expanded',String(show&&!!translation));
  }
  function register(el,en,vi='',{append=false,label=''}={}){
    if(!el||!en||!String(en).trim()||el.dataset.studyRegistered)return;
    const tool=document.createElement('span');tool.className='study-unit'+(append?' study-inline':'');
    const btn=document.createElement('button');btn.type='button';btn.className='btn study-trans-btn';btn.textContent='Dịch VI';btn.setAttribute('aria-label','Dịch sang tiếng Việt '+(label||'đoạn này'));
    const out=document.createElement('span');out.className='study-translation';out.hidden=true;out.lang='vi';
    tool.append(btn,out);
    el.dataset.studyRegistered='1';
    el.append(tool);
    const x={en:String(en).trim(),vi:String(vi||'').trim(),button:btn,output:out,force:null};entries.push(x);apply(x);
    btn.addEventListener('click',async ev=>{
      ev.preventDefault();ev.stopPropagation();
      const known=x.vi||cacheGet(x.en);
      if(known){x.force=out.hidden;apply(x);return}
      btn.disabled=true;btn.textContent='Đang dịch...';
      try{x.vi='';const vi=await translate(x.en);x.force=true;apply(x);out.textContent=vi;}
      catch(err){out.textContent='Chưa dịch được: '+(err.message||err);out.hidden=false;btn.textContent='Thử lại';}
      finally{btn.disabled=false}
    });
  }
  function enhance(sec,item){
    const root=document.querySelector('#exercise > .card');if(!root)return;
    entries=[];active++;
    const head=root.querySelector('.exercisehead');
    const bar=document.createElement('div');bar.className='study-toolbar';
    bar.innerHTML=`<button class="btn small" type="button" id="studyShow">👁 Hiện tiếng Việt</button><button class="btn small" type="button" id="studyHide">Ẩn tiếng Việt</button><button class="btn primary small" type="button" id="studyTranslateAll">🌐 Dịch toàn bài</button><span class="study-status" id="studyStatus" aria-live="polite"></span>`;
    if(head)head.insertAdjacentElement('afterend',bar);else root.prepend(bar);
    bar.insertAdjacentHTML('afterend',renderGuide(sec,item));
    const add=(el,text,vi,append=false)=>register(el,text,vi,{append});
    const first=selector=>root.querySelector(selector);
    const each=(selector,fn)=>root.querySelectorAll(selector).forEach(fn);
    const st=sec.type;
    if(st==='reading_order'){
      add(first('.prompt'),item.intro_en,item.intro_vi);
      each('.orderitem',node=>{
      const target=node.children[1];const idx=(item.sentences_en||[]).findIndex(s=>target?.textContent?.startsWith(s));
      if(idx>=0)add(target,item.sentences_en[idx],item.sentences_vi?.[idx],true);
      });
    }
    else if(st==='reading_opinion'){
      each('.person',node=>{const p=node.querySelector('b')?.textContent?.trim(),rec=item.people?.[p];if(rec)add(node,rec.en,rec.vi)});
      each('.qrow', (node,i)=>{const q=item.questions?.[i];if(q)add(node.querySelector('div'),q.en,q.vi)});
    }
    else if(st.startsWith('speaking')){
      const qs=root.querySelectorAll('.speakingQuestions li');
      if(qs.length){qs.forEach((el,i)=>{
        const q=el.firstChild?.textContent||el.textContent;add(el,q,item.questions_vi?.[i],true);
      })}else add(first('.prompt'),item.prompt||item.title_en,item.prompt_vi);
      const sampleList=root.querySelectorAll('#sampleBox .sample');
      sampleList.forEach((el,i)=>{
        if(el.classList.contains('translation'))return;
        const english=el.textContent.replace(/^(?:Bài mẫu \(câu 1\)|Câu [23])\s*/, '').trim();
        let vi='';if(i===0)vi=item.sample_vi;else if(i===1)vi=item.sampleAnswers_vi?.[1];else if(i===2)vi=item.sampleAnswers_vi?.[2];
        if(english)add(el,english,vi);
      });
      if(item.teacherSample)add(first('#sampleBox details .sample'),item.teacherSample,item.teacherSample_vi);
    }
    else if(st==='writing_short'){
      add(first('.prompt'),item.prompt,item.prompt_vi);add(first('#sampleBox'),item.sample,item.sample_vi);
    }
    else if(st==='writing_dual_email'){
      add(first('.prompt'),item.scenario,item.scenario_vi);
      add(first('#friendSample'),item.informalSample,item.informalSample_vi);
      add(first('#managerSample'),item.formalSample,item.formalSample_vi);
    }
    else if(st==='writing_chat'){
      add(first('.card > p.muted'),item.instructions,item.instructions_vi);
      each('.chatPrompt',(node,i)=>{const q=item.questions?.[i];if(!q)return;add(node.querySelector('.prompt p'),q.prompt||q.en,q.prompt_vi||q.vi);add(node.querySelector('.sample'),q.sample,q.sample_vi)});
    }
    else if(st==='reading_quiz'||st==='listening_quiz'){
      const paragraphs=root.querySelectorAll('.readingPassage .reading-paragraph');
      if(paragraphs.length){
        const original=String(item.passage||'').split(/\n\s*\n|\n/).map(x=>x.trim()).filter(Boolean);
        const translations=String(item.passage_vi||'').split(/\n\s*\n|\n/).map(x=>x.trim()).filter(Boolean);
        paragraphs.forEach((el,i)=>add(el,original[i],original.length===translations.length?translations[i]:'',true));
      }else add(first('.readingPassage'),item.passage,item.passage_vi);
      add(first('details .sample'),item.transcript,item.transcript_vi);
      each('.quizQuestion',(el,i)=>{const q=item.questions?.[i];if(!q)return;
        add(el.querySelector('legend'),q.prompt||q.question,q.prompt_vi||q.vi,true);
        el.querySelectorAll('.quizOption span').forEach((option,j)=>add(option,q.options?.[j],q.options_vi?.[j],true));
      });
    }
    else if(st==='reading_headings'){
      each('.person',(node,i)=>add(node,item.paragraphs?.[i],item.paragraphs_vi?.[i]));
      // Headings are in the selects: translate the original heading list as one optional reference.
      if((item.headings||[]).length){const el=document.createElement('div');el.className='study-headings';el.textContent='Headings: '+item.headings.join(' | ');bar.insertAdjacentElement('afterend',el);add(el,item.headings.join(' | '),(item.headings_vi||[]).join(' | '));}
    }
    else if(st==='listening_mcq'){
      add(first('.prompt'),item.question,item.question_vi);
      each('.person',(node,i)=>add(node,item.options?.[i],item.options_vi?.[i]));add(first('details .sample'),item.transcript,item.transcript_vi);
    }
    else if(st==='listening_speaker_match'){
      each('.qrow',(node,i)=>add(node.querySelector('div'),item.statements?.[i]?.text,item.statements?.[i]?.vi));
    }
    else if(st==='listening_two_answers'){
      each('.person',(node,i)=>add(node,item.options?.[i],item.options_vi?.[i]));
    }
    else if(st==='external_iframe'){
      const note=document.createElement('p');note.className='muted small';note.textContent='Nội dung bên trong trang nghe bên ngoài không thể được dịch trực tiếp từ ứng dụng này. Hãy mở trang nguồn để sử dụng tính năng dịch của trình duyệt.';bar.after(note);
    }
    root.querySelectorAll('.translation').forEach(el=>{
      const duplicate=!!el.closest('.sample,.orderitem,.person,.qrow');
      el.hidden=duplicate||!visible;
    });
    bar.querySelector('#studyShow').onclick=()=>setVisible(true);
    bar.querySelector('#studyHide').onclick=()=>setVisible(false);
    bar.querySelector('#studyTranslateAll').onclick=async()=>{
      const btn=bar.querySelector('#studyTranslateAll'),status=bar.querySelector('#studyStatus');setVisible(true);
      const missing=entries.filter(x=>!x.vi&&!cacheGet(x.en));
      if(!missing.length){status.textContent='Đã hiển thị các bản dịch đang có.';return}
      if(!askConsent()){status.textContent='Chưa cho phép dịch trực tuyến.';return}
      btn.disabled=true;let done=0,failed=0,used=0;const budget=5100;
      for(const x of missing){
        if(used+bytes(x.en)>budget)break;
        used+=bytes(x.en);status.textContent=`Đang dịch ${done+1}/${missing.length} đoạn...`;
        try{await translate(x.en,{skipConsent:true});done++;apply(x)}catch(err){failed++;x.output.textContent=err.message||'Lỗi dịch';x.output.hidden=false;if(failed>1)break}
      }
      btn.disabled=false;
      const left=entries.filter(x=>!x.vi&&!cacheGet(x.en)).length;
      status.textContent=`Đã dịch ${done} đoạn${failed?', lỗi '+failed:''}${left?', còn '+left+' đoạn chưa dịch (hãy nhấn “Dịch VI” từng đoạn)':''}.`;
    };
  }
  async function translateCreatorField(name,value,skipConsent=false){
    if(!['quiz','opinions','sentences'].includes(name))return translate(value,{skipConsent});
    const lines=String(value||'').split('\n');
    const translated=[];
    for(const original of lines){
      const trimmed=original.trim();
      if(!trimmed||trimmed==='---'){translated.push(original);continue}
      if(name==='quiz'){
        const m=original.match(/^(\s*(?:Q|Question|Câu|EXPLAIN|EXPLANATION|GIẢI THÍCH)\s*:\s*|\s*[A-F][).:]\s*)(.*)$/i);
        if(!m){translated.push(original);continue}
        translated.push(m[1]+(m[2].trim()?await translate(m[2],{skipConsent}):''));continue;
      }
      if(name==='opinions'){
        const split=original.lastIndexOf('|');
        if(split<0){translated.push(original);continue}
        translated.push((await translate(original.slice(0,split).trim(),{skipConsent}))+' | '+original.slice(split+1).trim());continue;
      }
      translated.push(await translate(original,{skipConsent}));
    }
    return translated.join('\n');
  }
  function attachCreator(form){
    form.querySelectorAll('[data-study-en]').forEach(btn=>btn.addEventListener('click',async()=>{
      const en=form.elements.namedItem(btn.dataset.studyEn),vi=form.elements.namedItem(btn.dataset.studyVi);
      if(!en||!vi||!en.value.trim()){alert('Cần nhập nội dung tiếng Anh trước khi dịch.');return}
      if(vi.value.trim()&&!confirm('Ô tiếng Việt đã có nội dung. Ghi đè bằng bản dịch máy?'))return;
      btn.disabled=true;btn.textContent='Đang dịch...';
      try{vi.value=await translateCreatorField(btn.dataset.studyEn,en.value);vi.dispatchEvent(new Event('input',{bubbles:true}));}
      catch(err){alert('Không dịch được: '+err.message)}finally{btn.disabled=false;btn.textContent='🌐 Dịch tự động'}
    }));
    const auto=form.querySelector('#studyAutoFillForm');if(auto)auto.onclick=async()=>{
      const list=[...form.querySelectorAll('[data-study-en]')].filter(btn=>{
        const en=form.elements.namedItem(btn.dataset.studyEn),vi=form.elements.namedItem(btn.dataset.studyVi);
        return en?.value.trim()&&!vi?.value.trim();
      });
      const status=form.querySelector('#studyCreatorStatus');if(!list.length){status.textContent='Các ô tiếng Việt đã có nội dung hoặc chưa nhập tiếng Anh.';return}
      if(!askConsent()){status.textContent='Chưa cho phép dịch trực tuyến.';return}
      auto.disabled=true;let done=0,total=0;for(const btn of list){const en=form.elements.namedItem(btn.dataset.studyEn),vi=form.elements.namedItem(btn.dataset.studyVi);if(total+bytes(en.value)>5000)break;total+=bytes(en.value);status.textContent=`Đang dịch ${done+1}/${list.length} mục...`;try{vi.value=await translateCreatorField(btn.dataset.studyEn,en.value,true);done++;}catch(err){status.textContent='Dịch dừng ở mục '+btn.dataset.studyEn+': '+err.message;break}}
      status.textContent=`Đã dịch ${done}/${list.length} mục. Hãy đọc và sửa bản dịch máy nếu cần.`;auto.disabled=false;
    };
  }
  async function enrichSection(section,budget=4300){
    let used=0,done=0,skipped=0;
    const itemPairs=(o,keys)=>keys.map(k=>[o,k,k+'_vi']);
    for(const item of section.items||[]){
      const pairs=itemPairs(item,['prompt','sample','scenario','informalSample','formalSample','passage','transcript','instructions']);
      if(item.intro_en&&!item.intro_vi)pairs.push([item,'intro_en','intro_vi']);
      for(const [o,k,vkey] of pairs){if(!o[k]||o[vkey])continue;if(used+bytes(o[k])>budget){skipped++;continue}used+=bytes(o[k]);try{o[vkey]=await translate(o[k],{skipConsent:true});done++}catch{skipped++;}}
      const arrayFields=[['questions','prompt'],['questions','en'],['questions','sample']];
      for(const [collection,field] of arrayFields)for(const q of item[collection]||[]){
        if(typeof q!=='object'||!q[field]||q[field+'_vi']||q.vi)continue;
        if(used+bytes(q[field])>budget){skipped++;continue}used+=bytes(q[field]);try{q[field+'_vi']=await translate(q[field],{skipConsent:true});done++}catch{skipped++}
      }
      for(const question of item.questions||[]){
        if(typeof question!=='object'||!Array.isArray(question.options)||question.options_vi?.length)continue;
        question.options_vi=[];
        for(const option of question.options){
          if(used+bytes(option)>budget){question.options_vi.push('');skipped++;continue}
          used+=bytes(option);try{question.options_vi.push(await translate(option,{skipConsent:true}));done++}catch{question.options_vi.push('');skipped++}
        }
      }
      if(Array.isArray(item.questions)&&typeof item.questions[0]==='string'&&!item.questions_vi){
        item.questions_vi=[];for(const q of item.questions){if(used+bytes(q)>budget){item.questions_vi.push('');skipped++;continue}used+=bytes(q);try{item.questions_vi.push(await translate(q,{skipConsent:true}));done++}catch{item.questions_vi.push('');skipped++}}
      }
      if(item.people)for(const o of Object.values(item.people))if(o?.en&&!o.vi){
        if(used+bytes(o.en)>budget){skipped++;continue}
        used+=bytes(o.en);try{o.vi=await translate(o.en,{skipConsent:true});done++}catch{skipped++}
      }
      if(Array.isArray(item.sampleAnswers)&&!Array.isArray(item.sampleAnswers_vi)){
        item.sampleAnswers_vi=[];for(const answer of item.sampleAnswers){
          if(!answer){item.sampleAnswers_vi.push('');continue}
          if(used+bytes(answer)>budget){item.sampleAnswers_vi.push('');skipped++;continue}
          used+=bytes(answer);try{item.sampleAnswers_vi.push(await translate(answer,{skipConsent:true}));done++}catch{item.sampleAnswers_vi.push('');skipped++}
        }
      }
      if(Array.isArray(item.sentences_en)&&!item.sentences_vi){item.sentences_vi=[];for(const sentence of item.sentences_en){if(used+bytes(sentence)>budget){item.sentences_vi.push('');skipped++;continue}used+=bytes(sentence);try{item.sentences_vi.push(await translate(sentence,{skipConsent:true}));done++}catch{item.sentences_vi.push('');skipped++}}}
      if(!item.guide_vi)item.guide_vi='Gợi ý được tạo theo dạng bài; hãy mở mục “Gợi ý làm bài chi tiết” khi luyện.';
    }
    return {done,skipped};
  }
  return {enhance,setVisible,get visible(){return visible},translate,askConsent,attachCreator,guideData,exportCache,importCache,enrichSection};
})();
