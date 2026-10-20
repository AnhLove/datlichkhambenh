import { apiGet } from './api';

const API_BASE = '/medical-services';

export function getMedicalServices(name) {
    const params = new URLSearchParams();

    if (name?.trim()) {
        params.set('name', name.trim());
    }

    const query = params.toString();

    return apiGet(`${API_BASE}/list${query ? `?${query}` : ''}`);
}
