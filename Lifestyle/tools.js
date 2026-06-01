/* ═══════════════════════════════════════════════════════════
   LIFESTYLE CHALLENGE TRACKER v3.0 — Health Tools (tools.js)
   BMI, TDEE/Maintenance, Calorie Burn, Weight-Loss Planner,
   Goal Projection Engine. Depends on core.js + app.js.
   ═══════════════════════════════════════════════════════════ */

// ── Constants ──
const ACTIVITY_FACTORS = {
  sedentary:   { factor:1.2,   label:'Sedentary (little/no exercise)' },
  light:       { factor:1.375, label:'Light (1-3 days/week)' },
  moderate:    { factor:1.55,  label:'Moderate (3-5 days/week)' },
  active:      { factor:1.725, label:'Active (6-7 days/week)' },
  veryactive:  { factor:1.9,   label:'Very Active (hard daily / physical job)' }
};

// METs for common activities (calorie burn = MET * kg * hours)
const ACTIVITIES_MET = [
  { id:'walk',   name:'Walking (brisk)', met:4.3, emoji:'🚶' },
  { id:'run',    name:'Running',         met:9.8, emoji:'🏃' },
  { id:'cycle',  name:'Cycling',         met:7.5, emoji:'🚴' },
  { id:'swim',   name:'Swimming',        met:7.0, emoji:'🏊' },
  { id:'yoga',   name:'Yoga',            met:3.0, emoji:'🧘' },
  { id:'weights',name:'Weight Training', met:5.0, emoji:'🏋️' },
  { id:'hiit',   name:'HIIT',            met:8.0, emoji:'🔥' },
  { id:'dance',  name:'Dancing',         met:5.5, emoji:'💃' },
  { id:'jump',   name:'Jump Rope',       met:11.0,emoji:'🤸' },
  { id:'house',  name:'House Chores',    met:3.3, emoji:'🧹' }
];

const KCAL_PER_KG_FAT = 7700; // energy in 1 kg of body fat
const MIN_SAFE_KCAL = { male:1500, female:1200 };

// ── Pure Calculations ──
function calcBMI(weightKg, heightCm) {
  if(!weightKg || !heightCm) return null;
  const m = heightCm/100;
  const bmi = weightKg/(m*m);
  let cat, color;
  if(bmi < 18.5) { cat='Underweight'; color='#06b6d4'; }
  else if(bmi < 25) { cat='Normal'; color='#22c55e'; }
  else if(bmi < 30) { cat='Overweight'; color='#f59e0b'; }
  else { cat='Obese'; color='#ef4444'; }
  const healthyMin = 18.5*m*m, healthyMax = 24.9*m*m;
  return { bmi:Math.round(bmi*10)/10, cat, color,
    healthyMin:Math.round(healthyMin*10)/10, healthyMax:Math.round(healthyMax*10)/10 };
}

function calcBMR(weightKg, heightCm, age, gender) {
  if(!weightKg || !heightCm || !age) return null;
  // Mifflin-St Jeor
  const base = 10*weightKg + 6.25*heightCm - 5*age;
  return Math.round(gender==='female' ? base - 161 : base + 5);
}

function calcTDEE(weightKg, heightCm, age, gender, activity) {
  const bmr = calcBMR(weightKg, heightCm, age, gender);
  if(!bmr) return null;
  const f = (ACTIVITY_FACTORS[activity]||ACTIVITY_FACTORS.moderate).factor;
  return { bmr, tdee:Math.round(bmr*f), factor:f };
}

function calcBurn(met, weightKg, minutes) {
  if(!met || !weightKg || !minutes) return 0;
  return Math.round(met * weightKg * (minutes/60));
}

// Weight-loss planner: lose (startW - goalW) kg over N days
function planWeightLoss(startW, goalW, days, tdee, gender) {
  if(!startW || !goalW || !days || !tdee) return null;
  const deltaKg = startW - goalW;               // positive = lose, negative = gain
  const totalKcal = deltaKg * KCAL_PER_KG_FAT;
  const dailyDeficit = Math.round(totalKcal / days);
  const targetIntake = Math.round(tdee - dailyDeficit);
  const weeklyRateKg = Math.round((deltaKg/days)*7*100)/100;
  const minSafe = MIN_SAFE_KCAL[gender] || 1200;
  const warnings = [];
  if(Math.abs(weeklyRateKg) > 1) warnings.push('Pace exceeds 1 kg/week — aggressive. Consider a longer timeframe.');
  if(targetIntake < minSafe && deltaKg>0) warnings.push('Target intake ('+targetIntake+' kcal) is below the safe minimum ('+minSafe+' kcal). Extend the timeframe.');
  if(Math.abs(dailyDeficit) > 1000) warnings.push('Daily deficit over 1000 kcal is hard to sustain.');
  return { deltaKg:Math.round(deltaKg*100)/100, totalKcal:Math.round(totalKcal), dailyDeficit,
    targetIntake, weeklyRateKg, minSafe, warnings, direction: deltaKg>=0?'lose':'gain' };
}

