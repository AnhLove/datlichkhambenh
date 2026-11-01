import { apiGet, apiPost, apiPatch } from './api';
import { buildQuery } from '../utils/paging';

// params: { page, size, fullName, phone, email, role, status } — backend trả thẳng { content, page, ... }
export function getUsers(params = {}) {
    return apiGet(`/user/list?${buildQuery(params)}`);
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
