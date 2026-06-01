# Lifestyle Challenge Tracker v2.0

**Version:** 2.0  
**Created:** April 2026 | **Updated:** May 2026  
**Platform:** Progressive Web App (PWA) — Works on iPhone, Android, Windows, macOS, any browser  
**License:** Open-source — 100% local, zero cloud, zero tracking  

---

## 📋 Revision History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Apr 2026 | Initial release — 16 habits, single user, basic analytics |
| 2.0 | May 2026 | Multi-user profiles, 6 challenge types, calorie/meal tracking, privacy controls, comparison, custom habits, target-line charts, data edit/delete, dynamic tracker forms, enhanced UI |

---

## 🎯 Project Overview

A world-class, production-quality **lifestyle challenge tracker** built as a 100% local Progressive Web App. Supports **multiple users**, **6 challenge types** (lifestyle, weight loss, sleep, activity, calorie, custom), **meal/calorie logging**, **privacy-controlled comparison**, and comprehensive analytics with target-line charts, heatmaps, and milestone achievements.

**Zero cloud. Zero server. Zero data breach risk.** All data stays in YOUR browser.

---

## 📋 Requirements Specification

### R1: Daily Habit Tracking
| # | Habit | Metric | Status |
|---|-------|--------|--------|
| 1 | Wake up at 4:30 AM | Checkbox + actual time | ✅ |
| 2 | Yoga (30 mins) | Checkbox + minutes | ✅ |
| 3 | Walking / Running / Cycling | Checkbox + minutes | ✅ |
| 4 | Gym (5-6 days/week) | Checkbox + workout type | ✅ |
| 5 | No Sugar | Checkbox | ✅ |
| 6 | No Junk Food | Checkbox | ✅ |
| 7 | 3-4 Litres Water | Checkbox + litres | ✅ |
| 8 | 7+ Hours Sleep | Checkbox + hours | ✅ |
| 9 | Read Book (5-10 pages) | Checkbox + pages | ✅ |
| 10 | Balanced Meals (all 3) | Checkbox | ✅ |
| 11 | Enough Protein | Checkbox + grams | ✅ |
| 12 | Upskill Study (1-2 hrs) | Checkbox + minutes | ✅ |
| 13 | Communication / English Practice | Checkbox + minutes | ✅ |
| 14 | Quality Time with Family | Checkbox | ✅ |
| 15 | Morning Weight (empty stomach) | Checkbox + kg | ✅ |
| 16 | Night Weight (before sleep) | Checkbox + kg | ✅ |

### R2: Day Classification
| Type | Description | Status |
|------|-------------|--------|
| Normal Day | All habits expected | ✅ |
| Rest Day | Gym rest (weekends), reduced expectations | ✅ |
| Cheat Day | Relaxed nutrition rules (planned) | ✅ |
| Sick Day | Reduced expectations, tracked separately | ✅ |

### R3: Mood & Energy Tracking
- [x] Mood selector (5 levels: 😄 🙂 😐 😕 😞)
- [x] Energy level slider (1-10)
- [x] Daily notes / reflections textarea

### R4: Analytics & Visualization
- [x] Overall challenge progress ring (animated)
- [x] Challenge streak map (color-coded dots for each day)
- [x] Weight trend chart (morning + night, dual line)
- [x] Habit completion rate bar chart (per-habit %)
- [x] Weekly score trend line chart
- [x] Water intake trend chart
- [x] Sleep hours trend chart
- [x] Study hours trend chart
- [x] Mood & energy dual trend chart
- [x] GitHub-style habit heat map
- [x] Milestone timeline with achievement badges

### R5: Weekly & Daily Review
- [x] Automatic weekly score calculation
- [x] Best day / worst day identification
- [x] Weak habit identification with improvement suggestions
- [x] Score grading: Excellent / Good / Needs Work / Poor

### R6: Milestone Achievements
- [x] Day 1, 7, 14, 21 (habit forming), 30, 50 (halfway), 66 (habit locked), 75, 90, 100, 101

### R7: Challenge Configuration
- [x] Duration options: 10, 25, 50, 75, 101 days
- [x] Custom start date
- [x] Restart challenge (preserves old data for export)
- [x] Configurable cheat days per week
- [x] Configurable rest days per week
- [x] Target weight, water, protein goals

### R8: Printable A4 Sheets
- [x] Weekly tracking grid (all habits × 7 days)
- [x] Full challenge report table
- [x] Print-optimized CSS (no nav, clean layout)

### R9: Data Security & Privacy
- [x] 100% local — browser localStorage only
- [x] Zero cloud, zero server, zero third-party data sharing
- [x] Export data as JSON (full backup/restore)
- [x] Export data as CSV (for Excel/Google Sheets analysis)
- [x] Import JSON backup to restore data

