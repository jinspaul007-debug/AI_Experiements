/* ═══════════════════════════════════════════════════════════
   LIFESTYLE CHALLENGE TRACKER v2.0 — Print Module (print.js)
   A4 Printable Tracking Sheets & Reports
   ═══════════════════════════════════════════════════════════ */

function printWeek() {
  const s = getS(), today = todayStr();
  const dayNum = diffD(s.startDate, today) + 1;
  const weekNum = Math.ceil(dayNum / 7);
  const wStart = addD(s.startDate, (weekNum - 1) * 7);
  const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

  let h = '<div style="text-align:center;margin-bottom:14px">';
  const chName = activeChallenge ? activeChallenge.name : 'Lifestyle Challenge';
  h += '<h2 style="margin:0;font-size:20px">' + chName + ' — Week ' + weekNum + '</h2>';
  h += '<p style="color:#666;font-size:12px;margin:4px 0">' + wStart + ' to ' + addD(wStart, 6) + '</p></div>';
  h += '<table style="width:100%;border-collapse:collapse;font-size:11px">';
  h += '<tr style="background:#1e293b;color:#fff"><th style="padding:8px;border:1px solid #444;width:100px">Habit</th>';
  for (let i = 0; i < 7; i++) {
    h += '<th style="padding:6px;border:1px solid #444;text-align:center">' + days[i] + '<br><small>' + addD(wStart, i).slice(5) + '</small></th>';
  }
  h += '</tr>';

  const hIds = getActiveHabitIds(), hNames = HNAMES();
  hIds.forEach(hab => {
    h += '<tr><td style="padding:5px 6px;border:1px solid #ddd;font-weight:500">' + (hNames[hab]||hab) + '</td>';
    for (let i = 0; i < 7; i++) h += '<td style="padding:5px;border:1px solid #ddd;text-align:center;width:55px">☐</td>';
    h += '</tr>';
  });

  ['Weight AM','Weight PM','Water (L)','Study (hrs)','Sleep (hrs)','Mood (1-5)','Score %','Notes'].forEach(label => {
    h += '<tr><td style="padding:5px 6px;border:1px solid #ddd;font-weight:500">' + label + '</td>';
    for (let i = 0; i < 7; i++) h += '<td style="padding:5px;border:1px solid #ddd"></td>';
    h += '</tr>';
  });
  h += '</table>';
  h += '<p style="text-align:center;font-size:9px;color:#999;margin-top:14px">Lifestyle Challenge Tracker</p>';

  const sheet = document.getElementById('pSheet');
  sheet.innerHTML = h; sheet.style.display = 'block';
  document.getElementById('pgPrint').classList.add('pt');
  window.print();
  sheet.style.display = 'none';
}

function printReport() {
  const s = getS(), ad = allD();
  const dates = Object.keys(ad).sort();
  if (!dates.length) { toast('⚠️ No data to report'); return; }

  let totalScore = 0;
  dates.forEach(d => totalScore += (ad[d].score || 0));
  const avgScore = Math.round(totalScore / dates.length);

  let h = '<div style="text-align:center;margin-bottom:14px">';
  const chName2 = activeChallenge ? activeChallenge.name : 'Lifestyle Challenge';
  h += '<h2 style="margin:0;font-size:20px">' + chName2 + ' — Full Report</h2>';
  h += '<p style="color:#666;font-size:12px;margin:4px 0">Generated: ' + new Date().toLocaleDateString() + '</p></div>';
  h += '<p style="font-size:13px"><strong>Duration:</strong> ' + s.duration + ' days | ';
  h += '<strong>Days tracked:</strong> ' + dates.length + ' | ';
  h += '<strong>Average:</strong> ' + avgScore + '%</p>';

  h += '<table style="width:100%;border-collapse:collapse;font-size:10px;margin-top:10px">';
  h += '<tr style="background:#1e293b;color:#fff">';
  ['Day','Date','Score','Type','Wt AM','Wt PM','Water','Sleep','Study','Mood'].forEach(col => {
    h += '<th style="padding:4px 5px;border:1px solid #444">' + col + '</th>';
  });
  h += '</tr>';

  dates.forEach(d => {
    const dd = ad[d], dn = diffD(s.startDate, d) + 1;
    const bg = dd.score >= 75 ? '#e8f5e9' : dd.score >= 50 ? '#fff8e1' : dd.score > 0 ? '#fce4ec' : '#fff';
    h += '<tr style="background:' + bg + '">';
    h += '<td style="padding:3px;border:1px solid #ddd;text-align:center">' + dn + '</td>';
    h += '<td style="border:1px solid #ddd;padding:3px">' + d + '</td>';
    h += '<td style="border:1px solid #ddd;padding:3px;text-align:center;font-weight:600">' + (dd.score || 0) + '%</td>';
    h += '<td style="border:1px solid #ddd;padding:3px;text-align:center">' + (dd.dayType || '—') + '</td>';
    h += '<td style="border:1px solid #ddd;padding:3px;text-align:center">' + (dd.weightMorning || '—') + '</td>';
    h += '<td style="border:1px solid #ddd;padding:3px;text-align:center">' + (dd.weightNight || '—') + '</td>';
    h += '<td style="border:1px solid #ddd;padding:3px;text-align:center">' + (dd.waterLitres || '—') + '</td>';
    h += '<td style="border:1px solid #ddd;padding:3px;text-align:center">' + (dd.sleepHours || '—') + '</td>';
    h += '<td style="border:1px solid #ddd;padding:3px;text-align:center">' + (dd.studyMins ? Math.round(dd.studyMins/60*10)/10+'h' : '—') + '</td>';
    h += '<td style="border:1px solid #ddd;padding:3px;text-align:center">' + (dd.mood || '—') + '</td>';
    h += '</tr>';
  });
  h += '</table>';

  // Summary stats
  h += '<div style="margin-top:14px;font-size:12px">';
  h += '<strong>Habit Completion Rates:</strong><br>';
  const hIds2 = getActiveHabitIds(), hNames2 = HNAMES();
  const hc = {}; hIds2.forEach(hab => hc[hab] = 0);
  dates.forEach(d => { const dd = ad[d]; if (dd.habits) hIds2.forEach(hab => { if (dd.habits[hab]) hc[hab]++; }); });
  hIds2.forEach(hab => {
    const pct = Math.round(hc[hab] / dates.length * 100);
    const bar = '█'.repeat(Math.round(pct / 5)) + '░'.repeat(20 - Math.round(pct / 5));
    h += (hNames2[hab]||hab).padEnd(12) + ' ' + bar + ' ' + pct + '%<br>';
  });
  h += '</div>';

  h += '<p style="text-align:center;font-size:9px;color:#999;margin-top:14px">Lifestyle Challenge Tracker</p>';

  const sheet = document.getElementById('pSheet');
  sheet.innerHTML = h; sheet.style.display = 'block';
  document.getElementById('pgPrint').classList.add('pt');
  window.print();
  sheet.style.display = 'none';
}
