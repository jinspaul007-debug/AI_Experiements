/* ═══════════════════════════════════════════════════════════
   LIFESTYLE CHALLENGE TRACKER v2.0 — App UI Engine (app.js)
   Navigation, Tracker, Dashboard, Settings, Profiles
   Depends on: core.js (loaded first)
   ═══════════════════════════════════════════════════════════ */

// ── Compat: derive HABITS/HNAMES from active challenge ──
function HABITS() { return getActiveHabitIds(); }
function HNAMES() { const m={}; getActiveHabits().forEach(h=>{m[h.id]=h.name;}); return m; }

const DAILY_QUOTES = [
  {en: "Believe you can and you're halfway there.", ml: "നിങ്ങൾക്ക് കഴിയുമെന്ന് വിശ്വസിക്കുക, നിങ്ങൾ പകുതി വഴി പിന്നിട്ടു."},
  {en: "The only bad workout is the one that didn't happen.", ml: "നടക്കാത്ത വ്യായാമം മാത്രമാണ് മോശമായത്."},
  {en: "Success is the sum of small efforts, repeated day in and day out.", ml: "വിജയം എന്നത് അനുദിനം ആവർത്തിക്കുന്ന ചെറിയ ശ്രമങ്ങളുടെ ആകെത്തുകയാണ്."},
  {en: "Your future is created by what you do today, not tomorrow.", ml: "നിങ്ങളുടെ ഭാവി സൃഷ്ടിക്കപ്പെടുന്നത് നിങ്ങൾ ഇന്ന് ചെയ്യുന്നതിലൂടെയാണ്, നാളെയല്ല."},
  {en: "Discipline is choosing between what you want now and what you want most.", ml: "ഇപ്പോൾ വേണ്ടതും ഏറ്റവും കൂടുതൽ വേണ്ടതും തമ്മിലുള്ള തിരഞ്ഞെടുപ്പാണ് അച്ചടക്കം."},
  {en: "Don't stop when you're tired. Stop when you're done.", ml: "തളരുമ്പോൾ നിർത്തരുത്. പൂർത്തിയാകുമ്പോൾ നിർത്തുക."},
  {en: "Small daily improvements are the key to staggering long-term results.", ml: "ചെറിയ ദൈനംദിന മെച്ചപ്പെടുത്തലുകളാണ് മികച്ച ദീർഘകാല ഫലങ്ങളുടെ താക്കോൽ."}
];

// ── Page Navigation ──
function showPg(id,btn) {
  if(!activeUser && id!=='pgProfile') { showProfileSetup(); return; }
  document.querySelectorAll('.pg').forEach(p=>p.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  document.querySelectorAll('.bnav button').forEach(b=>b.classList.remove('active'));
  if(btn) btn.classList.add('active');
  else {
    // Auto-highlight the matching primary nav button
    const navMap = {pgDash:0, pgTrack:1, pgGoals:2, pgAna:3, pgMore:4};
    const navBtns = document.querySelectorAll('.bnav button');
    if(navMap[id]!=null && navBtns[navMap[id]]) navBtns[navMap[id]].classList.add('active');
  }
  if(id==='pgDash') refreshDash();
  if(id==='pgTrack') { buildTrackerForm(); loadForm(curDate); }
  if(id==='pgAna') refreshAna();
  if(id==='pgSet') loadSet();
  if(id==='pgChallenge') renderChallenges();
  if(id==='pgCompare') renderCompare();
  if(id==='pgProfile') renderProfilePage();
  if(id==='pgGoals') renderGoalsPage();
  if(id==='pgTools') renderToolsPage();
  if(id==='pgTimetable') renderTimetable();
  window.scrollTo({top:0,behavior:'smooth'});
}

// ── Date Nav ──
function chgDate(d) {
  const s=getS(), next=addD(curDate,d), end=addD(s.startDate,s.duration-1);
  if(next<s.startDate||next>end){ toast('📅 Outside challenge range'); return; }
  curDate=next; loadForm(curDate);
}

function fmtDate(ds) {
  const d=s2d(ds), t=todayStr();
  const days=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const mos=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  let l=days[d.getDay()]+', '+d.getDate()+' '+mos[d.getMonth()]+' '+d.getFullYear();
  const s=getS(), dn=diffD(s.startDate,ds)+1;
  if(dn>=1&&dn<=s.duration) l+=' (Day '+dn+')';
  if(ds===t) l='📍 Today — '+l;
  return l;
}

// ── Load Day Form ──
function loadForm(ds) {
  document.getElementById('tDate').textContent=fmtDate(ds);
  const dd=getDD(ds);

  document.querySelectorAll('.hi').forEach(item=>{
    const h=item.dataset.h;
    if(!h) return;
    const cb=item.querySelector('.hcb');
    const on=dd.habits&&dd.habits[h];
    cb.classList.toggle('chk',!!on);
    item.classList.toggle('chk',!!on);
  });

  document.querySelectorAll('[data-f]').forEach(el=>{
    const f=el.dataset.f;
    if(el.tagName==='TEXTAREA') el.value=dd[f]||'';
    else if(el.type==='range'){ el.value=dd[f]||5; if(el.nextElementSibling) el.nextElementSibling.textContent=el.value+'/10'; }
    else el.value=dd[f]||'';
  });

  document.querySelectorAll('.dtb').forEach(b=>{
    b.style.background=(dd.dayType===b.dataset.t)?'var(--ac)':'';
    b.style.color=(dd.dayType===b.dataset.t)?'#fff':'';
  });

  const mood=dd.mood||0;
  document.querySelectorAll('.mb').forEach(m=>{
    const v=parseInt(m.dataset.v)||0;
    m.style.opacity=(v===mood)?'1':'0.4';
  });

  // Load meals
  dayMeals = dd.meals ? [...dd.meals] : [];
  renderMeals();
}

// ── Toggle Habit ──
function tglH(cb) {
  cb.classList.toggle('chk');
  cb.closest('.hi').classList.toggle('chk');
}

function setDT(type,btn) {
  document.querySelectorAll('.dtb').forEach(b=>{ b.style.background=''; b.style.color=''; });
  btn.style.background='var(--ac)'; btn.style.color='#fff';
}

function setM(val,el) {
  document.querySelectorAll('.mb').forEach(m=>m.style.opacity='0.4');
  el.style.opacity='1';
}

// ── Dynamic Tracker Form Builder ──
function buildTrackerForm() {
  const form = document.getElementById('dForm');
  const habits = getActiveHabits();
  const groups = {};
  habits.forEach(h => { const g=h.group||'custom'; if(!groups[g]) groups[g]=[]; groups[g].push(h); });

  let html = '';
  Object.keys(groups).sort((a,b)=>(HABIT_GROUPS[a]?.order??99)-(HABIT_GROUPS[b]?.order??99)).forEach(gk => {
    const gInfo = HABIT_GROUPS[gk]||{label:'📋 '+gk};
    html += '<div class="hg"><div class="hgt">'+gInfo.label+'</div>';
    groups[gk].forEach(h => {
      html += '<div class="hi" data-h="'+h.id+'"><div class="hcb" onclick="tglH(this)"></div>';
      html += '<div class="hl"><span class="em">'+h.emoji+'</span>'+h.name+'</div>';
      if(h.hasInput) {
        if(h.inputType==='select') {
          html += '<select class="hin" data-f="'+h.field+'" style="width:110px"><option value="">--</option>';
          (h.options||[]).forEach(o => html += '<option value="'+o.toLowerCase()+'">'+o+'</option>');
          html += '</select>';
        } else if(h.inputType==='time') {
          html += '<input type="time" class="hin" data-f="'+h.field+'" style="width:105px">';
        } else {
          html += '<input type="number" class="hin" data-f="'+h.field+'" placeholder="0"';
          if(h.step) html += ' step="'+h.step+'"';
          html += '>';
          if(h.unit) html += '<span class="hu">'+h.unit+'</span>';
        }
      }
      html += '</div>';
    });
    html += '</div>';
  });

  // Meal log section for calorie-related challenges
  const chType = activeChallenge ? activeChallenge.type : 'lifestyle';
  if(['calorie','weight_loss','lifestyle'].includes(chType)) {
    html += '<div class="hg"><div class="hgt">🍽️ Meal Log</div>';
    html += '<div id="mealList"></div>';
    html += '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:6px">';
    html += '<input type="text" class="hin" id="mealName" placeholder="Meal name" style="flex:1;min-width:100px;text-align:left">';
    html += '<input type="number" class="hin" id="mealCal" placeholder="kcal" style="width:65px">';
    html += '<select class="hin" id="mealType" style="width:90px"><option value="breakfast">Breakfast</option><option value="lunch">Lunch</option><option value="dinner">Dinner</option><option value="snack">Snack</option></select>';
    html += '<button class="btn btn-p btn-s" onclick="addMeal()">+ Add</button></div>';
    html += '<div id="calSummary" style="margin-top:8px;font-size:13px;color:var(--t2)"></div></div>';
  }

  // Day summary
  html += '<div class="hg"><div class="hgt">📝 Day Summary</div>';
  html += '<div style="display:flex;gap:6px;margin-bottom:10px;flex-wrap:wrap">';
  ['normal','rest','cheat','sick'].forEach(t => {
    const em = {normal:'🟢',rest:'🔵',cheat:'🟡',sick:'🔴'}[t];
    html += '<button class="btn btn-s btn-o dtb" data-t="'+t+'" onclick="setDT(\''+t+'\',this)">'+em+' '+t.charAt(0).toUpperCase()+t.slice(1)+'</button>';
  });
  html += '</div>';
  html += '<div style="margin-bottom:10px"><label style="font-size:12px;color:var(--t3);display:block;margin-bottom:4px">Mood</label>';
  html += '<div id="moodSel" style="display:flex;gap:8px">';
  ['😄','🙂','😐','😕','😞'].forEach((e,i) => {
    html += '<span class="mb" data-v="'+(5-i)+'" onclick="setM('+(5-i)+',this)" style="font-size:26px;cursor:pointer;opacity:.4">'+e+'</span>';
  });
  html += '</div></div>';
  html += '<div style="margin-bottom:10px"><label style="font-size:12px;color:var(--t3)">Energy Level</label>';
  html += '<input type="range" min="1" max="10" value="5" data-f="energy" style="width:100%;accent-color:var(--ac);margin-top:3px" oninput="this.nextElementSibling.textContent=this.value+\'/10\'">';
  html += '<span style="font-size:11px;color:var(--t3)">5/10</span></div>';
  html += '<textarea class="nota" data-f="notes" placeholder="Daily notes, reflections, wins, struggles..."></textarea></div>';

  html += '<div style="display:flex;gap:8px;margin-top:10px">';
  html += '<button class="btn btn-p" onclick="saveDay()" style="flex:1;justify-content:center">💾 Save Day</button>';
  html += '<button class="btn btn-no btn-s" onclick="delDay()">🗑️</button>';
  html += '</div>';

  form.innerHTML = html;
}

// ── Meal Tracking ──
let dayMeals = [];
function addMeal() {
  const name = document.getElementById('mealName').value.trim();
  const cal = parseInt(document.getElementById('mealCal').value)||0;
  const type = document.getElementById('mealType').value;
  if(!name){ toast('⚠️ Enter meal name'); return; }
  dayMeals.push({name, cal, type, time: new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})});
  document.getElementById('mealName').value='';
  document.getElementById('mealCal').value='';
  renderMeals();
}
function removeMeal(i) { dayMeals.splice(i,1); renderMeals(); }
function renderMeals() {
  const el = document.getElementById('mealList');
  if(!el) return;
  const s = getS();
  el.innerHTML = dayMeals.map((m,i) =>
    '<div style="display:flex;align-items:center;gap:6px;padding:6px;border-radius:6px;background:var(--bg3);margin-bottom:4px;font-size:13px">' +
    '<span>'+{breakfast:'🌅',lunch:'☀️',dinner:'🌙',snack:'🍪'}[m.type]+'</span>' +
    '<span style="flex:1">'+m.name+'</span><span style="color:var(--wn);font-weight:600">'+m.cal+' kcal</span>' +
    '<span style="cursor:pointer;opacity:.5" onclick="removeMeal('+i+')">✕</span></div>'
  ).join('');
  const total = dayMeals.reduce((sum,m)=>sum+m.cal,0);
  const target = s.calT||2000;
  const sumEl = document.getElementById('calSummary');
  if(sumEl) sumEl.innerHTML = '<strong>Total: '+total+' kcal</strong> / '+target+' kcal target '+
    (total>target?'<span style="color:var(--no)">⚠️ Over</span>':'<span style="color:var(--ok)">✅</span>');
}

