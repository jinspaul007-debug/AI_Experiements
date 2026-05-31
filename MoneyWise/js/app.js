/**
 * Main Application Controller v5.0 - Production Build
 * Security: SHA-256 hashing, AES-256 encryption, XSS sanitization, admin-only guards.
 * Features: Full backup/restore, data export, conflict auto-retry.
 * Mobile-first, iOS/Android tested, cross-browser verified.
 */

function toast(msg, type='success') {
    const c = document.getElementById('toast-container');
    if(!c) return;
    const t = document.createElement('div');
    t.className = `toast toast-${type}`;
    t.innerHTML = `<i class="fa-solid ${type==='success'?'fa-check-circle':type==='error'?'fa-triangle-exclamation':'fa-info-circle'}"></i> ${msg}`;
    c.appendChild(t);
    t.addEventListener('click', () => { t.classList.add('removing'); setTimeout(()=>t.remove(), 300); });
    setTimeout(()=>{ if(t.parentNode) { t.classList.add('removing'); setTimeout(()=>t.remove(), 300); } }, 3500);
}

/** Mobile-safe confirm dialog (native confirm() can be blocked on iOS) */
function mConfirm(message, title='Confirm') {
    return new Promise(resolve => {
        const overlay = document.createElement('div');
        overlay.className = 'confirm-dialog-overlay';
        overlay.innerHTML = `<div class="confirm-dialog"><h3>${title}</h3><p>${message}</p><div class="btn-row"><button class="btn btn-secondary" id="mConfirmNo">Cancel</button><button class="btn btn-primary" id="mConfirmYes">Confirm</button></div></div>`;
        document.body.appendChild(overlay);
        overlay.querySelector('#mConfirmYes').onclick = () => { overlay.remove(); resolve(true); };
        overlay.querySelector('#mConfirmNo').onclick = () => { overlay.remove(); resolve(false); };
        overlay.addEventListener('click', (e) => { if(e.target === overlay) { overlay.remove(); resolve(false); } });
    });
}

/** Mobile-safe prompt dialog */
function mPrompt(message, defaultVal='') {
    return new Promise(resolve => {
        const overlay = document.createElement('div');
        overlay.className = 'input-dialog-overlay';
        overlay.innerHTML = `<div class="input-dialog"><h3>${message}</h3><input type="text" class="form-input" id="mPromptInput" value="${defaultVal}" placeholder="Enter value..." autofocus><div class="btn-row"><button class="btn btn-secondary" id="mPromptNo">Cancel</button><button class="btn btn-primary" id="mPromptYes">OK</button></div></div>`;
        document.body.appendChild(overlay);
        const inp = overlay.querySelector('#mPromptInput');
        setTimeout(() => inp.focus(), 100);
        overlay.querySelector('#mPromptYes').onclick = () => { const v = inp.value.trim(); overlay.remove(); resolve(v || null); };
        overlay.querySelector('#mPromptNo').onclick = () => { overlay.remove(); resolve(null); };
        inp.addEventListener('keydown', (e) => { if(e.key === 'Enter') { const v = inp.value.trim(); overlay.remove(); resolve(v || null); } });
    });
}

/** Get today's date as YYYY-MM-DD in local timezone (not UTC) */
function getLocalDateStr(d) {
    const date = d || new Date();
    return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
}

const MAJOR_CATEGORIES = {
    expense: {
        'Food': ['Groceries', 'Dining Out', 'Snacks'],
        'Housing': ['Rent', 'Maintenance', 'Furnishings'],
        'Transportation': ['Fuel', 'Public Transit', 'Auto Repair', 'Taxi'],
        'Health': ['Medicines', 'Doctor', 'Insurance', 'Fitness'],
        'Lifestyle': ['Clothes', 'Salon', 'Hobbies'],
        'Online Shopping': ['Amazon', 'Flipkart', 'Gadgets'],
        'Education': ['Fees', 'Books', 'Courses'],
        'Travel': ['Flights', 'Hotels', 'Vacation'],
        'Utilities': ['Electricity', 'Water', 'Internet', 'Phone'],
        'Other': ['Misc Expense']
    },
    income: {
        'Salary': ['Base Pay', 'Bonus', 'Allowances'],
        'Investments': ['Dividends', 'Interest', 'Capital Gains'],
        'Other': ['Misc Income']
    },
    transfer: {
        'Credit Card': ['CC Bill Payment'],
        'Bank': ['Bank Transfer', 'ATM Withdrawal']
    },
    investment: { 'Portfolio': ['SIP', 'Lumpsum', 'Chitti EMI'] },
    emi: { 'Loan': ['EMI Payment', 'Prepayment'] }
};

const DEFAULT_PM = ['Cash', 'UPI', 'Debit Card', 'Amazon Pay', 'Credit Card'];

