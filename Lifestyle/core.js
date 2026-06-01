/* ═══════════════════════════════════════════════════════════
   LIFESTYLE CHALLENGE TRACKER v2.0 — Core Module (core.js)
   Date helpers, Storage, Profiles, Challenges, Constants
   ═══════════════════════════════════════════════════════════ */

// ── Avatars ──
const AVATARS = ['🦊','🐼','🦁','🐯','🐨','🐸','🦄','🐲','🦅','🐬','🌟','🔥','💎','🎯','🏆','🚀'];

// ── Default Habits Library ──
const DEFAULT_HABITS = [
  {id:'wakeUp430',name:'Wake up Early',emoji:'⏰',group:'morning',hasInput:true,inputType:'time',field:'wakeUpTime'},
  {id:'yoga',name:'Yoga / Stretch',emoji:'🧘',group:'morning',hasInput:true,inputType:'number',field:'yogaMins',unit:'min'},
  {id:'morningExercise',name:'Walk / Run / Cycle',emoji:'🏃',group:'morning',hasInput:true,inputType:'number',field:'exerciseMins',unit:'min'},
  {id:'weightMorning',name:'Morning Weight',emoji:'⚖️',group:'morning',hasInput:true,inputType:'number',field:'weightMorning',unit:'kg',step:'0.1'},
  {id:'gym',name:'Gym Workout',emoji:'🏋️',group:'fitness',hasInput:true,inputType:'select',field:'gymType',options:['Chest','Back','Shoulders','Arms','Legs','Cardio','Full Body','Rest Day']},
  {id:'steps',name:'Steps Goal',emoji:'👟',group:'fitness',hasInput:true,inputType:'number',field:'steps',unit:'steps'},
  {id:'noSugar',name:'No Sugar',emoji:'🚫',group:'nutrition'},
  {id:'noJunk',name:'No Junk Food',emoji:'🚫',group:'nutrition'},
  {id:'balancedMeal',name:'Balanced Meals',emoji:'🥗',group:'nutrition'},
  {id:'protein',name:'Enough Protein',emoji:'🥩',group:'nutrition',hasInput:true,inputType:'number',field:'proteinGrams',unit:'g'},
  {id:'water',name:'Water Intake',emoji:'💧',group:'nutrition',hasInput:true,inputType:'number',field:'waterLitres',unit:'L',step:'0.5'},
  {id:'calorieTrack',name:'Calorie Tracking',emoji:'🔥',group:'nutrition',hasInput:true,inputType:'number',field:'calories',unit:'kcal'},
  {id:'study',name:'Upskill Study',emoji:'💻',group:'learning',hasInput:true,inputType:'number',field:'studyMins',unit:'min'},
  {id:'reading',name:'Read Book',emoji:'📖',group:'learning',hasInput:true,inputType:'number',field:'readPages',unit:'pg'},
  {id:'communication',name:'Language Practice',emoji:'🗣️',group:'learning',hasInput:true,inputType:'number',field:'commMins',unit:'min'},
  {id:'qualityTime',name:'Quality Family Time',emoji:'❤️',group:'evening'},
  {id:'sleep7hrs',name:'7+ Hours Sleep',emoji:'😴',group:'evening',hasInput:true,inputType:'number',field:'sleepHours',unit:'hrs',step:'0.5'},
  {id:'sleepQuality',name:'Sleep Quality',emoji:'🌙',group:'evening',hasInput:true,inputType:'select',field:'sleepQuality',options:['Poor','Fair','Good','Very Good','Excellent']},
  {id:'bedTime',name:'Bed Time',emoji:'🛏️',group:'evening',hasInput:true,inputType:'time',field:'bedTime'},
  {id:'weightNight',name:'Night Weight',emoji:'⚖️',group:'evening',hasInput:true,inputType:'number',field:'weightNight',unit:'kg',step:'0.1'}
];

