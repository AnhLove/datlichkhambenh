import { apiGet } from './api';

export function getDepartments(name = '') {
    const params = new URLSearchParams();

    if (name.trim()) {
        params.set('name', name.trim());
    }

    const query = params.toString();

    return apiGet(`/department/list${query ? `?${query}` : ''}`);
}
