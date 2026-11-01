import { apiGet, apiPost, apiPatch } from './api';
import { buildQuery } from '../utils/paging';

const API_BASE = '/appointment';

export function getAvailableSlots(doctorUuid, date) {
    const params = new URLSearchParams({
        doctorUuid,
        date,
    });

    return apiGet(`${API_BASE}/available-slots?${params.toString()}`);
}

// Trả về trang { content, page, size, totalElements, totalPages } nằm trong response.data
export function getMyAppointments(page = 1, size = 20) {
    return apiGet(`${API_BASE}/my?${buildQuery({ page, size })}`);
}

export function createAppointment(request) {
    return apiPost(API_BASE, request);
}

export function cancelAppointment(appointmentUuid, cancelReason) {
    return apiPost(`${API_BASE}/my/${encodeURIComponent(appointmentUuid)}/cancel`, { cancelReason });
}

export function getMyDoctorAppointments(page = 1, size = 20) {
    return apiGet(`${API_BASE}/doctor/my?${buildQuery({ page, size })}`);
}

export function completeAppointment(appointmentUuid) {
    return apiPatch(`${API_BASE}/${encodeURIComponent(appointmentUuid)}/complete`);
}