const HABIT_GROUPS = {
  morning:{label:'🌅 Morning Routine',order:0},
  fitness:{label:'💪 Fitness',order:1},
  nutrition:{label:'🍎 Nutrition',order:2},
  learning:{label:'📚 Learning & Growth',order:3},
  evening:{label:'🌙 Evening & Sleep',order:4},
  custom:{label:'✏️ Custom Habits',order:5}
};

const CHALLENGE_TYPES = {
  lifestyle:{name:'Lifestyle Transform',emoji:'🌟',desc:'Track all habits for complete life improvement',
    habits:['wakeUp430','yoga','morningExercise','weightMorning','gym','noSugar','noJunk','balancedMeal','protein','water','study','reading','communication','qualityTime','sleep7hrs','weightNight']},
  weight_loss:{name:'Weight Loss',emoji:'⚖️',desc:'Focus on weight, calories, exercise and nutrition',
    habits:['weightMorning','morningExercise','gym','steps','noSugar','noJunk','balancedMeal','protein','water','calorieTrack','weightNight']},
  sleep:{name:'Sleep Improvement',emoji:'😴',desc:'Improve sleep quality, duration and schedule',
    habits:['wakeUp430','yoga','morningExercise','water','sleep7hrs','sleepQuality','bedTime']},
  activity:{name:'Activity Challenge',emoji:'🏃',desc:'Boost physical activity and fitness levels',
    habits:['morningExercise','yoga','gym','steps','water','protein','sleep7hrs']},
  calorie:{name:'Calorie Control',emoji:'🍎',desc:'Manage nutrition, calories and meal quality',
    habits:['balancedMeal','noSugar','noJunk','protein','water','calorieTrack','weightMorning','weightNight']},
  custom:{name:'Custom Challenge',emoji:'✏️',desc:'Choose your own habits and goals',habits:[]}
};

const MILESTONES = [
  {day:1,t:'Day 1 — The Beginning',d:'You started! The hardest part is done.'},
  {day:7,t:'Week 1 Complete',d:'First week survived. Habits forming.'},
  {day:14,t:'2 Weeks Strong',d:'Your brain is starting to rewire.'},
  {day:21,t:'21 Days — Habit Forming',d:'Science says 21 days forms habits.'},
  {day:30,t:'1 Month Warrior',d:'30 days of discipline!'},
  {day:50,t:'Halfway Hero',d:'Past the halfway mark.'},
  {day:66,t:'66 Days — Habit Locked',d:'Research: 66 days = automatic.'},
  {day:75,t:'75 Hard Complete',d:'You crushed 75 Hard!'},
  {day:90,t:'90 Days — Transformation',d:'3 months. Look back at Day 1.'},
  {day:100,t:'Century Mark!',d:'100 days of discipline.'},
  {day:101,t:'🏆 CHALLENGE COMPLETE!',d:'101 days. UNSTOPPABLE.'}
];

// ── State ──
let curDate = todayStr();
let CI = {};
let activeUser = null;
let activeChallenge = null;

// ── Cloud Sync ──
let syncTimeout = null;
function triggerSync() {
  if (sessionStorage.getItem('lc_cloud_auth') !== '1') return;
  clearTimeout(syncTimeout);
  syncTimeout = setTimeout(async () => {
    if (window.GitHubAPI && GitHubAPI.isConfigured()) {
       try { await GitHubAPI.pushData(exportFullBackup()); console.log('Auto-synced to cloud'); }
       catch (e) { console.error('Sync error:', e); }
    }
  }, 3000);
}

// ── Date Helpers ──
function todayStr() { const d=new Date(); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); }
function d2s(d) { return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); }
function s2d(s) { const p=s.split('-'); return new Date(p[0],p[1]-1,p[2]); }
function addD(s,n) { const d=s2d(s); d.setDate(d.getDate()+n); return d2s(d); }
function diffD(a,b) { return Math.floor((s2d(b)-s2d(a))/864e5); }
function uid() { return 'u_'+Date.now().toString(36)+Math.random().toString(36).slice(2,6); }

