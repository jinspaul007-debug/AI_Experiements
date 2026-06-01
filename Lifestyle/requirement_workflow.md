# 🧠 AI Context & Workflow Document: Lifestyle Challenge Tracker v3.0

> **Instruction for new AI Instance:** Read this document entirely before making any modifications to the codebase. It contains the complete context, user requirements, and architectural decisions made in previous sessions.

## Revision History
| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Apr 2026 | Initial release — 16 hardcoded habits, single user, basic analytics |
| 2.0 | May 2026 | Multi-user profiles, 6 challenge types, calorie/meal tracking, privacy controls, comparison features, dynamic tracker forms, target-line charts, data edit/delete, v1→v2 migration |
| 3.0 | May 2026 | Body metrics (height/age/gender/activity), PIN lock per profile, Health Tools (BMI, TDEE/maintenance, calorie burn, weight-loss planner), Goal engine with projection (plan vs actual pace), goal progress visualizations, custom challenge (free duration + date-range + goal weight), custom habit/category builder, professional UI redesign with smooth transitions, full multi-profile backup/restore, projection charts, USER_GUIDE.md |

## v3.0 Detailed Requirements

### R18: Body Metrics & Health Profile
- Profile stores: height (cm), age, gender, activity level, starting weight, goal weight.
- Used by all health calculators and projections.

### R19: PIN Protection (Data Security)
- Optional 4-digit PIN per profile. Lock screen on app open / profile switch.
- PIN stored hashed (local-only). Forgot-PIN clears that profile only.

### R20: Health Tools / Calculators
- **BMI Calculator** — category + healthy weight range.
- **Maintenance Calories (TDEE)** — Mifflin-St Jeor BMR × activity factor.
- **Calorie Burn** — METs-based estimator for common activities.
- **Weight-Loss Calorie Target** — deficit needed to reach goal weight by goal date.

### R21: Goal Planner & Projection
- User sets a goal (e.g. "lose 3 kg in 60 days"). App computes a daily plan: required daily calorie deficit, suggested sleep, activity, water.
- **Projection chart**: planned trajectory vs actual logged data.
- **Pace indicator**: ahead / on-track / behind, with projected finish date based on current rate.

### R22: Goal Progress Visualization
- Per-goal progress bars + trend graphs for water, sleep, reading, steps, weight.

### R23: Flexible Challenge Configuration
- Duration via free number input OR start-date → end-date range.
- Goal weight target attached to challenge.
- Custom challenge: add/remove habits, create custom categories & sub-habits.

### R24: Professional UI/UX
- Tier-1 quality redesign: smooth page transitions, refined cards, gradient accents, accessible contrast, responsive (Chrome/Edge/iPhone 12 Safari PWA).

### R25: Full Backup & Restore
- Export ALL profiles + data in one backup file; import to restore everything.

## �� User Profile & Constraints
- **User:** Any individual seeking lifestyle improvement. Multiple users supported per device.
- **Environment:** Any modern browser (desktop or mobile). Optimized for iPhone PWA.
- **Constraint:** Solution MUST be accessible anytime on any device. 100% offline capable (PWA).
- **Privacy:** Zero cloud, zero server. Data stays strictly in local storage. Per-user privacy controls for sharing.

## 🎯 Project Goal
Create a world-class, production-quality lifestyle challenge tracker built as a local Progressive Web App (PWA). Supports **multi-user profiles**, **6 challenge types** (Lifestyle, Weight Loss, Sleep, Activity, Calorie, Custom), **meal/calorie logging**, **privacy-controlled data comparison**, and comprehensive analytics with target-line charts.

## 📋 Core Requirements (v1.0 — All Implemented)
1. **20 Habit Library:** Wake up early, Yoga, Exercise, Gym, Steps, No Sugar, No Junk, Water, Protein, Calorie Tracking, Sleep, Sleep Quality, Bed Time, Reading, Study, Language Practice, Family Time, Weight AM/PM.
2. **Day Types:** Normal, Rest, Cheat, Sick.
3. **Analytics:** Heatmaps, 8 trend charts (Chart.js), weekly review, progress ring.
4. **Milestones:** Badges for day 1, 7, 14, 21, 50, 66, 75, 90, 100, 101.
5. **Printable Sheets:** A4 optimized CSS for weekly and full reports.
6. **Data Management:** JSON/CSV Export/Import, delete day entries.