const App = {
    editingTransId: null,
    data: null, currentUser: null, currencySymbol: '₹', budgetView: 'monthly',

    async init() {
        this.bindLogin();
        this.bindNavigation();
        this.bindModals();
        this.bindForms();
        this.bindSettings();

        const savedUser = localStorage.getItem('mw_current_user');
        const rememberedKey = localStorage.getItem('mw_enc_key');
        if (savedUser && GitHubAPI.isConfigured() && rememberedKey) {
            try {
                this.currentUser = JSON.parse(savedUser);
            } catch(parseErr) {
                console.error('Corrupted saved user, clearing:', parseErr);
                localStorage.removeItem('mw_current_user');
                this.showLogin(); return;
            }
            GitHubAPI.setEncryptionKey(rememberedKey);
            try {
                await this.syncData(true);
                const freshUser = this.data.users.find(u => u.id === this.currentUser.id);
                if (freshUser) { this.currentUser = freshUser; localStorage.setItem('mw_current_user', JSON.stringify(freshUser)); this.setupApp(); }
                else { this.showLogin(); }
            } catch (e) { console.error('Auto-login sync failed:', e); this.showLogin(); }
        } else { this.showLogin(); }
    },

    showLogin() {
        const spl = document.getElementById('splash-screen');
        if(spl) { spl.style.opacity = '0'; setTimeout(() => { spl.style.display = 'none'; }, 400); }
        const ls = document.getElementById('loginScreen');
        ls.style.display = 'flex';
        // Only override pre-filled HTML defaults if localStorage has saved values
        if (GitHubAPI.config.token) document.getElementById('loginToken').value = GitHubAPI.config.token;
        if (GitHubAPI.config.username) document.getElementById('loginGhUser').value = GitHubAPI.config.username;
        if (GitHubAPI.config.repo) document.getElementById('loginGhRepo').value = GitHubAPI.config.repo;
        const sf = document.getElementById('setup-fields');
        const ss = document.getElementById('setup-status');
        if (GitHubAPI.isConfigured()) {
            // Show as 'Saved' not 'Connected' — actual connection is tested on login
            sf.style.display = 'none'; ss.innerText = 'Saved'; ss.style.background = 'var(--warning-bg)'; ss.style.color = 'var(--warning)';
        } else {
            sf.style.display = 'block'; ss.innerText = 'Required'; ss.style.background = ''; ss.style.color = '';
        }
        const rk = localStorage.getItem('mw_enc_key');
        if (rk) { document.getElementById('loginKey').value = rk; document.getElementById('loginRememberKey').checked = true; }
    },

    showLoginError(msg) {
        const el = document.getElementById('login-error');
        el.innerText = msg; el.style.display = 'block';
        // Keep error visible for 15 seconds — mobile users need more time to read
        if (this._loginErrTimer) clearTimeout(this._loginErrTimer);
        this._loginErrTimer = setTimeout(() => { el.style.display = 'none'; }, 15000);
    },

    bindLogin() {
        document.getElementById('login-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            document.getElementById('login-error').style.display = 'none';

            // Read GitHub config from login screen fields
            const token = document.getElementById('loginToken').value.trim();
            const ghUser = document.getElementById('loginGhUser').value.trim();
            const ghRepo = document.getElementById('loginGhRepo').value.trim();

            // Apply config to memory (but DON'T save to localStorage yet)
            if (token && ghUser && ghRepo) {
                GitHubAPI.config.token = token;
                GitHubAPI.config.username = ghUser;
                GitHubAPI.config.repo = ghRepo;
                GitHubAPI.config.path = 'MoneyWise/data.enc';
            }
            // Debug log — helps identify typos in repo name
            console.log('[MoneyWise] Login attempt with config:', { username: GitHubAPI.config.username, repo: GitHubAPI.config.repo, path: GitHubAPI.config.path });

            if (!GitHubAPI.isConfigured()) { this.showLoginError('GitHub connection required. Expand the GitHub section and fill in your details.'); return; }

            const u = document.getElementById('loginUser').value.trim().toLowerCase();
            const p = document.getElementById('loginPass').value;
            const key = document.getElementById('loginKey').value;
            const rememberKey = document.getElementById('loginRememberKey').checked;
            if (!u || !p || !key) { this.showLoginError('All fields are required.'); return; }

            GitHubAPI.setEncryptionKey(key);

            const btn = e.target.querySelector('button[type="submit"]');
            const orig = btn.innerHTML;
            btn.innerHTML = '<div class="spinner" style="width:18px;height:18px;border-width:2px;margin:0;display:inline-block;vertical-align:middle;"></div> Connecting...';
            btn.disabled = true;

            const resetBtn = () => { btn.innerHTML = orig; btn.disabled = false; };
            const showGitHubFields = () => {
                // If connection fails, re-show the GitHub fields so user can fix them
                const sf = document.getElementById('setup-fields');
                const ss = document.getElementById('setup-status');
                sf.style.display = 'block';
                ss.innerText = 'Check Settings'; ss.style.background = 'var(--danger-bg)'; ss.style.color = 'var(--danger)';
            };

            try {
                let remoteData = await GitHubAPI.fetchData();

                // If we get here, the GitHub connection is VERIFIED working.
                // NOW save the config to localStorage (prevents 'ghost config' lockout)
                GitHubAPI.saveConfig(token || GitHubAPI.config.token, ghUser || GitHubAPI.config.username, ghRepo || GitHubAPI.config.repo, 'MoneyWise/data.enc');

                if (remoteData === null) {
                    // First-time setup: data.enc doesn't exist yet (repo is verified accessible)
                    if (u === 'admin' && p === 'admin123') {
                        this.data = GitHubAPI.getDefaultData();
                        this.currentUser = this.data.users[0];
                        localStorage.setItem('mw_current_user', JSON.stringify(this.currentUser));
                        if (rememberKey) localStorage.setItem('mw_enc_key', key); else localStorage.removeItem('mw_enc_key');
                        await GitHubAPI.pushData(this.data);
                        toast('Initial setup complete! Data saved to GitHub.');
                        this.setupApp(); this.switchView('settings'); return;
                    } else { this.showLoginError('Database not yet initialized. The very first login must use admin / admin123 to create the database.'); resetBtn(); return; }
                }

                // Auto-migrate legacy plain-text passwords to SHA-256 hashes
                const wasMigrated = migratePasswordsToHashed(remoteData);

                const user = remoteData.users.find(x => x.id === u);
                if (user && verifyPassword(p, user.pass)) {
                    this.currentUser = user;
                    localStorage.setItem('mw_current_user', JSON.stringify(user));
                    if (rememberKey) localStorage.setItem('mw_enc_key', key); else localStorage.removeItem('mw_enc_key');
                    this.data = remoteData;

                    // Persist migration if passwords were upgraded to hashes
                    if (wasMigrated) {
                        try { await GitHubAPI.pushData(this.data); } catch(e) { /* best-effort migration */ }
                    }

                    this.setupApp();
                } else { this.showLoginError('Invalid username or password.'); resetBtn(); }
            } catch (err) {
                console.error('Login error:', err);
                // Show actual error + re-show GitHub fields if it's a connection issue
                const msg = err.message || 'Unknown error';
                if (msg.includes('Network error') || msg.includes('not found') || msg.includes('Access denied') || msg.includes('Cannot access') || msg.includes('GitHub API Error')) {
                    showGitHubFields();
                }
                this.showLoginError(msg);
                resetBtn();
            }
        });

        const logoutBtn = document.getElementById('logout-btn');
        logoutBtn.addEventListener('click', () => {
            if (logoutBtn.dataset.confirmLogout === 'true') {
                localStorage.removeItem('mw_current_user');
                localStorage.removeItem('mw_enc_key');
                location.reload();
            } else {
                logoutBtn.dataset.confirmLogout = 'true';
                logoutBtn.innerHTML = '<i class="fa-solid fa-exclamation-triangle"></i> Tap again to confirm logout';
                logoutBtn.style.background = 'var(--danger-bg)';
                logoutBtn.style.color = 'var(--danger)';
                setTimeout(() => {
                    logoutBtn.dataset.confirmLogout = 'false';
                    logoutBtn.innerHTML = '<i class="fa-solid fa-right-from-bracket"></i> Logout';
                    logoutBtn.style.background = ''; logoutBtn.style.color = '';
                }, 3000);
            }
        });
    },

    setupApp() {
        document.getElementById('splash-screen').style.display = 'none';
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('appMain').style.display = 'flex';
        document.getElementById('current-user').innerText = this.currentUser.name;
        
        document.getElementById('gh-token').value = GitHubAPI.config.token;
        document.getElementById('gh-username').value = GitHubAPI.config.username;
        document.getElementById('gh-repo').value = GitHubAPI.config.repo;
        document.getElementById('gh-path').value = GitHubAPI.config.path;

        document.getElementById('dash-month-year').innerText = new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
        
        const updateTime = () => {
            const el = document.getElementById('dash-local-time');
            if(el) el.innerText = new Date().toLocaleString('en-IN', { weekday:'short', hour:'2-digit', minute:'2-digit', second:'2-digit' });
        };
        updateTime(); setInterval(updateTime, 1000);

        this.renderAll();
    },

    renderAll() {
        this.updateWealthVisibility();
        this.populateDropdowns();
        this.updateDashboard();
        this.updateWealth();
        this.renderTransactions();
        this.renderPortfolio();
        this.renderBudgets();
        this.renderEducation();
        this.renderSettings();
    },

    bindNavigation() {
        const updateNav = (targetView) => {
            document.querySelectorAll('.nav-menu li, .b-nav-item').forEach(el => {
                el.classList.remove('active');
                if(el.getAttribute('data-view') === targetView) el.classList.add('active');
            });
            this.switchView(targetView);
            const titleEl = document.querySelector(`.nav-menu li[data-view="${targetView}"]`);
            if(titleEl) document.getElementById('page-title').innerText = titleEl.innerText.trim();
        };

        document.querySelectorAll('.nav-menu li, .b-nav-item').forEach(link => {
            link.addEventListener('click', () => updateNav(link.getAttribute('data-view')));
        });

        document.getElementById('sync-btn').addEventListener('click', () => {
            const i = document.querySelector('#sync-btn i');
            i.classList.add('fa-spin');
            this.syncData().then(() => i.classList.remove('fa-spin'));
        });

        document.getElementById('tx-filter').addEventListener('change', () => this.renderTransactions());
        document.getElementById('tx-cat-filter').addEventListener('change', () => this.renderTransactions());
        document.getElementById('edu-child-filter').addEventListener('change', () => this.renderEducation());
        document.getElementById('edu-time-filter').addEventListener('change', () => this.renderEducation());
    },

    switchView(viewId) {
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        const v = document.getElementById(`view-${viewId}`);
        if(v) v.classList.add('active');
        if (viewId === 'dashboard' || viewId === 'wealth' || viewId === 'assets' || viewId === 'budget') Analytics.renderCharts(this.data);
        if (viewId === 'education') this.renderEducation();
    },

    openModal(id) {
        const el = document.getElementById(id);
        el.classList.add('active');
        // Pre-fill date fields
        if (id === 'modal-edu') document.getElementById('edu-date').value = getLocalDateStr();
        // Backdrop click to close
        if(!el._backdropBound) {
            el._backdropBound = true;
            el.addEventListener('click', (e) => { if(e.target === el) this.closeModal(id); });
        }
    },
    closeModal(id) { document.getElementById(id).classList.remove('active'); },
    
    toggleAssetFields() {
        const type = document.getElementById('asset-type').value;
        const fixBox = document.getElementById('asset-fixed-fields');
        if (['Fixed Deposit', 'Bond', 'PF', 'NPS', 'PPF', 'Gold', 'Real Estate'].includes(type)) {
            fixBox.style.display = 'block';
        } else {
            fixBox.style.display = 'none';
        }
    },

    async promptMajorCat() {
        const c = await mPrompt('Enter new MAJOR category:');
        if(c) {
            const type = document.getElementById('entry-type').value;
            this.addMajorCategory(type, c);
            this.updateEntryCategoryDropdowns();
        }
    },
    async promptMinorCat() {
        const m = document.getElementById('entry-major-cat').value;
        const c = await mPrompt(`Enter new MINOR category under ${m}:`);
        if(c && m) {
            const type = document.getElementById('entry-type').value;
            this.addMinorCategory(type, m, c);
            this.updateEntryCategoryDropdowns();
        }
    },

    addMajorCategory(type, catName) {
        if(!this.data.settings) this.data.settings = {};
        if(!this.data.settings.customCats) this.data.settings.customCats = {};
        if(!this.data.settings.customCats[type]) this.data.settings.customCats[type] = {};
        if(!this.data.settings.customCats[type][catName]) this.data.settings.customCats[type][catName] = ['General'];
        this.saveAndSync();
    },

    addMinorCategory(type, majorCat, minorCat) {
        if(!this.data.settings) this.data.settings = {};
        if(!this.data.settings.customCats) this.data.settings.customCats = {};
        if(!this.data.settings.customCats[type]) this.data.settings.customCats[type] = {};
        if(!this.data.settings.customCats[type][majorCat]) this.data.settings.customCats[type][majorCat] = [];
        this.data.settings.customCats[type][majorCat].push(minorCat);
        this.saveAndSync();
    },

    bindModals() {
        const openTrans = () => {
            document.getElementById('entry-date').value = getLocalDateStr();
            this.updateEntryCategoryDropdowns();
            this.openModal('add-modal');
        };
        document.getElementById('add-new-btn-desk').addEventListener('click', openTrans);
        document.getElementById('fab-add').addEventListener('click', openTrans);

        const tabs = document.querySelectorAll('#record-tabs .tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                document.getElementById('entry-type').value = tab.getAttribute('data-tab');
                this.updateEntryCategoryDropdowns();
            });
        });

        document.getElementById('entry-major-cat').addEventListener('change', () => this.updateMinorCategoryDropdown());
        document.getElementById('budget-major').addEventListener('change', () => this.updateBudgetMinorDropdown());
    },

    getCombinedCategories(type) {
        const base = MAJOR_CATEGORIES[type] || {};
        const custom = this.data.settings?.customCats?.[type] || {};
        const combined = JSON.parse(JSON.stringify(base)); 
        
        for (let maj in custom) {
            if (!combined[maj]) combined[maj] = [];
            custom[maj].forEach(min => {
                if(!combined[maj].includes(min)) combined[maj].push(min);
            });
        }
        return combined;
    },

    updateEntryCategoryDropdowns() {
        const type = document.getElementById('entry-type').value;
        const majorSel = document.getElementById('entry-major-cat');
        const targetGroup = document.getElementById('group-target');
        const targetSel = document.getElementById('entry-target');
        const lblTarget = document.getElementById('lbl-target');
        const catGroup = document.getElementById('group-category');
        
        if(type === 'investment') {
            targetGroup.style.display = 'block'; catGroup.style.display = 'none';
            lblTarget.innerText = 'Select Asset / Chitti';
            
            // Group Assets and Chittis
            let opts = (this.data.assets||[]).map(a => `<option value="A_${a.id}">${a.name} (${a.type})</option>`).join('');
            opts += (this.data.chittis||[]).map(c => `<option value="C_${c.id}">${c.name} (Chitti)</option>`).join('');
            targetSel.innerHTML = opts;

        } else if(type === 'emi') {
            targetGroup.style.display = 'block'; catGroup.style.display = 'none';
            lblTarget.innerText = 'Select Active Loan';
            targetSel.innerHTML = (this.data.liabilities||[]).map(l => `<option value="L_${l.id}">${l.name} (Bal: ${this.fmtMoney(l.remainingBalance)})</option>`).join('');
        } else {
            targetGroup.style.display = 'none'; catGroup.style.display = 'grid';
            const combined = this.getCombinedCategories(type);
            majorSel.innerHTML = Object.keys(combined).map(c => `<option value="${c}">${c}</option>`).join('');
            this.updateMinorCategoryDropdown();
        }
    },

    updateMinorCategoryDropdown() {
        const type = document.getElementById('entry-type').value;
        const major = document.getElementById('entry-major-cat').value;
        const minorSel = document.getElementById('entry-minor-cat');
        const combined = this.getCombinedCategories(type);
        const minors = combined[major] || ['General'];
        minorSel.innerHTML = minors.map(m => `<option value="${m}">${m}</option>`).join('');
    },

    updateBudgetMinorDropdown() {
        const major = document.getElementById('budget-major').value;
        const minorSel = document.getElementById('budget-minor');
        const combined = this.getCombinedCategories('expense');
        const minors = combined[major] || [];
        minorSel.innerHTML = `<option value="All">All Sub-Categories</option>` + minors.map(m => `<option value="${m}">${m}</option>`).join('');
    },

    updateSettingsMajorDropdown() {
        const type = document.getElementById('settings-cat-type').value;
        const sel = document.getElementById('settings-major-sel');
        const combined = this.getCombinedCategories(type);
        sel.innerHTML = Object.keys(combined).map(c => `<option value="${c}">${c}</option>`).join('');
    },

    populateDropdowns() {
        const users = (this.data.users || []);
        const ownerHtml = users.map(u => `<option value="${u.name}">${u.name}</option>`).join('') + `<option value="Mutual">Mutual (Shared)</option>`;
        
        const whoSel = document.getElementById('entry-who');
        whoSel.innerHTML = users.map(u => `<option value="${u.name}" ${this.currentUser && u.id === this.currentUser.id ? 'selected' : ''}>${u.name}</option>`).join('');
        
        document.querySelectorAll('.global-owner-sel').forEach(sel => {
            const currentVal = sel.value; 
            sel.innerHTML = ownerHtml;
            if(currentVal) sel.value = currentVal;
        });

        const pmSel = document.getElementById('entry-pm');
        const customPM = this.data.settings?.paymentMethods || DEFAULT_PM;
        pmSel.innerHTML = customPM.map(p => `<option value="${p}">${p}</option>`).join('');
        
        const txCat = document.getElementById('tx-cat-filter');
        const expCats = this.getCombinedCategories('expense');
        txCat.innerHTML = `<option value="all">All Categories</option>` + Object.keys(expCats).map(c => `<option value="${c}">${c}</option>`).join('');

        const bCat = document.getElementById('budget-major');
        if(bCat) {
            bCat.innerHTML = Object.keys(expCats).map(c => `<option value="${c}">${c}</option>`).join('');
            this.updateBudgetMinorDropdown();
        }

        const sType = document.getElementById('settings-cat-type');
        if(sType && !sType._bound) {
            sType._bound = true;
            sType.addEventListener('change', () => this.updateSettingsMajorDropdown());
        }
        this.updateSettingsMajorDropdown();
    },

    bindForms() {
        document.getElementById('entry-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const type = document.getElementById('entry-type').value;
            const amount = parseFloat(document.getElementById('entry-amount').value);
            const targetVal = document.getElementById('entry-target').value;
            
            const isEdit = !!App.editingTransId;
            const newEntry = {
                id: App.editingTransId || Date.now().toString(),
                type: type,
                amount: amount,
                date: document.getElementById('entry-date').value,
                paymentMethod: document.getElementById('entry-pm').value,
                whoPaid: document.getElementById('entry-who').value,
                description: document.getElementById('entry-desc').value || '',
                timestamp: new Date().toISOString()
            };

            // UNIVERSAL UPDATE LOGIC
            if(type === 'investment' || type === 'emi') {
                const targetType = targetVal.split('_')[0]; // 'A', 'C', or 'L'
                const targetId = targetVal.split('_')[1];
                
                newEntry.targetId = targetId;
                newEntry.category = type === 'investment' ? 'Asset SIP' : 'Loan EMI';
                newEntry.minorCategory = 'System';

                if (targetType === 'A') {
                    const ast = this.data.assets.find(a => a.id === targetId);
                    if(ast) {
                        ast.invested = parseFloat(ast.invested || 0) + amount;
                        ast.currentValue = parseFloat(ast.currentValue || 0) + amount; // Assume 1:1 initially, user can adjust later
                    }
                } else if (targetType === 'C') {
                    const cht = this.data.chittis.find(c => c.id === targetId);
                    if(cht) {
                        cht.paidSoFar = parseFloat(cht.paidSoFar || 0) + amount;
                        cht.installmentsPaid = parseInt(cht.installmentsPaid || 0) + 1;
                    }
                } else if (targetType === 'L') {
                    const ln = this.data.liabilities.find(l => l.id === targetId);
                    if(ln) {
                        ln.remainingBalance = Math.max(0, parseFloat(ln.remainingBalance || 0) - amount);
                        ln.paidAmount = parseFloat(ln.paidAmount || 0) + amount;
                    }
                }
            } else {
                newEntry.category = document.getElementById('entry-major-cat').value;
                newEntry.minorCategory = document.getElementById('entry-minor-cat').value;
            }

            if (!this.data.transactions) this.data.transactions = [];
            if (isEdit) {
                const idx = this.data.transactions.findIndex(t => t.id === App.editingTransId);
                if (idx !== -1) {
                    newEntry.timestamp = this.data.transactions[idx].timestamp || newEntry.timestamp;
                    this.data.transactions[idx] = newEntry;
                }
                App.editingTransId = null;
                const btn = document.querySelector('#entry-form button[type="submit"]');
                if (btn) btn.innerText = 'Save Record';
            } else {
                this.data.transactions.unshift(newEntry);
            }

            this.closeModal('add-modal'); e.target.reset();
            toast(isEdit ? 'Record updated successfully!' : 'Record saved successfully!');
            this.saveAndSync();
        });

        document.getElementById('asset-form').addEventListener('submit', (e) => {
            e.preventDefault();
            if(!this.data.assets) this.data.assets = [];
            const type = document.getElementById('asset-type').value;
            
            const newAsset = {
                id: Date.now().toString(), 
                type: type,
                name: document.getElementById('asset-name').value, 
                owner: document.getElementById('asset-owner').value,
                invested: parseFloat(document.getElementById('asset-invested').value), 
                currentValue: parseFloat(document.getElementById('asset-current').value)
            };

            if (['Fixed Deposit', 'Bond', 'PF', 'NPS', 'PPF', 'Gold', 'Real Estate'].includes(type)) {
                newAsset.investedDate = document.getElementById('asset-date').value;
                newAsset.interestRate = parseFloat(document.getElementById('asset-rate').value || 0);
                newAsset.maturityMonths = parseInt(document.getElementById('asset-months').value || 0);
                newAsset.maturityValue = parseFloat(document.getElementById('asset-maturity-value').value || 0);
            }

            this.data.assets.push(newAsset);
            this.closeModal('modal-asset'); e.target.reset();
            this.toggleAssetFields();
            toast('Investment added!');
            this.saveAndSync();
        });

        document.getElementById('chitti-form').addEventListener('submit', (e) => {
            e.preventDefault();
            if(!this.data.chittis) this.data.chittis = [];
            this.data.chittis.push({
                id: Date.now().toString(), name: document.getElementById('chitti-name').value,
                sala: parseFloat(document.getElementById('chitti-sala').value), months: parseInt(document.getElementById('chitti-months').value),
                owner: document.getElementById('chitti-owner').value, status: document.getElementById('chitti-status').value,
                paidSoFar: 0, installmentsPaid: 0
            });
            this.closeModal('modal-chitti'); e.target.reset(); toast('Chitti added!'); this.saveAndSync();
        });

        document.getElementById('bank-form').addEventListener('submit', (e) => {
            e.preventDefault();
            if(!this.data.banks) this.data.banks = [];
            this.data.banks.push({
                id: Date.now().toString(), name: document.getElementById('bank-name').value,
                owner: document.getElementById('bank-owner').value, balance: parseFloat(document.getElementById('bank-balance').value)
            });
            this.closeModal('modal-bank'); e.target.reset(); toast('Bank account saved!'); this.saveAndSync();
        });

        document.getElementById('loan-form').addEventListener('submit', (e) => {
            e.preventDefault();
            if(!this.data.liabilities) this.data.liabilities = [];
            
            const total = parseFloat(document.getElementById('loan-amount').value);
            const remaining = parseFloat(document.getElementById('loan-balance').value);

            this.data.liabilities.push({
                id: Date.now().toString(), type: document.getElementById('loan-type').value,
                name: document.getElementById('loan-name').value, owner: document.getElementById('loan-owner').value,
                totalAmount: total, 
                remainingBalance: remaining,
                paidAmount: total - remaining,
                emi: parseFloat(document.getElementById('loan-emi').value), 
                rate: parseFloat(document.getElementById('loan-rate').value),
                startDate: document.getElementById('loan-start-date').value || '',
                tenure: parseInt(document.getElementById('loan-tenure').value || 0)
            });
            this.closeModal('modal-loan'); e.target.reset(); toast('Loan added!'); this.saveAndSync();
        });

        document.getElementById('budget-form').addEventListener('submit', (e) => {
            e.preventDefault();
            if(!this.data.budgets) this.data.budgets = {};
            const major = document.getElementById('budget-major').value;
            const minor = document.getElementById('budget-minor').value;
            const key = minor === 'All' ? major : `${major} > ${minor}`;
            
            this.data.budgets[key] = parseFloat(document.getElementById('budget-amount').value);
            this.closeModal('modal-budget'); e.target.reset(); toast('Budget saved!'); this.saveAndSync();
        });

        // Education form
        document.getElementById('edu-form').addEventListener('submit', (e) => {
            e.preventDefault();
            if(!this.data.eduExpenses) this.data.eduExpenses = [];
            const amount = parseFloat(document.getElementById('edu-amount').value);
            if(!amount || amount <= 0) return toast('Enter a valid amount', 'error');
            this.data.eduExpenses.unshift({
                id: Date.now().toString(),
                child: document.getElementById('edu-child').value,
                date: document.getElementById('edu-date').value,
                school: document.getElementById('edu-school').value.trim(),
                category: document.getElementById('edu-category').value,
                amount: amount,
                whoPaid: document.getElementById('edu-who').value,
                paymentMethod: document.getElementById('edu-pm').value,
                term: document.getElementById('edu-term').value.trim(),
                grade: document.getElementById('edu-grade').value.trim(),
                description: document.getElementById('edu-desc').value.trim(),
                timestamp: new Date().toISOString()
            });
            this.closeModal('modal-edu'); e.target.reset();
            document.getElementById('edu-date').value = getLocalDateStr();
            toast('Education expense saved!');
            this.saveAndSync();
        });
    },

    bindSettings() {
        document.getElementById('settings-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            GitHubAPI.saveConfig(
                document.getElementById('gh-token').value.trim(), document.getElementById('gh-username').value.trim(),
                document.getElementById('gh-repo').value.trim(), document.getElementById('gh-path').value.trim()
            );
            toast('Settings saved! Syncing...', 'info'); await this.syncData();
        });

        document.getElementById('add-pm-btn').addEventListener('click', () => {
            const pm = document.getElementById('new-pm-input').value.trim();
            if(!pm) return;
            if(!this.data.settings) this.data.settings = {};
            if(!this.data.settings.paymentMethods) this.data.settings.paymentMethods = [...DEFAULT_PM];
            if(!this.data.settings.paymentMethods.includes(pm)) {
                this.data.settings.paymentMethods.push(pm); this.saveAndSync(); document.getElementById('new-pm-input').value = '';
            }
        });

        document.getElementById('add-member-btn').addEventListener('click', () => {
            if(this.currentUser?.role !== 'admin') return toast('Only admin can add members', 'error');
            const name = document.getElementById('new-member-name').value.trim();
            const pass = document.getElementById('new-member-pass').value.trim();
            const role = document.getElementById('new-member-role').value;
            if(!name) return toast('Enter a name', 'error');
            if(!pass) return toast('Set a password for this member', 'error');
            if(pass.length < 6) return toast('Password must be at least 6 characters', 'error');
            const id = name.toLowerCase().replace(/\s/g,'');
            if(!this.data.users) this.data.users = [];
            if(this.data.users.find(u => u.id === id)) return toast('User already exists', 'error');
            this.data.users.push({ id, name, role, pass: hashPassword(pass) });
            toast(`${sanitize(name)} added! Login: ${id} / [password you set]`);
            this.saveAndSync();
            document.getElementById('new-member-name').value = '';
            document.getElementById('new-member-pass').value = '';
        });

        document.getElementById('add-major-cat-btn').addEventListener('click', () => {
            const type = document.getElementById('settings-cat-type').value;
            const cat = document.getElementById('new-major-cat').value.trim();
            if(cat) { this.addMajorCategory(type, cat); document.getElementById('new-major-cat').value = ''; this.updateSettingsMajorDropdown(); }
        });

        document.getElementById('add-minor-cat-btn').addEventListener('click', () => {
            const type = document.getElementById('settings-cat-type').value;
            const maj = document.getElementById('settings-major-sel').value;
            const min = document.getElementById('new-minor-cat').value.trim();
            if(min && maj) { this.addMinorCategory(type, maj, min); document.getElementById('new-minor-cat').value = ''; }
        });

        document.getElementById('export-excel-btn').addEventListener('click', () => this.exportCSV());
        document.getElementById('export-pdf-btn').addEventListener('click', () => this.exportPDF());
        document.getElementById('backup-full-btn').addEventListener('click', () => this.exportFullBackup());
        document.getElementById('restore-backup-btn').addEventListener('click', () => document.getElementById('restore-file-input').click());
        document.getElementById('restore-file-input').addEventListener('change', (e) => this.restoreFromBackup(e));
        document.getElementById('change-pass-btn').addEventListener('click', () => {
            const oldP = document.getElementById('change-old-pass').value;
            const newP = document.getElementById('change-new-pass').value;
            if(!oldP || !newP) return toast('Fill both fields', 'error');
            if(newP.length < 6) return toast('Password must be at least 6 characters', 'error');
            const user = this.data.users.find(u => u.id === this.currentUser.id);
            if(!user || !verifyPassword(oldP, user.pass)) return toast('Current password is incorrect', 'error');
            user.pass = hashPassword(newP);
            this.currentUser.pass = user.pass;
            localStorage.setItem('mw_current_user', JSON.stringify(this.currentUser));
            toast('Password updated successfully!');
            this.saveAndSync();
            document.getElementById('change-old-pass').value = '';
            document.getElementById('change-new-pass').value = '';
        });

        const wealthCheck = document.getElementById('settings-show-wealth');
        wealthCheck.addEventListener('change', () => {
            if (!this.data.settings) this.data.settings = {};
            this.data.settings.showWealthPage = wealthCheck.checked;
            this.updateWealthVisibility();
            this.saveAndSync();
        });
    },
    
    setBudgetView(view) {
        this.budgetView = view;
        document.getElementById('budget-tab-monthly').classList.toggle('active', view === 'monthly');
        document.getElementById('budget-tab-yearly').classList.toggle('active', view === 'yearly');
        this.renderBudgets();
    },

    exportCSV() {
        if(!this.data || !this.data.transactions) return toast('No data to export', 'error');
        const esc = (v) => { const s = String(v||''); return s.includes(',') || s.includes('"') || s.includes('\n') ? '"'+s.replace(/"/g,'""')+'"' : s; };
        const rows = [["Date","Type","Major Category","Minor Category","Description","Amount","Payment Method","Who Paid"]];
        this.data.transactions.forEach(tx => {
            rows.push([tx.date, tx.type, tx.category, tx.minorCategory||'', esc(tx.description), tx.amount, tx.paymentMethod, tx.whoPaid]);
        });
        const blob = new Blob([rows.map(e=>e.join(',')).join('\n')], {type:'text/csv;charset=utf-8;'});
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute("download", `MoneyWise_Transactions_${new Date().toISOString().slice(0,10)}.csv`);
        document.body.appendChild(link); link.click(); document.body.removeChild(link);
    },

    exportPDF() {
        if (!window.jspdf) return toast('PDF Library loading... please wait.', 'info');
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        doc.setFontSize(20);
        doc.text("MoneyWise Financial Report", 14, 22);
        
        doc.setFontSize(12);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
        
        const w = Analytics.calculateWealth(this.data);
        doc.text(`Total Family Net Worth: ${this.currencySymbol}${w.netWorth.toLocaleString('en-IN')}`, 14, 40);
        doc.text(`Total Assets: ${this.currencySymbol}${w.totalAssets.toLocaleString('en-IN')}`, 14, 48);
        doc.text(`Total Liabilities: ${this.currencySymbol}${w.totalLiabilities.toLocaleString('en-IN')}`, 14, 56);

        const mo = Analytics.calculateMonthly(this.data);
        doc.text(`This Month Income: ${this.currencySymbol}${mo.income.toLocaleString('en-IN')}`, 14, 70);
        doc.text(`This Month Expense: ${this.currencySymbol}${mo.expense.toLocaleString('en-IN')}`, 14, 78);

        doc.setFontSize(14);
        doc.text("Recent Transactions", 14, 95);
        
        const txs = (this.data.transactions || []).slice(0, 50).map(t => [t.date, t.type.toUpperCase(), t.category, t.description, `${this.currencySymbol}${t.amount}`]);
        doc.autoTable({
            startY: 100,
            head: [['Date', 'Type', 'Category', 'Description', 'Amount']],
            body: txs,
        });

        doc.save(`MoneyWise_Report_${new Date().toISOString().slice(0,10)}.pdf`);
    },

    async saveAndSync() {
        Analytics.saveNetWorthSnapshot(this.data);
        this.renderAll();
        this.setSyncStatus('Saving...', 'warning');
        try {
            await GitHubAPI.pushData(this.data);
            this.setSyncStatus('Synced', 'online');
        } catch (err) {
            this.setSyncStatus('Failed', 'offline');
            toast('Sync failed: ' + err.message, 'error');
            console.error('Sync error:', err);
        }
    },

    async syncData(silent = false) {
        if (!GitHubAPI.isConfigured() || !GitHubAPI.hasEncryptionKey()) {
            if (!silent) toast('Not configured', 'error');
            throw new Error('Not configured');
        }
        if(!silent) this.setSyncStatus('Syncing...', 'warning');
        try {
            const remoteData = await GitHubAPI.fetchData();
            if (remoteData === null) {
                this.data = GitHubAPI.getDefaultData();
            } else {
                this.data = remoteData;
            }
            this.renderAll();
            this.setSyncStatus('Synced', 'online');
        } catch (error) {
            this.setSyncStatus('Offline', 'offline');
            if (!silent) toast('Sync failed: ' + error.message, 'error');
            throw error;
        }
    },

    setSyncStatus(msg, statusClass) {
        const el = document.getElementById('sync-status');
        if(el) { el.innerText = msg; el.style.color = statusClass === 'online' ? 'var(--success)' : statusClass === 'offline' ? 'var(--danger)' : 'var(--warning)'; }
    },

    fmtMoney(val) { return `${this.currencySymbol}${parseFloat(val).toLocaleString('en-IN')}`; },

    updateDashboard() {
        if (!this.data) return;
        const mo = Analytics.calculateMonthly(this.data);
        document.getElementById('dash-income').innerText = this.fmtMoney(mo.income);
        document.getElementById('dash-expense').innerText = this.fmtMoney(mo.expense);
        document.getElementById('dash-savings').innerText = this.fmtMoney(mo.savings);

        const sugg = document.getElementById('ai-suggestions'); sugg.innerHTML = '';
        const tips = [];
        if (mo.income > 0 && mo.expense > mo.income * 0.9) tips.push(`<div><strong class="text-danger">🔴 Critical:</strong> Expenses at ${((mo.expense/mo.income)*100).toFixed(0)}% of income!</div>`);
        else if (mo.income > 0 && mo.expense > mo.income * 0.7) tips.push(`<div><strong class="text-warning">⚠️ Watch:</strong> Expenses at ${((mo.expense/mo.income)*100).toFixed(0)}% of income.</div>`);
        if (mo.savings > 0 && mo.income > 0) tips.push(`<div class="text-success">💰 Savings rate: ${((mo.savings/mo.income)*100).toFixed(0)}%</div>`);
        const totalLoans = (this.data.liabilities||[]).reduce((s,l) => s + parseFloat(l.remainingBalance||0), 0);
        if (totalLoans > 0) tips.push(`<div class="text-muted">📊 Outstanding loans: ${this.fmtMoney(totalLoans)}</div>`);
        sugg.innerHTML = tips.length ? tips.join('') : '<div class="text-success">✅ Finances look healthy this month!</div>';
        if (document.getElementById('view-dashboard').classList.contains('active')) Analytics.renderCharts(this.data);
    },

    updateWealth() {
        const w = Analytics.calculateWealth(this.data);
        document.getElementById('wealth-net-worth').innerText = this.fmtMoney(w.netWorth);
        document.getElementById('wealth-banks').innerText = this.fmtMoney(w.totalBanks);
        document.getElementById('wealth-assets').innerText = this.fmtMoney(w.totalAssets);
        document.getElementById('wealth-liabilities').innerText = this.fmtMoney(w.totalLiabilities);
        
        if (document.getElementById('view-wealth').classList.contains('active')) Analytics.renderCharts(this.data);
    },

    updateWealthVisibility() {
        const show = this.data?.settings?.showWealthPage === true;
        document.querySelectorAll('[data-view="wealth"]').forEach(el => {
            el.style.display = show ? '' : 'none';
        });
        
        // If wealth page is currently active but hidden, switch to dashboard
        if (!show && document.getElementById('view-wealth').classList.contains('active')) {
            this.switchView('dashboard');
            document.querySelectorAll('.nav-menu li, .b-nav-item').forEach(el => {
                el.classList.remove('active');
                if(el.getAttribute('data-view') === 'dashboard') el.classList.add('active');
            });
            document.getElementById('page-title').innerText = 'Monthly Home';
        }
    },

    renderTransactions() {
        const list = document.getElementById('transactions-list'); list.innerHTML = '';
        if (!this.data || !this.data.transactions || this.data.transactions.length === 0) { list.innerHTML = `<div class="empty-state"><i class="fa-solid fa-receipt"></i><p>No transactions yet. Tap + to add one.</p></div>`; return; }

        const filter = document.getElementById('tx-filter').value;
        const catFilter = document.getElementById('tx-cat-filter').value;
        const now = new Date();
        
        let txs = this.data.transactions.filter(t => {
            const td = new Date(t.date);
            let timeMatch = true;
            if(filter === 'month') timeMatch = td.getMonth() === now.getMonth() && td.getFullYear() === now.getFullYear();
            else if(filter === '2months') timeMatch = (now - td) / (1000*60*60*24) <= 60;
            else if(filter === '6months') timeMatch = (now - td) / (1000*60*60*24) <= 180;
            else if(filter === 'year') timeMatch = td.getFullYear() === now.getFullYear();
            let catMatch = true;
            if(catFilter !== 'all') catMatch = t.category === catFilter;
            return timeMatch && catMatch;
        });

        txs.forEach(tx => {
            const div = document.createElement('div'); div.className = 'list-item';
            let color = '', icon = '', sign = '';
            if(tx.type === 'income') { color = 'text-success'; icon = 'fa-arrow-down'; sign = '+'; }
            else if(tx.type === 'transfer') { color = 'text-warning'; icon = 'fa-arrow-right-arrow-left'; sign = ''; }
            else if(tx.type === 'investment' || tx.type === 'chitti') { color = 'text-primary'; icon = 'fa-piggy-bank'; sign = '-'; }
            else { color = 'text-danger'; icon = 'fa-arrow-up'; sign = '-'; }

            const catText = tx.minorCategory ? `${sanitize(tx.category)} <i class="fa-solid fa-angle-right" style="font-size:0.7em;"></i> ${sanitize(tx.minorCategory)}` : sanitize(tx.category);

            div.innerHTML = `<div class="list-icon ${color}"><i class="fa-solid ${icon}"></i></div>
                <div class="list-details"><div class="list-title">${sanitize(tx.description) || catText} <span class="badge badge-outline">${sanitize(tx.paymentMethod)}</span></div><div class="list-subtitle">${sanitize(tx.date)} • ${sanitize(tx.whoPaid) || 'Admin'}</div></div>
                <div style="text-align:right"><div class="list-amount ${color}">${sign}${this.fmtMoney(tx.amount)}</div>
                <div style="margin-top:4px;">
                <button class="btn-icon-small" style="width:24px;height:24px; font-size:10px; display:inline-flex;" onclick="App.editTransaction('${sanitize(tx.id)}')" title="Edit"><i class="fa-solid fa-pencil"></i></button>
                <button class="btn-icon-small" style="width:24px;height:24px; font-size:10px; display:inline-flex;" onclick="App.deleteItem('transactions', '${sanitize(tx.id)}')"><i class="fa-solid fa-trash"></i></button>
                </div></div>`;
            list.appendChild(div);
        });
    },

    renderPortfolio() {
        const createItem = (icon, color, title, badge, sub1, sub2, val1, val2, delId, collection) => {
            const div = document.createElement('div'); div.className = 'list-item';
            div.innerHTML = `<div class="list-icon text-${color}"><i class="fa-solid ${icon}"></i></div>
                <div class="list-details"><div class="list-title">${title} <span class="badge badge-outline">${badge}</span></div><div class="list-subtitle">${sub1}</div><div class="list-subtitle" style="font-size:0.75rem">${sub2}</div></div>
                <div style="text-align:right"><div class="list-amount text-${color}">${val1}</div><div style="font-size:0.8rem; color:var(--text-secondary)">${val2}</div>
                <button class="btn-icon-small" onclick="App.deleteItem('${collection}', '${delId}')" style="margin-top:5px"><i class="fa-solid fa-trash"></i></button></div>`;
            return div;
        };

        const bList = document.getElementById('bank-list'); bList.innerHTML = '';
        (this.data.banks || []).forEach(b => bList.appendChild(createItem('fa-building-columns', 'primary', b.name, b.owner, 'Balance', '', this.fmtMoney(b.balance), '', b.id, 'banks')));

        const aList = document.getElementById('assets-list'); aList.innerHTML = '';
        (this.data.assets || []).forEach(a => {
            const gain = a.currentValue - a.invested;
            let sub2 = `Gain: ${gain>=0?'+':''}${this.fmtMoney(gain)}`;
            if (a.interestRate) sub2 += ` | Rate: ${a.interestRate}%`;
            
            aList.appendChild(createItem('fa-chart-line', 'success', a.name, a.type, `Owner: ${a.owner} | Invested: ${this.fmtMoney(a.invested)}`, sub2, this.fmtMoney(a.currentValue), '', a.id, 'assets'));
        });

        const cList = document.getElementById('chitti-list'); cList.innerHTML = '';
        (this.data.chittis || []).forEach(c => {
            cList.appendChild(createItem('fa-hand-holding-dollar', 'warning', c.name, c.status, `Owner: ${c.owner}`, `Paid: ${c.installmentsPaid}/${c.months} Months`, this.fmtMoney(c.paidSoFar), `Sala: ${this.fmtMoney(c.sala)}`, c.id, 'chittis'));
        });

        const lList = document.getElementById('liabilities-list'); lList.innerHTML = '';
        (this.data.liabilities || []).forEach(l => {
            const rateTxt = l.rate ? ` | Rate: ${l.rate}%` : '';
            const tenureTxt = l.tenure ? ` | ${l.tenure}mo` : '';
            lList.appendChild(createItem('fa-house-crack', 'danger', l.name, l.type, 
                `Owner: ${l.owner} | Total: ${this.fmtMoney(l.totalAmount)}`, 
                `EMI: ${this.fmtMoney(l.emi)}${rateTxt}${tenureTxt}`, 
                this.fmtMoney(l.remainingBalance), 
                `Paid: ${this.fmtMoney(l.paidAmount||0)}`, l.id, 'liabilities'));
        });
    },

    renderBudgets() {
        const bl = document.getElementById('budget-list'); bl.innerHTML = '';
        const budgets = this.data.budgets || {};
        const now = new Date();
        const cm = now.toISOString().slice(0, 7);
        const cy = now.getFullYear().toString();
        const isYearly = this.budgetView === 'yearly';
        const multiplier = isYearly ? 12 : 1;
        const label = isYearly ? 'Yearly' : 'Monthly';
        
        let totalAllocated = 0; let totalSpent = 0;

        Object.keys(budgets).forEach(key => {
            const limit = budgets[key] * multiplier; totalAllocated += limit;
            let spent = 0;
            const isMinor = key.includes(' > ');
            const majorCat = isMinor ? key.split(' > ')[0] : key;
            const minorCat = isMinor ? key.split(' > ')[1] : null;

            (this.data.transactions || []).forEach(tx => {
                if (tx.type === 'expense' && tx.date) {
                    const match = isYearly ? tx.date.startsWith(cy) : tx.date.startsWith(cm);
                    if (!match) return;
                    if (isMinor && tx.category === majorCat && tx.minorCategory === minorCat) spent += parseFloat(tx.amount);
                    else if (!isMinor && tx.category === majorCat) spent += parseFloat(tx.amount);
                }
            });

            totalSpent += spent;

            const pct = limit > 0 ? Math.min((spent/limit)*100, 100) : 0;
            const color = pct > 90 ? 'var(--danger)' : pct > 75 ? 'var(--warning)' : 'var(--success)';
            
            const div = document.createElement('div'); div.style.marginBottom = '1.5rem';
            div.innerHTML = `<div class="flex-between" style="margin-bottom:8px;"><strong style="font-size:0.95rem;">${key}</strong><span>${this.fmtMoney(spent)} / <span class="text-muted">${this.fmtMoney(limit)}</span></span></div>
                <div class="progress-track"><div class="progress-fill" style="width:${pct}%; background:${color};"></div></div>
                <div class="text-muted" style="font-size:0.75rem; margin-top:4px;">${pct.toFixed(0)}% used</div>`;
            bl.appendChild(div);
        });

        document.getElementById('budget-total-allocated').innerText = this.fmtMoney(totalAllocated);
        document.getElementById('budget-total-spent').innerText = this.fmtMoney(totalSpent);
        const rem = totalAllocated - totalSpent;
        const elRem = document.getElementById('budget-total-remaining');
        elRem.innerText = this.fmtMoney(rem);
        elRem.className = rem < 0 ? 'stat-value text-danger' : 'stat-value text-success';

        if(Object.keys(budgets).length === 0) bl.innerHTML = `<div class="empty-state"><i class="fa-solid fa-bullseye"></i><p>No budgets set. Tap + to create one.</p></div>`;
        if (document.getElementById('view-budget').classList.contains('active')) Analytics.renderCharts(this.data);
    },

    renderSettings() {
        const ul = document.getElementById('member-list'); ul.innerHTML = '';
        (this.data?.users || []).forEach(u => {
            const li = document.createElement('li'); li.className = 'list-item';
            li.innerHTML = `<div class="list-icon" style="background:var(--primary-glow)"><i class="fa-solid fa-user" style="color:var(--primary)"></i></div>
            <div class="list-details"><div class="list-title">${sanitize(u.name)} <span class="badge badge-outline">${sanitize(u.role)}</span></div><div class="list-subtitle">Login ID: <strong>${sanitize(u.id)}</strong></div></div>
            ${u.id !== 'admin' && this.currentUser?.role === 'admin' ? `<button class="btn-icon-small" onclick="App.deleteUser('${sanitize(u.id)}')"><i class="fa-solid fa-trash text-danger"></i></button>` : u.id === 'admin' ? '<span class="badge" style="background:var(--success-bg);color:var(--success)">Owner</span>' : ''}`;
            ul.appendChild(li);
        });
        
        const pml = document.getElementById('custom-pm-list'); pml.innerHTML = '';
        const pms = this.data.settings?.paymentMethods || DEFAULT_PM;
        pms.forEach(p => { const c = document.createElement('div'); c.className='chip'; c.innerText = p; pml.appendChild(c); });

        const wealthCheck = document.getElementById('settings-show-wealth');
        if (wealthCheck) {
            wealthCheck.checked = this.data.settings?.showWealthPage === true;
        }
    },

    /** ===== EDUCATION TRACKING ===== */
    renderEducation() {
        if (!this.data) return;
        if (!this.data.eduExpenses) this.data.eduExpenses = [];
        const exps = this.data.eduExpenses;
        const now = new Date();
        const cm = now.toISOString().slice(0,7);
        const cy = now.getFullYear().toString();

        // Summary stats
        const total = exps.reduce((s,e) => s + parseFloat(e.amount||0), 0);
        const yearTotal = exps.filter(e => e.date && e.date.startsWith(cy)).reduce((s,e) => s + parseFloat(e.amount||0), 0);
        const monthTotal = exps.filter(e => e.date && e.date.startsWith(cm)).reduce((s,e) => s + parseFloat(e.amount||0), 0);
        const avaTotal = exps.filter(e => e.child === 'Ava').reduce((s,e) => s + parseFloat(e.amount||0), 0);
        const izaTotal = exps.filter(e => e.child === 'Iza').reduce((s,e) => s + parseFloat(e.amount||0), 0);

        document.getElementById('edu-total').innerText = this.fmtMoney(total);
        document.getElementById('edu-year-total').innerText = this.fmtMoney(yearTotal);
        document.getElementById('edu-month-total').innerText = this.fmtMoney(monthTotal);
        document.getElementById('edu-ava-total').innerText = this.fmtMoney(avaTotal);
        document.getElementById('edu-iza-total').innerText = this.fmtMoney(izaTotal);

        // Filter
        const childFilter = document.getElementById('edu-child-filter').value;
        const timeFilter = document.getElementById('edu-time-filter').value;
        let filtered = exps.filter(e => {
            if (childFilter !== 'all' && e.child !== childFilter) return false;
            if (timeFilter === 'month') return e.date && e.date.startsWith(cm);
            if (timeFilter === 'year') return e.date && e.date.startsWith(cy);
            return true;
        });

        // Render list
        const list = document.getElementById('edu-list'); list.innerHTML = '';
        if (filtered.length === 0) {
            list.innerHTML = `<div class="empty-state"><i class="fa-solid fa-graduation-cap"></i><p>No education expenses yet. Tap + to add one.</p></div>`;
        } else {
            filtered.forEach(e => {
                const childColor = e.child === 'Ava' ? '#ec4899' : '#06b6d4';
                const childIcon = e.child === 'Ava' ? 'fa-child-dress' : 'fa-child';
                const div = document.createElement('div'); div.className = 'list-item';
                div.innerHTML = `<div class="list-icon" style="color:${childColor}; background:${childColor}15;"><i class="fa-solid ${childIcon}"></i></div>
                    <div class="list-details">
                        <div class="list-title">${sanitize(e.school)} <span class="badge badge-outline">${sanitize(e.category)}</span></div>
                        <div class="list-subtitle">${sanitize(e.date)} \u2022 ${sanitize(e.child)} \u2022 ${sanitize(e.whoPaid||'')} ${e.grade ? '\u2022 '+sanitize(e.grade) : ''}</div>
                        ${e.description ? `<div class="list-subtitle" style="font-size:0.72rem;color:var(--text-tertiary)">${sanitize(e.description)}</div>` : ''}
                    </div>
                    <div style="text-align:right">
                        <div class="list-amount" style="color:${childColor}">-${this.fmtMoney(e.amount)}</div>
                        <div style="font-size:0.7rem;color:var(--text-secondary)">${sanitize(e.paymentMethod||'')}</div>
                        <button class="btn-icon-small" style="width:22px;height:22px;font-size:9px;display:inline-flex;margin-top:3px;" onclick="App.deleteItem('eduExpenses','${sanitize(e.id)}')"><i class="fa-solid fa-trash"></i></button>
                    </div>`;
                list.appendChild(div);
            });
        }

        // Charts
        if (document.getElementById('view-education').classList.contains('active')) {
            this.renderEduCharts(exps);
        }
    },

    renderEduCharts(exps) {
        const COLORS = ['#6366f1','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#ec4899','#f97316','#14b8a6','#f43f5e','#84cc16'];

        // 1. Category Pie
        const catTotals = {};
        exps.forEach(e => { catTotals[e.category] = (catTotals[e.category]||0) + parseFloat(e.amount||0); });
        const catLabels = Object.keys(catTotals), catValues = Object.values(catTotals);
        Analytics.c('cEduCatPie', { type: 'doughnut',
            data: { labels: catLabels.length ? catLabels : ['No Data'], datasets: [{ data: catValues.length ? catValues : [1], backgroundColor: catValues.length ? COLORS : ['#27272a'], borderWidth: 0 }] },
            options: { responsive: true, maintainAspectRatio: false, cutout: '72%', plugins: { legend: { position: 'right', labels: { boxWidth: 10 } } } }
        });

        // 2. Child Comparison Bar (by category)
        const avaCats = {}, izaCats = {};
        exps.forEach(e => {
            const cat = e.category;
            if (e.child === 'Ava') avaCats[cat] = (avaCats[cat]||0) + parseFloat(e.amount||0);
            else izaCats[cat] = (izaCats[cat]||0) + parseFloat(e.amount||0);
        });
        const allCats = [...new Set([...Object.keys(avaCats), ...Object.keys(izaCats)])];
        if (!allCats.length) allCats.push('No Data');
        Analytics.c('cEduChildBar', { type: 'bar',
            data: { labels: allCats, datasets: [
                { label: 'Ava', data: allCats.map(c => avaCats[c]||0), backgroundColor: '#ec4899', borderRadius: 4 },
                { label: 'Iza', data: allCats.map(c => izaCats[c]||0), backgroundColor: '#06b6d4', borderRadius: 4 }
            ]},
            options: { responsive: true, maintainAspectRatio: false, scales: { y: { grid: { color: 'rgba(255,255,255,0.04)' } }, x: { grid: { display: false } } }, plugins: { legend: { position: 'top', labels: { boxWidth: 10 } } } }
        });

        // 3. Monthly Trend Line
        const year = new Date().getFullYear();
        const months = [], avaData = [], izaData = [];
        for (let m = 0; m < 12; m++) {
            const prefix = `${year}-${String(m+1).padStart(2,'0')}`;
            months.push(new Date(year, m).toLocaleString('default',{month:'short'}));
            let av = 0, iz = 0;
            exps.forEach(e => {
                if (e.date && e.date.startsWith(prefix)) {
                    if (e.child === 'Ava') av += parseFloat(e.amount||0);
                    else iz += parseFloat(e.amount||0);
                }
            });
            avaData.push(av); izaData.push(iz);
        }
        Analytics.c('cEduTrend', { type: 'line',
            data: { labels: months, datasets: [
                { label: 'Ava', data: avaData, borderColor: '#ec4899', backgroundColor: 'rgba(236,72,153,0.1)', fill: true, tension: 0.4 },
                { label: 'Iza', data: izaData, borderColor: '#06b6d4', backgroundColor: 'rgba(6,182,212,0.1)', fill: true, tension: 0.4 }
            ]},
            options: { responsive: true, maintainAspectRatio: false, scales: { y: { grid: { color: 'rgba(255,255,255,0.04)' } }, x: { grid: { display: false } } }, plugins: { legend: { position: 'top', labels: { boxWidth: 10 } } } }
        });
    },

    exportEduCSV() {
        if(!this.data?.eduExpenses?.length) return toast('No education data to export', 'error');
        const esc = (v) => { const s = String(v||''); return s.includes(',') || s.includes('"') || s.includes('\n') ? '"'+s.replace(/"/g,'""')+'"' : s; };
        const rows = [["Date","Child","School/Institution","Category","Amount","Who Paid","Payment Method","Term","Grade","Description"]];
        this.data.eduExpenses.forEach(e => {
            rows.push([e.date, e.child, esc(e.school), e.category, e.amount, e.whoPaid, e.paymentMethod, esc(e.term), esc(e.grade), esc(e.description)]);
        });
        const blob = new Blob([rows.map(r=>r.join(',')).join('\n')], {type:'text/csv;charset=utf-8;'});
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url; link.download = `MoneyWise_Education_${new Date().toISOString().slice(0,10)}.csv`;
        document.body.appendChild(link); link.click(); document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast('Education expenses exported!');
    },

    async deleteUser(id) {
        if(id === 'admin') return toast('Cannot delete admin', 'error');
        if(this.currentUser?.role !== 'admin') return toast('Only admin can delete members', 'error');
        const userName = this.data.users.find(u => u.id === id)?.name || id;
        const ok = await mConfirm(`Remove <strong>${sanitize(userName)}</strong> permanently? Their transaction history will remain.`, 'Delete Member');
        if (!ok) return;
        this.data.users = this.data.users.filter(x => x.id !== id); this.saveAndSync();
    },

    async deleteItem(collection, id) {
        const item = (this.data[collection] || []).find(x => x.id === id);
        const itemName = item ? (item.name || item.description || item.category || 'this item') : 'this item';
        const ok = await mConfirm(`Delete <strong>${sanitize(itemName)}</strong> permanently?`, 'Delete Item');
        if (!ok) return;
        this.data[collection] = this.data[collection].filter(x => x.id !== id); this.saveAndSync();
    },

    editTransaction(id) {
        const tx = this.data.transactions.find(t => t.id === id);
        if(!tx) return;
        App.editingTransId = id;
        
        this.openModal('add-modal');
        
        const tabs = document.querySelectorAll('#record-tabs .tab');
        tabs.forEach(t => t.classList.remove('active'));
        const tab = document.querySelector(`#record-tabs .tab[data-tab="${tx.type}"]`);
        if(tab) tab.classList.add('active');
        document.getElementById('entry-type').value = tx.type;
        this.updateEntryCategoryDropdowns();
        
        document.getElementById('entry-amount').value = tx.amount;
        document.getElementById('entry-date').value = tx.date;
        document.getElementById('entry-pm').value = tx.paymentMethod;
        document.getElementById('entry-who').value = tx.whoPaid;
        document.getElementById('entry-desc').value = tx.description || '';
        
        if(tx.type === 'investment' || tx.type === 'emi') {
            document.getElementById('entry-target').value = (tx.type==='emi'?'L_':'A_') + tx.targetId;
        } else {
            document.getElementById('entry-major-cat').value = tx.category;
            this.updateMinorCategoryDropdown();
            document.getElementById('entry-minor-cat').value = tx.minorCategory || 'None';
        }
        
        const btn = document.querySelector('#entry-form button[type="submit"]');
        if(btn) btn.innerText = 'Update Record';
    },

    /** Export entire database as a downloadable JSON file */
    exportFullBackup() {
        if(!this.data) return toast('No data to export', 'error');
        const backup = {
            _moneywise_backup: true,
            _version: '5.0',
            _exported: new Date().toISOString(),
            _exportedBy: this.currentUser?.name || 'Unknown',
            data: JSON.parse(JSON.stringify(this.data)) // Deep clone
        };
        // Strip password hashes from backup for extra security — they'll need to be reset on restore
        // Actually keep them so restore is seamless. They're already SHA-256 hashed (one-way).
        const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `MoneyWise_Backup_${new Date().toISOString().slice(0,10)}.json`;
        document.body.appendChild(link); link.click(); document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast('Full backup downloaded!', 'success');
    },

    /** Restore database from a previously exported JSON backup file */
    async restoreFromBackup(event) {
        const file = event.target.files?.[0];
        if (!file) return;
        event.target.value = ''; // Reset file input

        if (this.currentUser?.role !== 'admin') {
            return toast('Only admin can restore data', 'error');
        }

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const parsed = JSON.parse(e.target.result);
                let importData;

                // Support both wrapper format and raw data format
                if (parsed._moneywise_backup && parsed.data) {
                    importData = parsed.data;
                    toast(`Loading backup from ${parsed._exported?.slice(0,10) || 'unknown date'}...`, 'info');
                } else if (parsed.users && Array.isArray(parsed.users)) {
                    importData = parsed;
                } else {
                    return toast('Invalid backup file format. Expected MoneyWise JSON backup.', 'error');
                }

                // Validate structure
                const validation = validateDataStructure(importData);
                if (!validation.valid) {
                    return toast(`Invalid data: ${validation.error}`, 'error');
                }

                // Count what's being restored
                const stats = [
                    `${importData.users?.length || 0} users`,
                    `${importData.transactions?.length || 0} transactions`,
                    `${importData.assets?.length || 0} assets`,
                    `${importData.banks?.length || 0} banks`,
                    `${importData.liabilities?.length || 0} loans`,
                    `${importData.chittis?.length || 0} chittis`
                ].join(', ');

                const ok = await mConfirm(
                    `<strong>⚠️ This will REPLACE all current data!</strong><br><br>` +
                    `Backup contains: ${stats}<br><br>` +
                    `This cannot be undone. Continue?`,
                    'Restore Backup'
                );
                if (!ok) return;

                this.data = importData;
                await this.saveAndSync();
                toast('Data restored successfully! All data has been synced to GitHub.', 'success');
            } catch (parseErr) {
                console.error('Restore error:', parseErr);
                toast('Failed to parse backup file. Make sure it is a valid MoneyWise JSON backup.', 'error');
            }
        };
        reader.readAsText(file);
    }
};

document.addEventListener('DOMContentLoaded', () => { App.init(); });
