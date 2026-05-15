# MoneyWise App: Comprehensive Requirements & Architecture

> **CRITICAL SYSTEM RULE:** This document MUST NEVER be overwritten or have its historical requirements deleted. All updates MUST be appended. Any changes to requirements must be logged in the **Version History** section. Old requirements should be marked as updated or deprecated, never erased, to maintain a strict audit trail.

---

## 📅 VERSION HISTORY & CHANGELOG

### v3.0 - Multi-Device Architecture Overhaul & Production Deploy (Current)
- **CRITICAL FIX:** Login screen now includes GitHub Connection setup (PAT/Username/Repo) — this was the root cause of the 404 error when hosting on GitHub Pages. Previous versions required PAT to be configured in Settings AFTER login, creating a chicken-and-egg problem where non-admin users could never login.
- **First-Time Setup Flow:** When `data.enc` doesn't exist yet, admin can login with `admin/admin123` and the app automatically creates the encrypted data file on GitHub.
- **Remember Encryption Key:** Optional "Remember key on this device" checkbox stores the key in localStorage for auto-login.
- **Auto-Login:** If GitHub is configured AND encryption key is remembered, the app auto-logs in by fetching fresh data from GitHub.
- **SHA Conflict Resolution:** API layer now handles HTTP 409 conflicts when two devices edit simultaneously.
- **Improved Logout:** Double-tap logout (no more confirm dialog that blocks in some browsers).
- **Sync Error Feedback:** All sync failures now show toast notifications with specific error messages.
- **Service Worker v3:** Network-first strategy, skip caching API calls and CDN resources, proper version-based cache busting.
- **Session Freshness:** Auto-login re-validates user against remote data (catches password changes by admin).

### v2.2 - Password Management, Yearly Budget & Analytics
- **Password Change:** Users can now change their own password from Settings (validates current password, enforces min 6 chars).
- **Strong Passwords:** Family members created with mandatory custom password (no auto-generated weak defaults).
- **Yearly Budget View:** Budget page now has Monthly/Yearly toggle. Yearly view multiplies monthly budget x12 and tracks full-year spending.
- **Yearly Trend Chart:** Dashboard now shows a full 12-month Income vs Expense vs Savings line chart for the current year.
- **Local Date & Time:** Dashboard header shows current local date/time with live clock (Indian locale).
- **Budget Progress Bars:** Animated progress bars with percentage labels and color coding (green/yellow/red).
- **Empty State UX:** Budget and transaction pages show friendly empty states with icons instead of blank screens.
- **Admin Protection:** Admin account shows "Owner" badge and cannot be accidentally deleted.

### v2.1 - Comprehensive Asset Classes & Multi-User Production
- **Expanded Asset Types:** Added PPF (Public Provident Fund), Gold/Jewelry, Real Estate alongside existing PF/EPF, NPS, FD, Bonds, Mutual Funds, Shares.
- **Enhanced Fixed-Income Tracking:** All fixed-income assets now track Invested Date, Interest Rate (% p.a.), Maturity Period (Months), and Expected Maturity Value.
- **Loan Deep Tracking:** Loans now capture Start Date and Tenure (Months) alongside Total Principal, Remaining Balance, EMI, and Interest Rate.
- **Multi-User Credentials:** Family members now get custom passwords (not auto-generated). Settings shows Login ID for each member. Admin account protected from deletion.
- **Duplicate User Guard:** Prevents creating members with the same login ID.
- **Enhanced Portfolio Display:** Loans show Total Amount, Rate, and Tenure in list view. Assets show maturity details.
- **Browser-Tested:** Full end-to-end testing on localhost:8090 — Login, Dashboard, Settings, Portfolio, Quick Entry, EMI Pay all verified working.

### v2.0 - Complete Production Rebuild & Deployment
- **Deep Audit:** Performed exhaustive code review. Found 6 critical bugs, 10+ missing features from original spec.
- **Bug Fixes:** Fixed `getDefaultData()` missing banks/chittis arrays (crash on first use). Fixed duplicate event listeners (memory leak). Fixed mobile modal overflow. Fixed service worker cache invalidation.
- **Edit Flow:** Added ability to EDIT any existing transaction, asset, loan, bank, or chitti (not just add/delete).
- **Toast Notifications:** Added animated success/error toast system replacing raw `alert()` calls.
- **Net Worth Snapshots:** Implemented real historical snapshots saved on each sync for accurate trend charts.
- **Month-over-Month Comparison:** Added expense comparison chart (This Month vs Last Month) on Dashboard.
- **Mobile UX:** Scrollable modals, safe area padding, improved bottom nav with Budget tab.
- **Deployment Guide:** Created comprehensive DEPLOY.md with step-by-step GitHub Pages hosting and spouse access instructions.
- **Password Change:** Added password change in Settings for logged-in user.
- **Service Worker:** Added version-based cache busting.

### v1.5 - Advanced Portfolio & Universal Tracking
- **New Asset Classes:** Added full support for Provident Fund (PF) and National Pension System (NPS).
- **Deep Fixed-Income Analytics:** Bonds, FDs, PF, and NPS now track Invested Date, Interest Rate, Maturity Months, and Expected Maturity Gain.
- **Advanced Loan Analytics:** Loans now track Total Loan, Paid Amount, Remaining Balance, EMI, and feature a graphical comparison of Expected EMI vs Actual Payments.
- **Universal Auto-Update Logic:** Adding payments via the Monthly Tracker (Inv. SIP, EMI Pay) now universally updates corresponding targets (Mutual Funds, FDs, Bonds, Gold Loans, Chittis, PF, NPS) in real-time.