// Generic goal projection: planned linear line vs actual logged series
function projectGoal(goal, ad) {
  const start = goal.startDate, end = goal.endDate;
  const totalDays = Math.max(1, diffD(start, end));
  const labels=[], planned=[], actual=[];
  const isWeight = goal.type==='weight';
  const startVal = isWeight ? (goal.startValue||0) : 0;
  const targetVal = goal.target;

  for(let i=0;i<=totalDays;i++){
    const ds = addD(start, i);
    labels.push('D'+(i+1));
    // Planned: linear from startVal → target (weight) or 0 → cumulative for others
    if(isWeight) planned.push(Math.round((startVal + (targetVal-startVal)*(i/totalDays))*100)/100);
    else planned.push(targetVal); // daily target line
    const dd = ad[ds];
    if(dd){
      if(isWeight) actual.push(dd.weightMorning||dd.weightNight||null);
      else actual.push(dd[goal.field]!=null?dd[goal.field]:null);
    } else actual.push(null);
  }

  // Pace analysis
  const today = todayStr();
  const elapsed = Math.max(0, Math.min(totalDays, diffD(start, today)));
  let lastActual=null, lastIdx=-1;
  for(let i=0;i<=elapsed;i++){ if(actual[i]!=null){ lastActual=actual[i]; lastIdx=i; } }

  let pace='no-data', projFinish=null, projValue=null, msg='Log data to see your projection.';
  if(isWeight && lastActual!=null && lastIdx>0){
    const ratePerDay = (lastActual - startVal)/lastIdx;          // kg/day (negative if losing)
    const plannedRate = (targetVal - startVal)/totalDays;
    projValue = Math.round((startVal + ratePerDay*totalDays)*100)/100;
    // direction-aware: losing means rate negative & target below start
    const losing = (targetVal < startVal);
    const onPaceTol = Math.abs(plannedRate)*0.85;
    if(Math.abs(ratePerDay) >= Math.abs(plannedRate)) pace='ahead';
    else if(Math.abs(ratePerDay) >= onPaceTol) pace='on-track';
    else pace='behind';
    if(ratePerDay!==0){
      const daysToTarget = (targetVal - lastActual)/ratePerDay;
      if(daysToTarget>0 && isFinite(daysToTarget)) projFinish = addD(addD(start,lastIdx), Math.round(daysToTarget));
    }
    msg = 'At your current pace you\'ll reach ~'+projValue+' '+(goal.unit||'kg')+' by the end date.';
  } else if(!isWeight && lastIdx>=0){
    // average vs target
    const vals = actual.filter(v=>v!=null);
    const avg = vals.length? vals.reduce((a,b)=>a+b,0)/vals.length : 0;
    projValue = Math.round(avg*100)/100;
    if(avg >= targetVal) pace='ahead';
    else if(avg >= targetVal*0.85) pace='on-track';
    else pace='behind';
    msg = 'Your average is '+projValue+' '+(goal.unit||'')+' vs a target of '+targetVal+'.';
  }

  return { labels, planned, actual, pace, projFinish, projValue, msg, elapsed, totalDays };
}

