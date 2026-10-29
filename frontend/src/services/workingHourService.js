import { apiGet, apiPost, apiPut } from './api';

const API_BASE = '/doctor-working-hour';

export function getWorkingHoursByDoctorUuid(uuid) {
    return apiGet(`${API_BASE}/doctor/${encodeURIComponent(uuid)}`);
}

export function saveMyWorkingHour(dayOfWeek, shiftType) {
    return apiPut(`${API_BASE}/my/${dayOfWeek}/${shiftType}`);
}

export function getWorkingHoursByStatus(status) {
    return apiGet(`${API_BASE}/status/${status}`);
}

export function updateWorkingHourStatus(id, status) {
    return apiPut(`${API_BASE}/${id}/status`, { status });
}

export function createWorkingHour(request) {
    return apiPost(API_BASE, request);
}
