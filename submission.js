/* APTIS Practice Hub: offline student submission helper.
   No network calls, no third-party libraries. Audio saved in IndexedDB.
   ZIP is generated in the browser using the uncompressed ZIP32 format. */
(()=>{'use strict';
  const DB_NAME='aptis-practice-hub-audio';
  const STORE_NAME='recordings';
  const MAX_AUDIO=80*1024*1024;
  const fallback=new Map();
  let dbPromise;
  function db(){
    if(!('indexedDB' in window))return Promise.reject(new Error('IndexedDB không được hỗ trợ'));
    if(!dbPromise){
      dbPromise=new Promise((resolve,reject)=>{
        const req=indexedDB.open(DB_NAME,1);
        req.onupgradeneeded=()=>{if(!req.result.objectStoreNames.contains(STORE_NAME))req.result.createObjectStore(STORE_NAME,{keyPath:'key'})};
        req.onsuccess=()=>resolve(req.result);
        req.onerror=()=>reject(req.error||new Error('Không mở được IndexedDB'));
        req.onblocked=()=>reject(new Error('Bộ nhớ ghi âm đang được sử dụng trong tab khác'));
      }).catch(e=>{dbPromise=null;throw e});
    }
    return dbPromise;
  }
  function transact(method,op){
    return db().then(database=>new Promise((resolve,reject)=>{
      const tx=database.transaction(STORE_NAME,method), req=op(tx.objectStore(STORE_NAME));
      req.onsuccess=()=>resolve(req.result);
      req.onerror=()=>reject(req.error||new Error('Không đọc/ghi được bản ghi âm'));
      tx.onerror=()=>reject(tx.error||new Error('Lỗi lưu âm thanh'));
    }));
  }
  async function saveAudio(key,blob){
    if(!(blob instanceof Blob)||!blob.size)throw new Error('Âm thanh trống');
    if(blob.size>MAX_AUDIO)throw new Error('Tệp âm thanh lớn hơn giới hạn 80 MB');
    const inferred={mp3:'audio/mpeg',m4a:'audio/mp4',wav:'audio/wav',ogg:'audio/ogg',webm:'audio/webm'}[String(blob.name||'').split('.').pop()?.toLowerCase()]||'application/octet-stream';
    const record={key,blob,mime:blob.type||inferred,updatedAt:new Date().toISOString()};
    fallback.set(key,record);
    try{await transact('readwrite',store=>store.put(record));return {saved:true,record}}
    catch(e){console.warn('APTIS audio is only in memory:',e);return {saved:false,record}}
  }
  async function getAudio(key){
    try{return (await transact('readonly',store=>store.get(key)))||fallback.get(key)||null}
    catch{return fallback.get(key)||null}
  }
  async function listAudioKeys(){
    try{return [...new Set([...(await transact('readonly',store=>store.getAllKeys())),...fallback.keys()])]}
    catch{return [...fallback.keys()]}
  }
  async function removeAudio(key){
    fallback.delete(key);
    try{await transact('readwrite',store=>store.delete(key))}catch(e){console.warn(e)}
  }
  function extFor(mime){
    const type=String(mime||'').toLowerCase();
    if(type.includes('mpeg')||type.includes('mp3'))return 'mp3';
    if(type.includes('wav'))return 'wav';
    if(type.includes('mp4')||type.includes('m4a'))return 'm4a';
    if(type.includes('ogg'))return 'ogg';
    if(type.includes('aac'))return 'aac';
    if(type.includes('webm'))return 'webm';
    return 'bin';
  }
  function baseName(text){
    return String(text||'aptis').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[đĐ]/g,'d').replace(/[^a-zA-Z0-9._-]+/g,'-').replace(/^-+|-+$/g,'').slice(0,68)||'aptis';
  }
  const utf8=new TextEncoder();
  const crcTable=(()=>{const arr=new Uint32Array(256);for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=c&1?0xedb88320^(c>>>1):c>>>1;arr[n]=c>>>0}return arr})();
  function crc32(bytes){let c=0xffffffff;for(const b of bytes)c=crcTable[(c^b)&255]^(c>>>8);return (c^0xffffffff)>>>0}
  const le16=(view,offset,val)=>view.setUint16(offset,val,true);
  const le32=(view,offset,val)=>view.setUint32(offset,val>>>0,true);
  function dosTime(now){return ((now.getHours()&31)<<11)|((now.getMinutes()&63)<<5)|((Math.floor(now.getSeconds()/2))&31)}
  function dosDate(now){return ((Math.max(1980,now.getFullYear())-1980)<<9)|((now.getMonth()+1)<<5)|(now.getDate())}
  async function zipFiles(files){
    if(!Array.isArray(files)||!files.length)throw new Error('Không có dữ liệu để đóng gói');
    if(files.length>1000)throw new Error('Quá nhiều tệp để xuất');
    const bodies=[],central=[],now=new Date(),dt=dosDate(now),tm=dosTime(now);
    let offset=0,centralSize=0;
    for(const file of files){
      const name=String(file.name||'').replace(/\\/g,'/');
      if(!name||name.startsWith('/')||name.split('/').some(p=>!p||p==='.'||p==='..'))throw new Error('Tên tệp không hợp lệ');
      const nameBytes=utf8.encode(name), source=file.content;
      const bytes=typeof source==='string'?utf8.encode(source):source instanceof Blob?new Uint8Array(await source.arrayBuffer()):source instanceof Uint8Array?source:new Uint8Array(source);
      if(bytes.length>0xffffffff)throw new Error('Tệp vượt giới hạn ZIP32');
      const crc=crc32(bytes);
      const local=new Uint8Array(30+nameBytes.length),l=new DataView(local.buffer);
      le32(l,0,0x04034b50);le16(l,4,20);le16(l,6,0x0800);le16(l,8,0);le16(l,10,tm);le16(l,12,dt);
      le32(l,14,crc);le32(l,18,bytes.length);le32(l,22,bytes.length);le16(l,26,nameBytes.length);le16(l,28,0);local.set(nameBytes,30);
      bodies.push(local,bytes);
      const c=new Uint8Array(46+nameBytes.length),v=new DataView(c.buffer);
      le32(v,0,0x02014b50);le16(v,4,20);le16(v,6,20);le16(v,8,0x0800);le16(v,10,0);
      le16(v,12,tm);le16(v,14,dt);le32(v,16,crc);le32(v,20,bytes.length);le32(v,24,bytes.length);
      le16(v,28,nameBytes.length);le16(v,30,0);le16(v,32,0);le16(v,34,0);le16(v,36,0);le32(v,38,0);le32(v,42,offset);c.set(nameBytes,46);
      central.push(c);centralSize+=c.length;offset+=local.length+bytes.length;
    }
    if(offset>0xffffffff||centralSize>0xffffffff)throw new Error('Gói ZIP vượt giới hạn dung lượng');
    const end=new Uint8Array(22),v=new DataView(end.buffer);
    le32(v,0,0x06054b50);le16(v,4,0);le16(v,6,0);le16(v,8,files.length);le16(v,10,files.length);
    le32(v,12,centralSize);le32(v,16,offset);le16(v,20,0);
    return new Blob([...bodies,...central,end],{type:'application/zip'});
  }
  function downloadBlob(name,blob){
    const url=URL.createObjectURL(blob),a=document.createElement('a');
    a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),15000);
  }
  window.APTIS_SUBMISSION={saveAudio,getAudio,listAudioKeys,removeAudio,zipFiles,downloadBlob,extFor,baseName,MAX_AUDIO};
})();