// ═══════════════ TOOLS PAGE UI ═══════════════
function renderToolsPage() {
  const el = document.getElementById('toolsContent');
  if(!el) return;
  const b = getBody();
  const latestW = latestWeight();
  const wVal = latestW || b.startWeight || '';

  let html = '';
  // Body metrics card
  html += '<div class="cd"><div class="ct">📐 Your Body Metrics</div>';
  html += '<p class="muted" style="margin-bottom:10px">Used by all calculators below. Saved to your profile.</p>';
  html += '<div class="grid2">';
  html += metricInput('tmHeight','Height (cm)','number',b.heightCm);
  html += metricInput('tmAge','Age','number',b.age);
  html += '<div class="fld"><label>Gender</label><select class="hin wfull" id="tmGender">'
    +opt('male','Male',b.gender)+opt('female','Female',b.gender)+'</select></div>';
  html += '<div class="fld"><label>Activity Level</label><select class="hin wfull" id="tmActivity">'
    + Object.keys(ACTIVITY_FACTORS).map(k=>opt(k,ACTIVITY_FACTORS[k].label,b.activity)).join('')
    +'</select></div>';
  html += metricInput('tmStartW','Start Weight (kg)','number',b.startWeight);
  html += metricInput('tmGoalW','Goal Weight (kg)','number',b.goalWeight);
  html += '</div>';
  html += '<button class="btn btn-p btn-bl" style="margin-top:10px" onclick="saveBodyMetrics()">💾 Save Metrics</button></div>';

  // BMI
  html += '<div class="cd"><div class="ct">⚖️ BMI Calculator</div>';
  html += '<div class="grid2">'+metricInput('biWeight','Weight (kg)','number',wVal)+metricInput('biHeight','Height (cm)','number',b.heightCm)+'</div>';
  html += '<button class="btn btn-o btn-bl" style="margin-top:8px" onclick="doBMI()">Calculate BMI</button>';
  html += '<div id="bmiResult" class="result"></div></div>';

  // TDEE
  html += '<div class="cd"><div class="ct">🔥 Maintenance Calories (TDEE)</div>';
  html += '<p class="muted" style="margin-bottom:8px">How many calories you burn per day. Fill body metrics above first.</p>';
  html += '<button class="btn btn-o btn-bl" onclick="doTDEE()">Calculate Maintenance</button>';
  html += '<div id="tdeeResult" class="result"></div></div>';

  // Burn
  html += '<div class="cd"><div class="ct">🏃 Calorie Burn Estimator</div>';
  html += '<div class="grid2">';
  html += '<div class="fld"><label>Activity</label><select class="hin wfull" id="burnAct">'
    + ACTIVITIES_MET.map(a=>'<option value="'+a.met+'">'+a.emoji+' '+a.name+'</option>').join('')+'</select></div>';
  html += metricInput('burnMin','Minutes','number',30);
  html += '</div>';
  html += '<button class="btn btn-o btn-bl" style="margin-top:8px" onclick="doBurn()">Estimate Burn</button>';
  html += '<div id="burnResult" class="result"></div></div>';

  // Weight-loss planner
  html += '<div class="cd"><div class="ct">🎯 Weight-Loss / Gain Planner</div>';
  html += '<p class="muted" style="margin-bottom:8px">e.g. lose 3 kg in 60 days — get your daily calorie target & plan.</p>';
  html += '<div class="grid2">';
  html += metricInput('plStart','Current Weight (kg)','number',wVal);
  html += metricInput('plGoal','Goal Weight (kg)','number',b.goalWeight);
  html += metricInput('plDays','In how many days','number',60);
  html += '</div>';
  html += '<button class="btn btn-p btn-bl" style="margin-top:8px" onclick="doPlan()">📋 Build My Plan</button>';
  html += '<div id="planResult" class="result"></div>';
  html += '<div class="chc" id="planChartWrap" style="display:none"><canvas id="cPlan"></canvas></div></div>';

  el.innerHTML = html;
}

function metricInput(id,label,type,val) {
  return '<div class="fld"><label>'+label+'</label><input type="'+type+'" class="hin wfull" id="'+id+'" value="'+(val!=null&&val!==''?val:'')+'" step="0.1"></div>';
}
function opt(v,label,cur){ return '<option value="'+v+'"'+(v===cur?' selected':'')+'>'+label+'</option>'; }
function latestWeight() {
  const ad = allD(); const dates = Object.keys(ad).sort();
  for(let i=dates.length-1;i>=0;i--){ const dd=ad[dates[i]]; if(dd.weightMorning) return dd.weightMorning; if(dd.weightNight) return dd.weightNight; }
  return null;
}

function saveBodyMetrics() {
  updateBody({
    heightCm: parseFloat(val('tmHeight'))||null,
    age: parseInt(val('tmAge'))||null,
    gender: val('tmGender'),
    activity: val('tmActivity'),
    startWeight: parseFloat(val('tmStartW'))||null,
    goalWeight: parseFloat(val('tmGoalW'))||null
  });
  toast('💾 Body metrics saved');
}
function val(id){ const e=document.getElementById(id); return e?e.value:''; }

function doBMI() {
  const r = calcBMI(parseFloat(val('biWeight')), parseFloat(val('biHeight')));
  const el = document.getElementById('bmiResult');
  if(!r){ el.innerHTML='<span class="muted">Enter weight and height.</span>'; return; }
  el.innerHTML = '<div class="bigstat" style="color:'+r.color+'">'+r.bmi+'</div>'
    +'<div class="pill" style="background:'+r.color+'22;color:'+r.color+'">'+r.cat+'</div>'
    +'<p class="muted" style="margin-top:8px">Healthy weight range: <strong>'+r.healthyMin+'–'+r.healthyMax+' kg</strong></p>';
}

function doTDEE() {
  const b = getBody();
  const w = parseFloat(val('biWeight'))||latestWeight()||b.startWeight;
  const r = calcTDEE(w, b.heightCm, b.age, b.gender, b.activity);
  const el = document.getElementById('tdeeResult');
  if(!r){ el.innerHTML='<span class="muted">Fill height, age, weight in body metrics above.</span>'; return; }
  el.innerHTML = '<div class="grid2">'
    +'<div class="ministat"><div class="msv">'+r.bmr+'</div><div class="msl">BMR (rest)</div></div>'
    +'<div class="ministat"><div class="msv" style="color:var(--wn)">'+r.tdee+'</div><div class="msl">Maintenance / day</div></div>'
    +'</div><p class="muted" style="margin-top:8px">Eat ~<strong>'+r.tdee+' kcal</strong> to maintain, less to lose, more to gain.</p>';
}

