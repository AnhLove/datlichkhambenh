import { apiGet, apiPut } from './api';

const API_BASE = '/doctor-working-hour';

export function getWorkingHoursByDoctorUuid(uuid) {
    return apiGet(`${API_BASE}/doctor/${encodeURIComponent(uuid)}`);
}

export function saveMyWorkingHour(dayOfWeek, shiftType) {
    return apiPut(`${API_BASE}/my/${dayOfWeek}/${shiftType}`);
}