### R10: Cross-Device Compatibility
- [x] iPhone Safari — add to Home Screen as PWA
- [x] Windows Chrome/Edge — works as web app
- [x] Responsive design — mobile-first
- [x] Dark mode + Light mode toggle
- [x] Offline support via Service Worker

### R11: Multi-User Profiles (v2.0) ✅
- [x] Multiple user profiles with avatar selection
- [x] Switch between profiles on same device
- [x] Per-user data isolation (separate localStorage keys)
- [x] Profile creation and deletion

### R12: Challenge Types (v2.0) ✅
- [x] 6 challenge types: Lifestyle, Weight Loss, Sleep, Activity, Calorie, Custom
- [x] Dynamic tracker form adapts to selected challenge
- [x] Challenge creation with custom duration (10-101 days)
- [x] Switch between multiple active challenges

### R13: Calorie & Meal Tracking (v2.0) ✅
- [x] Meal logging with name, calories, type (breakfast/lunch/dinner/snack)
- [x] Daily calorie summary vs target
- [x] Calorie trend chart with target line
- [x] Steps tracking with chart

### R14: Privacy & Comparison (v2.0) ✅
- [x] Per-user privacy controls (share weight, sleep, activity, calories, mood, score)
- [x] Privacy-filtered data export for sharing
- [x] Import shared data from other users
- [x] Side-by-side score comparison charts
- [x] Average score comparison dashboard

### R15: Enhanced Analytics (v2.0) ✅
- [x] Target lines on water, sleep, calorie charts
- [x] Theme-aware chart colors (dark/light mode)
- [x] Calorie trend and steps trend charts
- [x] Dynamic habit-based heatmap and weekly review

