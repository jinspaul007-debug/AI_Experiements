/* ═══════════════════════════════════════════════════════════
   LIFESTYLE CHALLENGE TRACKER v2.0 — Analytics Engine
   Trend Charts, Heatmap, Weekly Review, Target Lines
   ═══════════════════════════════════════════════════════════ */

function refreshAna() {
  const s = getS(), ad = allD();
  const dates = Object.keys(ad).sort();

  renderTrend('cScore', dates, ad, s, d => d.score||0, 'Score %', '#3b82f6');
  renderTrendWithTarget('cWater', dates, ad, s, d => d.waterLitres||0, 'Litres', '#06b6d4', s.watT||3.5);
  renderTrendWithTarget('cSleep', dates, ad, s, d => d.sleepHours||0, 'Hours', '#a855f7', s.sleepT||7);
  renderTrend('cStudy', dates, ad, s, d => (d.studyMins||0)/60, 'Hours', '#f59e0b');
  renderMoodEnergy(dates, ad, s);
  renderHeatmap(s, ad);
  renderTrendWithTarget('cCalorie', dates, ad, s, d => d.totalCalories||d.calories||0, 'kcal', '#ef4444', s.calT||2000);
  renderTrend('cSteps', dates, ad, s, d => d.steps||0, 'Steps', '#22c55e');
  renderWeeklyReview(s, ad);
}

function renderTrend(canvasId, dates, ad, s, valFn, yLabel, color) {
  const labels = [], values = [];
  dates.forEach(d => {
    labels.push('D' + (diffD(s.startDate, d) + 1));
    values.push(valFn(ad[d]));
  });
  if (CI[canvasId]) CI[canvasId].destroy();
  const ctx = document.getElementById(canvasId).getContext('2d');
  CI[canvasId] = new Chart(ctx, {
    type: 'line',
    data: { labels, datasets: [{
      label: yLabel, data: values,
      borderColor: color, backgroundColor: color + '22',
      fill: true, tension: 0.3, pointRadius: 3
    }]},
    options: cOpt(yLabel)
  });
}

function renderTrendWithTarget(canvasId, dates, ad, s, valFn, yLabel, color, target) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const labels = [], values = [];
  dates.forEach(d => {
    labels.push('D' + (diffD(s.startDate, d) + 1));
    values.push(valFn(ad[d]));
  });
  if (CI[canvasId]) CI[canvasId].destroy();
  const ctx = canvas.getContext('2d');
  const datasets = [{
    label: yLabel, data: values,
    borderColor: color, backgroundColor: color + '22',
    fill: true, tension: 0.3, pointRadius: 3
  }];
  if (target) {
    datasets.push({
      label: 'Target', data: new Array(labels.length).fill(target),
      borderColor: '#94a3b8', borderDash: [6, 4], borderWidth: 1,
      pointRadius: 0, fill: false
    });
  }
  CI[canvasId] = new Chart(ctx, {
    type: 'line', data: { labels, datasets }, options: cOpt(yLabel)
  });
}

function renderMoodEnergy(dates, ad, s) {
  const labels = [], moods = [], energies = [];
  dates.forEach(d => {
    labels.push('D' + (diffD(s.startDate, d) + 1));
    moods.push(ad[d].mood || null);
    energies.push(ad[d].energy || null);
  });
  if (CI.mood) CI.mood.destroy();
  const ctx = document.getElementById('cMood').getContext('2d');
  CI.mood = new Chart(ctx, {
    type: 'line',
    data: { labels, datasets: [
      { label: 'Mood (1-5)', data: moods, borderColor: '#ec4899', tension: 0.3, spanGaps: true, pointRadius: 3 },
      { label: 'Energy (1-10)', data: energies, borderColor: '#f97316', tension: 0.3, spanGaps: true, pointRadius: 3 }
    ]},
    options: cOpt('Level')
  });
}

