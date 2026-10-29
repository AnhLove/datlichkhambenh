import { apiGet, apiPost, apiPut, apiDelete } from './api';

export function getDepartments(name = '') {
    const params = new URLSearchParams();

    if (name.trim()) {
        params.set('name', name.trim());
    }

    const query = params.toString();

    return apiGet(`/department/list${query ? `?${query}` : ''}`);
}

export function createDepartment(request) {
    return apiPost('/department', request);
}

export function updateDepartment(request) {
    return apiPut('/department', request);
}

export function deleteDepartment(id) {
    return apiDelete(`/department/${id}`);
}
