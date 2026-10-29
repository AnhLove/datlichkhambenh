import { apiGet, apiPost, apiPatch } from './api';

export function getUsers() {
    return apiGet('/user/list');
}

export function getUserByUuid(uuid) {
    return apiGet(`/user/${encodeURIComponent(uuid)}`);
}

export function createStaff(request) {
    return apiPost('/admin/staff', request);
}

export function updateUserStatus(uuid, status) {
    return apiPatch(`/user/${encodeURIComponent(uuid)}/status`, { status });
}
