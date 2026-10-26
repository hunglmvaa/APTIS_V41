
(()=> {
const BUILTIN = Array.isArray(window.APTIS_BUILTIN_PACKS) ? window.APTIS_BUILTIN_PACKS : [];
const EXTRA = Array.isArray(window.APTIS_EXTRA_PACKS) ? window.APTIS_EXTRA_PACKS : [];
const TEACHER = Array.isArray(window.APTIS_TEACHER_PACKS) ? window.APTIS_TEACHER_PACKS : [];
const SUB=window.APTIS_SUBMISSION;
const SUPPORTED_TYPES = [
  'external_iframe','reading_order','reading_opinion','speaking_prompt',
  'writing_short','writing_dual_email',
  'listening_mcq','listening_speaker_match','listening_two_answers',
  'reading_headings','speaking_picture','speaking_compare',
  'reading_quiz','listening_quiz','writing_chat'
];
const SKILLS = ['listening','reading','speaking','writing','grammar'];
const LABEL = {home:'Tổng quan',listening:'Listening',reading:'Reading',speaking:'Speaking',writing:'Writing',grammar:'Grammar',assignments:'Bài thầy giao',submission:'Xuất bài nộp',creator:'Tạo bài tập',data:'Dữ liệu & Sao lưu'};
const $=(s)=>document.querySelector(s);
const esc=(s)=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const safeUrl=(input)=>{
  const u=String(input||'').trim();
  if(!u||/[\u0000-\u001F\u007F]/.test(u))return '';
  if(/^data:/i.test(u))return /^data:(?:image\/(?:png|jpeg|gif|webp)|audio\/(?:mpeg|mp3|wav|ogg|webm));base64,[A-Za-z0-9+/=]+$/i.test(u)?u:'';
  if(/^(?:javascript|vbscript|file|blob):/i.test(u))return '';
  try{
    const x=new URL(u,location.href);
    return ['https:','http:'].includes(x.protocol)?u:'';
  }catch{return ''}
};
const countWords=(s)=>String(s||'').trim()?String(s).trim().split(/\s+/).length:0;
const shuffle=(arr)=>{let a=[...arr];for(let i=a.length-1;i>0;i--){let j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};

const store = {
  get(k,d){try{let v=localStorage.getItem(k);return v===null?d:JSON.parse(v)}catch{return d}},
  set(k,v){try{localStorage.setItem(k,JSON.stringify(v));return true}catch(e){console.warn('APTIS localStorage:',e);return false}}
};
const state = {
  page:'home', lang:store.get('aptis_lang','en'),
  customPacks:store.get('aptis_custom_packs',[]),
  progress:store.get('aptis_progress_v3',{}),
  drafts:store.get('aptis_drafts_v3',{}),
  assignments:store.get('aptis_assignments_v4',[]), creatorEditing:null, creatorDraft:{type:'speaking4',part:'Part 4'}, variantSelection:{}, recordToken:0, profile:store.get('aptis_submission_profile_v41',{name:'',className:'',teacher:''}), currentAudioKey:null,
  idx:{}, orderState:{}, opinionState:{}, timer:null, recorder:null, mediaStream:null, recChunks:[], recUrl:null,pendingAudio:null
};
function localAssignmentPack(){return {packId:'local-assignments',title:'Bài tập tự tạo trên thiết bị',sections:Array.isArray(state.assignments)?state.assignments:[]}}
function packs(){return [...BUILTIN,...TEACHER,localAssignmentPack(),...EXTRA,...(Array.isArray(state.customPacks)?state.customPacks:[])]}
function sections(){
  const seen=new Set(),out=[];
  for(const p of packs())for(const s of (p.sections||[])){
    if(!s||!s.id||seen.has(s.id)||!Array.isArray(s.items))continue;
    seen.add(s.id);out.push({...s,_packId:p.packId,_packTitle:p.title});
  }
  return out;
}
function skillSections(skill){return sections().filter(s=>s.skill===skill)}
function sectionById(id){return sections().find(s=>s.id===id)}
function persist(){store.set('aptis_progress_v3',state.progress);store.set('aptis_drafts_v3',state.drafts)}
function toast(msg){let t=$('#toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),1700)}
function stopTimer(){if(state.timer){clearInterval(state.timer);state.timer=null}}
function stopTTS(){if('speechSynthesis'in window)speechSynthesis.cancel()}
function speak(text){stopTTS();if(!('speechSynthesis'in window))return;let u=new SpeechSynthesisUtterance(text);u.lang='en-GB';u.rate=.92;speechSynthesis.speak(u)}
function markDone(key,score=1,total=1){if(!total||total<0)return;let old=state.progress[key]||{attempts:0,best:0,total};old.attempts++;old.total=total;old.best=Math.max(old.best||0,score);old.last=score;old.updated=new Date().toISOString();state.progress[key]=old;persist();renderNav()}
function completion(){
  // Coverage (not test accuracy): count unique exercises attempted / all exercises.
  const keys=sections().flatMap(s=>(s.items||[]).map(i=>s.id+':'+i.id));
  if(!keys.length)return 0;
  const practiced=keys.filter(k=>state.progress[k]?.attempts>0).length;
  return Math.round(100*practiced/keys.length);
}
function itemIndex(sec){let n=(sec.items||[]).length||1;return Math.min(state.idx[sec.id]||0,n-1)}
function setIndex(sec,delta){let n=(sec.items||[]).length;if(!n)return;state.idx[sec.id]=(itemIndex(sec)+delta+n)%n;stopTimer();stopRecording(true);renderSkill(sec.skill)}
function navItem(sec){let i=itemIndex(sec),n=(sec.items||[]).length;return `<div class="row between" style="margin-top:14px"><button class="btn" onclick="APT.prev('${esc(sec.id)}')">← Trước</button><span class="counter">${n?i+1:0} / ${n}</span><button class="btn" onclick="APT.next('${esc(sec.id)}')">Tiếp →</button></div>`}
function trObj(o){if(!o)return'';return state.lang==='vi'?(o.vi??o.en??''):(o.en??o.vi??'')}
function renderNav(){
  let available=new Set(sections().map(s=>s.skill));
  let items=[['home',LABEL.home],['assignments',LABEL.assignments],['submission',LABEL.submission],...SKILLS.filter(s=>available.has(s)).map(s=>[s,LABEL[s]]),['creator',LABEL.creator],['data',LABEL.data]];
  $('#mainNav').innerHTML=items.map(([id,label])=>`<button class="navbtn ${state.page===id?'active':''}" data-page="${id}">${label}</button>`).join('');
}
function page(id){state.page=id;stopTimer();stopRecording(true);render()}
function render(){renderNav();if(state.page==='home')renderHome();else if(state.page==='assignments')Features.renderAssignments();else if(state.page==='creator')Features.renderCreator();else if(state.page==='submission')renderSubmission();else if(state.page==='data')renderData();else renderSkill(state.page)}
function renderHome(){
  const ss=sections(),counts={};ss.forEach(s=>counts[s.skill]=(counts[s.skill]||0)+(s.items||[]).length);
  const exercises=ss.filter(s=>s.teacherAssigned);
  $('#app').innerHTML=`
    <div class="grid">
      <section class="card span8 hero">
        <span class="pill ok">APTIS ESOL General · Mục tiêu B2</span>
        <h1>APTIS Practice Hub v4.1</h1>
        <p>Luyện các đề có sẵn và trực tiếp tạo bài tập thầy giao. Phần <b>Speaking Part 4</b> hiển thị đủ ba câu hỏi, đồng hồ chuẩn bị 1 phút, trả lời 2 phút và ghi âm.</p>
        <div class="row"><button class="btn primary" onclick="APT.page('assignments')">Bài thầy giao (${exercises.length})</button><button class="btn" onclick="APT.creatorNew()">+ Tạo bài tập</button><button class="btn" onclick="APT.page('speaking')">Luyện Speaking</button><button class="btn good" onclick="APT.page('submission')">Xuất bài nộp (.zip)</button></div>
        <div class="notice warn"><b>Lưu ý:</b> Bài mẫu / đáp án tự biên soạn được ghi rõ nguồn; ứng dụng không tự kết luận trình độ B2 từ số từ hoặc đánh dấu đã luyện.</div>
      </section>
      <section class="card span4">
        <h3>Tỉ lệ bài đã luyện</h3><div class="progressBig">${completion()}%</div>
        <p class="muted small">${Object.keys(state.progress).length} bài có kết quả / dấu đã luyện. Chưa phải điểm APTIS.</p>
        <button class="btn small" onclick="APT.exportBackup()">Sao lưu toàn bộ</button>
        <label class="btn small">Nhập sao lưu<input type="file" accept=".json,application/json" hidden onchange="APT.importBackup(this.files[0])"></label>
      </section>
      <section class="card span12"><h3>Kho bài hiện có</h3><div class="kpis">
        <div class="kpi"><b>${counts.listening||0}</b>Listening*</div><div class="kpi"><b>${counts.reading||0}</b>Reading</div>
        <div class="kpi"><b>${counts.speaking||0}</b>Speaking</div><div class="kpi"><b>${counts.writing||0}</b>Writing</div>
        <div class="kpi"><b>${counts.grammar||0}</b>Grammar bổ trợ</div>
      </div><p class="muted tiny">* Bộ Listening cũ có liên kết tới nguồn ngoài; để làm offline cần thêm audio hợp lệ.</p></section>
      <section class="card span6"><h3>Cách luyện theo giáo viên</h3><p>Chọn <b>Bài thầy giao</b> → mở bài → luyện / làm bài → xem mẫu → đánh dấu và tự sửa. Khi thầy giao đề mới: <b>Tạo bài tập</b> và dán nội dung.</p></section>
      <section class="card span6"><h3>Dữ liệu và GitHub</h3><p>Bài mới lưu bằng localStorage trên máy, không tự đồng bộ. Dùng <b>Dữ liệu & Sao lưu</b> để xuất tệp sao lưu hoặc <code>extra-packs.js</code> đưa bài mới vào repository.</p></section>
    </div>`;
}
function renderSkill(skill){
  let ss=skillSections(skill);
  if(!ss.length){$('#app').innerHTML=`<div class="card"><h2>${LABEL[skill]}</h2><p>Chưa có phần hoàn chỉnh.</p></div>`;return}
  let sid=store.get('aptis_active_'+skill,ss[0].id);
  let sec=ss.find(x=>x.id===sid)||ss[0];
  $('#app').innerHTML=`<div class="sectionbar">${ss.map(s=>`<button class="btn sectionbtn ${s.id===sec.id?'primary':''}" title="${esc(s.title)}" onclick="APT.section('${skill}','${esc(s.id)}')">${esc(s.part)}${s.teacherAssigned?` — ${esc(s.title)}`:''} <span class="tiny">(${(s.items||[]).length})</span></button>`).join('')}</div><div id="exercise"></div>`;
  renderSection(sec);
}
function renderSection(sec){
  if(!sec||!(sec.items||[]).length){$('#exercise').innerHTML='<div class="card"><div class="notice warn">Phần này chưa có bài tập hợp lệ.</div></div>';return}
  let fn=renderers[sec.type]||renderUnsupported;fn(sec);
}
function header(sec,item,titleExtra=''){
  let i=itemIndex(sec);
  return `<div class="exercisehead"><div><span class="pill ${sec.status==='complete'?'ok':'custom'}">${esc(sec.part||'Practice')}</span><h2>${esc(sec.title)}</h2>${sec.description?`<div class="muted small">${esc(sec.description)}</div>`:''}${sec.sourceLabel?`<div class="sourceNote">Nguồn: ${esc(sec.sourceLabel)}</div>`:''}${sec.dueDate?`<div class="sourceNote">Hạn nộp: ${esc(sec.dueDate)}</div>`:''}</div><div class="counter">${(sec.items||[]).length?i+1:0} / ${(sec.items||[]).length}</div></div>${titleExtra}`;
}
function showTranslation(o){if(!o)return'';let vi=o.vi||'';return state.lang==='vi'&&vi?`<div class="translation">${esc(vi)}</div>`:''}

// ---------- Reading Order ----------
function initOrder(sec,item){
  let k=sec.id+':'+item.id;
  if(!state.orderState[k]){
    let base=(item.sentences_en||[]).map((text,idx)=>({text,idx}));
    state.orderState[k]=shuffle(base);
  }
  return state.orderState[k];
}
function renderReadingOrder(sec){
  let item=sec.items[itemIndex(sec)], arr=initOrder(sec,item), k=sec.id+':'+item.id;
  $('#exercise').innerHTML=`<div class="card">${header(sec,item)}
  <div class="prompt"><b>${esc(item.intro_en||'')}</b>${state.lang==='vi'&&item.intro_vi?`<div class="translation">${esc(item.intro_vi)}</div>`:''}</div>
  <p class="muted small">Sắp xếp các câu bằng nút ↑ ↓. App trộn thứ tự mỗi lần Reset.</p>
  <div class="orderlist">${arr.map((x,pos)=>`<div class="orderitem"><div class="ordernum">${pos+1}</div><div>${esc(x.text)}${state.lang==='vi'&&item.sentences_vi?.[x.idx]?`<div class="translation">${esc(item.sentences_vi[x.idx])}</div>`:''}</div><div class="move"><button onclick="APT.moveOrder('${esc(sec.id)}','${esc(item.id)}',${pos},-1)">↑</button><button onclick="APT.moveOrder('${esc(sec.id)}','${esc(item.id)}',${pos},1)">↓</button></div></div>`).join('')}</div>
  <div class="row" style="margin-top:12px"><button class="btn primary" onclick="APT.checkOrder('${esc(sec.id)}','${esc(item.id)}')">Chấm</button><button class="btn" onclick="APT.resetOrder('${esc(sec.id)}','${esc(item.id)}')">Trộn lại</button><span id="orderResult"></span></div>
  ${navItem(sec)}</div>`;
}
function moveOrder(secId,itemId,pos,delta){let k=secId+':'+itemId,a=state.orderState[k],j=pos+delta;if(!a||j<0||j>=a.length)return;[a[pos],a[j]]=[a[j],a[pos]];renderSection(sectionById(secId))}
function checkOrder(secId,itemId){let k=secId+':'+itemId,a=state.orderState[k]||[];let correct=a.filter((x,i)=>x.idx===i).length;let el=$('#orderResult');el.className='result '+(correct===a.length?'ok':'bad');el.textContent=`${correct}/${a.length} vị trí đúng`;markDone(k,correct,a.length)}
function resetOrder(secId,itemId){delete state.orderState[secId+':'+itemId];renderSection(sectionById(secId))}

// ---------- Reading Opinion ----------
function renderReadingOpinion(sec){
  let item=sec.items[itemIndex(sec)], key=sec.id+':'+item.id, vals=state.opinionState[key]||{};
  let people=Object.entries(item.people||{});
  $('#exercise').innerHTML=`<div class="card">${header(sec,item)}
  <h3>${esc(item.title_en||'')}</h3>${state.lang==='vi'&&item.title_vi?`<div class="translation">${esc(item.title_vi)}</div>`:''}
  <details><summary><b>Đọc 4 quan điểm A–D</b></summary>${people.map(([p,o])=>`<div class="person"><b>${p}</b>${esc(o.en||'')}${state.lang==='vi'&&o.vi?`<div class="translation">${esc(o.vi)}</div>`:''}</div>`).join('')}</details>
  <div style="margin-top:10px">${(item.questions||[]).map((q,qi)=>`<div class="qrow"><div><b>${qi+1}.</b> ${esc(q.en)}${state.lang==='vi'&&q.vi?`<div class="translation">${esc(q.vi)}</div>`:''}</div><select onchange="APT.setOpinion('${esc(key)}',${qi},this.value)"><option value="">—</option>${['A','B','C','D'].map(v=>`<option ${vals[qi]===v?'selected':''}>${v}</option>`).join('')}</select></div>`).join('')}</div>
  <div class="row"><button class="btn primary" onclick="APT.checkOpinion('${esc(sec.id)}','${esc(item.id)}')">Chấm</button><span id="opResult"></span></div>${navItem(sec)}</div>`;
}
function setOpinion(key,qi,v){state.opinionState[key]=state.opinionState[key]||{};state.opinionState[key][qi]=v}
function checkOpinion(secId,itemId){let sec=sectionById(secId),item=sec.items.find(x=>x.id===itemId),key=secId+':'+itemId,vals=state.opinionState[key]||{};let c=(item.questions||[]).filter((q,i)=>vals[i]===q.answer).length;let n=item.questions.length;let el=$('#opResult');el.className='result '+(c===n?'ok':'bad');el.textContent=`${c}/${n} đúng`;markDone(key,c,n)}

// ---------- Speaking ----------
function speakingQuestions(sec,item){
  const qs=Array.isArray(item.questions)&&item.questions.length?item.questions.map(q=>typeof q==='string'?q:(q.prompt||'')):[item.prompt||item.title_en||item.title_vi||''];
  const k=sec.id+':'+item.id, v=state.variantSelection[k]||0;
  if((item.variants||[]).length&&state.variantSelection[k]!==undefined){
    qs[0]='Tell me about a time when you '+item.variants[Math.min(v,item.variants.length-1)].replace(/^(?:a time when|you )/i,'').replace(/[.?!]+$/,'')+'.';
  }
  return qs;
}
function selectVariant(secId,itemId,variant){
  const sec=sectionById(secId),item=sec?.items?.find(i=>i.id===itemId);if(!item)return;
  state.variantSelection[secId+':'+itemId]=Math.max(0,Math.min(Number(variant)||0,(item.variants||[]).length-1));
  stopRecording(true);renderSection(sec);
}
function ttsCurrent(secId,itemId){
  const sec=sectionById(secId),item=sec?.items?.find(i=>i.id===itemId);
  if(item)speak(speakingQuestions(sec,item).join(' '));
}
function speakingCommon(sec,item,imageHtml=''){
  let settings=sec.settings||{},prep=settings.prepSeconds??5,speakSec=settings.speakSeconds??30;
  let phrases=item.phrases||[],qs=speakingQuestions(sec,item),k='notes:'+sec.id+':'+item.id;
  let sample2=item.sampleAnswers?.[1]||'',sample3=item.sampleAnswers?.[2]||'',v=state.variantSelection[sec.id+':'+item.id];
  let variantUI=(item.variants||[]).length?`<div class="variantPanel"><label for="variantChoice" class="small"><b>Chọn một dạng đề gộp</b></label><select id="variantChoice" onchange="APT.selectVariant('${esc(sec.id)}','${esc(item.id)}',this.value)"><option value="" ${v===undefined?'selected':''}>Đề gốc</option>${item.variants.map((x,i)=>`<option value="${i}" ${v===i?'selected':''}>${esc(x)}</option>`).join('')}</select><p class="small muted">Chỉ thay trọng tâm kể chuyện; câu 2 và 3 phải trả lời theo câu hỏi thực tế.</p></div>`:'';
  $('#exercise').innerHTML=`<div class="card">${header(sec,item)}${imageHtml}${variantUI}
    <div class="prompt"><div class="row between"><b>Câu hỏi cần trả lời</b><button class="btn small" onclick="APT.ttsCurrent('${esc(sec.id)}','${esc(item.id)}')">🔊 Đọc đề</button></div><ol class="speakingQuestions">${qs.map(x=>`<li>${esc(x)}</li>`).join('')}</ol>${item.title_vi?`<div class="translation">${esc(item.title_vi)}</div>`:''}</div>
    <div class="timerbox"><span class="timer" id="sTimer">00:00</span><button class="btn" onclick="APT.startTimer(${prep},'Chuẩn bị')">Chuẩn bị ${prep}s</button><button class="btn primary" onclick="APT.startTimer(${speakSec},'Nói')">Nói ${speakSec}s</button><button class="btn small" onclick="APT.stopTimer()">Dừng giờ</button></div>
    <div id="timerLabel" class="muted small" aria-live="polite"></div>
    <label class="formfield" style="margin-top:12px"><span>Ghi nhanh 5–7 từ khóa khi chuẩn bị</span><textarea rows="3" oninput="APT.saveDraft('${esc(k)}',this.value,null,0,999)" placeholder="when / where / who / problem / action / result...">${esc(state.drafts[k]||'')}</textarea></label>
    <label class="formfield"><span>Nội dung bài nói của anh (tự nhập nếu muốn gửi kèm; ứng dụng chưa tự chép lời)</span><textarea rows="5" oninput="APT.saveDraft('speech:${esc(sec.id)}:${esc(item.id)}',this.value,null,0,9999)" placeholder="Today, I'd like to talk about...">${esc(state.drafts['speech:'+sec.id+':'+item.id]||'')}</textarea></label>
    <div class="recordbox"><b>Ghi âm luyện nói</b><div class="row" style="margin-top:8px"><button class="btn primary" onclick="APT.startRecording()">🎙 Bắt đầu</button><button class="btn" onclick="APT.stopRecording(false)">■ Dừng</button><button class="btn" id="downloadRec" style="display:none">Tải bản ghi</button><label class="btn small">Đính kèm file âm thanh cũ<input type="file" accept="audio/*,.webm,.m4a,.mp3,.ogg" hidden onchange="APT.attachRecording(this.files[0]);this.value='' "></label></div><div id="recordStatus" class="muted small" style="margin-top:7px">Dùng HTTPS hoặc localhost; bản ghi mới được lưu riêng trong trình duyệt này. Không tự đồng bộ giữa các thiết bị. Kiểm tra bằng nút Nghe lại trước khi xuất.</div><div id="recordPlayback"></div></div>
    ${phrases.length?`<details style="margin-top:12px"><summary><b>Cụm nên nhớ</b></summary><div class="sample">${phrases.map(esc).join(' • ')}</div></details>`:''}
    <div class="row" style="margin-top:12px"><button class="btn good" onclick="APT.toggleSample('sampleBox')">Xem/ẩn bài mẫu</button><button class="btn" onclick="APT.markPractice('${esc(sec.id+':'+item.id)}')">Đánh dấu đã luyện</button><button class="btn" onclick="APT.exportAnswer('${esc(sec.id)}','${esc(item.id)}')">Tải ghi chú (.txt)</button><button class="btn primary" onclick="APT.exportSubmission('${esc(sec.id)}','${esc(item.id)}')">Xuất bài + ghi âm (.zip)</button></div>
    <div id="sampleBox" style="display:none"><div class="sample"><b>Bài mẫu (câu 1)</b>
${esc(item.sample||'(Chưa có bài mẫu)')}</div>${sample2?`<div class="sample"><b>Câu 2</b>
${esc(sample2)}</div>`:''}${sample3?`<div class="sample"><b>Câu 3</b>
${esc(sample3)}</div>`:''}${item.sample_vi?`<div class="translation sample"><b>Tiếng Việt</b>
${esc(item.sample_vi)}</div>`:''}${item.sampleSource?`<p class="sourceNote">${esc(item.sampleSource)}</p>`:''}${item.teacherSample?`<details><summary>Mở bài mẫu gốc của thầy (lưu riêng, không chỉnh sửa)</summary><div class="sample">${esc(item.teacherSample)}</div></details>`:''}</div>
    ${navItem(sec)}</div>`;
  state.currentAudioKey=sec.id+':'+item.id;
  loadSavedAudio(state.currentAudioKey);
}
function renderSpeakingPrompt(sec){let item=sec.items[itemIndex(sec)];speakingCommon(sec,item)}
function renderSpeakingPicture(sec){let item=sec.items[itemIndex(sec)],src=safeUrl(item.image);speakingCommon(sec,item,src?`<img class="imgbox" src="${esc(src)}" alt="Speaking picture">`:`<div class="notice warn">Ảnh chưa có/đường dẫn không hợp lệ.</div>`)}
function renderSpeakingCompare(sec){let item=sec.items[itemIndex(sec)],imgs=(item.images||[]).map(safeUrl).filter(Boolean);let h=imgs.length?`<div class="compareimgs">${imgs.map(x=>`<img src="${esc(x)}" alt="Speaking comparison">`).join('')}</div>`:`<div class="notice warn">Chưa có cặp ảnh.</div>`;speakingCommon(sec,item,h)}
function startTimer(seconds,label){
  stopTimer();let left=Math.max(0,Math.floor(Number(seconds)||0));const el=$('#timerLabel');if(el)el.textContent=label;
  const tick=()=>{const timer=$('#sTimer');if(!timer){stopTimer();return}timer.textContent=`${String(Math.floor(left/60)).padStart(2,'0')}:${String(left%60).padStart(2,'0')}`;if(left<=0){stopTimer();toast(label+' kết thúc');return}left--};
  tick();state.timer=setInterval(tick,1000);
}
function showRecordedAudio(key,blob,saved,updatedAt){
  if(state.currentAudioKey!==key||state.page!=='speaking')return;
  const pane=$('#recordPlayback'),btn=$('#downloadRec'),status=$('#recordStatus');
  if(!pane||!btn)return;
  if(state.recUrl)URL.revokeObjectURL(state.recUrl);
  state.recUrl=URL.createObjectURL(blob);
  const audio=document.createElement('audio');audio.controls=true;audio.src=state.recUrl;audio.preload='metadata';
  pane.replaceChildren(audio);btn.style.display='inline-block';
  btn.onclick=()=>SUB.downloadBlob('aptis-speaking-'+SUB.baseName(key)+'.'+SUB.extFor(blob.type),blob);
  if(status)status.textContent=saved?'Đã lưu bản ghi cho bài này trên thiết bị ('+new Date(updatedAt||Date.now()).toLocaleString('vi-VN')+'). Nghe lại rồi xuất ZIP để gửi thầy.':'Bản ghi chỉ còn trong phiên này; hãy tải xuống ngay. Trình duyệt chưa cho phép lưu lâu dài.';
}
async function loadSavedAudio(key){
  const pane=$('#recordPlayback'),btn=$('#downloadRec');
  if(state.recUrl){URL.revokeObjectURL(state.recUrl);state.recUrl=null}
  if(pane)pane.replaceChildren();if(btn)btn.style.display='none';
  const rec=await SUB.getAudio(key);
  if(state.currentAudioKey!==key||state.page!=='speaking'||state.recorder?.state==='recording')return;
  if(rec?.blob?.size)showRecordedAudio(key,rec.blob,true,rec.updatedAt);
}
async function attachRecording(file){
  if(!file)return;
  const key=state.currentAudioKey;
  if(!key||state.page!=='speaking')return;
  if(state.recorder?.state==='recording'){alert('Hãy dừng ghi âm hiện tại trước.');return}
  if(!(file.type.startsWith('audio/')||file.type==='video/webm'||/\.(webm|mp3|m4a|wav|ogg)$/i.test(file.name))){alert('Chọn tệp âm thanh mp3, m4a, webm, ogg hoặc wav.');return}
  if(file.size>SUB.MAX_AUDIO){alert('Âm thanh quá lớn (tối đa 80 MB).');return}
  const existing=await SUB.getAudio(key);
  if(existing&&!confirm('Thay bản ghi hiện có của bài này bằng tệp mới?'))return;
  try{const result=await SUB.saveAudio(key,file);if(state.currentAudioKey===key)showRecordedAudio(key,file,result.saved,result.record.updatedAt)}
  catch(e){alert('Không thêm được âm thanh: '+e.message)}
}
async function startRecording(){
  stopRecording(true);const token=++state.recordToken,key=state.currentAudioKey;
  if(!key||state.page!=='speaking')return;
  if(!navigator.mediaDevices?.getUserMedia||!window.MediaRecorder){toast('Trình duyệt không hỗ trợ ghi âm');return}
  try{
    const stream=await navigator.mediaDevices.getUserMedia({audio:true});
    if(token!==state.recordToken||key!==state.currentAudioKey||!$('#recordPlayback')){stream.getTracks().forEach(t=>t.stop());return}
    const mimes=['audio/mp4','audio/webm;codecs=opus','audio/webm','audio/ogg;codecs=opus'];
    const compatible=mimes.find(x=>MediaRecorder.isTypeSupported?.(x));
    const chunks=[],rec=compatible?new MediaRecorder(stream,{mimeType:compatible}):new MediaRecorder(stream);
    state.mediaStream=stream;state.recorder=rec;
    rec.ondataavailable=e=>{if(e.data.size)chunks.push(e.data)};
    let settled;state.pendingAudio=new Promise(resolve=>{settled=resolve});
    rec.onstop=async()=>{
      stream.getTracks().forEach(t=>t.stop());
      if(state.recorder===rec)state.recorder=null;
      if(rec._discard){settled();return}
      const blob=new Blob(chunks,{type:rec.mimeType||'audio/webm'});
      if(!blob.size){settled();return}
      try{
        const result=await SUB.saveAudio(key,blob);
        if(token===state.recordToken && key===state.currentAudioKey)showRecordedAudio(key,blob,result.saved,result.record.updatedAt);
      }catch(e){const status=$('#recordStatus');if(status)status.textContent='Lưu bản ghi thất bại: '+e.message}
      finally{settled()}
    };
    rec.onerror=()=>{settled();const status=$('#recordStatus');if(status)status.textContent='Ghi âm thất bại. Hãy thử lại và kiểm tra quyền micro.'};
    rec.start();const status=$('#recordStatus');if(status)status.textContent='Đang ghi âm... Nhấn Dừng, nghe lại và xuất ZIP.';
  }catch(e){state.pendingAudio=null;const status=$('#recordStatus');if(status)status.textContent='Không mở được micro. Kiểm tra quyền truy cập và HTTPS.'}
}
function stopRecording(discard){
  if(discard)state.recordToken++;
  const rec=state.recorder;
  if(rec&&rec.state!=='inactive')try{rec._discard=!!discard;rec.stop()}catch{}
  if(state.mediaStream)try{state.mediaStream.getTracks().forEach(t=>t.stop())}catch{}
  state.mediaStream=null;
  if(!discard){const status=$('#recordStatus');if(status)status.textContent='Đang xử lý bản ghi. Khi hiện trình phát âm thanh, anh có thể tải ZIP.'}
}

// ---------- Writing ----------
function draftKey(sec,item,suffix=''){return sec.id+':'+item.id+suffix}
function renderWritingShort(sec){
  let item=sec.items[itemIndex(sec)], k=draftKey(sec,item), draft=state.drafts[k]||'', words=countWords(draft);
  item.minWords=Number.isFinite(Number(item.minWords))?Number(item.minWords):0;item.maxWords=Number.isFinite(Number(item.maxWords))?Number(item.maxWords):999;
  let inRange=words>=item.minWords&&words<=item.maxWords;
  $('#exercise').innerHTML=`<div class="card">${header(sec,item)}
  ${item.category?`<span class="pill">${esc(item.category)}</span>`:''}
  <div class="prompt">${esc(item.prompt)}</div>
  <textarea rows="4" oninput="APT.saveDraft('${esc(k)}',this.value,'wc-${esc(item.id)}',${item.minWords},${item.maxWords})" placeholder="Write your answer...">${esc(draft)}</textarea>
  <div class="wordbar"><span>Target: ${item.minWords}–${item.maxWords} words</span><span id="wc-${esc(item.id)}" class="${inRange?'good':words>item.maxWords?'bad':''}">${words} words</span></div>
  <div class="row" style="margin-top:10px"><button class="btn good" onclick="APT.toggleSample('sampleBox')">Xem/ẩn bài mẫu</button><button class="btn" onclick="APT.clearDraft('${esc(k)}')">Xóa bài</button><button class="btn" onclick="APT.markPractice('${esc(sec.id+':'+item.id)}')">Đánh dấu đã luyện</button><button class="btn" onclick="APT.exportAnswer('${esc(sec.id)}','${esc(item.id)}')">Tải bài làm (.txt)</button><button class="btn primary" onclick="APT.exportSubmission('${esc(sec.id)}','${esc(item.id)}')">Xuất bài nộp (.zip)</button></div>
  <div id="sampleBox" class="sample" style="display:none">${esc(item.sample)}</div>${navItem(sec)}</div>`;
}
const TPL_PROPOSAL=`Informal: I just received an email from the [club] about [topic]. Personally, I think we should [idea 1]. Another idea is to [idea 2]. What do you think?

Formal: I am writing to share my thoughts on how the club can [goal]. Firstly, I suggest [idea 1]. This is because [reason]. Additionally, we could [idea 2]. By doing so, we can [benefit].`;
const TPL_PROBLEM=`Informal: I just received an email from the [club] about [problem]. I feel worried/disappointed because [reason]. Personally, I think the club should [solution 1]. Another idea is to [solution 2]. What do you think?

Formal: I am writing to share my feelings and suggestions about [problem]. Firstly, I suggest [solution 1]. This is because [reason]. Additionally, we could [solution 2]. By doing so, we can [benefit].`;
function renderWritingDual(sec){
  let item=sec.items[itemIndex(sec)], k1=draftKey(sec,item,':friend'),k2=draftKey(sec,item,':manager'),d1=state.drafts[k1]||'',d2=state.drafts[k2]||'';
  $('#exercise').innerHTML=`<div class="card">${header(sec,item)}
  <span class="pill ${item.kind==='problem'?'custom':'ok'}">${item.kind==='problem'?'Problem / tình huống':'Proposal / đề xuất'}</span>
  <h3 style="margin-top:10px">${esc(item.title)}</h3>
  <div class="prompt">${esc(item.scenario||item.title)}</div>
  <details style="margin:10px 0"><summary><b>Xem khung gợi ý</b></summary><div class="sample">${esc(item.kind==='problem'?TPL_PROBLEM:TPL_PROPOSAL)}</div></details>
  <h3>Email to a friend</h3>
  <textarea rows="4" oninput="APT.saveDraft('${esc(k1)}',this.value,'wc-friend',40,50)">${esc(d1)}</textarea>
  <div class="wordbar"><span>Target: 40–50 words</span><span id="wc-friend" class="${countWords(d1)>=40&&countWords(d1)<=50?'good':countWords(d1)>50?'bad':''}">${countWords(d1)} words</span></div>
  <div class="row"><button class="btn good" onclick="APT.toggleSample('friendSample')">Bài mẫu</button></div>
  <div id="friendSample" class="sample" style="display:none">${esc(item.informalSample)}</div>
  <h3 style="margin-top:18px">Email to the manager</h3>
  <textarea rows="7" oninput="APT.saveDraft('${esc(k2)}',this.value,'wc-manager',120,150)">${esc(d2)}</textarea>
  <div class="wordbar"><span>Target: 120–150 words</span><span id="wc-manager" class="${countWords(d2)>=120&&countWords(d2)<=150?'good':countWords(d2)>150?'bad':''}">${countWords(d2)} words</span></div>
  <div class="row"><button class="btn good" onclick="APT.toggleSample('managerSample')">Bài mẫu</button><button class="btn" onclick="APT.markPractice('${esc(sec.id+':'+item.id)}')">Đánh dấu đã luyện</button><button class="btn" onclick="APT.exportAnswer('${esc(sec.id)}','${esc(item.id)}')">Tải bài làm (.txt)</button><button class="btn primary" onclick="APT.exportSubmission('${esc(sec.id)}','${esc(item.id)}')">Xuất bài nộp (.zip)</button></div>
  <div id="managerSample" class="sample" style="display:none">${esc(item.formalSample)}</div>${item.sampleSource?`<p class="sourceNote">${esc(item.sampleSource)}</p>`:''}${navItem(sec)}</div>`;
}
function buildAnswerText(sec,item){
 const info=state.profile||{},key=sec.id+':'+item.id;
 const lines=['APTIS PRACTICE HUB - BAI NOP CHO GIAO VIEN','Họ tên: '+(info.name||'(chưa điền)'),'Lớp: '+(info.className||'(chưa điền)'),info.teacher?'Giáo viên: '+info.teacher:'','Ngày xuất: '+new Date().toLocaleString('vi-VN'),'Bài: '+sec.title,'Phần: '+(sec.part||sec.skill),sec.sourceLabel?'Nguồn: '+sec.sourceLabel:'',''];
 const d=k=>String(state.drafts[k]||'').trim();
 if(sec.type==='writing_short')lines.push('ĐỀ BÀI:',item.prompt||'', '\nBÀI LÀM:',d(key)||'(chưa viết)');
 else if(sec.type==='writing_chat'){
   (item.questions||[]).forEach((q,i)=>lines.push('CÂU '+(i+1)+': '+(q.prompt||q.en||''),'TRẢ LỜI:',d(key+':chat-'+i)||'(chưa viết)',''));
 }else if(sec.type==='writing_dual_email')lines.push('ĐỀ BÀI:',item.scenario||'', '\nEMAIL BẠN BÈ:',d(key+':friend')||'(chưa viết)','\nEMAIL TRANG TRỌNG:',d(key+':manager')||'(chưa viết)');
 else if(sec.type.startsWith('speaking'))lines.push('CÂU HỎI:',...speakingQuestions(sec,item).map((q,i)=>(i+1)+'. '+q),'\nBẢN TRẢ LỜI TỰ NHẬP (không phải phiên âm tự động):',d('speech:'+key)||'(chưa nhập)','\nTỪ KHÓA / GHI CHÚ:',d('notes:'+key)||'(chưa có)','\nBẢN GHI ÂM: xem tệp âm thanh đi kèm nếu có.');
 else lines.push('Bài trắc nghiệm: chỉ xuất thống kê tiến độ; không lưu đầy đủ các lựa chọn trước đây.');
 const result=state.progress[key];if(result)lines.push('','THÔNG TIN ÔN TẬP: Đã luyện '+(result.attempts||0)+' lần; kết quả tốt nhất '+(result.best??'?')+'/'+(result.total??'?')+'.');
 lines.push('','Ghi chú: Đây là bài làm cá nhân, không bao gồm đáp án/bài mẫu của giáo viên.');
 return lines.filter(x=>x!==null).join('\n');
}
function exportAnswer(secId,itemId){
 const sec=sectionById(secId),item=sec?.items?.find(x=>x.id===itemId);if(!item)return;
 download('aptis-bai-lam-'+sec.skill+'-'+secId.replace(/[^A-Za-z0-9_-]/g,'-')+'.txt','\ufeff'+buildAnswerText(sec,item),'text/plain;charset=utf-8');
}
function saveDraft(k,v,id,min,max){state.drafts[k]=v;persist();let el=id?document.getElementById(id):null;if(el){let n=countWords(v);el.textContent=n+' words';el.className=(n>=min&&n<=max)?'good':(n>max?'bad':'')}}
function clearDraft(k){delete state.drafts[k];persist();render()}
function toggleSample(id){let e=document.getElementById(id);if(e)e.style.display=e.style.display==='none'?'block':'none'}

// ---------- Writing Part 3: three club-chat answers ----------
function renderWritingChat(sec){
 const item=sec.items[itemIndex(sec)],min=item.minWords??30,max=item.maxWords??40;
 $('#exercise').innerHTML=`<div class="card">${header(sec,item)}<h3>${esc(item.club||'Club chat')}</h3><p class="muted">${esc(item.instructions||'Write one reply to each of the three members.')}</p>
 ${(item.questions||[]).map((q,i)=>{const k=draftKey(sec,item,':chat-'+i),d=state.drafts[k]||'',n=countWords(d);return `<div class="chatPrompt"><div class="prompt"><b>Member ${i+1}</b><p>${esc(q.prompt||q.en||'')}</p></div><label class="formfield"><span>Trả lời câu ${i+1}</span><textarea rows="4" oninput="APT.saveDraft('${esc(k)}',this.value,'chatWords-${i}',${min},${max})" placeholder="Write your own response...">${esc(d)}</textarea></label><div class="wordbar"><span>Target: ${min}–${max} words</span><span class="${n>=min&&n<=max?'good':n>max?'bad':''}" id="chatWords-${i}">${n} words</span></div><details><summary>Hiện bài mẫu câu ${i+1}</summary><div class="sample">${esc(q.sample||'Chưa có bài mẫu')}</div></details></div>`}).join('')}
 <div class="row" style="margin-top:14px"><button class="btn" onclick="APT.markPractice('${esc(sec.id+':'+item.id)}')">Đánh dấu đã luyện cả 3 câu</button><button class="btn" onclick="APT.exportAnswer('${esc(sec.id)}','${esc(item.id)}')">Tải bài làm (.txt)</button><button class="btn primary" onclick="APT.exportSubmission('${esc(sec.id)}','${esc(item.id)}')">Xuất bài nộp (.zip)</button></div>${navItem(sec)}</div>`;
}
// ---------- Reading/Listening multi-question practice, including unverified keys ----------
function renderQuiz(sec){
 const item=sec.items[itemIndex(sec)],isAudio=sec.type==='listening_quiz';
 $('#exercise').innerHTML=`<div class="card">${header(sec,item)}<h3>${esc(item.title||'Multiple choice')}</h3>
 ${isAudio?`${audioTag(item.audio)}${item.transcript?`<details><summary>Hiện transcript</summary><div class="sample">${esc(item.transcript)}</div></details>`:''}`:`<div class="prompt readingPassage">${esc(item.passage||'Chưa có đoạn văn')}</div>`}
 ${(item.questions||[]).map((q,i)=>`<fieldset class="quizQuestion"><legend>${i+1}. ${esc(q.prompt||q.question||'')}</legend>${(q.options||[]).map((o,j)=>`<label class="quizOption"><input type="radio" name="quiz-${i}" value="${j}"><span><b>${String.fromCharCode(65+j)}.</b> ${esc(o)}</span></label>`).join('')}<p class="quizFeedback" id="quizFeedback-${i}" aria-live="polite"></p></fieldset>`).join('')}
 <div class="row"><button class="btn primary" onclick="APT.checkQuiz('${esc(sec.id)}','${esc(item.id)}')">Kiểm tra đáp án</button><span id="quizSummary" class="result"></span></div>
 <p class="muted small">Chỉ chấm câu có đáp án đã xác minh. Câu ghi “chưa xác minh” không tính điểm và cần đối chiếu nguồn / audio gốc.</p>${navItem(sec)}</div>`;
}
function checkQuiz(secId,itemId){
 const sec=sectionById(secId),item=sec?.items?.find(x=>x.id===itemId);if(!item)return;
 let correct=0,known=0,answered=0;
 (item.questions||[]).forEach((q,i)=>{
   const choice=document.querySelector(`input[name="quiz-${i}"]:checked`),feedback=$('#quizFeedback-'+i);
   const verified=Number.isInteger(q.answer)&&q.answer>=0&&q.answer<(q.options||[]).length;
   if(choice)answered++;
   if(!verified){feedback.className='quizFeedback muted';feedback.textContent='Chưa xác minh đáp án. '+(q.explanation||'Cần đối chiếu nguồn.');return}
   known++;const ok=!!choice&&Number(choice.value)===q.answer;if(ok)correct++;
   feedback.className='quizFeedback '+(ok?'ok':'bad');feedback.textContent=(ok?'Đúng. ':'Chưa đúng. ')+(q.explanation||('Đáp án: '+String.fromCharCode(65+q.answer)+'.'));
 });
 const summary=$('#quizSummary');summary.className='result '+(correct===known&&known?'ok':'bad');
 summary.textContent=known?`${correct}/${known} đúng (${(item.questions||[]).length-known} câu chưa xác minh)`:'Chưa có đáp án đã xác minh để chấm';
 if(!answered){toast('Hãy chọn ít nhất một đáp án trước khi chấm');return}
 if(known)markDone(secId+':'+itemId,correct,known);
}

// ---------- Future-supported Listening / Reading renderers ----------
function audioTag(url){let u=safeUrl(url);return u?`<audio controls preload="metadata" src="${esc(u)}" style="width:100%"></audio>`:`<div class="notice warn">Chưa có audio hợp lệ.</div>`}
function renderListeningMCQ(sec){
 let item=sec.items[itemIndex(sec)],key=sec.id+':'+item.id;
 $('#exercise').innerHTML=`<div class="card">${header(sec,item)}${audioTag(item.audio)}<div class="prompt">${esc(item.question)}</div>
 ${(item.options||[]).map((o,i)=>`<label class="person"><input type="radio" name="mcq" value="${i}"> ${esc(o)}</label>`).join('')}
 <div class="row"><button class="btn primary" onclick="APT.checkMCQ('${esc(sec.id)}','${esc(item.id)}')">Chấm</button><span id="mcqResult"></span></div>
 ${item.transcript?`<details><summary>Transcript</summary><div class="sample">${esc(item.transcript)}</div></details>`:''}${navItem(sec)}</div>`;
}
function checkMCQ(secId,itemId){let sec=sectionById(secId),item=sec.items.find(x=>x.id===itemId),r=document.querySelector('input[name=mcq]:checked');if(!r){toast('Hãy chọn đáp án');return}let ok=Number(r.value)===Number(item.answer);let e=$('#mcqResult');e.className='result '+(ok?'ok':'bad');e.textContent=ok?'Đúng':'Chưa đúng';markDone(secId+':'+itemId,ok?1:0,1)}
function renderSpeakerMatch(sec){
 let item=sec.items[itemIndex(sec)];
 $('#exercise').innerHTML=`<div class="card">${header(sec,item)}${audioTag(item.audio)}<h3>${esc(item.title||'')}</h3>
 ${(item.statements||[]).map((s,i)=>`<div class="qrow"><div>${i+1}. ${esc(s.text)}</div><select id="sm-${i}"><option value="">—</option><option>M</option><option>W</option><option>B</option></select></div>`).join('')}
 <div class="row"><button class="btn primary" onclick="APT.checkSpeaker('${esc(sec.id)}','${esc(item.id)}')">Chấm</button><span id="smResult"></span></div>${navItem(sec)}</div>`;
}
function checkSpeaker(secId,itemId){let sec=sectionById(secId),item=sec.items.find(x=>x.id===itemId),c=0;(item.statements||[]).forEach((s,i)=>{if(document.getElementById('sm-'+i)?.value===s.answer)c++});let n=item.statements.length;$('#smResult').textContent=`${c}/${n} đúng`;markDone(secId+':'+itemId,c,n)}
function renderTwoAnswers(sec){
 let item=sec.items[itemIndex(sec)];
 $('#exercise').innerHTML=`<div class="card">${header(sec,item)}${audioTag(item.audio)}<h3>${esc(item.title||'')}</h3>
 ${(item.options||[]).map((o,i)=>`<label class="person"><input type="checkbox" name="two" value="${i}"> ${esc(o)}</label>`).join('')}
 <div class="row"><button class="btn primary" onclick="APT.checkTwo('${esc(sec.id)}','${esc(item.id)}')">Chấm</button><span id="twoResult"></span></div>${navItem(sec)}</div>`;
}
function checkTwo(secId,itemId){let sec=sectionById(secId),item=sec.items.find(x=>x.id===itemId),got=[...document.querySelectorAll('input[name=two]:checked')].map(x=>Number(x.value)).sort(),ans=(item.answers||[]).map(Number).sort();let ok=JSON.stringify(got)===JSON.stringify(ans);$('#twoResult').textContent=ok?'Đúng':'Chưa đúng';markDone(secId+':'+itemId,ok?1:0,1)}
function renderHeadings(sec){
 let item=sec.items[itemIndex(sec)];
 $('#exercise').innerHTML=`<div class="card">${header(sec,item)}<div class="notice">Chọn heading cho từng paragraph.</div>
 ${(item.paragraphs||[]).map((p,i)=>`<div class="person"><b>${i+1}</b> ${esc(p)}<select id="hd-${i}" style="margin-top:8px"><option value="">—</option>${(item.headings||[]).map((h,j)=>`<option value="${j}">${esc(h)}</option>`).join('')}</select></div>`).join('')}
 <div class="row"><button class="btn primary" onclick="APT.checkHeadings('${esc(sec.id)}','${esc(item.id)}')">Chấm</button><span id="hdResult"></span></div>${navItem(sec)}</div>`;
}
function checkHeadings(secId,itemId){let sec=sectionById(secId),item=sec.items.find(x=>x.id===itemId),c=0;(item.answers||[]).forEach((a,i)=>{if(document.getElementById('hd-'+i)?.value!=='' && Number(document.getElementById('hd-'+i)?.value)===Number(a))c++});let n=item.answers.length;$('#hdResult').textContent=`${c}/${n} đúng`;markDone(secId+':'+itemId,c,n)}
function renderUnsupported(sec){$('#exercise').innerHTML=`<div class="card">${header(sec,null)}<div class="notice warn">Renderer <b>${esc(sec.type)}</b> chưa được hỗ trợ trong bản này.</div></div>`}

const renderers={
 external_iframe(sec){let item=sec.items[itemIndex(sec)],u=safeUrl(item.url);$('#exercise').innerHTML=`<div class="card">${header(sec,item)}<div class="notice ok">Listening Part 2 dùng trực tiếp nguồn online; cần Internet.</div><div class="row">${u?`<a class="btn primary" href="${esc(u)}" rel="noopener noreferrer" target="_blank">Mở trang nguồn ↗</a>`:'Nguồn không hợp lệ'}</div>${u?`<iframe class="sourceframe" src="${esc(u)}" loading="lazy" title="Bài luyện Listening bên ngoài"></iframe>`:''}${navItem(sec)}</div>`},
 reading_order:renderReadingOrder,reading_opinion:renderReadingOpinion,
 speaking_prompt:renderSpeakingPrompt,speaking_picture:renderSpeakingPicture,speaking_compare:renderSpeakingCompare,
 writing_short:renderWritingShort,writing_dual_email:renderWritingDual,
 listening_mcq:renderListeningMCQ,listening_speaker_match:renderSpeakerMatch,listening_two_answers:renderTwoAnswers,
 reading_headings:renderHeadings,
 reading_quiz:renderQuiz,listening_quiz:renderQuiz,writing_chat:renderWritingChat
};

// ---------- Data Manager ----------
function validatePack(p){
 let errs=[];
 if(!p||typeof p!=='object')return ['Không phải object JSON'];
 if(p.schemaVersion!==1)errs.push('schemaVersion phải bằng 1');
 if(!p.packId||typeof p.packId!=='string'||!/^[A-Za-z0-9][A-Za-z0-9._-]{0,100}$/.test(p.packId))errs.push('packId không hợp lệ (chỉ chữ/số và dấu - _ .)');
 if(!Array.isArray(p.sections)||!p.sections.length)errs.push('sections phải là mảng không rỗng');
 let seen=new Set();
 (p.sections||[]).forEach((s,si)=>{
   if(!s.id||!/^[A-Za-z0-9][A-Za-z0-9._-]{0,100}$/.test(s.id))errs.push(`sections[${si}] thiếu id hoặc id chứa ký tự không hợp lệ (chỉ chữ, số, dấu - _ .)`);
   if(seen.has(s.id))errs.push(`Trùng section id: ${s.id}`);seen.add(s.id);
   if(!SKILLS.includes(s.skill))errs.push(`section ${s.id||si}: skill không hợp lệ`);
   if(!SUPPORTED_TYPES.includes(s.type))errs.push(`section ${s.id||si}: type ${s.type} chưa hỗ trợ`);
   if(!Array.isArray(s.items)||!s.items.length)errs.push(`section ${s.id||si}: items phải là mảng không rỗng`);
   else if(s.items.some(i=>!i||typeof i.id!=='string'||!/^[A-Za-z0-9][A-Za-z0-9._-]{0,100}$/.test(i.id)))errs.push(`section ${s.id||si}: item.id không hợp lệ`);
 });
 return errs;
}
function renderData(){
 let all=packs();
 $('#app').innerHTML=`<div class="grid">
 <section class="card span8">
   <span class="pill">Import Pack</span><h2>Thêm phần mới khi có tài liệu</h2>
   <p>Muốn tạo bài theo đề thầy mà không dùng JSON? <button class="btn small" onclick="APT.creatorNew()">Mở công cụ Tạo bài tập</button>. Pack JSON chỉ dành cho bài nâng cao / nhập dữ liệu nhiều bài cùng lúc.</p>
   <div class="filebox"><b>Chọn một hoặc nhiều file JSON</b><p class="muted small">Pack hợp lệ sẽ được lưu vào localStorage trên thiết bị này.</p><label class="btn primary">Import JSON<input multiple type="file" accept=".json,application/json" hidden onchange="APT.importPacks(this.files)"></label></div>
   <div class="row" style="margin-top:12px"><button class="btn" onclick="APT.downloadExample()">Tải example-pack.json</button><button class="btn" onclick="APT.exportCustomJSON()">Xuất custom packs JSON</button><button class="btn good" onclick="APT.exportExtraJS()">Xuất extra-packs.js cho GitHub</button></div>
   <div class="notice warn">Dữ liệu trong trình duyệt <b>không tự đồng bộ</b> và có thể mất khi xóa dữ liệu trang web. Xuất sao lưu định kỳ. <b>File JSON không kèm âm thanh</b>; hãy xuất ZIP ở tab <button class="btn small" onclick="APT.page('submission')">Xuất bài nộp</button> để sao lưu cả ghi âm.</div>
   <div class="row"><button class="btn primary" onclick="APT.exportBackup()">Sao lưu toàn bộ (bài viết, tiến độ, bài tự tạo)</button><label class="btn">Nhập/Gộp sao lưu<input type="file" accept=".json,application/json" hidden onchange="APT.importBackup(this.files[0])"></label></div>
 </section>
 <section class="card span4">
   <h3>Loại bài đã hỗ trợ</h3>
   <div class="small">${SUPPORTED_TYPES.map(x=>`<div>• <code>${esc(x)}</code></div>`).join('')}</div>
 </section>
 <section class="card span12">
   <h3>Packs đang cài</h3>
   <div class="tablewrap"><table class="datatable"><thead><tr><th>Pack</th><th>Sections</th><th>Loại</th><th></th></tr></thead><tbody>
   ${all.map(p=>`<tr><td><b>${esc(p.title||p.packId)}</b><div class="tiny muted">${esc(p.packId)}</div></td><td>${(p.sections||[]).length}</td><td>${state.customPacks.some(c=>c.packId===p.packId)?'<span class="pill custom">Custom</span>':'<span class="pill ok">Built-in/GitHub</span>'}</td><td>${state.customPacks.some(c=>c.packId===p.packId)?`<button class="btn danger small" onclick="APT.removePack('${esc(p.packId)}')">Xóa</button>`:''}</td></tr>`).join('')}
   </tbody></table></div>
 </section>
 <section class="card span12">
   <h3>Quy trình cập nhật lâu dài</h3>
   <div class="code">1. Chuyển tài liệu mới thành pack JSON theo schema.
2. Import JSON trong tab này để kiểm tra.
3. Nếu hoạt động đúng: “Xuất extra-packs.js cho GitHub”.
4. Xuất extra-packs.js gồm cả pack hiện có và bài tự tạo, thay data/extra-packs.js trên GitHub.
5. Sau khi deploy, tải lại bằng Ctrl+F5; kiểm tra laptop + điện thoại.
6. Sao lưu bản cũ trước khi thay, vì dữ liệu localStorage không tự đi theo source code.

Ảnh/audio trong pack có thể dùng URL HTTPS hoặc đường dẫn tương đối như:
assets/speaking/day6/picture1.jpg
assets/audio/listening/p3/set01.mp3</div>
 </section></div>`;
}
// ---------- Nộp bài / xuất ZIP: bài tự viết và ghi âm, không gồm bài mẫu ----------
function saveProfile(field,val){
 if(!['name','className','teacher'].includes(field))return;
 state.profile[field]=String(val||'').slice(0,160);store.set('aptis_submission_profile_v41',state.profile);
}
function hasAnswer(sec,item){
 const k=sec.id+':'+item.id,d=x=>!!String(state.drafts[x]||'').trim();
 if(sec.type==='writing_short')return d(k);
 if(sec.type==='writing_chat')return (item.questions||[]).some((q,i)=>d(k+':chat-'+i));
 if(sec.type==='writing_dual_email')return d(k+':friend')||d(k+':manager');
 if(sec.type.startsWith('speaking'))return d('notes:'+k)||d('speech:'+k);
 return false;
}
function submissionCandidates(){
 return sections().filter(sec=>sec.skill==='writing'||sec.skill==='speaking').flatMap(sec=>(sec.items||[]).map(item=>({sec,item,key:sec.id+':'+item.id})));
}
async function renderSubmission(){
 $('#app').innerHTML='<div class="card"><h2>Hồ sơ nộp bài</h2><p>Đang kiểm tra các bài viết và bản ghi âm đã lưu trên thiết bị...</p></div>';
 const audioKeys=new Set(await SUB.listAudioKeys());if(state.page!=='submission')return;
 const items=submissionCandidates().filter(({sec,item,key})=>hasAnswer(sec,item)||audioKeys.has(key));
 const profile=state.profile||{},input=(key,label)=>`<label class="formfield"><span>${label}</span><input type="text" value="${esc(profile[key]||'')}" maxlength="160" oninput="APT.saveProfile('${key}',this.value)"></label>`;
 $('#app').innerHTML=`<div class="pageintro"><span class="pill ok">Nộp bài cho giáo viên</span><h1>Xuất hồ sơ nộp bài</h1><p>Chọn các bài Writing/Speaking muốn gửi. App sẽ tạo <b>một tệp ZIP</b> gồm đề, bài tự làm và tệp ghi âm của từng bài (nếu có); không kèm đáp án mẫu. Tải ZIP về rồi tự đính kèm trên nền tảng thầy yêu cầu.</p></div>
 <div class="grid"><section class="card span12"><h3>Thông tin người làm bài</h3><div class="formrow">${input('name','Họ tên')}${input('className','Lớp')}</div>${input('teacher','Giáo viên (tùy chọn)')}<p class="muted small">Chỉ lưu trên trình duyệt; không tự gửi lên GitHub hoặc cho người khác.</p></section>
 <section class="card span12"><div class="row between"><h3>Bài đã có nội dung / ghi âm (${items.length})</h3><div class="row"><button class="btn small" onclick="APT.submissionSelect(true)">Chọn tất cả</button><button class="btn small" onclick="APT.submissionSelect(false)">Bỏ chọn</button></div></div>
 ${items.length?`<div class="submissionList">${items.map(({sec,item,key})=>`<label class="submissionRow"><input type="checkbox" data-submit-key="${esc(key)}" checked><span><b>${esc(sec.title)}</b><small>${esc(sec.skill.toUpperCase()+' '+(sec.part||''))} · ${hasAnswer(sec,item)?'Có nội dung trả lời':'Chưa có văn bản'} · ${audioKeys.has(key)?'Có bản ghi âm':'Không có ghi âm'}</small></span></label>`).join('')}</div><div class="row" style="margin-top:14px"><button class="btn primary" onclick="APT.exportSelectedSubmission()">Tải tất cả bài đã chọn (.zip)</button></div>`:'<div class="notice warn">Chưa có bài viết hoặc bản ghi âm nào. Hãy mở bài trong mục Speaking/Writing và làm trước khi xuất.</div>'}
 <p class="muted small">Âm thanh nằm trong IndexedDB của thiết bị, không thuộc sao lưu JSON và không tự đồng bộ. Nếu đã lưu bản ghi âm từ V4 trên máy, hãy dùng nút <b>Đính kèm file âm thanh cũ</b> trong bài Speaking.</p>
 </section></div>`;
}
function submissionSelect(value){document.querySelectorAll('[data-submit-key]').forEach(el=>{el.checked=value})}
function asHtml(txt){return '<!doctype html><html lang="vi"><meta charset="utf-8"><title>Bài nộp APTIS</title><style>body{max-width:780px;margin:35px auto;padding:0 18px;font:16px/1.65 Arial,sans-serif;color:#17243a}h1{font-size:24px}pre{font:inherit;white-space:pre-wrap;overflow-wrap:anywhere;border:1px solid #dae1ea;background:#f9fbfd;padding:18px;border-radius:10px}@media print{pre{border:none;padding:0}}</style><h1>APTIS - Bài nộp</h1><pre>'+esc(txt)+'</pre></html>'}
async function packageSubmission(chosen){
 if(state.pendingAudio)await state.pendingAudio;
 const name=state.profile.name?.trim()||'ChuaDienTen';
 if(!state.profile.name?.trim()||!state.profile.className?.trim()){
  if(!confirm('Chưa điền đủ họ tên hoặc lớp. Tệp sẽ ghi là chưa điền. Vẫn xuất?'))return;
 }
 const texts=[],files=[{name:'HUONG_DAN.txt',content:'GÓI BÀI NỘP APTIS\nTải về: '+new Date().toLocaleString('vi-VN')+'\nCác thư mục con chứa BAI_LAM.txt, BAI_LAM.html (có thể mở trên Word/trình duyệt) và GHI_AM nếu có.\nỨng dụng KHÔNG tự gửi bài. Hãy nghe bản ghi, kiểm tra bài làm và đính kèm ZIP lên hệ thống thầy yêu cầu.\nBài mẫu giáo viên không được đưa vào hồ sơ này.\nÂm thanh giữ nguyên định dạng của trình duyệt (m4a/webm/ogg...) hoặc file anh đã tải lên.\n'}];
 let audioCount=0,nonempty=0;
 for(let i=0;i<chosen.length;i++){
  const {sec,item,key}=chosen[i],folder=String(i+1).padStart(2,'0')+'_'+SUB.baseName(sec.skill+'-'+sec.part+'-'+sec.id+'-'+item.id);
  const content=buildAnswerText(sec,item);texts.push(content);files.push({name:folder+'/BAI_LAM.txt',content:'\ufeff'+content});files.push({name:folder+'/BAI_LAM.html',content:asHtml(content)});
  if(hasAnswer(sec,item))nonempty++;
  if(sec.skill==='speaking'){
   const audio=await SUB.getAudio(key);
   if(audio?.blob?.size){files.push({name:folder+'/GHI_AM.'+SUB.extFor(audio.mime||audio.blob.type),content:audio.blob});audioCount++}
  }
 }
 if(!nonempty&&!audioCount){alert('Các bài đã chọn chưa có nội dung trả lời hoặc ghi âm để nộp.');return}
 if(chosen.some(x=>x.sec.skill==='speaking')&&!audioCount){if(!confirm('Các bài Speaking đã chọn chưa có file ghi âm. Gói ZIP sẽ chỉ có văn bản. Vẫn xuất?'))return}
 files.push({name:'TONG_HOP.txt',content:'\ufeff'+texts.join('\n\n'+'='.repeat(60)+'\n\n')});
 const zip=await SUB.zipFiles(files);
 const suffix=chosen.length===1?SUB.baseName(chosen[0].sec.skill+'-'+chosen[0].sec.part+'-'+chosen[0].item.id):'TongHop-'+chosen.length+'Bai';
 SUB.downloadBlob('APTIS_BaiNop_'+SUB.baseName(name)+'_'+suffix+'_'+new Date().toISOString().slice(0,10)+'.zip',zip);
 toast('Đã tạo ZIP: '+chosen.length+' bài, '+audioCount+' ghi âm');
}
async function exportSubmission(secId,itemId){
 const sec=sectionById(secId),item=sec?.items?.find(x=>x.id===itemId);
 if(!item)return;
 if(state.recorder?.state==='recording'){alert('Hãy nhấn Dừng, chờ bản ghi xuất hiện rồi mới xuất bài.');return}
 try{await packageSubmission([{sec,item,key:sec.id+':'+item.id}])}
 catch(e){alert('Không xuất được ZIP: '+e.message)}
}
async function exportSelectedSubmission(){
 const keys=new Set([...document.querySelectorAll('[data-submit-key]:checked')].map(x=>x.dataset.submitKey));
 const chosen=submissionCandidates().filter(({key})=>keys.has(key));
 if(!chosen.length){toast('Hãy chọn ít nhất một bài');return}
 try{await packageSubmission(chosen)}catch(e){alert('Không xuất được ZIP: '+e.message)}
}

async function importPacks(files){
 for(let f of files){
   try{
     if(f.size>10*1024*1024)throw new Error('File quá lớn (trên 10 MB)');
     let p=JSON.parse(await f.text()),errs=validatePack(p);
     if(errs.length){alert(`${f.name}\n\n`+errs.join('\n'));continue}
     let collision=sections().some(s=>(p.sections||[]).some(ns=>ns.id===s.id));
     if(collision){alert(`${f.name}: có section id trùng dữ liệu đang cài.`);continue}
     state.customPacks.push(p);store.set('aptis_custom_packs',state.customPacks);toast('Đã import '+(p.title||p.packId));
   }catch(e){alert(`${f.name}: không nhập được. ${e.message}`)}
 }
 render();
}
function removePack(id){if(!confirm('Xóa custom pack '+id+' khỏi thiết bị?'))return;state.customPacks=state.customPacks.filter(p=>p.packId!==id);store.set('aptis_custom_packs',state.customPacks);render()}
function download(name,text,type='application/json'){let a=document.createElement('a'),url=URL.createObjectURL(new Blob([text],{type}));a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),3000)}
function exportCustomJSON(){download('aptis-custom-packs.json',JSON.stringify(state.customPacks,null,2))}
function exportExtraJS(){
 const all=[{packId:'published-personal-assignments',title:'Bài tự tạo - xuất từ máy',sections:state.assignments},...state.customPacks,...EXTRA];
 const seen=new Set(),out=all.map(p=>({...p,sections:(p.sections||[]).filter(s=>{if(seen.has(s.id))return false;seen.add(s.id);return true})})).filter(p=>p.sections.length);
 download('extra-packs.js','window.APTIS_EXTRA_PACKS = '+JSON.stringify(out,null,2)+';\n','text/javascript');
}
function downloadExample(){fetch('data/example-pack.json').then(r=>r.text()).then(t=>download('example-pack.json',t)).catch(()=>toast('Hãy mở app qua GitHub Pages/localhost'))}
function exportProgress(){download('aptis-progress-v3.json',JSON.stringify({progress:state.progress,drafts:state.drafts},null,2))}
async function importProgress(file){if(!file)return;try{let x=JSON.parse(await file.text());state.progress=x.progress||{};state.drafts=x.drafts||{};persist();toast('Đã nhập tiến độ');render()}catch{alert('File tiến độ không hợp lệ')}}
function markPractice(key){markDone(key,1,1);toast('Đã đánh dấu hoàn thành')}

// ---------- Extensions and wiring ----------
const Features=window.APT_FEATURES({state,sections,store,esc,render,page,toast,download});
window.APT={
 page,section(skill,id){stopRecording(true);store.set('aptis_active_'+skill,id);renderSkill(skill)},
 next(id){const sec=sectionById(id);if(sec)setIndex(sec,1)},prev(id){const sec=sectionById(id);if(sec)setIndex(sec,-1)},
 moveOrder,checkOrder,resetOrder,setOpinion,checkOpinion,
 startTimer,stopTimer,startRecording,stopRecording,attachRecording,tts:speak,ttsCurrent,toggleSample,selectVariant,saveDraft,clearDraft,markPractice,exportAnswer,exportSubmission,exportSelectedSubmission,saveProfile,submissionSelect,
 checkMCQ,checkSpeaker,checkTwo,checkHeadings,checkQuiz,
 importPacks,removePack,downloadExample,exportCustomJSON,exportExtraJS,exportProgress,importProgress,
 ...Features
};
$('#mainNav').addEventListener('click',e=>{let b=e.target.closest('[data-page]');if(b){if(b.dataset.page==='creator')Features.creatorNew();else page(b.dataset.page)}});
$('#langBtn').onclick=()=>{state.lang=state.lang==='en'?'vi':'en';store.set('aptis_lang',state.lang);render()};
$('#stopTts').onclick=stopTTS;
render();
})();
