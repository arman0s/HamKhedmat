/* HamKhedmat v2 — local-first prototype. Shared accounts/chat/community require a secure backend. */
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const titles={settings:'تنظیمات',home:"داشبورد",countdown:"روزشمار",community:"انجمن",market:"بازارچه",chat:"گفت‌وگوها",calendar:"تقویم شمسی و خاطرات",fun:"سرگرمی",news:"اخبار و آموزش",profile:"پروفایل",friends:"دوستان",auth:"ورود و ثبت‌نام",settings:"تنظیمات"};
const fa=n=>new Intl.NumberFormat('fa-IR').format(n);
const get=(k,d=null)=>{try{return JSON.parse(localStorage.getItem('hk-'+k))??d}catch{return d}};
const put=(k,v)=>localStorage.setItem('hk-'+k,JSON.stringify(v));
function toast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>t.classList.remove('show'),2800)}
function escapeHtml(s=''){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function page(name){$$('.page').forEach(p=>p.classList.toggle('active',p.id==='page-'+name));$$('[data-page]').forEach(b=>b.classList.toggle('active',b.dataset.page===name));$('#page-title').textContent=titles[name]||'هم‌خدمت';window.scrollTo({top:0,behavior:'smooth'});if(name==='calendar')renderCalendar();if(name==='friends')renderFriends();if(name==='chat')renderChats();if(name==='profile')renderProfile();if(name==='settings')renderSettings()}
document.addEventListener('click',e=>{const b=e.target.closest('[data-page]');if(b){e.preventDefault();page(b.dataset.page)}});
$('#today-label').textContent=new Intl.DateTimeFormat('fa-IR',{weekday:'long',day:'numeric',month:'long'}).format(new Date());
function addMonths(date,months){const d=new Date(date+'T12:00:00');const day=d.getDate();d.setMonth(d.getMonth()+Number(months));if(d.getDate()<day)d.setDate(0);return d}
function fmtDate(d){return new Intl.DateTimeFormat('fa-IR',{year:'numeric',month:'long',day:'numeric'}).format(d)}
function dayDiff(a,b){return Math.floor((Date.UTC(b.getFullYear(),b.getMonth(),b.getDate())-Date.UTC(a.getFullYear(),a.getMonth(),a.getDate()))/86400000)}
function updateCountdown(){
 const c=get('countdown');let days=null,elapsed=0,pct=0,end=null,total=0;const now=new Date();now.setHours(0,0,0,0);
 if(c?.start&&c?.duration){const s=new Date(c.start+'T00:00:00');end=addMonths(c.start,c.duration);total=Math.max(1,dayDiff(s,end));elapsed=Math.min(total,Math.max(0,dayDiff(s,now)));days=Math.max(0,dayDiff(now,end));pct=Math.min(100,Math.max(0,elapsed/total*100));}
 $('#hero-days').textContent=days===null?'هنوز روزشماری تنظیم نشده':days===0?'به تاریخ پایان تخمینی رسیدی':fa(days)+' روز تا پایان';
 $('#hero-subtitle').textContent=days===null?'تاریخ شروع و مدت خدمتت رو وارد کن تا روزشمار ساخته بشه.':(c.name||'روزشمار من')+' · '+fa(Math.round(pct))+'٪ از بازه سپری شده';
 $('#hero-percent').textContent=fa(Math.round(pct))+'٪';$('#hero-ring').style.background=`conic-gradient(from 35deg,#48a5ff ${pct}%,#ffffff22 ${pct}% 100%)`;
 $('#elapsed-stat').textContent=days===null?'—':fa(elapsed);$('#remaining-stat').textContent=days===null?'—':fa(days);$('#end-stat').textContent=end?fmtDate(end):'—';
 $('#countdown-number').textContent=days===null?'—':fa(days);$('#countdown-progress').textContent=fa(Math.round(pct))+'٪';$('#countdown-end').textContent=end?fmtDate(end):'—';$('#countdown-bar').style.width=pct+'%';if($('#remaining-detail'))$('#remaining-detail').textContent=days===null?'پس از تنظیم روزشمار، جزئیات زمان باقی‌مانده اینجا نمایش داده می‌شود.':days===0?'بازه تخمینی خدمت به پایان رسیده است.':`تقریباً ${fa(Math.floor(days/30))} ماه و ${fa(days%30)} روز باقی مانده است.`;
 if($('#total-days'))$('#total-days').textContent=days===null?'—':fa(total)+' روز';if($('#elapsed-days'))$('#elapsed-days').textContent=days===null?'—':fa(elapsed)+' روز';
 if(c){$('#start-date').value=c.start;$('#duration').value=c.duration;$('#countdown-name').value=c.name||'روزشمار من';if($('#start-date-display'))$('#start-date-display').textContent=fmtJalaliISO(c.start)}
}
// Persian calendar engine: native ECMAScript Intl calendar support.
const jMonths=['فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور','مهر','آبان','آذر','دی','بهمن','اسفند'];
const persianParts = new Intl.DateTimeFormat('en-u-ca-persian-nu-latn',{year:'numeric',month:'numeric',day:'numeric',timeZone:'UTC'});
const g2j=(gy,gm,gd)=>{
 const dt=new Date(Date.UTC(gy,gm-1,gd,12));
 const p={};persianParts.formatToParts(dt).forEach(x=>{if(x.type==='year'||x.type==='month'||x.type==='day')p[x.type]=Number(x.value)});
 return {jy:p.year,jm:p.month,jd:p.day};
};
const j2g=(jy,jm,jd)=>{
 // Search around Nowruz; compare calendar parts instead of assuming leap-year rules.
 const target=jy*10000+jm*100+jd;
 let d=new Date(Date.UTC(jy+621,2,15,12));
 for(let i=0;i<20;i++){
  const p=g2j(d.getUTCFullYear(),d.getUTCMonth()+1,d.getUTCDate());
  const value=p.jy*10000+p.jm*100+p.jd;
  if(value===target)return new Date(d.getUTCFullYear(),d.getUTCMonth(),d.getUTCDate(),12);
  d.setUTCDate(d.getUTCDate()+(value<target?1:-1));
 }
 throw new Error('تبدیل تاریخ شمسی ناموفق بود');
};
function jalaliMonthLength(y,m){
 const next=m===12?{y:y+1,m:1}:{y,m:m+1};
 return Math.round((Date.UTC(j2g(next.y,next.m,1).getFullYear(),j2g(next.y,next.m,1).getMonth(),j2g(next.y,next.m,1).getDate())-Date.UTC(j2g(y,m,1).getFullYear(),j2g(y,m,1).getMonth(),j2g(y,m,1).getDate()))/86400000);
}
let calState={...g2j(new Date().getFullYear(),new Date().getMonth()+1,new Date().getDate()),selected:null};
function renderCalendar(){const root=$('#calendar-grid');if(!root)return;const y=calState.jy,m=calState.jm,first=j2g(y,m,1),offset=(first.getDay()+1)%7,days=jalaliMonthLength(y,m),todayJ=g2j(new Date().getFullYear(),new Date().getMonth()+1,new Date().getDate());$('#calendar-month-title').textContent=jMonths[m-1]+' '+fa(y);$('#calendar-subtitle').textContent='امروز: '+fa(todayJ.jd)+' '+jMonths[todayJ.jm-1]+' '+fa(todayJ.jy);let html=['ش','ی','د','س','چ','پ','ج'].map(x=>`<div class="cal-weekday">${x}</div>`).join('');for(let i=0;i<offset;i++)html+='<div class="cal-day blank"></div>';for(let d=1;d<=days;d++){const selected=calState.selected===d;const isToday=y===todayJ.jy&&m===todayJ.jm&&d===todayJ.jd;const date=j2g(y,m,d);const iso=date.getFullYear()+'-'+String(date.getMonth()+1).padStart(2,'0')+'-'+String(date.getDate()).padStart(2,'0');const has=get('calendarEvents',[]).some(e=>e.date===iso);html+=`<button class="cal-day ${isToday?'today-day':''} ${selected?'selected':''} ${has?'has-event':''}" data-calday="${d}" data-iso="${iso}">${fa(d)}${has?'<i></i>':''}</button>`}root.innerHTML=html;$$('[data-calday]').forEach(b=>b.addEventListener('click',()=>{calState.selected=Number(b.dataset.calday);$('#memory-date').value=b.dataset.iso;renderCalendar();$('#selected-date').textContent=fa(calState.selected)+' '+jMonths[m-1]+' '+fa(y);$('#memory-title').focus()}));renderCalendarEvents()}
function renderCalendarEvents(){const list=$('#calendar-event-list');if(!list)return;const events=get('calendarEvents',[]).filter(e=>{const j=g2j(...e.date.split('-').map(Number));return j.jy===calState.jy&&j.jm===calState.jm}).sort((a,b)=>a.date.localeCompare(b.date));list.innerHTML=events.length?events.map(e=>`<article class="memory-item"><div class="memory-item-head"><b>${escapeHtml(e.title)}</b><button class="text-danger" type="button" data-event-delete="${escapeHtml(e.id||e.date+'|'+e.title)}" aria-label="حذف یادداشت">حذف</button></div><div>${escapeHtml(e.text||'')}</div><small>${escapeHtml(fmtDate(new Date(e.date+'T12:00:00')))}</small></article>`).join(''):'<p class="muted">برای این ماه هنوز یادداشتی ثبت نشده است.</p>';list.querySelectorAll('[data-event-delete]').forEach(btn=>btn.addEventListener('click',()=>{if(!confirm('این یادداشت از تقویم حذف شود؟'))return;const all=get('calendarEvents',[]);const idx=all.findIndex(e=>(e.id||e.date+'|'+e.title)===btn.dataset.eventDelete);if(idx>=0)all.splice(idx,1);put('calendarEvents',all);renderCalendar();toast('یادداشت تقویم حذف شد.')}))}
$('#cal-prev').addEventListener('click',()=>{calState.jm--;if(calState.jm<1){calState.jm=12;calState.jy--}calState.selected=null;renderCalendar()});$('#cal-next').addEventListener('click',()=>{calState.jm++;if(calState.jm>12){calState.jm=1;calState.jy++}calState.selected=null;renderCalendar()});$('#cal-today').addEventListener('click',()=>{calState={...g2j(new Date().getFullYear(),new Date().getMonth()+1,new Date().getDate()),selected:null};renderCalendar()});
function renderNotes(){const notes=get('notes',[]);$('#notes-stat').textContent=fa(notes.length);$('#memory-list').innerHTML=notes.map(n=>`<div class="memory-item"><b>${escapeHtml(n.title)}</b><div>${escapeHtml(n.text)}</div><small>${escapeHtml(n.date||'بدون تاریخ')}</small></div>`).join('');renderCalendarEvents()}
$('#save-note').addEventListener('click',()=>{const text=$('#quick-note').value.trim();if(!text){toast('اول متن یادداشت رو بنویس.');return}const notes=get('notes',[]);notes.unshift({title:'یادداشت سریع',text,date:new Date().toLocaleDateString('fa-IR')});put('notes',notes);$('#quick-note').value='';renderNotes();$('#note-feedback').textContent='یادداشت ذخیره شد.';toast('یادداشت ذخیره شد.')});
$('#save-memory').addEventListener('click',()=>{const title=$('#memory-title').value.trim(),text=$('#memory-text').value.trim(),date=$('#memory-date').value;if(!title||!text||!date){toast('عنوان، تاریخ و متن را وارد کن.');return}const notes=get('notes',[]);notes.unshift({title,text,date:fmtDate(new Date(date+'T12:00:00'))});put('notes',notes);const events=get('calendarEvents',[]);events.push({id:(crypto.randomUUID?crypto.randomUUID():String(Date.now())+Math.random().toString(16).slice(2)),title,text,date});put('calendarEvents',events);$('#memory-title').value='';$('#memory-text').value='';renderNotes();renderCalendar();toast('یادداشت در تقویم ذخیره شد.')});
// Local prototype community: content stays on this browser only.
function renderPosts(){const posts=get('posts',[]);const list=$('#post-list');if(!list)return;const seed=list.dataset.seed||list.innerHTML;if(!list.dataset.seed)list.dataset.seed=seed;list.innerHTML=seed+posts.map((p,i)=>`<article class="feed-card"><div class="feed-top"><span class="avatar">${escapeHtml((p.author||'ش').slice(0,1))}</span><div><b>${escapeHtml(p.author||'شما')}</b><small>پست محلی · ${escapeHtml(p.date||'امروز')}</small></div><span class="feed-category">شخصی</span></div><p>${escapeHtml(p.text)}</p><div class="feed-actions"><button data-like="${i}">♥ پسندیدن (${fa(p.likes||0)})</button><button data-comment="${i}">◌ نظر</button><button data-report="${i}">⚑ گزارش</button></div>${(p.comments||[]).map(c=>`<p class="local-comment"><b>${escapeHtml(c.author)}:</b> ${escapeHtml(c.text)}</p>`).join('')}</article>`).join('');list.querySelectorAll('[data-like]').forEach(b=>b.onclick=()=>{const a=get('posts',[]);a[+b.dataset.like].likes=(a[+b.dataset.like].likes||0)+1;put('posts',a);renderPosts()});list.querySelectorAll('[data-comment]').forEach(b=>b.onclick=()=>{const text=prompt('نظر خودت را بنویس:');if(!text?.trim())return;const a=get('posts',[]),p=a[+b.dataset.comment];p.comments=p.comments||[];p.comments.push({author:get('profile',{name:'کاربر مهمان'}).name||'کاربر',text});put('posts',a);renderPosts()});list.querySelectorAll('[data-report]').forEach(b=>b.onclick=()=>toast('گزارش نمونه ثبت شد؛ در نسخه آنلاین به ناظر ارسال می‌شود.'))}
$('#new-post').addEventListener('click',()=>{const text=prompt('متن پست را بنویس:');if(!text?.trim())return;const posts=get('posts',[]);posts.unshift({text,author:get('profile',{name:'شما'}).name||'شما',date:fmtDate(new Date()),likes:0,comments:[]});put('posts',posts);renderPosts();toast('پست فقط روی همین دستگاه ذخیره شد.')});
$('#new-ad').addEventListener('click',()=>toast('ثبت آگهی عمومی پس از اتصال بک‌اند و بررسی محتوا فعال می‌شود.'));$('#poll-vote').addEventListener('click',()=>toast('پاسخ نمونه ثبت شد؛ نظرسنجی عمومی بعداً فعال می‌شود.'));$('#quiz-start').addEventListener('click',()=>toast('بخش آزمون در نسخه بعدی تکمیل می‌شود.'));
$('#market-search').addEventListener('input',e=>{$$('#market-list .market-card').forEach(c=>c.hidden=!c.textContent.includes(e.target.value))});$('#market-filter').addEventListener('change',e=>{$$('#market-list .market-card').forEach(c=>c.hidden=e.target.value!=='all'&&!c.textContent.includes(e.target.value))});
// Profile is deliberately local-only: no password is stored in browser storage.
function renderProfile(){const p=get('profile',{name:'کاربر مهمان',bio:'',nickname:''});$('#profile-name').value=p.name||'';$('#profile-nickname').value=p.nickname||'';$('#profile-bio').value=p.bio||'';$('#profile-display-name').textContent=p.nickname||p.name||'کاربر مهمان';$('#profile-initial').textContent=(p.nickname||p.name||'ک').slice(0,1)}
$('#save-profile').addEventListener('click',()=>{const name=$('#profile-name').value.trim(),nickname=$('#profile-nickname').value.trim(),bio=$('#profile-bio').value.trim();if(!name){toast('نام نمایشی را وارد کن.');return}put('profile',{name,nickname,bio});renderProfile();toast('پروفایل محلی ذخیره شد.')});
$('#signup-demo').addEventListener('click',()=>toast('برای ساخت حساب واقعی باید سرویس احراز هویت و پایگاه داده متصل شود.'));
$('#login-demo').addEventListener('click',()=>toast('ورود واقعی در این نسخه فعال نیست؛ رمز عبور وارد نکن.'));
// Friend requests are sample/local records, not accounts searchable across the internet.
function renderFriends(){const f=get('friends',[]);$('#friend-list').innerHTML=f.length?f.map((x,i)=>`<div class="friend-row"><span class="avatar">${escapeHtml(x.name.slice(0,1))}</span><div><b>${escapeHtml(x.name)}</b><small>درخواست محلی</small></div><button class="outline-btn" data-friend-remove="${i}">حذف</button></div>`).join(''):'<p class="muted">هنوز دوستی اضافه نکرده‌ای.</p>';$$('[data-friend-remove]').forEach(b=>b.onclick=()=>{const a=get('friends',[]);a.splice(+b.dataset.friendRemove,1);put('friends',a);renderFriends()})}
$('#add-friend').addEventListener('click',()=>{const name=$('#friend-name').value.trim();if(!name){toast('یک نام مستعار وارد کن.');return}const f=get('friends',[]);f.push({name});put('friends',f);$('#friend-name').value='';renderFriends();toast('به فهرست محلی اضافه شد؛ هنوز درخواست واقعی ارسال نشده است.')});
function renderChats(){const msgs=get('localChat',[]);$('#chat-messages').innerHTML=msgs.map(m=>`<div class="chat-bubble"><b>${escapeHtml(m.author)}</b><p>${escapeHtml(m.text)}</p><small>${escapeHtml(m.time)}</small></div>`).join('')||'<p class="muted">گفت‌وگوی آزمایشی هنوز پیامی ندارد.</p>'}
$('#send-chat').addEventListener('click',()=>{const text=$('#chat-input').value.trim();if(!text)return;const a=get('localChat',[]);a.push({author:get('profile',{name:'شما'}).nickname||get('profile',{name:'شما'}).name||'شما',text,time:new Date().toLocaleTimeString('fa-IR',{hour:'2-digit',minute:'2-digit'})});put('localChat',a);$('#chat-input').value='';renderChats();toast('پیام فقط روی همین دستگاه ذخیره شد؛ به شخص دیگری ارسال نشده است.')});
$('#clear-local').addEventListener('click',()=>{if(confirm('همه اطلاعات ذخیره‌شده هم‌خدمت روی این دستگاه پاک شود؟')){Object.keys(localStorage).filter(k=>k.startsWith('hk-')).forEach(k=>localStorage.removeItem(k));updateCountdown();renderNotes();renderProfile();renderPosts();renderFriends();renderChats();toast('اطلاعات محلی پاک شد.')}});

// Calendar date selector for personal memories, sharing the same verified Persian calendar engine.
let memoryPickerState={...g2j(new Date().getFullYear(),new Date().getMonth()+1,new Date().getDate())};
function renderMemoryPicker(){
 const root=$('#memory-date-grid');if(!root)return;
 const {jy,jm}=memoryPickerState,first=j2g(jy,jm,1),offset=(first.getDay()+1)%7,count=jalaliMonthLength(jy,jm);
 $('#memory-month-title').textContent=`${jMonths[jm-1]} ${fa(jy)}`;
 let out=['ش','ی','د','س','چ','پ','ج'].map(x=>`<span class="jalali-weekday">${x}</span>`).join('');
 for(let i=0;i<offset;i++)out+='<span class="jalali-empty"></span>';
 for(let day=1;day<=count;day++){
  const d=j2g(jy,jm,day),iso=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  out+=`<button type="button" class="jalali-day ${$('#memory-date').value===iso?'selected':''}" data-memory-day="${day}">${fa(day)}</button>`;
 }
 root.innerHTML=out;
 root.querySelectorAll('[data-memory-day]').forEach(btn=>btn.addEventListener('click',()=>{
  const d=j2g(jy,jm,Number(btn.dataset.memoryDay)),iso=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  $('#memory-date').value=iso;$('#memory-date-display').textContent=fmtJalaliISO(iso);$('#selected-date').textContent=fmtJalaliISO(iso);closeMemoryPicker();
 }));
}
function openMemoryPicker(){const v=$('#memory-date').value;if(v){const [y,m,d]=v.split('-').map(Number);memoryPickerState=g2j(y,m,d)}else memoryPickerState={...g2j(new Date().getFullYear(),new Date().getMonth()+1,new Date().getDate())};$('#memory-date-picker').hidden=false;renderMemoryPicker()}
function closeMemoryPicker(){$('#memory-date-picker').hidden=true}
$('#memory-date-display').addEventListener('click',openMemoryPicker);
$('#memory-month-prev').addEventListener('click',()=>{memoryPickerState.jm--;if(memoryPickerState.jm<1){memoryPickerState.jm=12;memoryPickerState.jy--}renderMemoryPicker()});
$('#memory-month-next').addEventListener('click',()=>{memoryPickerState.jm++;if(memoryPickerState.jm>12){memoryPickerState.jm=1;memoryPickerState.jy++}renderMemoryPicker()});
$('#memory-date-today').addEventListener('click',()=>{const d=new Date(),iso=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;$('#memory-date').value=iso;$('#memory-date-display').textContent=fmtJalaliISO(iso);$('#selected-date').textContent=fmtJalaliISO(iso);closeMemoryPicker()});
$('#memory-date-close').addEventListener('click',closeMemoryPicker);

// Preferences: persisted locally; language pack covers shared navigation, settings and common actions.
const languagePacks={
 fa:{dir:'rtl',lang:'fa',nav:['خانه','روزشمار','انجمن','بازارچه','گفت‌وگوها','دوستان','تقویم و خاطرات','سرگرمی','اخبار و آموزش'],settings:'تنظیمات برنامه',welcome:'خوش اومدی به هم‌خدمت',home:'داشبورد',countdown:'روزشمار',calendar:'تقویم شمسی و خاطرات',profile:'پروفایل من'},
 en:{dir:'ltr',lang:'en',nav:['Home','Countdown','Community','Marketplace','Chats','Friends','Calendar & memories','Fun','News & guides'],settings:'App settings',welcome:'Welcome to HamKhedmat',home:'Dashboard',countdown:'My countdown',calendar:'Persian calendar & memories',profile:'My profile'},
 ar:{dir:'rtl',lang:'ar',nav:['الرئيسية','العد التنازلي','المجتمع','السوق','المحادثات','الأصدقاء','التقويم والذكريات','ترفيه','الأخبار والإرشادات'],settings:'إعدادات التطبيق',welcome:'مرحباً بك في هم‌خدمت',home:'لوحة التحكم',countdown:'العد التنازلي',calendar:'التقويم والذكريات',profile:'ملفي الشخصي'}
};
function applyLanguage(code){
 const pack=languagePacks[code]||languagePacks.fa;document.documentElement.lang=pack.lang;document.documentElement.dir=pack.dir;
 const side=$$('.side-nav .nav-link');side.forEach((b,i)=>{const span=b.querySelector('span');if(span&&pack.nav[i]){const icon=span.textContent;b.innerHTML='';const s=document.createElement('span');s.textContent=icon;b.append(s,document.createTextNode(' '+pack.nav[i]))}});
 const map={'#page-home .welcome-row h1':pack.welcome,'#page-title':pack.home,'#page-countdown h1':pack.countdown,'#page-calendar h1':pack.calendar,'#page-profile h1':pack.profile,'#page-settings h1':pack.settings};
 Object.entries(map).forEach(([sel,value])=>{const el=$(sel);if(el){if(sel==='#page-title')el.textContent=value;else el.textContent=value}});
 $$('.mobile-nav button small').forEach((el,i)=>{const names=code==='en'?['Home','Timer','Community','Market','Profile']:code==='ar'?['الرئيسية','العد','المجتمع','السوق','ملفي']:['خانه','روزشمار','انجمن','بازارچه','پروفایل'];el.textContent=names[i]||el.textContent});
}
function applyTheme(mode){
 const actual=mode==='system'?(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):mode;
 document.documentElement.dataset.theme=actual;
 document.querySelector('meta[name="theme-color"]').content=actual==='dark'?'#0c1426':'#101d3a';
}
function updateClock(){
 const prefs=get('settings',{}),code=prefs.language||'fa';
 const locale=code==='fa'?'fa-IR-u-ca-persian-nu-arab':code==='ar'?'ar-EG-u-ca-islamic-nu-arab':'en-GB';
 const now=new Date();
 const date=new Intl.DateTimeFormat(locale,{weekday:'long',year:'numeric',month:'long',day:'numeric'}).format(now);
 const time=new Intl.DateTimeFormat(locale,{hour:'2-digit',minute:'2-digit',second:'2-digit'}).format(now);
 $('#today-label').textContent=date;$('#clock-label').textContent=time;
 $('#settings-date-preview').textContent=date;$('#settings-time-preview').textContent=time;
 $('#clock-label').hidden=prefs.showClock===false;
}
function renderSettings(){
 const s=get('settings',{theme:'system',language:'fa',notifications:false,dailyReminder:false,reminderTime:'09:00',showClock:true});
 $('#theme-setting').value=s.theme;$('#language-setting').value=s.language;$('#daily-reminder').checked=!!s.dailyReminder;$('#reminder-time').value=s.reminderTime||'09:00';$('#show-clock').checked=s.showClock!==false;
 $('#notification-status').textContent=('Notification'in window)?({granted:'اجازه داده شده',denied:'مسدود شده در مرورگر',default:'هنوز اجازه داده نشده'}[Notification.permission]||'پشتیبانی نمی‌شود'):'این مرورگر اعلان را پشتیبانی نمی‌کند';
}
$('#theme-setting').addEventListener('change',e=>applyTheme(e.target.value));
$$('[data-theme-choice]').forEach(b=>b.addEventListener('click',()=>{$('#theme-setting').value=b.dataset.themeChoice;applyTheme(b.dataset.themeChoice)}));
$('#language-setting').addEventListener('change',e=>{applyLanguage(e.target.value);updateClock()});
$('#enable-notifications').addEventListener('click',async()=>{
 if(!('Notification'in window)){toast('اعلان در این مرورگر پشتیبانی نمی‌شود.');return}
 try{const p=await Notification.requestPermission();$('#notification-status').textContent=p==='granted'?'اجازه داده شده':p==='denied'?'مسدود شده':'هنوز اجازه داده نشده';toast(p==='granted'?'اجازه اعلان فعال شد.':'اجازه اعلان داده نشد.')}catch{toast('امکان درخواست اجازه اعلان وجود ندارد.')}
});
$('#save-settings').addEventListener('click',()=>{
 const s={theme:$('#theme-setting').value,language:$('#language-setting').value,dailyReminder:$('#daily-reminder').checked,reminderTime:$('#reminder-time').value,showClock:$('#show-clock').checked};
 put('settings',s);applyTheme(s.theme);applyLanguage(s.language);updateClock();toast('تنظیمات ذخیره شد.');
});
$('#reset-settings').addEventListener('click',()=>{localStorage.removeItem('hk-settings');renderSettings();applyTheme('system');applyLanguage('fa');updateClock();toast('تنظیمات پیش‌فرض بازیابی شد.')});
$('#daily-reminder').addEventListener('change',e=>{if(e.target.checked&&(!('Notification'in window)||Notification.permission!=='granted'))toast('برای اعلان، ابتدا اجازه اعلان سیستم را فعال کن.')});
function localReminderCheck(){
 const s=get('settings',{});if(!s.dailyReminder||!('Notification'in window)||Notification.permission!=='granted')return;
 const now=new Date(),key=`${now.getFullYear()}-${now.getMonth()}-${now.getDate()}-${s.reminderTime||'09:00'}`;
 if(now.getHours()===Number((s.reminderTime||'09:00').split(':')[0])&&now.getMinutes()===Number((s.reminderTime||'09:00').split(':')[1])&&get('lastReminder')!==key){
  navigator.serviceWorker?.ready.then(reg=>reg.showNotification('یادآوری هم‌خدمت',{body:'زمان مرور برنامه و یادداشت‌های امروز رسیده است.',icon:'./assets/icon-192.png'})).catch(()=>{});
  put('lastReminder',key);
 }
}

updateCountdown();renderNotes();renderPosts();renderProfile();renderCalendar();renderSettings();
const initialPrefs=get('settings',{theme:'system',language:'fa'});applyTheme(initialPrefs.theme||'system');applyLanguage(initialPrefs.language||'fa');updateClock();setInterval(()=>{updateClock();localReminderCheck()},1000);

if('serviceWorker'in navigator&&location.protocol!=='file:'){window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}))}
let deferredPrompt;window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredPrompt=e;const btn=document.createElement('button');btn.className='outline-btn';btn.textContent='نصب هم‌خدمت';btn.onclick=async()=>{deferredPrompt.prompt();deferredPrompt=null;btn.remove()};$('.top-actions').prepend(btn)});
