const MAX = 50 * 1024 * 1024;
const ALLOWED = /\.(ppt|pptx|pdf|doc|docx|xls|xlsx|jpg|jpeg|png|zip)$/i;

const fileInput = document.querySelector("#file");
const uploadBtn = document.querySelector("#upload");
const statusEl = document.querySelector("#status");
const filesEl = document.querySelector("#files");

let selected = null;

function setStatus(msg, bad=false){ statusEl.textContent=msg; statusEl.style.color=bad?"#c62828":"#44546a"; }

function client(){
  if(!window.supabase) throw new Error("Supabase library not loaded.");
  if(!window.SUPABASE_URL || window.SUPABASE_URL.includes("YOUR-")) throw new Error("Configure config.js first.");
  return window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
}

fileInput.addEventListener("change", ()=>{
  selected = fileInput.files[0] || null;
  uploadBtn.disabled = !selected;
  if(selected) setStatus(`${selected.name} • ${(selected.size/1024/1024).toFixed(2)} MB`);
});

uploadBtn.addEventListener("click", async ()=>{
  if(!selected) return;
  if(selected.size > MAX) return setStatus("File is larger than 50 MB.", true);
  if(!ALLOWED.test(selected.name)) return setStatus("This file type is not allowed.", true);

  try{
    uploadBtn.disabled=true; setStatus("Uploading…");
    const sb=client();
    const safeName = `${Date.now()}-${crypto.randomUUID()}-${selected.name.replace(/[^a-zA-Z0-9._-]/g,"_")}`;
    const {error}=await sb.storage.from("lecture-files").upload(safeName, selected, {upsert:false});
    if(error) throw error;
    setStatus("Uploaded successfully.");
    selected=null; fileInput.value="";
    await loadFiles();
  }catch(e){ setStatus(e.message || "Upload failed.", true); }
  finally{ uploadBtn.disabled=!selected; }
});

async function loadFiles(){
  try{
    const sb=client();
    const {data,error}=await sb.storage.from("lecture-files").list("", {limit:100, sortBy:{column:"created_at",order:"desc"}});
    if(error) throw error;
    if(!data?.length){ filesEl.innerHTML='<div class="muted">No files yet.</div>'; return; }
    filesEl.innerHTML="";
    for(const f of data){
      const {data:urlData}=sb.storage.from("lecture-files").getPublicUrl(f.name);
      const row=document.createElement("div"); row.className="file";
      const name=document.createElement("div"); name.className="file-name"; name.textContent=f.name.replace(/^\d+-[0-9a-f-]+-/,"");
      const a=document.createElement("a"); a.href=urlData.publicUrl; a.target="_blank"; a.rel="noopener"; a.textContent="Download";
      row.append(name,a); filesEl.append(row);
    }
  }catch(e){ filesEl.innerHTML=`<div class="muted">Storage is not configured yet.</div>`; }
}

const script=document.createElement("script");
script.src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
script.onload=loadFiles;
document.head.appendChild(script);