// ── Profile Storage ──
function getProfiles() { return JSON.parse(localStorage.getItem('lc_profiles')||'{}'); }
function setProfiles(p) { localStorage.setItem('lc_profiles',JSON.stringify(p)); triggerSync(); }
function getActiveUserId() { return localStorage.getItem('lc_active')||null; }
function setActiveUserId(id) { localStorage.setItem('lc_active',id); triggerSync(); }

function createProfile(name, avatar, body) {
  const profiles = getProfiles(), id = uid();
  profiles[id] = { id, name, avatar:avatar||'🦊', createdAt:todayStr(),
    body: Object.assign({ heightCm:null, age:null, gender:'male', activity:'moderate', startWeight:null, goalWeight:null }, body||{}),
    pinHash: null,
    privacy:{ shareWeight:false, shareSleep:true, shareActivity:true, shareCalories:false, shareMood:false, shareScore:true }
  };
  setProfiles(profiles);
  setActiveUserId(id);
  activeUser = profiles[id];
  return id;
}

// ── Body Metrics ──
function getBody() { return (activeUser && activeUser.body) || { heightCm:null, age:null, gender:'male', activity:'moderate', startWeight:null, goalWeight:null }; }
function updateBody(patch) {
  if(!activeUser) return;
  const profiles = getProfiles();
  profiles[activeUser.id].body = Object.assign({}, profiles[activeUser.id].body||{}, patch);
  activeUser.body = profiles[activeUser.id].body;
  setProfiles(profiles);
}

// ── PIN Protection (local-only simple hash) ──
function hashPin(pin) {
  let h = 5381;
  const str = 'lc_salt_'+pin;
  for(let i=0;i<str.length;i++){ h = ((h<<5)+h) + str.charCodeAt(i); h = h & h; }
  return 'h'+(h>>>0).toString(36);
}
function setPin(pin) {
  if(!activeUser) return;
  const profiles = getProfiles();
  profiles[activeUser.id].pinHash = pin ? hashPin(pin) : null;
  activeUser.pinHash = profiles[activeUser.id].pinHash;
  setProfiles(profiles);
}
function verifyPin(pin) { return activeUser && activeUser.pinHash === hashPin(pin); }
function hasPin(profile) { return !!(profile && profile.pinHash); }

function switchProfile(id) {
  const profiles = getProfiles();
  if(!profiles[id]) return;
  setActiveUserId(id);
  activeUser = profiles[id];
  loadActiveChallenge();
  init();
}

function deleteProfile(id) {
  const profiles = getProfiles();
  delete profiles[id];
  setProfiles(profiles);
  ['lc_s_','lc_d_','lc_ch_','lc_ach_'].forEach(k=>localStorage.removeItem(k+id));
  if(getActiveUserId()===id) {
    const keys = Object.keys(profiles);
    if(keys.length) switchProfile(keys[0]);
    else { localStorage.removeItem('lc_active'); activeUser=null; showProfileSetup(); }
  }
  triggerSync();
}

function updatePrivacy(field, value) {
  if(!activeUser) return;
  const profiles = getProfiles();
  profiles[activeUser.id].privacy[field] = value;
  activeUser.privacy[field] = value;
  setProfiles(profiles);
}