// ── Save Day ──
function saveDay() {
  const hIds = HABITS();
  const dd={habits:{}, ts:new Date().toISOString()};

  document.querySelectorAll('.hi').forEach(item=>{
    const h=item.dataset.h;
    if(h) dd.habits[h]=item.querySelector('.hcb').classList.contains('chk');
  });

  document.querySelectorAll('[data-f]').forEach(el=>{
    const f=el.dataset.f;
    if(el.tagName==='TEXTAREA') dd[f]=el.value;
    else if(el.type==='range') dd[f]=parseInt(el.value);
    else if(el.type==='number') dd[f]=el.value?parseFloat(el.value):null;
    else dd[f]=el.value||null;
  });

  const at=document.querySelector('.dtb[style*="var(--ac)"]');
  dd.dayType=at?at.dataset.t:'normal';

  const am=document.querySelector('.mb[style*="opacity: 1"]')||document.querySelector('.mb[style*="opacity:1"]');
  if(am) dd.mood=parseInt(am.dataset.v)||3;

  if(dayMeals.length) dd.meals = [...dayMeals];
  if(dd.meals) dd.totalCalories = dd.meals.reduce((s,m)=>s+m.cal,0);

  const checked = Object.values(dd.habits).filter(Boolean).length;
  dd.score=hIds.length ? Math.round((checked/hIds.length)*100) : 0;

  setDD(curDate,dd);
  toast('✅ Day saved! Score: '+dd.score+'%');
}

// ── Delete Day ──
function delDay() {
  const dd = getDD(curDate);
  if(!dd.ts) { toast('⚠️ No data for this day'); return; }
  openMo('🗑️ Delete Day?','Delete all data for '+fmtDate(curDate)+'?',()=>{
    deleteDD(curDate);
    closeMo();
    loadForm(curDate);
    toast('🗑️ Day data deleted');
  });
}