### R16: Data Management (v2.0) ✅
- [x] Delete individual day entries
- [x] Date boundary enforcement (can't navigate outside challenge)
- [x] V1 → V2 automatic data migration
- [x] Year shown in date display

### R17: Future Enhancements (Planned)
- [ ] Apple Health / Zepp integration (requires native app bridge)
- [ ] Photo progress tracking
- [ ] Notification reminders
- [ ] Custom habit creation UI (add/remove habits per challenge)
- [ ] Monthly summary report

---

## 🏗️ Architecture

```
Lifestyle/
├── README.md           ← This file (requirements & documentation)
├── USER_GUIDE.md       ← Step-by-step how-to-use guide
├── index.html          ← App shell (HTML + full CSS + all pages)
├── core.js             ← Data layer (profiles, body metrics, PIN, goals, challenges, storage)
├── tools.js            ← Health tools (BMI, TDEE, burn, weight-loss planner, projection engine)
├── app.js              ← UI engine (navigation, tracker, dashboard, goals, PIN, settings)
├── analytics.js        ← Charts with target lines, heatmap, weekly review
├── print.js            ← A4 printable sheet generation
├── manifest.json       ← PWA manifest (home screen install)
├── sw.js               ← Service worker (offline support)
└── icon-192.png        ← App icon (auto-generated SVG fallback)
```

### Technology Stack
- **Frontend:** Vanilla HTML5 + CSS3 + ES6 JavaScript (zero frameworks)
- **Charts:** Chart.js 4.x (CDN, cached offline by service worker)
- **Storage:** Browser localStorage (survives browser close)
- **PWA:** Service Worker + Web App Manifest
- **Print:** CSS @media print + dynamic HTML table generation

### Data Storage Schema (v2.0 — Multi-User)
```
localStorage keys:
  lc_profiles         → { userId: { id, name, avatar, privacy, createdAt } }
  lc_active           → activeUserId
  lc_s_{userId}       → { duration, startDate, theme, targets... }
  lc_d_{userId}       → { "2026-05-01": { habits, metrics, meals, score... } }
  lc_ch_{userId}      → [ { id, type, name, duration, startDate, habits, status } ]
  lc_ach_{userId}     → activeChallengeId
  lc_shared           → [ imported comparison data from other users ]
```

**Day Data Example:**
```json
{
  "habits": { "wakeUp430": true, "yoga": true },
  "weightMorning": 82.5, "weightNight": 83.1,
  "waterLitres": 3.5, "sleepHours": 7, "steps": 8500,
  "meals": [{ "name": "Oatmeal", "cal": 350, "type": "breakfast" }],
  "totalCalories": 1750,
  "mood": 4, "energy": 7, "dayType": "normal",
  "score": 87, "notes": "Great day!"
}
```

---

## 🚀 How to Use

### 📱 Mobile-First Solution (Recommended)
**Deploy to GitHub Pages — Works anywhere, anytime, no laptop needed:**

1. **Create GitHub Account** (free): https://github.com/signup
2. **Create New Repository**: Name it `lifestyle-tracker` (public)
3. **Upload Files**: Drag & drop all Lifestyle folder files to the repository
4. **Enable GitHub Pages**: Settings → Pages → Source: Deploy from branch → Save
5. **Get Your URL**: https://yourusername.github.io/lifestyle-tracker
6. **On iPhone**: Open that URL in Safari → Share → Add to Home Screen
7. **Works Offline**: After first load, works without internet

### 🖥️ Alternative: Local Server (Laptop Required)
```bash
cd UpSkill/Lifestyle
python -m http.server 8080
# Open http://localhost:8080 in browser
# iPhone must be on same WiFi
```

### 📲 iPhone Home Screen Installation
1. Open the app URL in Safari
2. Tap **Share** (square with arrow) at bottom
3. Scroll down → **Add to Home Screen**
4. Name it "LifeTrack" → **Add**
5. Icon appears on home screen like a native app
6. Works offline after first load (PWA)

### 💼 Office Laptop Restrictions? No Problem!
**You can deploy this app from your office laptop in 5 minutes:**

1. **Copy Files**: Copy all Lifestyle folder files to a USB drive or cloud storage
2. **GitHub Upload**: From any browser (even restricted), upload to GitHub
3. **One-Time Setup**: Takes 5 minutes, then works forever on your iPhone
4. **No Software Needed**: Just browser upload — no local server, no admin rights
5. **Global Access**: Works from any country, any network

**Alternative if GitHub blocked:**
- Use **Netlify Drop**: https://app.netlify.com/drop (drag & drop, instant URL)
- Use **Vercel**: https://vercel.com (free, drag & drop)
- Use **GitHub Gist**: Paste HTML code, get raw URL

### Data Backup
- **iPhone**: Settings → Export JSON → Save to Files/Google Drive
- **Automatic**: Export weekly to Google Drive or iCloud
- **Email**: Email JSON backup to yourself monthly

### 🔄 Mobile-Only Workflow
1. **Morning**: Open iPhone app → Track wake up, yoga, exercise
2. **During Day**: Quick entries for water, meals, study
3. **Evening**: Log weight, sleep, mood, notes
4. **Weekly**: Review analytics, print sheets if needed
5. **Monthly**: Export backup to Google Drive

---

## 📝 Changelog

### v3.0 — May 2026
- **Body metrics** in profile: height, age, gender, activity level, start/goal weight
- **PIN lock** per profile — 4-digit PIN lock screen on open & profile switch
- **Health Tools**: BMI calculator, Maintenance calories (TDEE / Mifflin-St Jeor), calorie-burn estimator, weight-loss/gain planner
- **Goal engine** with projection: planned trajectory vs actual, pace indicator (ahead/on-track/behind), projected finish date
- **Goals page**: water, sleep, reading, study, steps, weight goals with progress bars + projection charts
- **Goals at a glance** card on dashboard
- **Flexible challenges**: free day count OR start→end date range, goal weight, custom habit/category builder
- **Full backup/restore** of ALL profiles in one file
- **Professional UI redesign**: smooth page transitions, refined cards, new "More" hub, polished tool/goal components
- New module `tools.js`; SW cache bumped to `life101-v3`
- Added `USER_GUIDE.md`

### v2.0 — May 2026
- Multi-user profiles with avatars and per-user data isolation
- 6 challenge types: Lifestyle, Weight Loss, Sleep, Activity, Calorie, Custom
- Dynamic tracker form auto-builds based on challenge type
- Meal logging with calorie tracking and daily summary
- Privacy controls — toggle what data is shared
- Comparison page — import shared data, side-by-side score charts
- Target lines on water, sleep, calorie analytics charts
- Theme-aware chart colors (dark/light mode)
- Delete individual day entries
- Date boundary enforcement for challenge range
- V1 → V2 automatic data migration
- New architecture: `core.js` (data layer) + `app.js` (UI engine)
- Steps tracking and calorie trend charts
- Updated all documentation for v2.0

### v1.0 — April 2026
- Initial release — 16 daily habits with checkbox + metric tracking
- Dashboard with progress ring, stats, streak map, weight charts
- Daily tracker with date navigation, mood, energy, notes
- Analytics: 6 trend charts, habit heatmap, weekly review
- Printable A4 weekly tracking sheets
- Settings: duration, targets, theme, data management
- PWA: manifest, service worker, offline support
- JSON + CSV export/import
- Dark/Light mode

---

## 🔐 Security Notes

- **No data leaves your device** — ever
- No cookies, no analytics, no tracking pixels
- No server-side code — pure client-side JavaScript
- localStorage is sandboxed per browser origin
- Per-user privacy controls for selective data sharing
- Clear browser data = clear app data (export backups regularly!)
- Service worker caches only app files and Chart.js CDN