// ── User-Scoped Storage ──
function getS() {
  if(!activeUser) return {duration:101,startDate:todayStr(),theme:'dark',cheatDPW:1,restDPW:1,tgtW:75,watT:3.5,proT:120,calT:2000,sleepT:7,stepsT:10000};
  return JSON.parse(localStorage.getItem('lc_s_'+activeUser.id)||JSON.stringify({
    duration:101,startDate:todayStr(),theme:'dark',cheatDPW:1,restDPW:1,tgtW:75,watT:3.5,proT:120,calT:2000,sleepT:7,stepsT:10000
  }));
}
function setS(s) { if(activeUser) { localStorage.setItem('lc_s_'+activeUser.id,JSON.stringify(s)); triggerSync(); } }
function getDD(ds) { if(!activeUser) return {}; const a=JSON.parse(localStorage.getItem('lc_d_'+activeUser.id)||'{}'); return a[ds]||{}; }
function setDD(ds,d) { if(!activeUser) return; const a=JSON.parse(localStorage.getItem('lc_d_'+activeUser.id)||'{}'); a[ds]=d; localStorage.setItem('lc_d_'+activeUser.id,JSON.stringify(a)); triggerSync(); }
function allD() { if(!activeUser) return {}; return JSON.parse(localStorage.getItem('lc_d_'+activeUser.id)||'{}'); }
function deleteDD(ds) { if(!activeUser) return; const a=JSON.parse(localStorage.getItem('lc_d_'+activeUser.id)||'{}'); delete a[ds]; localStorage.setItem('lc_d_'+activeUser.id,JSON.stringify(a)); triggerSync(); }

// ── Challenge Storage ──
function getChallenges() { if(!activeUser) return []; return JSON.parse(localStorage.getItem('lc_ch_'+activeUser.id)||'[]'); }
function setChallenges(chs) { if(activeUser) { localStorage.setItem('lc_ch_'+activeUser.id,JSON.stringify(chs)); triggerSync(); } }

function createNewChallenge(type, name, duration, startDate, customHabits, opts) {
  opts = opts || {};
  const chs = getChallenges();
  const ct = CHALLENGE_TYPES[type]||CHALLENGE_TYPES.lifestyle;
  const ch = { id:'ch_'+Date.now().toString(36), type, name:name||ct.name, duration:duration||101,
    startDate:startDate||todayStr(), habits:(customHabits&&customHabits.length)?customHabits:ct.habits.slice(),
    goalWeight: opts.goalWeight!=null ? opts.goalWeight : null,
    customHabitDefs: opts.customHabitDefs || [],
    status:'active', createdAt:todayStr() };
  chs.forEach(c=>c.status='archived');
  chs.push(ch);
  setChallenges(chs);
  localStorage.setItem('lc_ach_'+activeUser.id, ch.id);
  triggerSync();
  loadActiveChallenge();
  const s = getS(); s.duration = ch.duration; s.startDate = ch.startDate;
  if(opts.goalWeight!=null) s.tgtW = opts.goalWeight;
  setS(s);
  return ch;
}

// Challenge end date helper
function challengeEndDate(ch) { ch = ch||activeChallenge; if(!ch) return null; return addD(ch.startDate, (ch.duration||1)-1); }

function loadActiveChallenge() {
  if(!activeUser) { activeChallenge=null; return; }
  const chId = localStorage.getItem('lc_ach_'+activeUser.id);
  const chs = getChallenges();
  activeChallenge = chs.find(c=>c.id===chId) || chs.find(c=>c.status==='active') || null;
}

function getActiveHabits() {
  if(activeChallenge && activeChallenge.habits && activeChallenge.habits.length) {
    const customDefs = activeChallenge.customHabitDefs || [];
    return activeChallenge.habits.map(hid =>
      DEFAULT_HABITS.find(h=>h.id===hid) ||
      customDefs.find(h=>h.id===hid) ||
      {id:hid,name:hid,emoji:'✏️',group:'custom'});
  }
  return DEFAULT_HABITS.filter(h=>CHALLENGE_TYPES.lifestyle.habits.includes(h.id));
}

function getActiveHabitIds() { return getActiveHabits().map(h=>h.id); }

