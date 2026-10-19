const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

async function apiRequest(path, options = {}) {
    if (!API_BASE_URL) {
        throw new Error('Chưa cấu hình VITE_API_BASE_URL');
    }

    const response = await fetch(`${API_BASE_URL.replace(/\/+$/, '')}${path}`, {
        ...options,
        headers: {
            Accept: 'application/json',
            ...options.headers,
        },
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
        throw new Error(data?.message || `Yêu cầu thất bại (HTTP ${response.status}).`);
    }

    return data;
}

export function apiGet(path, token) {
    return apiRequest(path, {
        method: 'GET',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
}

export function apiPost(path, body, token) {
    return apiRequest(path, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(body),
    });
}