### v1.4 - Settings, Budgets, and Export Overhaul
- **Category Management:** Added UI in Settings to dynamically create Major and Minor categories.
- **Export Capabilities:** Implemented CSV Export for transactions and PDF Report generation using jsPDF.
- **Advanced Budgets:** Added Budget Radar charts and Budget Trend Bar charts to the Budgets tab. Added Financial Summary Widgets (Total Allocated, Spent, Remaining).

### v1.3 - Ownership, Advanced Portfolios, and Hierarchy
- **Categories:** Migrated to a strict Major/Minor hierarchical category system.
- **Ownership Tagging:** Every asset, chitti, and loan requires an ownership assignment (User A, User B, or Mutual).
- **Portfolio Analytics:** Implemented ownership wealth bar charts and portfolio asset doughnut charts.
- **EMI Math:** Implemented logic where paying a loan EMI automatically mathematically reduces the target loan's remaining balance.
- **Transactions Filters:** Added Major Category filtering to the transactions view.

### v1.2 - SIPs, Chitti, and Fintech Refinement
- **Investments:** Implemented SIP tracking logic which updates asset values.
- **KSFE Chitti:** Built dedicated engine tracking Sala, Months, and Installments.
- **Transfer Logic:** Implemented "Transfer / CC Bill" transaction type to prevent double-counting of expenses when paying credit card bills.
- **Wealth Views:** Split Dashboard (Monthly focused) from Net Worth (Wealth focused).

### v1.1 - The Foundation
- **Goal:** Create a static PWA that acts as a secure, local-first finance tracker.
- **Architecture:** Zero-Backend. Data must be 100% AES-256 encrypted on the client side before syncing to a private GitHub repository (`data.enc`).
- **UI/UX:** Must feature premium, dark-themed Fintech design (Zinc palette, Glassmorphism, Floating Action Buttons).

---

## 1. Core Project Goal
Create a highly secure, private, "world-class" Progressive Web App (PWA) for managing family finances with zero cloud dependency (stores encrypted data on private GitHub). It must feature an ultra-modern, smooth Fintech UI/UX.

## 2. Core Constraints & Security
- **Data:** 100% AES-256 encrypted JSON synced via GitHub REST API.
- **Auto-Login:** Smooth splash screen auto-login if credentials and keys are saved locally.
- **Privacy:** Zero third-party analytics or server tracking.

## 3. UI/UX & Navigation Structure
- **Dashboard:** Strictly focuses on *Current Month* (Monthly Income, Monthly Expense, Monthly Savings). Explicitly displays the Current Month & Year. Includes AI Insights.
- **Wealth / Net Worth View:** A dedicated page to analyze Total Net Worth, Total Assets, Total Liabilities, and Bank Account balances with deep charts.
- **Transactions:** View activities (Filters: Time periods + Major Categories).
- **Portfolio / Investments:** Manage specific assets, SIPs, and Chittis. Includes rich graphs breaking down portfolio by Asset Type and Ownership.
- **Budgets:** Set Monthly/Yearly budgets per Major/Minor category. Visual indicators and graphical analytics for overshooting categories.
- **Settings:** Manage API Keys, Custom Payment Methods, Manage Family Members, Export Data, and Manage Categories.

## 4. Feature Requirements (Active)

### A. Record Entry & Categories
- **Hierarchical Categories:** Expenses and Income are structured (Major -> Minor). 
  - Manageable directly from the Settings tab.
- **Transaction Types:** Expense, Income, Transfer/CC Bill, Investment (SIP), EMI.
- **Transfer / CC Bill Logic:** Prevent duplicate expense counting. Paying a CC bill is a "Transfer" from Bank to CC Liability, not a new expense.
- **Who Paid:** Defaults to the currently logged-in user.

### B. Universal Investment, Loan, & Ownership Logic
- **Ownership Mapping:** Every Asset, Loan, and Chitti MUST map to an owner (Individual Family Member or "Mutual").
- **Universal Target Updating:**
  - **Loans:** Logging an "EMI" transaction automatically reduces the target loan's `remainingBalance` and increases its tracked `paidAmount`.
  - **Market/Fixed Assets:** Logging an "Inv. SIP" transaction automatically increases the `invested` and `currentValue` amounts for the target asset (PF, NPS, FDs, Bonds, Mutual Funds, etc.).
  - **KSFE Chitti:** Adding Chitti EMI dynamically updates `paidSoFar` and tracks `installmentsPaid` against `months`.
- **Advanced Fixed-Income:** FDs and Bonds track granular data (Date Invested, Maturity Months, Interest Rate, Current/Maturity Gains).
- **Bank Accounts:** Track multiple bank accounts with monthly balance updates.

### C. Budgets, Analytics & Data Export
- **Advanced Budgeting:**
  - Set budgets per Major/Minor category (Monthly/Yearly).
  - Deep graphical analysis: Radar charts comparing Budget vs Actual across categories, and Bar charts for overall budget health.
  - Detailed budget summaries (Total Budget, Total Spent, Remaining Safe to Spend).
- **Data Export:**
  - **Excel (CSV):** Export all transactions to CSV natively.
  - **PDF Reports:** Export structured Financial Summary Reports to PDF (net worth, month summaries, transaction history) using jsPDF.
- **Portfolio Analytics:** 
  - Expense pie chart by Major Category.
  - Wealth breakdown by Owner (User A vs User B vs Mutual).
  - Portfolio asset distribution doughnut charts.

### D. User Management
- Add new family members (Admin/Editor).
- Remove existing members (except Admin) permanently.

## 5. Architecture Stack
- **HTML/CSS/JS:** Vanilla Web Technologies (No complex frameworks like React/Vue).
- **Chart.js:** For all advanced graphical rendering.
- **CryptoJS:** For AES-256 local encryption.
- **jsPDF:** For offline PDF report generation.
