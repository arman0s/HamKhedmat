const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const titles={home:"داشبورد",countdown:"روزشمار",community:"انجمن",market:"بازارچه",chat:"گفت‌وگوها",calendar:"تقویم و خاطرات",fun:"سرگرمی",news:"اخبار و آموزش",profile:"پروفایل"};
const fa=n=>new Intl.NumberFormat("fa-IR").format(n);
function toast(msg){const t=$("#toast");t.textContent=msg;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),2600)}
function page(name){$$(".page").forEach(p=>p.classList.toggle("active",p.id==="page-"+name));$$("[data-page]").forEach(b=>b.classList.toggle("active",b.dataset.page===name));$("#page-title").textContent=titles[name]||"هم‌خدمت";window.scrollTo({top:0,behavior:"smooth"})}
document.addEventListener("click",e=>{const b=e.target.closest("[data-page]");if(b){e.preventDefault();page(b.dataset.page)}});
$("#today-label").textContent=new Intl.DateTimeFormat("fa-IR",{weekday:"long",day:"numeric",month:"long"}).format(new Date());
const get=(k,d=null)=>{try{return JSON.parse(localStorage.getItem("hk-"+k))??d}catch{return d}};
const put=(k,v)=>localStorage.setItem("hk-"+k,JSON.stringify(v));
function addMonths(date,months){const d=new Date(date+"T12:00:00");const day=d.getDate();d.setMonth(d.getMonth()+Number(months));if(d.getDate()<day)d.setDate(0);return d}
function fmtDate(d){return new Intl.DateTimeFormat("fa-IR",{year:"numeric",month:"long",day:"numeric"}).format(d)}
function updateCountdown(){
 const c=get("countdown");let days=null,elapsed=0,pct=0,end=null;
 if(c?.start&&c?.duration){const s=new Date(c.start+"T00:00:00");end=addMonths(c.start,c.duration);const now=new Date();now.setHours(0,0,0,0);const total=Math.max(1,Math.ceil((end-s)/86400000));elapsed=Math.max(0,Math.floor((now-s)/86400000));days=Math.max(0,Math.ceil((end-now)/86400000));pct=Math.min(100,Math.max(0,elapsed/total*100));}
 $("#hero-days").textContent=days===null?"هنوز روزشماری تنظیم نشده":days===0?"روز پایان تخمینی فرا رسیده":fa(days)+" روز تا پایان";
 $("#hero-subtitle").textContent=days===null?"تاریخ شروع و مدت خدمتت رو وارد کن تا شمارش معکوس ساخته بشه.":"هر روز یک قدم به مقصد نزدیک‌تر می‌شی.";
 $("#hero-percent").textContent=fa(Math.round(pct))+"٪";$("#hero-ring").style.background=`conic-gradient(from 35deg,#48a5ff ${pct}%,#ffffff22 ${pct}% 100%)`;$("#hero-ring").style.border="8px solid #ffffff20";
 $("#elapsed-stat").textContent=days===null?"—":fa(elapsed);$("#remaining-stat").textContent=days===null?"—":fa(days);$("#end-stat").textContent=end?fmtDate(end):"—";
 $("#countdown-number").textContent=days===null?"—":fa(days);$("#countdown-progress").textContent=fa(Math.round(pct))+"٪";$("#countdown-end").textContent=end?fmtDate(end):"—";$("#countdown-bar").style.width=pct+"%";
 if(c){$("#start-date").value=c.start;$("#duration").value=c.duration;$("#countdown-name").value=c.name||"روزشمار من"}
}
$("#calculate").addEventListener("click",()=>{const start=$("#start-date").value,duration=Number($("#duration").value);if(!start||!duration||duration<1||duration>60){toast("لطفاً تاریخ شروع و مدت معتبر وارد کن.");return}put("countdown",{start,duration,name:$("#countdown-name").value.trim()});updateCountdown();toast("روزشمار روی همین دستگاه ذخیره شد.")});
$("#reset-countdown").addEventListener("click",()=>{localStorage.removeItem("hk-countdown");$("#start-date").value="";$("#duration").value="";$("#countdown-name").value="";updateCountdown();toast("اطلاعات روزشمار پاک شد.")});
function renderNotes(){const notes=get("notes",[]);$("#notes-stat").textContent=fa(notes.length);$("#memory-list").innerHTML=notes.map(n=>`<div class="memory-item"><b>${escapeHtml(n.title)}</b><div>${escapeHtml(n.text)}</div><small>${escapeHtml(n.date||"بدون تاریخ")}</small></div>`).join("")}
function escapeHtml(s=""){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
$("#save-note").addEventListener("click",()=>{const text=$("#quick-note").value.trim();if(!text){toast("اول متن یادداشت رو بنویس.");return}const notes=get("notes",[]);notes.unshift({title:"یادداشت سریع",text,date:new Date().toLocaleDateString("fa-IR")});put("notes",notes);$("#quick-note").value="";renderNotes();$("#note-feedback").textContent="یادداشت ذخیره شد.";toast("یادداشت ذخیره شد.")});
$("#save-memory").addEventListener("click",()=>{const title=$("#memory-title").value.trim(),text=$("#memory-text").value.trim();if(!title||!text){toast("عنوان و متن یادداشت رو وارد کن.");return}const notes=get("notes",[]);notes.unshift({title,text,date:$("#memory-date").value});put("notes",notes);$("#memory-title").value="";$("#memory-text").value="";renderNotes();toast("خاطره روی دستگاه ذخیره شد.")});
$("#new-post").addEventListener("click",()=>{const text=prompt("متن پست نمونه را وارد کن:");if(!text?.trim())return;const el=document.createElement("article");el.className="feed-card";el.innerHTML=`<div class="feed-top"><span class="avatar">ش</span><div><b>شما</b><small>همین الان · ذخیره محلی</small></div><span class="feed-category">پست محلی</span></div><p>${escapeHtml(text)}</p><div class="feed-actions"><span>♡ پسندیدن</span><span>⚑ گزارش</span></div>`;$("#post-list").prepend(el);toast("پست فقط در همین صفحه اضافه شد؛ هنوز عمومی نیست.")});
$("#new-ad").addEventListener("click",()=>toast("ثبت آگهی آنلاین در مرحله اتصال بک‌اند فعال می‌شود."));
$("#poll-vote").addEventListener("click",()=>toast("پاسخ نمونه ثبت شد؛ نظرسنجی عمومی بعداً فعال می‌شود."));
$("#quiz-start").addEventListener("click",()=>toast("بخش آزمون در نسخه بعدی تکمیل می‌شود."));
$("#market-search").addEventListener("input",e=>{$$("#market-list .market-card").forEach(c=>c.hidden=!c.textContent.includes(e.target.value))});
$("#market-filter").addEventListener("change",e=>{$$("#market-list .market-card").forEach(c=>c.hidden=e.target.value!=="all"&&!c.textContent.includes(e.target.value))});
$("#clear-local").addEventListener("click",()=>{if(confirm("همه اطلاعات ذخیره‌شده هم‌خدمت روی این دستگاه پاک شود؟")){Object.keys(localStorage).filter(k=>k.startsWith("hk-")).forEach(k=>localStorage.removeItem(k));updateCountdown();renderNotes();toast("اطلاعات محلی پاک شد.")}});
updateCountdown();renderNotes();
if("serviceWorker" in navigator && location.protocol!=="file:"){window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}))}
let deferredPrompt;
window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();deferredPrompt=e;const btn=document.createElement("button");btn.className="outline-btn";btn.textContent="نصب هم‌خدمت";btn.onclick=async()=>{deferredPrompt.prompt();deferredPrompt=null;btn.remove()};$(".top-actions").prepend(btn)});