// ── Dashboard ──
function refreshDash() {
  const s=getS(), ad=allD(), t=todayStr();
  const dn=Math.max(1,diffD(s.startDate,t)+1), cap=Math.min(dn,s.duration);

  // Live Clock & Date
  if(CI.clockInt) clearInterval(CI.clockInt);
  const updateClock = () => {
    const now = new Date();
    const clkEl = document.getElementById('liveClock');
    const dtEl = document.getElementById('liveDate');
    if(clkEl) clkEl.textContent = now.toLocaleTimeString('en-US', {hour12:false});
    if(dtEl) dtEl.textContent = now.toLocaleDateString('en-GB', {weekday:'long', year:'numeric', month:'long', day:'numeric'});
  };
  CI.clockInt = setInterval(updateClock, 1000);
  updateClock();

  // Daily Quote
  const now = new Date();
  const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
  const q = DAILY_QUOTES[dayOfYear % DAILY_QUOTES.length];
  const qEn = document.getElementById('quoteEn');
  const qMl = document.getElementById('quoteMl');
  if(qEn) qEn.textContent = '"' + q.en + '"';
  if(qMl) qMl.textContent = '"' + q.ml + '"';

  const chEmoji = activeChallenge ? (CHALLENGE_TYPES[activeChallenge.type]||{emoji:'🔥'}).emoji : '🔥';
  document.getElementById('bdgT').textContent=chEmoji+' Day '+cap+' of '+s.duration;

  let done=0, cStrk=0, bStrk=0, tmp=0;
  for(let i=0;i<cap;i++){
    const ds=addD(s.startDate,i), dd=ad[ds];
    if(dd&&dd.score>=50){ done++; tmp++; bStrk=Math.max(bStrk,tmp); }
    else if(dd&&(dd.dayType==='rest'||dd.dayType==='cheat'||dd.dayType==='sick')){ tmp++; bStrk=Math.max(bStrk,tmp); }
    else tmp=0;
  }
  for(let i=cap-1;i>=0;i--){
    const ds=addD(s.startDate,i), dd=ad[ds];
    if(dd&&(dd.score>=50||dd.dayType==='rest'||dd.dayType==='cheat'||dd.dayType==='sick')) cStrk++;
    else break;
  }

  const td=ad[t], ts=td?(td.score||0)+'%':'—';
  const op=Math.round((done/s.duration)*100);

  document.getElementById('sDone').textContent=done;
  document.getElementById('sStrk').textContent=cStrk;
  document.getElementById('sToday').textContent=ts;
  document.getElementById('sBest').textContent=bStrk;
  document.getElementById('oPct').textContent=op+'%';

  const circ=2*Math.PI*78;
  document.getElementById('pRing').style.strokeDasharray=circ;
  document.getElementById('pRing').style.strokeDashoffset=circ-(op/100)*circ;

  // Streak map
  const sm=document.getElementById('sMap'); sm.innerHTML='';
  for(let i=0;i<s.duration;i++){
    const ds=addD(s.startDate,i), dd=ad[ds];
    const dot=document.createElement('div'); dot.className='sd';
    dot.title='Day '+(i+1)+': '+ds;
    if(ds>t) dot.classList.add('fut');
    else if(dd&&dd.score>=75) dot.classList.add('ok');
    else if(dd&&dd.score>=40) dot.classList.add('prt');
    else if(dd&&(dd.dayType==='rest'||dd.dayType==='cheat')) dot.classList.add('prt');
    else if(ds<=t) dot.classList.add('mis');
    if(ds===t) dot.classList.add('tod');
    sm.appendChild(dot);
  }

  // Weight chart
  const wL=[], wM=[], wN=[], wG=[];
  let lastWt = null;
  Object.keys(ad).sort().forEach(d=>{
    const dd=ad[d];
    if(dd.weightMorning||dd.weightNight){
      wL.push('D'+(diffD(s.startDate,d)+1));
      wM.push(dd.weightMorning||null); wN.push(dd.weightNight||null);
      if(s.tgtW) wG.push(s.tgtW);
      lastWt = dd.weightMorning || dd.weightNight || lastWt;
    }
  });

  const goalTxtEl = document.getElementById('goalProgressTxt');
  if (goalTxtEl) {
    if (s.tgtW && lastWt) {
       const diff = Math.abs(lastWt - s.tgtW).toFixed(1);
       const txt = lastWt > s.tgtW ? `You are ${diff} kg away from your goal!` : `You have reached your goal! 🎉`;
       goalTxtEl.textContent = txt;
    } else if (s.tgtW) {
       goalTxtEl.textContent = `Target Goal: ${s.tgtW} kg`;
    } else {
       goalTxtEl.textContent = '';
    }
  }

  if(CI.wt) CI.wt.destroy();
  const wtDatasets = [
    {label:'Morning',data:wM,borderColor:'#3b82f6',backgroundColor:'rgba(59,130,246,.1)',fill:true,tension:.3,spanGaps:true},
    {label:'Night',data:wN,borderColor:'#a855f7',backgroundColor:'rgba(168,85,247,.1)',fill:true,tension:.3,spanGaps:true}
  ];
  if(s.tgtW && wG.length > 0) {
    wtDatasets.push({label:'Goal',data:wG,borderColor:'#22c55e',borderDash:[5,5],borderWidth:2,pointRadius:0,fill:false});
  }
  
  CI.wt=new Chart(document.getElementById('cWt'),{
    type:'line', data:{ labels:wL, datasets:wtDatasets}, options:cOpt('kg')
  });

  // Habit bar chart
  const hIds=HABITS(), hNames=HNAMES();
  const hc={}; hIds.forEach(h=>hc[h]=0); let tDays=0;
  Object.values(ad).forEach(dd=>{ if(dd.habits){ tDays++; hIds.forEach(h=>{ if(dd.habits[h]) hc[h]++; }); }});
  if(!tDays) tDays=1;
  if(CI.hab) CI.hab.destroy();
  CI.hab=new Chart(document.getElementById('cHab'),{
    type:'bar', data:{
      labels:hIds.map(h=>hNames[h]||h),
      datasets:[{label:'Completion %',data:hIds.map(h=>Math.round(hc[h]/tDays*100)),
        backgroundColor:hIds.map((_,i)=>`hsla(${i*22+200},70%,55%,.8)`),borderRadius:4}]
    }, options:{...cOpt('%'),indexAxis:'y',plugins:{legend:{display:false}},
      scales:{x:{max:100,ticks:{color:chartTxtColor()},grid:{color:chartGridColor()}},
              y:{ticks:{color:chartTxtColor(),font:{size:10}},grid:{display:false}}}}
  });

  // Milestones
  const ml=document.getElementById('mTL'); ml.innerHTML='';
  MILESTONES.forEach(m=>{
    const el=document.createElement('div'); el.className='mi';
    if(cap>=m.day) el.classList.add('ach');
    if(cap===m.day) el.classList.add('cur');
    el.innerHTML='<div class="mi-t">'+m.t+'</div><div class="mi-d">'+m.d+(cap>=m.day?' ✅':'')+'</div>';
    ml.appendChild(el);
  });

  renderDashGoals(ad);
}

// Goals at-a-glance on dashboard
function renderDashGoals(ad) {
  const el = document.getElementById('dashGoals');
  if(!el) return;
  const goals = getGoals();
  if(!goals.length){ el.innerHTML=''; return; }
  let html = '<div class="cd"><div class="ct">🎯 Goals at a Glance <span style="margin-left:auto"><button class="btn btn-o btn-s" onclick="showPg(\'pgGoals\')">View All</button></span></div>';
  goals.slice(0,4).forEach(g => {
    const proj = projectGoal(g, ad);
    const paceCls = {ahead:'ahead','on-track':'ontrack',behind:'behind','no-data':'nodata'}[proj.pace]||'nodata';
    const paceLbl = {ahead:'🚀 Ahead','on-track':'✅ On Track',behind:'⚠️ Behind','no-data':'No data'}[proj.pace]||'—';
    html += '<div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--bd)">';
    html += '<span style="font-size:20px">'+(GOAL_PRESETS.find(p=>p.type===g.type)?.emoji||'🎯')+'</span>';
    html += '<span style="flex:1;font-size:13px">'+g.label+'</span>';
    html += '<span class="pace '+paceCls+'">'+paceLbl+'</span></div>';
  });
  html += '</div>';
  el.innerHTML = html;
}

function chartTxtColor() { return getS().theme==='dark'?'#94a3b8':'#475569'; }
function chartGridColor() { return getS().theme==='dark'?'rgba(148,163,184,.1)':'rgba(71,85,105,.1)'; }

function cOpt(yL) {
  const tc=chartTxtColor(), gc=chartGridColor();
  return {
    responsive:true, maintainAspectRatio:true,
    plugins:{legend:{labels:{color:tc,font:{size:11}}}},
    scales:{
      x:{ticks:{color:tc,font:{size:10}},grid:{color:gc}},
      y:{ticks:{color:tc},grid:{color:gc},title:{display:true,text:yL,color:tc}}
    }
  };
}

