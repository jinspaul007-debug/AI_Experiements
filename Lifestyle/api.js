/**
 * GitHub API + Encryption Layer v5.0
 * Security: SHA-256 hashed passwords, AES-256 encrypted storage, XSS sanitization.
 * Reliable: Cache-busted fetches, 409 conflict retry, input trimming.
 */

/** Sanitize string for safe HTML insertion — prevents XSS */
function sanitize(str) {
    if (str === null || str === undefined) return '';
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(String(str)));
    return div.innerHTML;
}

/** Hash a password with SHA-256 using CryptoJS — one-way, non-reversible */
function hashPassword(plainText) {
    return CryptoJS.SHA256(plainText).toString(CryptoJS.enc.Hex);
}

/** Compare a plain-text password against a stored hash */
function verifyPassword(plainText, storedHash) {
    // Support legacy unhashed passwords during migration
    if (storedHash && storedHash.length !== 64) {
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

/** Validate imported data structure has required fields */
function validateDataStructure(data) {
    if (!data || typeof data !== 'object') return { valid: false, error: 'Not a valid JSON object' };
    if (data.app !== 'LifestyleTracker') return { valid: false, error: 'Not a valid Lifestyle backup' };
    if (!data.keys) return { valid: false, error: 'Missing data keys' };
    return { valid: true };
}

const GitHubAPI = {
    config: {
        token: (localStorage.getItem('gh_token') || '').trim(),
        username: (localStorage.getItem('gh_username') || '').trim(),
        repo: (localStorage.getItem('gh_repo') || '').trim(),
        path: '', // Set dynamically upon login
        encKey: '',
        sha: null
    },

    saveConfig(token, username, repo) {
        this.config.token = (token || '').trim();
        this.config.username = (username || '').trim();
        this.config.repo = (repo || '').trim();
        localStorage.setItem('gh_token', this.config.token);
        localStorage.setItem('gh_username', this.config.username);
        localStorage.setItem('gh_repo', this.config.repo);
    },

    setPath(path) { this.config.path = path; },

    setEncryptionKey(key) { this.config.encKey = key; },

    isConfigured() {
        return !!(this.config.token && this.config.username && this.config.repo);
    },

    hasEncryptionKey() { return !!this.config.encKey; },

    /** Build standard headers for GitHub API */
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
        const url = `https://api.github.com/repos/${this.config.username}/${this.config.repo}?t=${Date.now()}`;
        const res = await fetch(url, { headers: this._headers(), cache: 'no-store' });
        if (!res.ok) throw new Error(`Cannot access repo (${res.status}). Check token/username/repo.`);
        return true;
    },

    async _request(method, body = null) {
        if (!this.config.token) throw new Error('GitHub token not set.');
        const cacheBust = method === 'GET' ? `?t=${Date.now()}` : '';
        const url = `https://api.github.com/repos/${this.config.username}/${this.config.repo}/contents/${this.config.path}${cacheBust}`;
        const options = { method, headers: this._headers(), cache: 'no-store' };
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
                // SHA conflict — auto-retry: fetch latest SHA and let caller retry
                const fresh = await this._request('GET');
                if (fresh) this.config.sha = fresh.sha;
                throw new Error('CONFLICT_RETRY');
            }
            if (response.status === 401 || response.status === 403) {
                throw new Error('Access denied. Your PAT token may have expired or lacks permissions.');
            }
            throw new Error(`GitHub API Error: ${response.status}`);
        }
        return await response.json();
    },

    async fetchData() {
        let data;
        try {
            data = await this._request('GET');
        } catch (fetchErr) {
            throw fetchErr;
        }

        if (!data) {
            // 404 — verify repo exists to distinguish "file missing" from "repo wrong"
            try {
                const repoUrl = `https://api.github.com/repos/${this.config.username}/${this.config.repo}`;
                const repoCheck = await fetch(repoUrl, { headers: this._headers(), cache: 'no-store' });
                if (!repoCheck.ok) {
                    const status = repoCheck.status;
                    if (status === 401 || status === 403) {
                        throw new Error(`Access denied (${status}). Your PAT token may have expired or lacks permissions.`);
                    }
                    throw new Error(`Repository "${this.config.username}/${this.config.repo}" not found (${status}). Check your GitHub username and repository name — spelling must match EXACTLY.`);
                }
            } catch (repoErr) {
                if (repoErr.message.includes('Repository') || repoErr.message.includes('Access denied')) throw repoErr;
                console.warn('Could not verify repo, assuming data.enc does not exist yet.');
            }
            return null;
        }

        this.config.sha = data.sha;
        try {
            const rawContent = data.content.replace(/\n/g, '');
            const encryptedContent = decodeURIComponent(escape(atob(rawContent)));
            const bytes = CryptoJS.AES.decrypt(encryptedContent, this.config.encKey);
            const decrypted = bytes.toString(CryptoJS.enc.Utf8);
            if (!decrypted) throw new Error('DECRYPT_FAIL');
            const parsed = JSON.parse(decrypted);
            const val = validateDataStructure(parsed);
            if (!val.valid) throw new Error(val.error);
            return parsed;
        } catch (e) {
            if (e.message === 'DECRYPT_FAIL') throw new Error('Wrong encryption key. Data cannot be decrypted.');
            throw new Error('Data corrupted or wrong encryption key.');
        }
    },

    async pushData(jsonData, retryCount = 0) {
        if (!this.config.encKey) throw new Error('Encryption key not set.');
        const encrypted = CryptoJS.AES.encrypt(JSON.stringify(jsonData), this.config.encKey).toString();
        const contentBase64 = btoa(unescape(encodeURIComponent(encrypted)));
        const body = {
            message: `Data update: ${new Date().toLocaleDateString('en-IN')} ${new Date().toLocaleTimeString('en-IN')}`,
            content: contentBase64
        };
        if (this.config.sha) body.sha = this.config.sha;
        try {
            const response = await this._request('PUT', body);
            if (response && response.content) this.config.sha = response.content.sha;
            return true;
        } catch (err) {
            if (err.message === 'CONFLICT_RETRY' && retryCount < 2) {
                // Auto-retry with fresh SHA (already updated by _request)
                console.warn(`SHA conflict, retrying... (attempt ${retryCount + 1})`);
                return this.pushData(jsonData, retryCount + 1);
            }
            if (err.message === 'CONFLICT_RETRY') {
                throw new Error('Data was updated by another device. Please refresh and try again.');
            }
            throw err;
        }
    },

    getDefaultData() {
        return { app:'LifestyleTracker', version:'3.0', exportDate:new Date().toISOString(), keys:{} };
    }
};
