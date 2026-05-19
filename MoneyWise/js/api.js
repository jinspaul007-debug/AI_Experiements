/**
 * GitHub API + Encryption Layer v4.3
 * Security: All passwords hashed with SHA-256 (one-way, non-reversible).
 * Fixed: Multi-device sync, proper SHA tracking, first-time setup flow.
 * Fixed v4.2: 404 ambiguity bug.
 * Fixed v4.3: Chrome/cross-browser fetch caching issue. Removed testConnection 
 *   pre-check (caused failures). All fetches now use cache:'no-store' and 'Bearer' auth.
 */

/** Hash a password with SHA-256 using CryptoJS — one-way, non-reversible */
function hashPassword(plainText) {
    return CryptoJS.SHA256(plainText).toString(CryptoJS.enc.Hex);
}

/** Compare a plain-text password against a stored hash */
function verifyPassword(plainText, storedHash) {
    // Support legacy unhashed passwords during migration
    if (storedHash && storedHash.length !== 64) {
        // Legacy plain-text password — compare directly
        return plainText === storedHash;
    }
    return hashPassword(plainText) === storedHash;
}

/** Check if a stored password is already hashed (64 hex chars = SHA-256) */
function isPasswordHashed(pass) {
    return pass && pass.length === 64 && /^[a-f0-9]+$/.test(pass);
}

/** Migrate all users' passwords from plain-text to SHA-256 hashes */
function migratePasswordsToHashed(data) {
    let migrated = false;
    (data.users || []).forEach(u => {
        if (!isPasswordHashed(u.pass)) {
            u.pass = hashPassword(u.pass);
            migrated = true;
        }
    });
    return migrated;
}

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

    /** Build standard headers for GitHub API — uses Bearer auth (works with all PAT types) */
    _headers() {
        return {
            'Authorization': `Bearer ${this.config.token}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
            'X-GitHub-Api-Version': '2022-11-28'
        };
    },

    async testConnection() {
        if (!this.config.token) throw new Error('No GitHub token configured');
        const url = `https://api.github.com/repos/${this.config.username}/${this.config.repo}`;
        const res = await fetch(url, {
            headers: this._headers(),
            cache: 'no-store'
        });
        if (!res.ok) throw new Error(`Cannot access repo (${res.status}). Check token/username/repo.`);
        return true;
    },

    async _request(method, body = null) {
        if (!this.config.token) throw new Error('GitHub token not set.');
        const url = `https://api.github.com/repos/${this.config.username}/${this.config.repo}/contents/${this.config.path}`;
        const options = {
            method,
            headers: this._headers(),
            cache: 'no-store'   // CRITICAL: prevents browser from caching 404 responses
        };
        if (body) options.body = JSON.stringify(body);

        let response;
        try {
            response = await fetch(url, options);
        } catch (networkErr) {
            throw new Error('Network error: Cannot reach GitHub. Check your internet connection.');
        }

        if (!response.ok) {
            if (response.status === 404 && method === 'GET') return null;
            if (response.status === 409) {
                // SHA conflict — re-fetch to get latest SHA
                const fresh = await this._request('GET');
                if (fresh) this.config.sha = fresh.sha;
                throw new Error('Data was updated by another device. Please refresh and try again.');
            }
            if (response.status === 401 || response.status === 403) {
                throw new Error('Access denied. Your PAT token may have expired or lacks permissions.');
            }
            throw new Error(`GitHub API Error: ${response.status}`);
        }
        return await response.json();
    },

    /**
     * Fetch and decrypt data.enc from GitHub.
     * Returns: decrypted JSON data, or null if data.enc doesn't exist yet.
     * Throws: specific errors for connection issues, wrong key, or corruption.
     */
    async fetchData() {
        // Directly try to fetch the data file (no separate testConnection call)
        let data;
        try {
            data = await this._request('GET');
        } catch (fetchErr) {
            // Network errors or auth errors bubble up with clear messages
            throw fetchErr;
        }

        if (!data) {
            // Got 404 — but is it because the FILE doesn't exist, or the REPO/TOKEN is wrong?
            // For a public repo, we can verify by checking if the repo endpoint is accessible.
            // This is only called when we get a 404, not on every login.
            try {
                const repoUrl = `https://api.github.com/repos/${this.config.username}/${this.config.repo}`;
                const repoCheck = await fetch(repoUrl, { cache: 'no-store' }); // No auth needed for public repo
                if (!repoCheck.ok) {
                    throw new Error(`Repository "${this.config.username}/${this.config.repo}" not found. Check your GitHub username and repository name.`);
                }
            } catch (repoErr) {
                if (repoErr.message.includes('Repository')) throw repoErr;
                // Network error checking repo — assume repo is fine, report as no data
                console.warn('Could not verify repo, assuming data.enc does not exist yet.');
            }
            return null; // data.enc truly doesn't exist → first-time setup
        }

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
            users: [{ id: 'admin', name: 'Admin', role: 'admin', pass: hashPassword('admin123') }],
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