// ── Settings ──
function loadSet() {
  const s=getS();
  document.getElementById('sDur').value=s.duration;
  document.getElementById('sStart').value=s.startDate;
  document.getElementById('sCheat').value=s.cheatDPW;
  document.getElementById('sRest').value=s.restDPW;
  document.getElementById('sTgtW').value=s.tgtW;
  document.getElementById('sWatT').value=s.watT;
  document.getElementById('sProT').value=s.proT;
  document.getElementById('tTheme').classList.toggle('on',s.theme==='dark');
  if(document.getElementById('sCalT')) document.getElementById('sCalT').value=s.calT||2000;
  if(document.getElementById('sSleepT')) document.getElementById('sSleepT').value=s.sleepT||7;
  if(document.getElementById('sStepsT')) document.getElementById('sStepsT').value=s.stepsT||10000;
  renderPrivacySettings();
  renderPinStatus();
}
function saveSt() {
  const s=getS();
  s.cheatDPW=parseInt(document.getElementById('sCheat').value);
  s.restDPW=parseInt(document.getElementById('sRest').value);
  s.tgtW=parseFloat(document.getElementById('sTgtW').value)||75;
  s.watT=parseFloat(document.getElementById('sWatT').value)||3.5;
  s.proT=parseFloat(document.getElementById('sProT').value)||120;
  const calEl=document.getElementById('sCalT'); if(calEl) s.calT=parseInt(calEl.value)||2000;
  const slEl=document.getElementById('sSleepT'); if(slEl) s.sleepT=parseFloat(slEl.value)||7;
  const stEl=document.getElementById('sStepsT'); if(stEl) s.stepsT=parseInt(stEl.value)||10000;
  setS(s); toast('⚙️ Settings saved');
}
function updDur() {
  const s=getS(); s.duration=parseInt(document.getElementById('sDur').value);
  setS(s); toast('📅 Duration: '+s.duration+' days');
}
function updStart() {
  const s=getS(); s.startDate=document.getElementById('sStart').value;
  setS(s); toast('📅 Start date updated');
}
function tglTheme() {
  const s=getS(); s.theme=s.theme==='dark'?'light':'dark';
  document.body.dataset.theme=s.theme;
  document.getElementById('tTheme').classList.toggle('on',s.theme==='dark');
  setS(s);
}

// ── Privacy Settings ──
function renderPrivacySettings() {
  const el = document.getElementById('privacySettings');
  if(!el || !activeUser) return;
  const priv = activeUser.privacy;
  const fields = [
    {key:'shareScore',label:'Share Score',desc:'Overall daily score'},
    {key:'shareWeight',label:'Share Weight',desc:'Weight data'},
    {key:'shareSleep',label:'Share Sleep',desc:'Sleep hours & quality'},
    {key:'shareActivity',label:'Share Activity',desc:'Exercise & steps'},
    {key:'shareCalories',label:'Share Calories',desc:'Calorie data'},
    {key:'shareMood',label:'Share Mood',desc:'Mood & energy'}
  ];
  el.innerHTML = fields.map(f =>
    '<div class="sr"><div class="sr-l">'+f.label+'<small>'+f.desc+'</small></div>' +
    '<div class="tgl'+(priv[f.key]?' on':'')+'" onclick="togglePriv(\''+f.key+'\',this)"></div></div>'
  ).join('');
}
function togglePriv(key,el) {
  const on = !el.classList.contains('on');
  el.classList.toggle('on',on);
  updatePrivacy(key,on);
}

