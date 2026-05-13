/**
 * GitHub API + Encryption Layer v2.0
 * Handles AES-256 encrypted sync to private GitHub repository.
 */
const GitHubAPI = {
    config: {
        token: localStorage.getItem('gh_token') || '',
        username: localStorage.getItem('gh_username') || '',
        repo: localStorage.getItem('gh_repo') || '',
        path: localStorage.getItem('gh_path') || 'MoneyWise/data.enc',
        encKey: localStorage.getItem('mw_enc_key') || '',
        sha: null
    },

    saveConfig(token, username, repo, path) {
        this.config.token = token;
        this.config.username = username;
        this.config.repo = repo;
        this.config.path = path;
        localStorage.setItem('gh_token', token);
        localStorage.setItem('gh_username', username);
        localStorage.setItem('gh_repo', repo);
        localStorage.setItem('gh_path', path);
    },

    setEncryptionKey(key) {
        this.config.encKey = key;
        localStorage.setItem('mw_enc_key', key);
    },

    isConfigured() {
        return !!(this.config.token && this.config.username && this.config.repo && this.config.encKey);
    },

    async _request(method, body = null) {
        if (!this.config.token) throw new Error('GitHub sync not configured.');
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
            throw new Error(`GitHub API Error: ${response.status}`);
        }
        return await response.json();
    },

    async fetchData() {
        const data = await this._request('GET');
        if (!data) return this.getDefaultData();
        this.config.sha = data.sha;
        const encryptedContent = decodeURIComponent(escape(atob(data.content.replace(/\n/g, ''))));
        const bytes = CryptoJS.AES.decrypt(encryptedContent, this.config.encKey);
        const decrypted = bytes.toString(CryptoJS.enc.Utf8);
        if (!decrypted) throw new Error('Decryption failed. Wrong encryption key.');
        return JSON.parse(decrypted);
    },

    async pushData(jsonData) {
        const encrypted = CryptoJS.AES.encrypt(JSON.stringify(jsonData), this.config.encKey).toString();
        const contentBase64 = btoa(unescape(encodeURIComponent(encrypted)));
        const body = { message: `MoneyWise sync: ${new Date().toISOString()}`, content: contentBase64 };
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