## 📋 v2.0 Requirements (All Implemented)
7. **Multi-User Profiles:** Create/switch/delete profiles with avatars, per-user data isolation.
8. **Challenge Types:** 6 types — Lifestyle, Weight Loss, Sleep, Activity, Calorie, Custom. Each configures which habits to track.
9. **Calorie & Meal Tracking:** Log meals with name, calories, type. Daily calorie summary vs target.
10. **Privacy Controls:** Per-user toggles for sharing weight, sleep, activity, calories, mood, score.
11. **Comparison:** Privacy-filtered data export/import, side-by-side score comparison charts.
12. **Enhanced Charts:** Target lines on water/sleep/calorie charts, theme-aware colors, calorie & steps trend charts.
13. **Dynamic Tracker:** Form auto-builds based on active challenge's habits. Delete individual day entries. Date boundary enforcement.
14. **V1→V2 Migration:** Automatic migration of existing single-user data to multi-user format.

## 🏗️ Architecture & File Structure
- `index.html`: App shell with 8 pages (Profile, Dashboard, Tracker, Challenges, Analytics, Compare, Print, Settings).
- `core.js`: Data layer — constants, profiles, challenges, storage, shared data, migration.
- `app.js`: UI engine — navigation, dynamic tracker builder, dashboard, settings, profile/challenge/compare pages.
- `analytics.js`: Chart.js rendering with target lines, heatmap, weekly review.
- `print.js`: Dynamic HTML table generation for A4 printing (adapts to active challenge habits).
- `sw.js` & `manifest.json`: Service worker (v2 cache) and PWA config for offline access.
- `README.md`: Full requirements, architecture, data schema, usage guide.
- `DEPLOY_MOBILE.md`: Deployment guide for GitHub Pages and iPhone.

## 🔍 Deep Review & Fixed Issues (v2.0)
- **Issue:** Single-user only. **Fix:** Multi-user profile system with per-user localStorage keys.
- **Issue:** Hardcoded 16 habits. **Fix:** Dynamic habit library with challenge-type-based selection.
- **Issue:** No calorie/meal tracking. **Fix:** Meal logging with daily calorie summary and target comparison.
- **Issue:** No data comparison. **Fix:** Privacy-filtered export/import with comparison charts.
- **Issue:** Chart colors hardcoded for dark theme. **Fix:** Theme-aware `chartTxtColor()`/`chartGridColor()` functions.
- **Issue:** Mood detection used fragile inline style matching. **Fix:** Use `data-v` attribute for reliable mood value detection.
- **Issue:** No date boundary checks. **Fix:** `chgDate()` enforces challenge date range.
- **Issue:** Can't delete day data. **Fix:** `delDay()` with confirmation modal.
- **Issue:** Personal/company references. **Fix:** All sanitized — no personal names, no corporate data.

## 🚀 Next Steps / Pending Tasks for AI
1. **Custom Habit Creation UI:** Allow users to add/remove custom habits from the challenge.
2. **Apple Health Integration:** Export/import bridge for Apple Health/Zepp.
3. **Photo Progress:** Base64 encoded daily progress photos.
4. **Notification Reminders:** PWA push notification for daily tracking reminders.
5. **Monthly Summary Report:** Aggregated monthly stats view.

## 💻 How to continue development:
When adding features, modify the relevant module:
- **core.js** for data model, storage, constants
- **app.js** for UI, navigation, tracker, dashboard
- **analytics.js** for charts and analytics
- **print.js** for printable reports
Ensure changes don't break offline caching in `sw.js` (update CACHE_NAME version). Maintain the UI design language (modern dark/light theme, CSS variables).
