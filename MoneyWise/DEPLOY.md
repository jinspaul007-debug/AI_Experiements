# MoneyWise — Deployment & Access Guide

## 🚀 Step 1: Push to Private GitHub Repository

Your repo `AI_Experiements` is already private. Push the MoneyWise folder:

```bash
cd D:\Work\AI_experiment\UpSkill\github_jp\WorkAI_experimentAI_Experiements
git add MoneyWise/
git commit -m "MoneyWise v2.0 production release"
git push origin main
```

## 🌐 Step 2: Enable GitHub Pages

1. Go to `https://github.com/jinspaul007-debug/AI_Experiements/settings/pages`
2. Source: **Deploy from a branch**
3. Branch: `main`, Folder: `/ (root)`
4. Click **Save**
5. Wait 2-3 minutes → Your URL: `https://jinspaul007-debug.github.io/AI_Experiements/MoneyWise/`

> ⚠️ **IMPORTANT**: GitHub Pages requires the repo to be public for free accounts. If you want to keep it private, use one of these alternatives:
> - **Cloudflare Pages** (free, supports private repos)
> - **Netlify** (free, connect private GitHub repo)
> - Make the repo public — the data is AES-256 encrypted anyway

## 🔐 Step 3: First-Time Setup

1. Open the app URL in browser
2. Login: `admin` / `admin123`
3. Enter a **Family Encryption Key** — choose a strong passphrase your family agrees on
4. Go to **Settings** → Configure GitHub API:
   - **PAT**: Your GitHub Personal Access Token
   - **Username**: `jinspaul007-debug`
   - **Repo**: `AI_Experiements`
   - **Path**: `MoneyWise/data.enc`
5. Click **Save Settings**

## 👩 Step 4: Give Spouse Access

### Option A: Same GitHub Token (Simpler)
1. Share the app URL with your spouse
2. In Settings → Family Members → Add her name (role: Editor)
3. Give her the login credentials and encryption key
4. She logs in with her username and password

### Option B: Separate GitHub Token (More Secure)
1. Add spouse as **Collaborator** on the repo:
   - Repo Settings → Collaborators → Add `spouse-github-username`
2. She creates her own PAT with `repo` scope
3. She configures her own token in Settings

## 📱 Step 5: Install on Phone (PWA)

### iPhone (Safari)
1. Open app URL in Safari
2. Tap **Share** → **Add to Home Screen**
3. Done — opens like a native app

### Android (Chrome)
1. Open app URL in Chrome
2. Tap **⋮** → **Install app** or **Add to Home Screen**

## 🔄 Updating the App

```bash
# After making code changes:
git add MoneyWise/
git commit -m "MoneyWise update: description"
git push origin main
# GitHub Pages auto-deploys in ~2 minutes
```

Your financial **data** is stored separately in `data.enc` (encrypted). Code updates never touch data.

## 🛡️ Security Summary

| Layer | Protection |
|-------|-----------|
| Repository | Private (only collaborators see code) |
| Data at rest | AES-256 encrypted (`data.enc`) |
| Data in transit | HTTPS enforced |
| App access | Username + Password + Encryption Key |
| GitHub API | Personal Access Token (scoped) |
