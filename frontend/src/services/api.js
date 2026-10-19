const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function readCookie(name) {
    const prefix = `${name}=`;
    const item = document.cookie.split('; ').find((cookie) => cookie.startsWith(prefix));

    if (!item) {
        return null;
    }

    return decodeURIComponent(item.substring(prefix.length));
}

async function ensureCsrfToken() {
    let token = readCookie('XSRF-TOKEN');

    if (token) {
        return token;
    }

    const response = await fetch(`${API_BASE_URL.replace(/\/+$/, '')}/auth/csrf`, {
        method: 'GET',
        credentials: 'include',
        headers: {
            Accept: 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error(`Không lấy được CSRF token (HTTP ${response.status}).`);
    }

    token = readCookie('XSRF-TOKEN');

    if (!token) {
        throw new Error('Backend chưa tạo cookie XSRF-TOKEN. Hãy kiểm tra cấu hình CSRF.');
    }

    return token;
}

async function apiRequest(path, options = {}) {
    if (!API_BASE_URL) {
        throw new Error('Chưa cấu hình VITE_API_BASE_URL trong file .env.');
    }

    const method = (options.method || 'GET').toUpperCase();
    const headers = {
        Accept: 'application/json',
        ...options.headers,
    };

    const unsafeMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];

    if (unsafeMethods.includes(method)) {
        const csrfToken = await ensureCsrfToken();
        headers['X-XSRF-TOKEN'] = csrfToken;
    }

    const response = await fetch(`${API_BASE_URL.replace(/\/+$/, '')}${path}`, {
        ...options,
        method,
        headers,
        credentials: 'include',
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
        throw new Error(data?.message || `Yêu cầu thất bại (HTTP ${response.status}).`);
    }

    return data;
}

export function apiGet(path) {
    return apiRequest(path, { method: 'GET' });
}

export function apiPost(path, body) {
    return apiRequest(path, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    });
}

export function apiPut(path, body) {
    return apiRequest(path, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    });
}

export function apiDelete(path) {
    return apiRequest(path, { method: 'DELETE' });
}