// ── Goals (per user) ──
// Goal shape: { id, type:'water'|'sleep'|'reading'|'steps'|'weight'|'study'|'custom',
//   label, target, unit, field, startDate, endDate, startValue(for weight), direction:'increase'|'decrease' }
function getGoals() { if(!activeUser) return []; return JSON.parse(localStorage.getItem('lc_g_'+activeUser.id)||'[]'); }
function setGoals(g) { if(activeUser) { localStorage.setItem('lc_g_'+activeUser.id,JSON.stringify(g)); triggerSync(); } }
function addGoal(goal) {
  const g = getGoals();
  goal.id = 'g_'+Date.now().toString(36)+Math.random().toString(36).slice(2,5);
  g.push(goal); setGoals(g); return goal;
}
function removeGoal(id) { setGoals(getGoals().filter(x=>x.id!==id)); }

// ── Full Backup / Restore (ALL profiles + data) ──
function exportFullBackup() {
  const dump = { app:'LifestyleTracker', version:'3.0', exportDate:new Date().toISOString(), keys:{} };
  for(let i=0;i<localStorage.length;i++){
    const k = localStorage.key(i);
    if(k && k.indexOf('lc_')===0) dump.keys[k] = localStorage.getItem(k);
  }
  return dump;
}
function importFullBackup(dump) {
  if(!dump || !dump.keys) return false;
  Object.keys(dump.keys).forEach(k => { if(k.indexOf('lc_')===0) localStorage.setItem(k, dump.keys[k]); });
  return true;
}

// ── Shared Data (for comparison) ──
function getSharedData() { return JSON.parse(localStorage.getItem('lc_shared')||'[]'); }
function setSharedData(d) { localStorage.setItem('lc_shared',JSON.stringify(d)); triggerSync(); }

function exportForSharing() {
  if(!activeUser) return null;
  const s = getS(), ad = allD(), priv = activeUser.privacy;
  const filtered = {};
  Object.keys(ad).forEach(ds => {
    const dd = ad[ds]; const out = { score: priv.shareScore ? dd.score : null };
    if(priv.shareWeight) { out.weightMorning=dd.weightMorning; out.weightNight=dd.weightNight; }
    if(priv.shareSleep) { out.sleepHours=dd.sleepHours; }
    if(priv.shareActivity) { out.exerciseMins=dd.exerciseMins; out.steps=dd.steps; }
    if(priv.shareCalories) { out.calories=dd.calories; }
    if(priv.shareMood) { out.mood=dd.mood; out.energy=dd.energy; }
    filtered[ds] = out;
  });
  return { userName:activeUser.name, avatar:activeUser.avatar, startDate:s.startDate, duration:s.duration,
    challengeType:activeChallenge?activeChallenge.type:'lifestyle', days:filtered, exportDate:new Date().toISOString() };
}

// ── Data Migration (v1 → v2) ──
function migrateV1Data() {
  const oldSettings = localStorage.getItem('lc_s');
  const oldDays = localStorage.getItem('lc_d');
  if(!oldSettings && !oldDays) return false;
  const id = createProfile('User', '🌟');
  if(oldSettings) localStorage.setItem('lc_s_'+id, oldSettings);
  if(oldDays) localStorage.setItem('lc_d_'+id, oldDays);
  localStorage.removeItem('lc_s');
  localStorage.removeItem('lc_d');
  createNewChallenge('lifestyle','Lifestyle Transform',
    JSON.parse(oldSettings||'{}').duration||101,
    JSON.parse(oldSettings||'{}').startDate||todayStr());
  return true;
}

// ── Toast / Modal helpers ──
function toast(msg) { const t=document.getElementById('toast'); t.textContent=msg; t.classList.add('show'); setTimeout(()=>t.classList.remove('show'),2500); }
function openMo(title,msg,onConfirm) { document.getElementById('moT').textContent=title; document.getElementById('moM').textContent=msg; document.getElementById('moC').onclick=onConfirm; document.getElementById('mOv').classList.add('show'); }
function closeMo() { document.getElementById('mOv').classList.remove('show'); }