function renderHeatmap(s, ad) {
  const grid = document.getElementById('hmGrid');
  grid.innerHTML = '';
  // Pad to align with Mon start
  const startDow = s2d(s.startDate).getDay();
  const mondayOff = startDow === 0 ? 6 : startDow - 1;
  for (let i = 0; i < mondayOff; i++) {
    const c = document.createElement('div');
    c.className = 'hmc'; grid.appendChild(c);
  }
  for (let i = 0; i < s.duration; i++) {
    const ds = addD(s.startDate, i), dd = ad[ds];
    const c = document.createElement('div');
    c.className = 'hmc';
    const score = dd ? (dd.score || 0) : 0;
    if (score >= 90) c.classList.add('l4');
    else if (score >= 70) c.classList.add('l3');
    else if (score >= 50) c.classList.add('l2');
    else if (score > 0) c.classList.add('l1');
    c.title = 'Day ' + (i+1) + ': ' + score + '%';
    grid.appendChild(c);
  }
}

function renderWeeklyReview(s, ad) {
  const el = document.getElementById('wRev');
  const today = todayStr();
  const dayNum = diffD(s.startDate, today) + 1;
  const weekNum = Math.ceil(dayNum / 7);
  const wStart = addD(s.startDate, (weekNum - 1) * 7);

  let html = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px"><strong>Week ' + weekNum + '</strong>';
  let total = 0, cnt = 0, bestD = null, bestS = 0, worstD = null, worstS = 100;

  for (let i = 0; i < 7; i++) {
    const ds = addD(wStart, i);
    if (ds > today) break;
    const dd = ad[ds];
    if (dd && dd.score !== undefined) {
      total += dd.score; cnt++;
      if (dd.score > bestS) { bestS = dd.score; bestD = ds; }
      if (dd.score < worstS) { worstS = dd.score; worstD = ds; }
    }
  }

  const avg = cnt ? Math.round(total / cnt) : 0;
  const cls = avg >= 80 ? 'ex' : avg >= 60 ? 'gd' : avg >= 40 ? 'nw' : 'po';
  html += '<span class="scb ' + cls + '">' + avg + '% avg</span></div>';

  html += '<div style="font-size:13px;color:var(--t2);margin-top:8px">';
  html += '<p><strong>Days tracked:</strong> ' + cnt + '/7</p>';
  if (bestD) html += '<p><strong>Best day:</strong> Day ' + (diffD(s.startDate, bestD)+1) + ' (' + bestS + '%)</p>';
  if (worstD && cnt > 1) html += '<p><strong>Needs work:</strong> Day ' + (diffD(s.startDate, worstD)+1) + ' (' + worstS + '%)</p>';

  html += '<div style="margin-top:10px;padding:10px;border-radius:8px;background:var(--inp)">';
  html += '<strong>💡 Suggestions:</strong><br>';
  if (avg < 40) html += '• Start with 3 core habits: wake up early, drink water, no junk<br>';
  else if (avg < 60) html += '• Focus on nutrition and consistency. Small wins compound!<br>';
  else if (avg < 80) html += '• Good progress! Push gym and study to level up<br>';
  else html += '• Outstanding! Maintain momentum. You\'re in the top tier!<br>';

  // Weak habits this week
  let weak = [];
  const hIds = getActiveHabitIds(), hNames = HNAMES();
  hIds.forEach(h => {
    let hit = 0;
    for (let i = 0; i < 7; i++) {
      const ds = addD(wStart, i);
      if (ds > today) break;
      const dd = ad[ds];
      if (dd && dd.habits && dd.habits[h]) hit++;
    }
    if (cnt > 0 && hit / cnt < 0.5) weak.push(hNames[h]||h);
  });
  if (weak.length) html += '• Weak: <strong>' + weak.slice(0, 4).join(', ') + '</strong><br>';
  html += '</div></div>';

  // Previous weeks summary
  if (weekNum > 1) {
    html += '<div style="margin-top:14px;font-size:13px"><strong>Previous Weeks:</strong></div>';
    for (let w = weekNum - 1; w >= Math.max(1, weekNum - 4); w--) {
      const ws = addD(s.startDate, (w - 1) * 7);
      let wt = 0, wc = 0;
      for (let i = 0; i < 7; i++) {
        const ds = addD(ws, i);
        const dd = ad[ds];
        if (dd && dd.score !== undefined) { wt += dd.score; wc++; }
      }
      const wa = wc ? Math.round(wt / wc) : 0;
      const wCls = wa >= 80 ? 'ex' : wa >= 60 ? 'gd' : wa >= 40 ? 'nw' : 'po';
      html += '<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--bd);font-size:13px">';
      html += '<span>Week ' + w + '</span><span class="scb ' + wCls + '">' + wa + '%</span></div>';
    }
  }

  el.innerHTML = html;
}