// ── Export/Import ──
function expJSON() {
  const d={settings:getS(), days:allD(), challenge:activeChallenge, exportDate:new Date().toISOString(), version:'2.0'};
  dlBlob(new Blob([JSON.stringify(d,null,2)],{type:'application/json'}),'lifestyle_'+todayStr()+'.json');
  toast('📥 Exported JSON');
}
function expShared() {
  const data = exportForSharing();
  if(!data) { toast('⚠️ No user active'); return; }
  dlBlob(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}),'shared_'+activeUser.name+'_'+todayStr()+'.json');
  toast('📤 Shared data exported (privacy-filtered)');
}
function expCSV() {
  const ad=allD(), dates=Object.keys(ad).sort(), s=getS();
  if(!dates.length){ toast('⚠️ No data'); return; }
  const hIds=HABITS(), hNames=HNAMES();
  let csv='Date,Day,Score,Type,Mood,Energy';
  hIds.forEach(h => csv+=','+hNames[h]);
  csv+=',Calories,Notes\n';
  dates.forEach(d=>{
    const dd=ad[d], h=dd.habits||{}, dn=diffD(s.startDate,d)+1;
    let row=[d,dn,dd.score||0,dd.dayType||'normal',dd.mood||'',dd.energy||''];
    hIds.forEach(hid => row.push(h[hid]?1:0));
    row.push(dd.totalCalories||'');
    row.push('"'+(dd.notes||'').replace(/"/g,'""')+'"');
    csv+=row.join(',')+'\n';
  });
  dlBlob(new Blob([csv],{type:'text/csv'}),'lifestyle_'+todayStr()+'.csv');
  toast('📥 Exported CSV');
}
function impJSON(ev) {
  const f=ev.target.files[0]; if(!f) return;
  const r=new FileReader();
  r.onload=function(e){
    try{
      const d=JSON.parse(e.target.result);
      if(d.userName) { // Shared data import
        const shared = getSharedData();
        shared.push(d);
        setSharedData(shared);
        toast('✅ Shared data imported from '+d.userName);
        return;
      }
      if(d.settings && activeUser) localStorage.setItem('lc_s_'+activeUser.id,JSON.stringify(d.settings));
      if(d.days && activeUser) localStorage.setItem('lc_d_'+activeUser.id,JSON.stringify(d.days));
      toast('✅ Data imported!'); init();
    }catch(err){ toast('❌ Invalid: '+err.message); }
  };
  r.readAsText(f); ev.target.value='';
}
function dlBlob(b,fn) {
  const u=URL.createObjectURL(b), a=document.createElement('a');
  a.href=u; a.download=fn; document.body.appendChild(a); a.click();
  document.body.removeChild(a); URL.revokeObjectURL(u);
}
function confReset() {
  openMo('⚠️ Reset All Data?','This permanently deletes ALL tracking data for this profile. Export first!',()=>{
    if(activeUser) { localStorage.removeItem('lc_d_'+activeUser.id); localStorage.removeItem('lc_s_'+activeUser.id); }
    closeMo(); toast('🗑️ All data cleared'); init();
  });
}
function restartCh() {
  openMo('🔄 New Challenge?','Starts fresh from today. Export current data first!',()=>{
    const s=getS(); s.startDate=todayStr(); setS(s);
    if(activeUser) localStorage.removeItem('lc_d_'+activeUser.id);
    closeMo(); toast('🚀 New challenge started!'); init();
  });
}

// ── Profile Setup Page ──
function showProfileSetup() {
  document.querySelectorAll('.pg').forEach(p=>p.classList.remove('active'));
  document.getElementById('pgProfile').classList.add('active');
  renderProfilePage();
}
function renderProfilePage() {
  const el = document.getElementById('profileContent');
  if(!el) return;
  const profiles = getProfiles();
  const keys = Object.keys(profiles);
  let html = '';
  if(keys.length) {
    html += '<div class="cd"><div class="ct">👥 Profiles</div>';
    keys.forEach(k => {
      const p = profiles[k];
      const isActive = activeUser && activeUser.id===k;
      html += '<div style="display:flex;align-items:center;gap:12px;padding:12px;border-radius:8px;margin-bottom:6px;'
        +(isActive?'background:rgba(59,130,246,.12);border:1px solid var(--ac)':'border:1px solid var(--bd)')
        +';cursor:pointer" onclick="switchProfile(\''+k+'\')">';
      html += '<span style="font-size:32px">'+p.avatar+'</span>';
      html += '<div style="flex:1"><div style="font-weight:600">'+p.name+(isActive?' <span style="color:var(--ac);font-size:11px">ACTIVE</span>':'')+'</div>';
      html += '<div style="font-size:11px;color:var(--t3)">Joined '+p.createdAt+'</div></div>';
      if(!isActive) html += '<button class="btn btn-no btn-s" onclick="event.stopPropagation();confirmDelProfile(\''+k+'\')">✕</button>';
      html += '</div>';
    });
    html += '</div>';
  }
  html += '<div class="cd"><div class="ct">➕ New Profile</div>';
  html += '<div style="display:flex;gap:8px;margin-bottom:10px;flex-wrap:wrap" id="avatarPick">';
  AVATARS.forEach((a,i) => {
    html += '<span style="font-size:28px;cursor:pointer;opacity:'+(i===0?'1':'0.4')+';padding:4px" onclick="pickAvatar(this)" data-av="'+a+'">'+a+'</span>';
  });
  html += '</div>';
  html += '<input type="text" class="hin" id="newProfName" placeholder="Enter name" style="width:100%;text-align:left;padding:10px;margin-bottom:10px">';
  html += '<button class="btn btn-p btn-bl" onclick="doCreateProfile()">🚀 Create Profile</button></div>';
  el.innerHTML = html;
}
function pickAvatar(el) {
  document.querySelectorAll('#avatarPick span').forEach(s=>s.style.opacity='0.4');
  el.style.opacity='1';
}
function doCreateProfile() {
  const name = document.getElementById('newProfName').value.trim();
  if(!name) { toast('⚠️ Enter a name'); return; }
  const avEl = document.querySelector('#avatarPick span[style*="opacity: 1"]')||document.querySelector('#avatarPick span[style*="opacity:1"]');
  const avatar = avEl ? avEl.dataset.av : '🦊';
  createProfile(name, avatar);
  toast('✅ Profile created: '+name);
  if(!getChallenges().length) { showPg('pgChallenge'); return; }
  loadActiveChallenge();
  init();
}
function confirmDelProfile(id) {
  const profiles = getProfiles();
  openMo('Delete Profile?','Delete "'+profiles[id].name+'" and all their data?',()=>{ deleteProfile(id); closeMo(); renderProfilePage(); });
}

// ── Challenge Page ──
function renderChallenges() {
  const el = document.getElementById('challengeContent');
  if(!el) return;
  const chs = getChallenges();
  let html = '';

  // Active challenge
  if(activeChallenge) {
    const ct = CHALLENGE_TYPES[activeChallenge.type]||{emoji:'🌟',name:'Custom'};
    const s = getS();
    const dn = Math.max(1,diffD(s.startDate,todayStr())+1);
    html += '<div class="cd" style="border-color:var(--ac)"><div class="ct">'+ct.emoji+' Active: '+activeChallenge.name+'</div>';
    html += '<div style="font-size:13px;color:var(--t2)">Day '+Math.min(dn,s.duration)+' of '+s.duration+' &bull; Started '+s.startDate+'</div>';
    html += '<div style="font-size:12px;color:var(--t3);margin-top:4px">Tracking '+activeChallenge.habits.length+' habits</div></div>';
  }

  // Challenge history
  if(chs.length>1 || (chs.length===1 && !activeChallenge)) {
    html += '<div class="cd"><div class="ct">📋 Your Challenges</div>';
    chs.forEach(ch => {
      const ct = CHALLENGE_TYPES[ch.type]||{emoji:'✏️'};
      const isActive = activeChallenge && activeChallenge.id===ch.id;
      html += '<div style="display:flex;align-items:center;gap:10px;padding:10px;border-radius:8px;margin-bottom:6px;border:1px solid '+(isActive?'var(--ac)':'var(--bd)')+'">';
      html += '<span style="font-size:24px">'+ct.emoji+'</span>';
      html += '<div style="flex:1"><div style="font-weight:600;font-size:13px">'+ch.name+'</div>';
      html += '<div style="font-size:11px;color:var(--t3)">'+ch.duration+' days &bull; '+ch.startDate+'</div></div>';
      if(!isActive) html += '<button class="btn btn-p btn-s" onclick="switchChallenge(\''+ch.id+'\')">Switch</button>';
      else html += '<span class="scb gd">Active</span>';
      html += '</div>';
    });
    html += '</div>';
  }

  // New challenge
  html += '<div class="cd"><div class="ct">🏆 Start New Challenge</div>';
  html += '<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin-bottom:12px">';
  Object.keys(CHALLENGE_TYPES).forEach(k => {
    const ct = CHALLENGE_TYPES[k];
    html += '<div class="scard" style="cursor:pointer;text-align:left;padding:12px" onclick="selectChallengeType(\''+k+'\')" id="ct_'+k+'">';
    html += '<div style="font-size:24px;margin-bottom:4px">'+ct.emoji+'</div>';
    html += '<div style="font-weight:600;font-size:13px">'+ct.name+'</div>';
    html += '<div style="font-size:11px;color:var(--t3)">'+ct.desc+'</div></div>';
  });
  html += '</div>';
  html += '<input type="text" class="hin wfull" id="chName" placeholder="Challenge name (optional)" style="padding:10px;margin-bottom:10px">';

  // Duration mode toggle
  html += '<div class="fld" style="margin-bottom:8px"><label>Duration Mode</label>';
  html += '<select class="hin wfull" id="chMode" onchange="onChModeChange()">';
  html += '<option value="days">Fixed number of days</option>';
  html += '<option value="range">Start date → End date</option></select></div>';

  html += '<div class="grid2">';
  html += '<div class="fld"><label>Start Date</label><input type="date" class="hin wfull" id="chStart"></div>';
  html += '<div class="fld" id="chDaysWrap"><label>Number of Days</label><input type="number" class="hin wfull" id="chDays" value="101" min="1" max="999"></div>';
  html += '<div class="fld" id="chEndWrap" style="display:none"><label>End Date</label><input type="date" class="hin wfull" id="chEnd"></div>';
  html += '<div class="fld"><label>Goal Weight (kg, optional)</label><input type="number" class="hin wfull" id="chGoalW" step="0.1" placeholder="e.g. 72"></div>';
  html += '</div>';

  // Custom habit builder (shown for custom type)
  html += '<div id="customHabitBuilder" style="display:none;margin-top:12px">';
  html += '<label style="font-size:11px;color:var(--t3);font-weight:600;text-transform:uppercase;letter-spacing:.5px">Pick Habits / Categories</label>';
  html += '<div id="habitPickList" style="margin-top:6px"></div>';
  html += '<div style="display:flex;gap:6px;margin-top:8px"><input type="text" class="hin wfull" id="newHabitName" placeholder="Add custom habit (e.g. Meditate)"><button class="btn btn-o btn-s" onclick="addCustomHabit()">+ Add</button></div>';
  html += '</div>';

  html += '<button class="btn btn-p btn-bl" style="margin-top:12px" onclick="doCreateChallenge()">🚀 Start Challenge</button></div>';
  el.innerHTML = html;
  if(document.getElementById('chStart')) document.getElementById('chStart').value = todayStr();
  selectChallengeType(selectedChType);
}
let selectedChType = 'lifestyle';
let customPickedHabits = [];
let customExtraDefs = [];
function selectChallengeType(type) {
  selectedChType = type;
  document.querySelectorAll('[id^="ct_"]').forEach(el => { el.style.borderColor='var(--bd)'; el.style.background=''; });
  const el = document.getElementById('ct_'+type);
  if(el) { el.style.borderColor='var(--ac)'; el.style.background='rgba(59,130,246,.08)'; }
  const builder = document.getElementById('customHabitBuilder');
  if(builder) {
    builder.style.display = (type==='custom') ? 'block' : 'none';
    if(type==='custom'){
      if(!customPickedHabits.length) customPickedHabits = CHALLENGE_TYPES.lifestyle.habits.slice(0,6);
      renderHabitPicker();
    }
  }
}
function renderHabitPicker() {
  const el = document.getElementById('habitPickList');
  if(!el) return;
  const all = DEFAULT_HABITS.concat(customExtraDefs);
  el.innerHTML = all.map(h =>
    '<label style="display:inline-flex;align-items:center;gap:5px;margin:3px 6px 3px 0;font-size:13px;cursor:pointer">'
    +'<input type="checkbox" '+(customPickedHabits.includes(h.id)?'checked':'')+' onchange="toggleHabitPick(\''+h.id+'\')"> '+h.emoji+' '+h.name+'</label>'
  ).join('');
}
function toggleHabitPick(id){
  const i = customPickedHabits.indexOf(id);
  if(i>=0) customPickedHabits.splice(i,1); else customPickedHabits.push(id);
}
function addCustomHabit(){
  const name = document.getElementById('newHabitName').value.trim();
  if(!name){ toast('⚠️ Enter habit name'); return; }
  const id = 'cust_'+Date.now().toString(36);
  customExtraDefs.push({id, name, emoji:'✏️', group:'custom'});
  customPickedHabits.push(id);
  document.getElementById('newHabitName').value='';
  renderHabitPicker();
}
function onChModeChange(){
  const mode = document.getElementById('chMode').value;
  document.getElementById('chDaysWrap').style.display = mode==='days'?'flex':'none';
  document.getElementById('chEndWrap').style.display = mode==='range'?'flex':'none';
  if(mode==='range'){ const e=document.getElementById('chEnd'); if(e && !e.value) e.value=addD(document.getElementById('chStart').value||todayStr(),100); }
}
function doCreateChallenge() {
  const name = document.getElementById('chName').value.trim();
  const start = document.getElementById('chStart').value || todayStr();
  const mode = document.getElementById('chMode').value;
  let dur;
  if(mode==='range'){
    const end = document.getElementById('chEnd').value;
    if(!end || end<=start){ toast('⚠️ End date must be after start'); return; }
    dur = diffD(start,end)+1;
  } else {
    dur = parseInt(document.getElementById('chDays').value);
    if(!dur || dur<1){ toast('⚠️ Enter valid number of days'); return; }
  }
  const goalW = parseFloat(document.getElementById('chGoalW').value)||null;
  const opts = { goalWeight:goalW };
  let customHabits = null;
  if(selectedChType==='custom'){
    if(!customPickedHabits.length){ toast('⚠️ Pick at least one habit'); return; }
    customHabits = customPickedHabits.slice();
    opts.customHabitDefs = customExtraDefs.filter(d=>customPickedHabits.includes(d.id));
  }
  if(goalW){ updateBody({ goalWeight:goalW, startWeight:getBody().startWeight||latestWeight() }); }
  createNewChallenge(selectedChType, name||null, dur, start, customHabits, opts);
  customPickedHabits=[]; customExtraDefs=[];
  toast('🏆 Challenge started!');
  proceedInit();
}
function switchChallenge(chId) {
  localStorage.setItem('lc_ach_'+activeUser.id, chId);
  loadActiveChallenge();
  if(activeChallenge) { const s=getS(); s.duration=activeChallenge.duration; s.startDate=activeChallenge.startDate; setS(s); }
  toast('🔄 Switched challenge');
  renderChallenges();
}

// ── Comparison Page ──
function renderCompare() {
  const el = document.getElementById('compareContent');
  if(!el) return;
  const shared = getSharedData();
  let html = '<div class="cd"><div class="ct">📤 Share Your Data</div>';
  html += '<p style="font-size:13px;color:var(--t2);margin-bottom:10px">Export privacy-filtered data to share with others.</p>';
  html += '<button class="btn btn-p btn-s" onclick="expShared()">📤 Export for Sharing</button></div>';

  html += '<div class="cd"><div class="ct">📥 Import Shared Data</div>';
  html += '<p style="font-size:13px;color:var(--t2);margin-bottom:10px">Import JSON from others to compare progress.</p>';
  html += '<button class="btn btn-o btn-s" onclick="document.getElementById(\'impF\').click()">📥 Import JSON</button></div>';

  if(shared.length) {
    html += '<div class="cd"><div class="ct">📊 Comparison</div>';
    const s = getS(), myData = allD();
    shared.forEach((sd,idx) => {
      html += '<div style="margin-bottom:16px;padding:12px;border-radius:8px;border:1px solid var(--bd)">';
      html += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">';
      html += '<div><span style="font-size:20px">'+sd.avatar+'</span> <strong>'+sd.userName+'</strong></div>';
      html += '<button class="btn btn-no btn-s" onclick="removeShared('+idx+')">✕</button></div>';
      // Score comparison
      const myDates = Object.keys(myData).sort();
      const theirDates = Object.keys(sd.days).sort();
      const myAvg = myDates.length ? Math.round(myDates.reduce((acc,d)=>(myData[d].score||0)+acc,0)/myDates.length) : 0;
      const theirAvg = theirDates.length ? Math.round(theirDates.reduce((acc,d)=>(sd.days[d].score||0)+acc,0)/theirDates.length) : 0;
      html += '<div style="display:flex;gap:12px;font-size:13px">';
      html += '<div style="flex:1;text-align:center;padding:8px;border-radius:6px;background:rgba(59,130,246,.1)"><div style="font-size:20px;font-weight:700">'+myAvg+'%</div><div style="color:var(--t3);font-size:11px">You</div></div>';
      html += '<div style="flex:1;text-align:center;padding:8px;border-radius:6px;background:rgba(168,85,247,.1)"><div style="font-size:20px;font-weight:700">'+theirAvg+'%</div><div style="color:var(--t3);font-size:11px">'+sd.userName+'</div></div></div>';
      html += '</div>';
    });
    html += '<div class="chc"><canvas id="cCompare"></canvas></div>';
    html += '</div>';
    setTimeout(renderCompareChart, 100);
  }
  el.innerHTML = html;
}
function removeShared(idx) { const s=getSharedData(); s.splice(idx,1); setSharedData(s); renderCompare(); }

function renderCompareChart() {
  const canvas = document.getElementById('cCompare');
  if(!canvas) return;
  const s=getS(), myData=allD(), shared=getSharedData();
  if(!shared.length) return;
  const labels=[], myScores=[];
  const dates = Object.keys(myData).sort();
  dates.forEach(d => { labels.push('D'+(diffD(s.startDate,d)+1)); myScores.push(myData[d].score||0); });
  const datasets = [{label:'You',data:myScores,borderColor:'#3b82f6',tension:.3,pointRadius:2}];
  shared.forEach((sd,i) => {
    const colors=['#a855f7','#ec4899','#f59e0b','#22c55e'];
    const scores = dates.map(d => sd.days[d]?.score||null);
    datasets.push({label:sd.userName,data:scores,borderColor:colors[i%4],tension:.3,spanGaps:true,pointRadius:2});
  });
  if(CI.compare) CI.compare.destroy();
  CI.compare = new Chart(canvas, {type:'line',data:{labels,datasets},options:cOpt('Score %')});
}

// ═══════════════ GOALS PAGE ═══════════════
const GOAL_PRESETS = [
  {type:'water',  label:'Water Intake', unit:'L',     field:'waterLitres', emoji:'💧', def:3.5},
  {type:'sleep',  label:'Sleep',        unit:'hrs',   field:'sleepHours',  emoji:'😴', def:7},
  {type:'reading',label:'Reading',      unit:'pages', field:'readPages',   emoji:'📖', def:20},
  {type:'study',  label:'Study',        unit:'min',   field:'studyMins',   emoji:'💻', def:60},
  {type:'steps',  label:'Steps',        unit:'steps', field:'steps',       emoji:'👟', def:10000},
  {type:'weight', label:'Weight Goal',  unit:'kg',    field:'weightMorning',emoji:'⚖️', def:70}
];

function renderGoalsPage() {
  const el = document.getElementById('goalsContent');
  if(!el) return;
  const goals = getGoals(), ad = allD();
  let html = '';

  html += '<div class="cd"><div class="ct">🎯 Your Goals</div>';
  if(!goals.length) html += '<p class="muted">No goals yet. Add one below or build a weight plan in Health Tools.</p>';
  el.innerHTML = '';

  goals.forEach(g => {
    const proj = projectGoal(g, ad);
    const paceCls = {ahead:'ahead','on-track':'ontrack',behind:'behind','no-data':'nodata'}[proj.pace]||'nodata';
    const paceLbl = {ahead:'Ahead 🚀','on-track':'On Track ✅',behind:'Behind ⚠️','no-data':'No data'}[proj.pace]||'—';
    // Progress percentage
    let pct = 0;
    if(g.type==='weight' && proj.actual.length){
      const last = [...proj.actual].reverse().find(v=>v!=null);
      if(last!=null && g.startValue!=null && g.startValue!==g.target)
        pct = Math.max(0,Math.min(100, Math.round((g.startValue-last)/(g.startValue-g.target)*100)));
    } else if(proj.projValue!=null && g.target) {
      pct = Math.max(0,Math.min(100, Math.round(proj.projValue/g.target*100)));
    }
    html += '<div class="goal">';
    html += '<div class="goal-h"><span class="ge">'+(GOAL_PRESETS.find(p=>p.type===g.type)?.emoji||'🎯')+'</span>';
    html += '<span class="gt">'+g.label+'</span>';
    html += '<span class="pace '+paceCls+'">'+paceLbl+'</span></div>';
    html += '<div class="muted">Target: '+g.target+' '+g.unit+' &bull; '+g.startDate+' → '+g.endDate+'</div>';
    html += '<div class="pbar"><div style="width:'+pct+'%"></div></div>';
    html += '<div class="muted">'+proj.msg+(proj.projFinish?' (proj. finish '+proj.projFinish+')':'')+'</div>';
    html += '<div class="chc"><canvas id="cgoal_'+g.id+'"></canvas></div>';
    html += '<button class="btn btn-no btn-s" onclick="delGoal(\''+g.id+'\')">🗑️ Remove</button>';
    html += '</div>';
  });
  html += '</div>';

  // Add goal form
  html += '<div class="cd"><div class="ct">➕ Add a Goal</div>';
  html += '<div class="fld" style="margin-bottom:8px"><label>Goal Type</label><select class="hin wfull" id="goalType" onchange="onGoalTypeChange()">';
  GOAL_PRESETS.forEach(p => html += '<option value="'+p.type+'">'+p.emoji+' '+p.label+'</option>');
  html += '</select></div>';
  html += '<div class="grid2">';
  html += '<div class="fld"><label>Target</label><input type="number" class="hin wfull" id="goalTarget" value="3.5" step="0.1"></div>';
  html += '<div class="fld" id="goalStartValWrap" style="display:none"><label>Current Weight (kg)</label><input type="number" class="hin wfull" id="goalStartVal" step="0.1"></div>';
  html += '<div class="fld"><label>Start Date</label><input type="date" class="hin wfull" id="goalStart"></div>';
  html += '<div class="fld"><label>End Date</label><input type="date" class="hin wfull" id="goalEnd"></div>';
  html += '</div>';
  html += '<button class="btn btn-p btn-bl" style="margin-top:10px" onclick="doAddGoal()">🎯 Add Goal</button></div>';

  el.innerHTML = html;
  // defaults
  const gs=document.getElementById('goalStart'); if(gs) gs.value=getS().startDate||todayStr();
  const ge=document.getElementById('goalEnd'); if(ge){ const s=getS(); ge.value=challengeEndDate()||addD(todayStr(),60); }
  onGoalTypeChange();
  // render charts
  goals.forEach(g => renderGoalChart(g, ad));
}

function onGoalTypeChange() {
  const t = document.getElementById('goalType').value;
  const preset = GOAL_PRESETS.find(p=>p.type===t);
  if(preset && document.getElementById('goalTarget')) document.getElementById('goalTarget').value = preset.def;
  const wrap = document.getElementById('goalStartValWrap');
  if(wrap) wrap.style.display = (t==='weight') ? 'flex' : 'none';
  if(t==='weight'){ const sv=document.getElementById('goalStartVal'); if(sv && !sv.value) sv.value=latestWeight()||getBody().startWeight||''; }
}

function doAddGoal() {
  const t = document.getElementById('goalType').value;
  const preset = GOAL_PRESETS.find(p=>p.type===t);
  const target = parseFloat(document.getElementById('goalTarget').value);
  const start = document.getElementById('goalStart').value || todayStr();
  const end = document.getElementById('goalEnd').value || addD(start,60);
  if(!target){ toast('⚠️ Enter a target'); return; }
  if(end<=start){ toast('⚠️ End date must be after start'); return; }
  const goal = { type:t, label:preset.label+' → '+target+' '+preset.unit, target, unit:preset.unit,
    field:preset.field, startDate:start, endDate:end };
  if(t==='weight'){
    const sv = parseFloat(document.getElementById('goalStartVal').value)||latestWeight()||getBody().startWeight;
    if(!sv){ toast('⚠️ Enter current weight'); return; }
    goal.startValue = sv;
    goal.direction = target<sv?'decrease':'increase';
    goal.label = (target<sv?'Lose to ':'Gain to ')+target+' kg';
  }
  addGoal(goal);
  toast('🎯 Goal added!');
  renderGoalsPage();
}
function delGoal(id){ openMo('Remove Goal?','This removes the goal (your daily data stays).',()=>{ removeGoal(id); closeMo(); renderGoalsPage(); }); }

function renderGoalChart(g, ad) {
  const canvas = document.getElementById('cgoal_'+g.id);
  if(!canvas) return;
  const proj = projectGoal(g, ad);
  if(CI['goal_'+g.id]) CI['goal_'+g.id].destroy();
  const datasets = [
    { label:'Planned', data:proj.planned, borderColor:'#94a3b8', borderDash:[6,4], borderWidth:1.5, pointRadius:0, fill:false, tension:.2 },
    { label:'Actual', data:proj.actual, borderColor:'#3b82f6', backgroundColor:'#3b82f622', fill:true, tension:.3, spanGaps:true, pointRadius:2 }
  ];
  CI['goal_'+g.id] = new Chart(canvas.getContext('2d'), { type:'line', data:{labels:proj.labels,datasets}, options:cOpt(g.unit) });
}

// ═══════════════ PIN LOCK ═══════════════
let pinBuffer = '', pinMode = 'verify', pinNewFirst = '';
function renderPinStatus() {
  const el = document.getElementById('pinStatus');
  if(!el || !activeUser) return;
  if(activeUser.pinHash) {
    el.innerHTML = '<div style="display:flex;gap:6px;flex-wrap:wrap"><span class="pill" style="background:rgba(34,197,94,.15);color:var(--ok)">🔒 PIN Enabled</span>'
      +'<button class="btn btn-o btn-s" onclick="startSetPin()">Change PIN</button>'
      +'<button class="btn btn-no btn-s" onclick="removePinFlow()">Remove PIN</button></div>';
  } else {
    el.innerHTML = '<button class="btn btn-p btn-s" onclick="startSetPin()">🔐 Set a PIN</button>';
  }
}
function startSetPin(){ pinMode='set'; pinNewFirst=''; pinBuffer=''; openLock('Set a 4-digit PIN'); }
function removePinFlow(){ openMo('Remove PIN?','Disable PIN protection for this profile?',()=>{ setPin(null); closeMo(); renderPinStatus(); toast('🔓 PIN removed'); }); }

function openLock(msg) {
  const ls = document.getElementById('lockScreen');
  document.getElementById('lockAvatar').textContent = activeUser ? activeUser.avatar : '🔒';
  document.getElementById('lockName').textContent = activeUser ? activeUser.name : 'Locked';
  document.getElementById('lockMsg').textContent = msg || 'Enter your 4-digit PIN';
  pinBuffer=''; updatePinDots();
  ls.classList.add('show');
}
function closeLock(){ document.getElementById('lockScreen').classList.remove('show'); pinBuffer=''; updatePinDots(); }
function updatePinDots(){
  document.querySelectorAll('#pinDots .pindot').forEach((d,i)=>d.classList.toggle('on', i<pinBuffer.length));
}
function pinPress(n){
  if(pinBuffer.length>=4) return;
  pinBuffer+=n; updatePinDots();
  if(pinBuffer.length===4) setTimeout(pinComplete,150);
}
function pinDel(){ pinBuffer=pinBuffer.slice(0,-1); updatePinDots(); }
function pinComplete(){
  if(pinMode==='set'){
    if(!pinNewFirst){ pinNewFirst=pinBuffer; pinBuffer=''; updatePinDots(); document.getElementById('lockMsg').textContent='Confirm your PIN'; return; }
    if(pinNewFirst===pinBuffer){ setPin(pinBuffer); closeLock(); renderPinStatus(); toast('🔒 PIN set'); }
    else { pinNewFirst=''; pinBuffer=''; updatePinDots(); document.getElementById('lockMsg').textContent='PINs did not match. Try again.'; }
  } else {
    if(verifyPin(pinBuffer)){ closeLock(); afterUnlock(); }
    else { pinBuffer=''; updatePinDots(); const m=document.getElementById('lockMsg'); m.textContent='Wrong PIN. Try again.'; m.style.color='var(--no)'; setTimeout(()=>m.style.color='',1200); }
  }
}
function pinForgot(){
  if(pinMode==='set'){ closeLock(); return; }
  openMo('Forgot PIN?','To protect privacy, the only option is to delete THIS profile and its data. Continue?',()=>{
    closeMo(); const id=activeUser.id; closeLock(); deleteProfile(id);
  });
}
let afterUnlock = function(){ proceedInit(); };

// ═══════════════ FULL BACKUP ═══════════════
function expFullBackupFile() {
  const dump = exportFullBackup();
  dlBlob(new Blob([JSON.stringify(dump,null,2)],{type:'application/json'}),'lifestyle_FULL_backup_'+todayStr()+'.json');
  toast('🗄️ Full backup exported (all profiles)');
}
function impFullBackupFile(ev) {
  const f=ev.target.files[0]; if(!f) return;
  const r=new FileReader();
  r.onload=function(e){
    try{
      const dump=JSON.parse(e.target.result);
      if(!dump.keys){ toast('❌ Not a full backup file'); return; }
      openMo('Restore Full Backup?','This OVERWRITES all current profiles & data with the backup. Continue?',()=>{
        importFullBackup(dump); closeMo(); toast('♻️ Backup restored'); location.reload();
      });
    }catch(err){ toast('❌ Invalid: '+err.message); }
  };
  r.readAsText(f); ev.target.value='';
}

// ── Cloud Sync Logic ──
function showCloudConfig() {
  document.getElementById('ccToken').value = GitHubAPI.config.token || '';
  document.getElementById('ccUser').value = GitHubAPI.config.username || '';
  document.getElementById('ccRepo').value = GitHubAPI.config.repo || '';
  document.getElementById('cloudConfigMo').classList.add('show');
}
function saveCloudConfig() {
  const token = document.getElementById('ccToken').value.trim();
  const user = document.getElementById('ccUser').value.trim();
  const repo = document.getElementById('ccRepo').value.trim();
  if(!token || !user || !repo) { toast('⚠️ All GitHub fields required'); return; }
  GitHubAPI.saveConfig(token, user, repo);
  document.getElementById('cloudConfigMo').classList.remove('show');
  toast('✅ GitHub Config Saved');
  initCloudAuth();
}

async function cloudLoginBtn() {
  if(!GitHubAPI.isConfigured()) { toast('⚠️ Configure GitHub first'); return; }
  const clBtn = document.getElementById('clBtn');
  const user = document.getElementById('clUser').value.trim();
  const pass = document.getElementById('clPass').value.trim();
  if(!user || !pass) { toast('⚠️ Enter username and password'); return; }
  
  clBtn.textContent = 'Syncing...';
  clBtn.disabled = true;
  
  try {
    GitHubAPI.setPath('Lifestyle/data_' + user + '.enc');
    GitHubAPI.setEncryptionKey(pass);
    
    const data = await GitHubAPI.fetchData();
    if(data) {
      // Clear existing localStorage
      localStorage.clear();
      GitHubAPI.saveConfig(GitHubAPI.config.token, GitHubAPI.config.username, GitHubAPI.config.repo);
      GitHubAPI.setPath('Lifestyle/data_' + user + '.enc');
      // Import the full backup
      importFullBackup(data);
      toast('✅ Cloud data synced and decrypted!');
    } else {
      // New user
      localStorage.clear();
      GitHubAPI.saveConfig(GitHubAPI.config.token, GitHubAPI.config.username, GitHubAPI.config.repo);
      GitHubAPI.setPath('Lifestyle/data_' + user + '.enc');
      createProfile(user, '🌟');
      await GitHubAPI.pushData(exportFullBackup());
      toast('✅ New cloud profile created!');
    }
    
    // Successfully authenticated
    sessionStorage.setItem('lc_cloud_auth', '1');
    document.getElementById('cloudLogin').classList.remove('show');
    init();
    
  } catch(err) {
    toast('❌ ' + err.message);
  } finally {
    clBtn.textContent = 'Login & Sync';
    clBtn.disabled = false;
  }
}

function cloudLogout() {
  openMo('Logout?', 'This will clear local device data and return to login screen. Ensure you are synced!', () => {
    sessionStorage.removeItem('lc_cloud_auth');
    localStorage.clear();
    GitHubAPI.saveConfig(GitHubAPI.config.token, GitHubAPI.config.username, GitHubAPI.config.repo);
    location.reload();
  });
}

function initCloudAuth() {
  if(sessionStorage.getItem('lc_cloud_auth') === '1') return true;
  document.getElementById('cloudLogin').classList.add('show');
  return false;
}

// ── Init ──
function init() {
  if(!initCloudAuth()) return; // Block initialization if not logged in

  // Migrate v1 data if present
  if(localStorage.getItem('lc_s') || localStorage.getItem('lc_d')) migrateV1Data();

  // Load active user
  const userId = getActiveUserId();
  const profiles = getProfiles();
  if(userId && profiles[userId]) {
    activeUser = profiles[userId];
    loadActiveChallenge();
  } else if(Object.keys(profiles).length) {
    const first = Object.keys(profiles)[0];
    setActiveUserId(first);
    activeUser = profiles[first];
    loadActiveChallenge();
  }

  // PIN gate
  if(activeUser && activeUser.pinHash) {
    pinMode='verify'; afterUnlock=proceedInit; openLock('Enter your 4-digit PIN');
    return;
  }
  proceedInit();
}

function proceedInit() {
  if(!activeUser) { showProfileSetup(); return; }
  if(!getChallenges().length) { showPg('pgChallenge'); return; }

  const s=getS();
  document.body.dataset.theme=s.theme;
  const themeEl = document.getElementById('tTheme');
  if(themeEl) themeEl.classList.toggle('on',s.theme==='dark');
  curDate=todayStr();

  // Update header
  const bdgT = document.getElementById('bdgT');
  if(bdgT && activeChallenge) {
    const ct = CHALLENGE_TYPES[activeChallenge.type]||{emoji:'🌟'};
    bdgT.textContent = ct.emoji+' '+activeChallenge.name;
  }
  const userBadge = document.getElementById('userBadge');
  if(userBadge) userBadge.textContent = activeUser.avatar+' '+activeUser.name;
  
  // Add Logout button next to profile badge if not already there
  if(!document.getElementById('btnLogout')) {
    const btn = document.createElement('div');
    btn.id = 'btnLogout';
    btn.className = 'badge';
    btn.style.background = 'linear-gradient(135deg, var(--no), #b91c1c)';
    btn.style.cursor = 'pointer';
    btn.textContent = '🚪 Logout';
    btn.onclick = cloudLogout;
    userBadge.parentNode.appendChild(btn);
  }

  showPg('pgDash');
}

// ── Timetable Logic ──
function renderTimetable() {
  const el = document.getElementById('timetableList');
  if(!el) return;
  const tt = getTimetable();
  if(!tt.length) {
    el.innerHTML = '<div style="color:var(--t3);font-size:13px;font-style:italic">No schedule added yet.</div>';
    return;
  }
  // Sort by time
  tt.sort((a,b) => a.time.localeCompare(b.time));
  
  let html = '';
  tt.forEach((slot, idx) => {
    // format time 14:00 to 02:00 PM
    let [h, m] = slot.time.split(':');
    let hh = parseInt(h);
    let ampm = hh >= 12 ? 'PM' : 'AM';
    hh = hh % 12 || 12;
    let tFmt = hh + ':' + m + ' ' + ampm;
    
    html += '<div style="display:flex;align-items:center;padding:10px;border:1px solid var(--bd);border-radius:8px;margin-bottom:6px">';
    html += '<div style="background:rgba(59,130,246,.15);color:var(--ac);font-weight:700;padding:6px 10px;border-radius:6px;font-size:12px;margin-right:12px;font-family:monospace">' + tFmt + '</div>';
    html += '<div style="flex:1;font-size:14px">' + slot.desc + '</div>';
    html += '<button class="btn btn-no btn-s" style="padding:4px 8px" onclick="deleteTimetableSlot(' + idx + ')">✕</button>';
    html += '</div>';
  });
  el.innerHTML = html;
}

function addTimetableSlot() {
  const time = document.getElementById('ttTime').value;
  const desc = document.getElementById('ttDesc').value.trim();
  if(!time || !desc) { toast('⚠️ Enter both time and description'); return; }
  
  const tt = getTimetable();
  tt.push({time, desc});
  setTimetable(tt);
  
  document.getElementById('ttTime').value = '';
  document.getElementById('ttDesc').value = '';
  renderTimetable();
  toast('✅ Schedule updated');
}

function deleteTimetableSlot(idx) {
  const tt = getTimetable();
  tt.splice(idx, 1);
  setTimetable(tt);
  renderTimetable();
  toast('🗑️ Block removed');
}

document.addEventListener('DOMContentLoaded', init);
