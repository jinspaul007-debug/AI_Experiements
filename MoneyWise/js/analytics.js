/**
 * Analytics Engine v2.0 — Real Data Charts
 */
Chart.defaults.color = '#a1a1aa';
Chart.defaults.font.family = "'Plus Jakarta Sans', sans-serif";
Chart.defaults.font.size = 11;

const Analytics = {
    charts: {},
    COLORS: ['#6366f1','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#ec4899','#f97316','#14b8a6','#f43f5e'],

    calculateWealth(data) {
        let banks = 0, assets = 0, liabilities = 0;
        (data.banks||[]).forEach(b => banks += parseFloat(b.balance||0));
        (data.assets||[]).forEach(a => assets += parseFloat(a.currentValue||0));
        (data.chittis||[]).forEach(c => assets += parseFloat(c.paidSoFar||0));
        (data.liabilities||[]).forEach(l => liabilities += parseFloat(l.remainingBalance||0));
        return { netWorth: banks + assets - liabilities, totalBanks: banks, totalAssets: assets, totalLiabilities: liabilities };
    },

    calculateMonthly(data, monthPrefix) {
        const cm = monthPrefix || new Date().toISOString().slice(0,7);
        let income = 0, expense = 0;
        (data.transactions||[]).forEach(tx => {
            if (tx.date && tx.date.startsWith(cm)) {
                if (tx.type === 'income') income += parseFloat(tx.amount);
                if (tx.type === 'expense' || tx.type === 'emi') expense += parseFloat(tx.amount);
            }
        });
        return { income, expense, savings: income - expense };
    },

    getCategoryTotals(txs, type, monthPrefix) {
        const cat = {};
        txs.forEach(tx => {
            if ((tx.type === type || (type === 'expense' && tx.type === 'emi')) && tx.date && tx.date.startsWith(monthPrefix)) {
                const key = tx.category || 'Other';
                cat[key] = (cat[key]||0) + parseFloat(tx.amount);
            }
        });
        return cat;
    },

    getOwnershipBreakdown(data) {
        const owners = {};
        (data.users||[]).forEach(u => owners[u.name] = { assets: 0, liabilities: 0 });
        owners['Mutual'] = { assets: 0, liabilities: 0 };
        (data.banks||[]).forEach(b => { if(owners[b.owner]) owners[b.owner].assets += parseFloat(b.balance||0); });
        (data.assets||[]).forEach(a => { if(owners[a.owner]) owners[a.owner].assets += parseFloat(a.currentValue||0); });
        (data.chittis||[]).forEach(c => { if(owners[c.owner]) owners[c.owner].assets += parseFloat(c.paidSoFar||0); });
        (data.liabilities||[]).forEach(l => { if(owners[l.owner]) owners[l.owner].liabilities += parseFloat(l.remainingBalance||0); });
        return owners;
    },

    saveNetWorthSnapshot(data) {
        if (!data.netWorthHistory) data.netWorthHistory = [];
        const today = new Date().toISOString().slice(0,7);
        const w = this.calculateWealth(data);
        const existing = data.netWorthHistory.findIndex(h => h.month === today);
        if (existing >= 0) data.netWorthHistory[existing].value = w.netWorth;
        else data.netWorthHistory.push({ month: today, value: w.netWorth });
        if (data.netWorthHistory.length > 24) data.netWorthHistory = data.netWorthHistory.slice(-24);
    },

    renderCharts(data) {
        const txs = data.transactions || [];
        this.renderExpensePie(txs);
        this.renderIncomePie(txs);
        this.renderMoMComparison(txs);
        this.renderYearlyTrend(txs);
        this.renderNetWorthTrend(data);
        this.renderWealthByOwner(data);
        this.renderPortfolioAssets(data);
        this.renderLoanProgress(data.liabilities||[]);
        this.renderBudgetCharts(data);
    },

    renderYearlyTrend(txs) {
        const year = new Date().getFullYear();
        const months = [];
        const incData = [], expData = [], savData = [];
        for (let m = 0; m < 12; m++) {
            const prefix = `${year}-${String(m+1).padStart(2,'0')}`;
            months.push(new Date(year, m).toLocaleString('default',{month:'short'}));
            let inc = 0, exp = 0;
            txs.forEach(tx => {
                if (tx.date && tx.date.startsWith(prefix)) {
                    if (tx.type === 'income') inc += parseFloat(tx.amount);
                    if (tx.type === 'expense' || tx.type === 'emi') exp += parseFloat(tx.amount);
                }
            });
            incData.push(inc); expData.push(exp); savData.push(inc - exp);
        }
        this.c('cYearlyTrend', { type: 'line',
            data: { labels: months, datasets: [
                { label: 'Income', data: incData, borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.1)', fill: true, tension: 0.4 },
                { label: 'Expense', data: expData, borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,0.1)', fill: true, tension: 0.4 },
                { label: 'Savings', data: savData, borderColor: '#6366f1', borderDash: [5,5], tension: 0.4, fill: false }
            ]},
            options: { responsive: true, maintainAspectRatio: false, scales: { y: { grid: { color: 'rgba(255,255,255,0.04)' } }, x: { grid: { display: false } } }, plugins: { legend: { position: 'top', labels: { boxWidth: 10 } } } }
        });
    },

    c(id, config) {
        const ctx = document.getElementById(id);
        if (!ctx) return;
        if (this.charts[id]) this.charts[id].destroy();
        this.charts[id] = new Chart(ctx, config);
    },

    renderExpensePie(txs) {
        const cm = new Date().toISOString().slice(0,7);
        const d = this.getCategoryTotals(txs, 'expense', cm);
        const labels = Object.keys(d), data = Object.values(d);
        this.c('cExpensePie', { type: 'doughnut',
            data: { labels: labels.length ? labels : ['No Data'], datasets: [{ data: data.length ? data : [1], backgroundColor: data.length ? this.COLORS : ['#27272a'], borderWidth: 0 }] },
            options: { responsive: true, maintainAspectRatio: false, cutout: '72%', plugins: { legend: { position: 'right', labels: { boxWidth: 10 } } } }
        });
    },

    renderIncomePie(txs) {
        const cm = new Date().toISOString().slice(0,7);
        const d = this.getCategoryTotals(txs, 'income', cm);
        const labels = Object.keys(d), data = Object.values(d);
        this.c('cIncomePie', { type: 'doughnut',
            data: { labels: labels.length ? labels : ['No Data'], datasets: [{ data: data.length ? data : [1], backgroundColor: data.length ? ['#10b981','#06b6d4','#8b5cf6','#f59e0b'] : ['#27272a'], borderWidth: 0 }] },
            options: { responsive: true, maintainAspectRatio: false, cutout: '72%', plugins: { legend: { position: 'right', labels: { boxWidth: 10 } } } }
        });
    },

    renderMoMComparison(txs) {
        const now = new Date();
        const cm = now.toISOString().slice(0,7);
        const prev = new Date(now.getFullYear(), now.getMonth()-1, 1).toISOString().slice(0,7);
        const thisCats = this.getCategoryTotals(txs, 'expense', cm);
        const lastCats = this.getCategoryTotals(txs, 'expense', prev);
        const allCats = [...new Set([...Object.keys(thisCats), ...Object.keys(lastCats)])];
        if (allCats.length === 0) allCats.push('No Data');
        this.c('cMoM', { type: 'bar',
            data: { labels: allCats, datasets: [
                { label: now.toLocaleString('default',{month:'short'}), data: allCats.map(c=>thisCats[c]||0), backgroundColor: '#6366f1', borderRadius: 4 },
                { label: new Date(prev).toLocaleString('default',{month:'short'}), data: allCats.map(c=>lastCats[c]||0), backgroundColor: '#3f3f46', borderRadius: 4 }
            ]},
            options: { responsive: true, maintainAspectRatio: false, scales: { y: { grid: { color: 'rgba(255,255,255,0.04)' } }, x: { grid: { display: false } } }, plugins: { legend: { position: 'top', labels: { boxWidth: 10 } } } }
        });
    },

    renderNetWorthTrend(data) {
        const history = data.netWorthHistory || [];
        const labels = history.map(h => { const d = new Date(h.month + '-01'); return d.toLocaleString('default',{month:'short',year:'2-digit'}); });
        const values = history.map(h => h.value);
        if (labels.length === 0) { labels.push('Now'); values.push(this.calculateWealth(data).netWorth); }
        this.c('cNetWorthTrend', { type: 'line',
            data: { labels, datasets: [{ label: 'Net Worth', data: values, borderColor: '#6366f1', backgroundColor: 'rgba(99,102,241,0.1)', fill: true, tension: 0.4, pointRadius: 3 }] },
            options: { responsive: true, maintainAspectRatio: false, scales: { y: { grid: { color: 'rgba(255,255,255,0.04)' } }, x: { grid: { display: false } } }, plugins: { legend: { display: false } } }
        });
    },

    renderWealthByOwner(data) {
        const bd = this.getOwnershipBreakdown(data);
        const labels = Object.keys(bd);
        this.c('cWealthOwner', { type: 'bar',
            data: { labels, datasets: [
                { label: 'Assets', data: labels.map(l=>bd[l].assets), backgroundColor: '#10b981', borderRadius: 4 },
                { label: 'Liabilities', data: labels.map(l=>bd[l].liabilities), backgroundColor: '#ef4444', borderRadius: 4 }
            ]},
            options: { responsive: true, maintainAspectRatio: false, scales: { y: { grid: { color: 'rgba(255,255,255,0.04)' } }, x: { grid: { display: false } } }, plugins: { legend: { position: 'top', labels: { boxWidth: 10 } } } }
        });
    },

    renderPortfolioAssets(data) {
        const totals = {};
        (data.assets||[]).forEach(a => { totals[a.type] = (totals[a.type]||0) + parseFloat(a.currentValue||0); });
        (data.chittis||[]).forEach(c => { totals['KSFE Chitti'] = (totals['KSFE Chitti']||0) + parseFloat(c.paidSoFar||0); });
        const labels = Object.keys(totals).filter(k => totals[k] > 0);
        const values = labels.map(l => totals[l]);
        this.c('cPortfolioAssets', { type: 'doughnut',
            data: { labels: labels.length ? labels : ['No Assets'], datasets: [{ data: values.length ? values : [1], backgroundColor: values.length ? this.COLORS : ['#27272a'], borderWidth: 0 }] },
            options: { responsive: true, maintainAspectRatio: false, cutout: '72%', plugins: { legend: { position: 'right', labels: { boxWidth: 10 } } } }
        });
    },

    renderLoanProgress(liabilities) {
        const labels = liabilities.map(l => l.name);
        const paid = liabilities.map(l => parseFloat(l.paidAmount||0));
        const bal = liabilities.map(l => parseFloat(l.remainingBalance||0));
        this.c('cLoanPaymentActual', { type: 'bar',
            data: { labels: labels.length ? labels : ['No Loans'], datasets: [
                { label: 'Paid', data: paid.length ? paid : [0], backgroundColor: '#10b981', borderRadius: 4 },
                { label: 'Remaining', data: bal.length ? bal : [0], backgroundColor: '#ef4444', borderRadius: 4 }
            ]},
            options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, scales: { x: { stacked: true }, y: { stacked: true } }, plugins: { legend: { position: 'top', labels: { boxWidth: 10 } } } }
        });
    },

    renderBudgetCharts(data) {
        const budgets = data.budgets || {};
        const cm = new Date().toISOString().slice(0,7);
        const labels = [], allocated = [], spent = [];
        Object.keys(budgets).forEach(key => {
            labels.push(key); allocated.push(budgets[key]);
            let s = 0;
            const isMinor = key.includes(' > ');
            const majorCat = isMinor ? key.split(' > ')[0] : key;
            const minorCat = isMinor ? key.split(' > ')[1] : null;
            (data.transactions||[]).forEach(tx => {
                if (tx.type === 'expense' && tx.date && tx.date.startsWith(cm)) {
                    if (isMinor && tx.category === majorCat && tx.minorCategory === minorCat) s += parseFloat(tx.amount);
                    else if (!isMinor && tx.category === majorCat) s += parseFloat(tx.amount);
                }
            });
            spent.push(s);
        });
        if (!labels.length) { labels.push('No Budget'); allocated.push(0); spent.push(0); }

        this.c('cBudgetRadar', { type: 'radar',
            data: { labels, datasets: [
                { label: 'Budget', data: allocated, backgroundColor: 'rgba(99,102,241,0.15)', borderColor: '#6366f1', pointBackgroundColor: '#6366f1' },
                { label: 'Actual', data: spent, backgroundColor: 'rgba(239,68,68,0.15)', borderColor: '#ef4444', pointBackgroundColor: '#ef4444' }
            ]},
            options: { responsive: true, maintainAspectRatio: false, scales: { r: { angleLines: { color: 'rgba(255,255,255,0.06)' }, grid: { color: 'rgba(255,255,255,0.06)' }, ticks: { display: false } } }, plugins: { legend: { position: 'top', labels: { boxWidth: 10 } } } }
        });

        this.c('cBudgetTrend', { type: 'bar',
            data: { labels, datasets: [
                { label: 'Budget', data: allocated, backgroundColor: '#6366f1', borderRadius: 4 },
                { label: 'Spent', data: spent, backgroundColor: '#ef4444', borderRadius: 4 }
            ]},
            options: { responsive: true, maintainAspectRatio: false, scales: { y: { grid: { color: 'rgba(255,255,255,0.04)' } }, x: { grid: { display: false } } }, plugins: { legend: { position: 'top', labels: { boxWidth: 10 } } } }
        });
    }
};
