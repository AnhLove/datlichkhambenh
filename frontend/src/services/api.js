const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function apiGet(path) {
    if (!API_BASE_URL) {
        throw new Error('Chưa cấu hình VITE_API_BASE_URL');
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {
        method: 'GET',
        headers: {
            Accept: 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error(`API trả về HTTP ${response.status}`);
    }

    return response.json();
}
