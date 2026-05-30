# MenuPlanner — Kerala & South Indian Weekly Menu Planner

A beautiful, premium Progressive Web App for weekly food menu planning. Built with a curated database of 70+ Kerala and South Indian dishes, it helps families plan breakfast, lunch, snacks, and dinner across 7 days — and auto-generates a shopping list.

## ✨ Features

- 🍲 **Rich Dish Database** — 70+ curated Kerala & South Indian dishes across 8 categories
- 📅 **Weekly Planner** — Plan 6 meal types per day across 7 days with quick-select modals
- 🛒 **Smart Shopping List** — Auto-generated ingredient checklist from your planned meals
- ☁️ **Cloud Sync** — Secure GitHub Gist synchronization for cross-device access
- 👥 **Multi-User** — Admin, Editor, and Viewer roles with password protection
- 📱 **PWA** — Install on iPhone, Android, or any browser. Works offline.
- 🎨 **Premium UI** — Dark spice-themed design with smooth animations

## 🚀 Quick Start

### GitHub Pages Deployment
1. Create a new repository on GitHub (e.g., `menuplanner`)
2. Upload all files from this folder
3. Go to **Settings → Pages → Deploy from Branch → Save**
4. Access at: `https://yourusername.github.io/menuplanner`

### Default Login
- **Username:** `admin`
- **Password:** `admin123`
- ⚠️ Change your password immediately after first login!

## 📱 Mobile Setup
1. Open the deployed URL in Safari (iOS) or Chrome (Android)
2. Tap **Share → Add to Home Screen**
3. Works offline after first load!

## 🔐 Security
- All data stored locally in browser (localStorage)
- Optional GitHub Gist sync uses private gists
- XSS protection on all user inputs
- Role-based access control

## 📋 Meal Categories
| Category | Examples |
|---|---|
| Breakfast Mains | Idiyappam, Dosa, Puttu, Appam, Chapathi |
| Rice & Lunch | Biriyani, Pulav, Ghee Rice, Kanji |
| Curries | Chicken Curry, Sambar, Fish Curry, Dal Curry |
| Dry Items | Beef Fry, Thoran varieties |
| Vegetables | Beans Thoran, Beetroot Thoran |
| Snacks | Pazham Pori, Unniyappam, Vada |
| Salads & Fruits | Cucumber Salad, seasonal fruits |
| Add-ons | Pappadam, Pickle, Chammanthi |

## 📦 Tech Stack
- Pure HTML5, CSS3, JavaScript (no frameworks, no build step)
- Service Worker for offline caching
- GitHub Gist API for cloud sync

## 📄 License
Personal use. Not for commercial distribution.
