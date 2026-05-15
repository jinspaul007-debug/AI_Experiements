/**
 * GitHub API + Encryption Layer v3.0
 * Fixed: Multi-device sync, proper SHA tracking, first-time setup flow.
 */
const GitHubAPI = {
    config: {
        token: localStorage.getItem('gh_token') || '',
        username: localStorage.getItem('gh_username') || '',
        repo: localStorage.getItem('gh_repo') || '',
        path: localStorage.getItem('gh_path') || 'MoneyWise/data.enc',
        encKey: '',
        sha: null
    },

    saveConfig(token, username, repo, path) {
        this.config.token = token;
        this.config.username = username;
        this.config.repo = repo;
        this.config.path = path || 'MoneyWise/data.enc';
        localStorage.setItem('gh_token', token);
        localStorage.setItem('gh_username', username);
        localStorage.setItem('gh_repo', repo);
        localStorage.setItem('gh_path', this.config.path);
    },

    setEncryptionKey(key) {
        this.config.encKey = key;
    },

    isConfigured() {
        return !!(this.config.token && this.config.username && this.config.repo);
    },

    hasEncryptionKey() {
        return !!this.config.encKey;
    },

    async testConnection() {
        if (!this.config.token) throw new Error('No GitHub token configured');
        const url = `https://api.github.com/repos/${this.config.username}/${this.config.repo}`;
        const res = await fetch(url, {
            headers: { 'Authorization': `token ${this.config.token}`, 'Accept': 'application/vnd.github.v3+json' }
        });
        if (!res.ok) throw new Error(`Cannot access repo (${res.status}). Check token/username/repo.`);
        return true;
    },

    async _request(method, body = null) {
        if (!this.config.token) throw new Error('GitHub token not set.');
        const url = `https://api.github.com/repos/${this.config.username}/${this.config.repo}/contents/${this.config.path}`;
        const headers = {
            'Authorization': `token ${this.config.token}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
        };
        const options = { method, headers };
        if (body) options.body = JSON.stringify(body);
        const response = await fetch(url, options);
        if (!response.ok) {
            if (response.status === 404 && method === 'GET') return null;
            if (response.status === 409) {
                // SHA conflict — re-fetch to get latest SHA
                const fresh = await this._request('GET');
                if (fresh) this.config.sha = fresh.sha;
                throw new Error('Data was updated by another device. Please refresh and try again.');
            }
            if (response.status === 401 || response.status === 403) {
                throw new Error('Access denied. Your token may have expired. Please update in Settings.');
            }
            throw new Error(`GitHub API Error: ${response.status}`);
        }
        return await response.json();
    },

    async fetchData() {
        const data = await this._request('GET');
        if (!data) return null; // No data.enc exists yet
        this.config.sha = data.sha;
        try {
            const rawContent = data.content.replace(/\n/g, '');
            const encryptedContent = decodeURIComponent(escape(atob(rawContent)));
            const bytes = CryptoJS.AES.decrypt(encryptedContent, this.config.encKey);
            const decrypted = bytes.toString(CryptoJS.enc.Utf8);
            if (!decrypted) throw new Error('DECRYPT_FAIL');
            return JSON.parse(decrypted);
        } catch (e) {
            if (e.message === 'DECRYPT_FAIL') throw new Error('Wrong encryption key. Data cannot be decrypted.');
            throw new Error('Data corrupted or wrong encryption key.');
        }
    },

    async pushData(jsonData) {
        if (!this.config.encKey) throw new Error('Encryption key not set.');
        const encrypted = CryptoJS.AES.encrypt(JSON.stringify(jsonData), this.config.encKey).toString();
        const contentBase64 = btoa(unescape(encodeURIComponent(encrypted)));
        const body = {
            message: `Data update: ${new Date().toLocaleDateString('en-IN')} ${new Date().toLocaleTimeString('en-IN')}`,
            content: contentBase64
        };
        if (this.config.sha) body.sha = this.config.sha;
        const response = await this._request('PUT', body);
        if (response && response.content) this.config.sha = response.content.sha;
        return true;
    },

    getDefaultData() {
        return {
            users: [{ id: 'admin', name: 'Admin', role: 'admin', pass: 'admin123' }],
            transactions: [],
            budgets: {},
            assets: [],
            liabilities: [],
            banks: [],
            chittis: [],
            settings: { currency: '₹', paymentMethods: ['Cash', 'UPI', 'Debit Card', 'Amazon Pay', 'Credit Card'] },
            netWorthHistory: []
        };
    }
};
