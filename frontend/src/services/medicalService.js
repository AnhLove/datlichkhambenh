import { apiGet, apiPost, apiPut, apiDelete } from './api';

const API_BASE = '/medical-services';

export function getMedicalServices(name) {
    const params = new URLSearchParams();

    if (name?.trim()) {
        params.set('name', name.trim());
    }

    const query = params.toString();

    return apiGet(`${API_BASE}/list${query ? `?${query}` : ''}`);
}

export function createMedicalService(request) {
    return apiPost(API_BASE, request);
}

export function updateMedicalService(id, request) {
    return apiPut(`${API_BASE}/${id}`, request);
}

export function deleteMedicalService(id) {
    return apiDelete(`${API_BASE}/${id}`);
}
