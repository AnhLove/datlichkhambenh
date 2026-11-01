import { apiGet, apiPost, apiPut } from './api';
import { buildQuery } from '../utils/paging';

const API_BASE = '/doctor-working-hour';

export function getWorkingHoursByDoctorUuid(uuid) {
    return apiGet(`${API_BASE}/doctor/${encodeURIComponent(uuid)}`);
}

export function saveMyWorkingHour(dayOfWeek, shiftType) {
    return apiPut(`${API_BASE}/my/${dayOfWeek}/${shiftType}`);
}

// Backend trả thẳng { content, page, size, totalElements, totalPages }
export function getWorkingHoursByStatus(status, page = 1, size = 20) {
    return apiGet(`${API_BASE}/status/${status}?${buildQuery({ page, size })}`);
}

export function updateWorkingHourStatus(uuid, status) {
    return apiPut(`${API_BASE}/${encodeURIComponent(uuid)}/status`, { status });
}

// request: { doctorUuid, dayOfWeek, shiftType }
export function createWorkingHour(request) {
    return apiPost(API_BASE, request);
}