function doBurn() {
  const b = getBody();
  const w = latestWeight()||b.startWeight;
  if(!w){ document.getElementById('burnResult').innerHTML='<span class="muted">Set your weight in body metrics first.</span>'; return; }
  const met = parseFloat(val('burnAct')), mins = parseFloat(val('burnMin'));
  const kcal = calcBurn(met, w, mins);
  document.getElementById('burnResult').innerHTML = '<div class="bigstat" style="color:var(--no)">'+kcal+' kcal</div><p class="muted">burned in '+mins+' min</p>';
}

function doPlan() {
  const b = getBody();
  const startW = parseFloat(val('plStart')), goalW = parseFloat(val('plGoal')), days = parseInt(val('plDays'));
  const tdeeObj = calcTDEE(startW, b.heightCm, b.age, b.gender, b.activity);
  const el = document.getElementById('planResult');
  if(!startW||!goalW||!days){ el.innerHTML='<span class="muted">Enter current weight, goal weight and days.</span>'; return; }
  if(!tdeeObj){ el.innerHTML='<span class="muted">Fill height, age & gender in body metrics above to compute calories.</span>'; return; }
  const p = planWeightLoss(startW, goalW, days, tdeeObj.tdee, b.gender);
  let html = '<div class="grid2">';
  html += '<div class="ministat"><div class="msv">'+Math.abs(p.deltaKg)+' kg</div><div class="msl">to '+(p.direction)+'</div></div>';
  html += '<div class="ministat"><div class="msv" style="color:var(--ac)">'+Math.abs(p.weeklyRateKg)+' kg/wk</div><div class="msl">pace</div></div>';
  html += '<div class="ministat"><div class="msv" style="color:var(--wn)">'+p.targetIntake+'</div><div class="msl">daily kcal target</div></div>';
  html += '<div class="ministat"><div class="msv" style="color:var(--no)">'+Math.abs(p.dailyDeficit)+'</div><div class="msl">daily '+(p.direction==='lose'?'deficit':'surplus')+'</div></div>';
  html += '</div>';
  html += '<div class="plan-suggest"><strong>📋 Suggested daily plan</strong><ul>';
  html += '<li>🍽️ Eat ~'+p.targetIntake+' kcal/day (maintenance '+tdeeObj.tdee+')</li>';
  html += '<li>🏃 ~30-45 min activity to support the '+Math.abs(p.dailyDeficit)+' kcal '+(p.direction==='lose'?'deficit':'surplus')+'</li>';
  html += '<li>😴 7-8 h sleep for recovery & appetite control</li>';
  html += '<li>💧 3-4 L water daily</li>';
  html += '</ul></div>';
  if(p.warnings.length) html += '<div class="warn">⚠️ '+p.warnings.join('<br>⚠️ ')+'</div>';
  html += '<button class="btn btn-ok btn-bl" style="margin-top:10px" onclick="createGoalFromPlan('+startW+','+goalW+','+days+')">🎯 Save as Goal & Challenge</button>';
  el.innerHTML = html;
  renderPlanChart(startW, goalW, days);
}

function renderPlanChart(startW, goalW, days) {
  const wrap = document.getElementById('planChartWrap');
  if(!wrap) return;
  wrap.style.display='block';
  const labels=[], planned=[];
  for(let i=0;i<=days;i++){ labels.push('D'+(i+1)); planned.push(Math.round((startW+(goalW-startW)*(i/days))*100)/100); }
  if(CI.plan) CI.plan.destroy();
  CI.plan = new Chart(document.getElementById('cPlan').getContext('2d'), {
    type:'line',
    data:{ labels, datasets:[{ label:'Planned Weight', data:planned, borderColor:'#3b82f6', backgroundColor:'#3b82f622', fill:true, tension:.2, pointRadius:0 }]},
    options:cOpt('kg')
  });
}

function createGoalFromPlan(startW, goalW, days) {
  updateBody({ startWeight:startW, goalWeight:goalW });
  const start = todayStr(), end = addD(start, days-1);
  addGoal({ type:'weight', label:(goalW<startW?'Lose':'Gain')+' to '+goalW+' kg', target:goalW, unit:'kg',
    startDate:start, endDate:end, startValue:startW, direction: goalW<startW?'decrease':'increase' });
  toast('🎯 Goal created! See Goals page.');
  if(typeof renderGoalsPage==='function' && document.getElementById('goalsContent')) renderGoalsPage();
}
