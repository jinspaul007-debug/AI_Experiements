/**
 * Main Application Controller v2.0 - Production Build
 */

function toast(msg, type='success') {
    const c = document.getElementById('toast-container');
    if(!c) return;
    const t = document.createElement('div');
    t.className = `toast toast-${type}`;
    t.innerHTML = `<i class="fa-solid ${type==='success'?'fa-check-circle':type==='error'?'fa-triangle-exclamation':'fa-info-circle'}"></i> ${msg}`;
    c.appendChild(t);
    setTimeout(()=>{ t.classList.add('removing'); setTimeout(()=>t.remove(), 300); }, 3000);
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
            this.currentUser = JSON.parse(savedUser);
            GitHubAPI.setEncryptionKey(rememberedKey);
            try {
                await this.syncData(true);
                const freshUser = this.data.users.find(u => u.id === this.currentUser.id);
                if (freshUser) { this.currentUser = freshUser; localStorage.setItem('mw_current_user', JSON.stringify(freshUser)); this.setupApp(); }
                else { this.showLogin(); }
            } catch (e) { this.showLogin(); }
        } else { this.showLogin(); }
    },

    showLogin() {
        const spl = document.getElementById('splash-screen');
        if(spl) { spl.style.opacity = '0'; setTimeout(() => { spl.style.display = 'none'; }, 400); }
        const ls = document.getElementById('loginScreen');
        ls.style.display = 'flex';
        // Pre-fill saved GitHub config
        document.getElementById('loginToken').value = GitHubAPI.config.token || '';
        document.getElementById('loginGhUser').value = GitHubAPI.config.username || '';
        document.getElementById('loginGhRepo').value = GitHubAPI.config.repo || '';
        const sf = document.getElementById('setup-fields');
        const ss = document.getElementById('setup-status');
        if (GitHubAPI.isConfigured()) {
            sf.style.display = 'none'; ss.innerText = 'Connected'; ss.style.background = 'var(--success-bg)'; ss.style.color = 'var(--success)';
        }
        const rk = localStorage.getItem('mw_enc_key');
        if (rk) { document.getElementById('loginKey').value = rk; document.getElementById('loginRememberKey').checked = true; }
    },

    showLoginError(msg) {
        const el = document.getElementById('login-error');
        el.innerText = msg; el.style.display = 'block';
        setTimeout(() => { el.style.display = 'none'; }, 6000);
    },

    bindLogin() {
        document.getElementById('login-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            document.getElementById('login-error').style.display = 'none';

            // Save GitHub config from login screen fields
            const token = document.getElementById('loginToken').value.trim();
            const ghUser = document.getElementById('loginGhUser').value.trim();
            const ghRepo = document.getElementById('loginGhRepo').value.trim();
            if (token && ghUser && ghRepo) GitHubAPI.saveConfig(token, ghUser, ghRepo, 'MoneyWise/data.enc');

            if (!GitHubAPI.isConfigured()) { this.showLoginError('GitHub connection required. Expand the GitHub section and fill in your details.'); return; }

            const u = document.getElementById('loginUser').value.trim().toLowerCase();
            const p = document.getElementById('loginPass').value;
            const key = document.getElementById('loginKey').value;
            const rememberKey = document.getElementById('loginRememberKey').checked;
            if (!u || !p || !key) { this.showLoginError('All fields are required.'); return; }

            GitHubAPI.setEncryptionKey(key);
            if (rememberKey) localStorage.setItem('mw_enc_key', key); else localStorage.removeItem('mw_enc_key');

            const btn = e.target.querySelector('button[type="submit"]');
            const orig = btn.innerHTML;
            btn.innerHTML = '<div class="spinner" style="width:18px;height:18px;border-width:2px;margin:0;display:inline-block;vertical-align:middle;"></div> Connecting...';
            btn.disabled = true;

            try {
                let remoteData = await GitHubAPI.fetchData();
                if (remoteData === null) {
                    // First-time setup: data.enc doesn't exist yet
                    if (u === 'admin' && p === 'admin123') {
                        this.data = GitHubAPI.getDefaultData();
                        this.currentUser = this.data.users[0];
                        localStorage.setItem('mw_current_user', JSON.stringify(this.currentUser));
                        await GitHubAPI.pushData(this.data);
                        toast('Initial setup complete! Data saved to GitHub.');
                        this.setupApp(); this.switchView('settings'); return;
                    } else { this.showLoginError('No data found on GitHub. First-time setup requires admin / admin123.'); btn.innerHTML = orig; btn.disabled = false; return; }
                }
                const user = remoteData.users.find(x => x.id === u);
                if (user && user.pass === p) {
                    this.currentUser = user;
                    localStorage.setItem('mw_current_user', JSON.stringify(user));
                    this.data = remoteData;
                    this.setupApp();
                } else { this.showLoginError('Invalid username or password.'); btn.innerHTML = orig; btn.disabled = false; }
            } catch (err) { this.showLoginError(err.message); btn.innerHTML = orig; btn.disabled = false; }
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
        this.populateDropdowns();
        this.updateDashboard();
        this.updateWealth();
        this.renderTransactions();
        this.renderPortfolio();
        this.renderBudgets();
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
    },

    switchView(viewId) {
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        const v = document.getElementById(`view-${viewId}`);
        if(v) v.classList.add('active');
        if (viewId === 'dashboard' || viewId === 'wealth' || viewId === 'assets' || viewId === 'budget') Analytics.renderCharts(this.data);
    },

    openModal(id) { document.getElementById(id).classList.add('active'); },
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

    promptMajorCat() {
        const c = prompt('Enter new MAJOR category:');
        if(c) {
            const type = document.getElementById('entry-type').value;
            this.addMajorCategory(type, c);
            this.updateEntryCategoryDropdowns();
        }
    },
    promptMinorCat() {
        const m = document.getElementById('entry-major-cat').value;
        const c = prompt(`Enter new MINOR category under ${m}:`);
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
            document.getElementById('entry-date').valueAsDate = new Date();
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
            
            const newEntry = {
                id: Date.now().toString(),
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
            this.data.transactions.unshift(newEntry);

            this.closeModal('add-modal'); e.target.reset();
            toast('Record saved successfully!');
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
            const name = document.getElementById('new-member-name').value.trim();
            const pass = document.getElementById('new-member-pass').value.trim();
            const role = document.getElementById('new-member-role').value;
            if(!name) return toast('Enter a name', 'error');
            if(!pass) return toast('Set a password for this member', 'error');
            const id = name.toLowerCase().replace(/\s/g,'');
            if(!this.data.users) this.data.users = [];
            if(this.data.users.find(u => u.id === id)) return toast('User already exists', 'error');
            this.data.users.push({ id, name, role, pass });
            toast(`${name} added! Login: ${id} / [password you set]`);
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
        
        document.getElementById('change-pass-btn').addEventListener('click', () => {
            const oldP = document.getElementById('change-old-pass').value;
            const newP = document.getElementById('change-new-pass').value;
            if(!oldP || !newP) return toast('Fill both fields', 'error');
            if(newP.length < 6) return toast('Password must be at least 6 characters', 'error');
            const user = this.data.users.find(u => u.id === this.currentUser.id);
            if(!user || user.pass !== oldP) return toast('Current password is incorrect', 'error');
            user.pass = newP;
            this.currentUser.pass = newP;
            localStorage.setItem('mw_current_user', JSON.stringify(this.currentUser));
            toast('Password updated successfully!');
            this.saveAndSync();
            document.getElementById('change-old-pass').value = '';
            document.getElementById('change-new-pass').value = '';
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
        const rows = [["Date", "Type", "Major Category", "Minor Category", "Description", "Amount", "Payment Method", "Who Paid"]];
        this.data.transactions.forEach(tx => {
            rows.push([tx.date, tx.type, tx.category, tx.minorCategory || '', tx.description, tx.amount, tx.paymentMethod, tx.whoPaid]);
        });
        const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
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

            const catText = tx.minorCategory ? `${tx.category} <i class="fa-solid fa-angle-right" style="font-size:0.7em;"></i> ${tx.minorCategory}` : tx.category;

            div.innerHTML = `<div class="list-icon ${color}"><i class="fa-solid ${icon}"></i></div>
                <div class="list-details"><div class="list-title">${tx.description || catText} <span class="badge badge-outline">${tx.paymentMethod}</span></div><div class="list-subtitle">${tx.date} • ${tx.whoPaid || 'Admin'}</div></div>
                <div style="text-align:right"><div class="list-amount ${color}">${sign}${this.fmtMoney(tx.amount)}</div>
                <button class="btn-icon-small" style="width:24px;height:24px; font-size:10px; display:inline-flex; margin-top:4px;" onclick="App.deleteItem('transactions', '${tx.id}')"><i class="fa-solid fa-trash"></i></button></div>`;
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
            <div class="list-details"><div class="list-title">${u.name} <span class="badge badge-outline">${u.role}</span></div><div class="list-subtitle">Login ID: <strong>${u.id}</strong></div></div>
            ${u.id !== 'admin' ? `<button class="btn-icon-small" onclick="App.deleteUser('${u.id}')"><i class="fa-solid fa-trash text-danger"></i></button>` : '<span class="badge" style="background:var(--success-bg);color:var(--success)">Owner</span>'}`;
            ul.appendChild(li);
        });
        
        const pml = document.getElementById('custom-pm-list'); pml.innerHTML = '';
        const pms = this.data.settings?.paymentMethods || DEFAULT_PM;
        pms.forEach(p => { const c = document.createElement('div'); c.className='chip'; c.innerText = p; pml.appendChild(c); });
    },

    async deleteUser(id) {
        if(id === 'admin') return toast('Cannot delete admin', 'error');
        if (!confirm('Remove this family member?')) return;
        this.data.users = this.data.users.filter(x => x.id !== id); this.saveAndSync();
    },

    async deleteItem(collection, id) {
        if (!confirm('Delete this?')) return;
        this.data[collection] = this.data[collection].filter(x => x.id !== id); this.saveAndSync();
    }
};

document.addEventListener('DOMContentLoaded', () => { App.init(); });
