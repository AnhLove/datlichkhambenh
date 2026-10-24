import { apiGet, apiPost, apiPatch } from './api';

const API_BASE = '/appointment';

export function getAvailableSlots(doctorUuid, date) {
    const params = new URLSearchParams({
        doctorUuid,
        date,
    });

    return apiGet(`${API_BASE}/available-slots?${params.toString()}`);
}

export function getMyAppointments() {
    return apiGet(`${API_BASE}/my`);
}

export function createAppointment(request) {
    return apiPost(API_BASE, request);
}

export function cancelAppointment(appointmentId, cancelReason) {
    return apiPost(`${API_BASE}/my/${appointmentId}/cancel`, { cancelReason });
}

export function getMyDoctorAppointments() {
    return apiGet(`${API_BASE}/doctor/my`);
}
export function completeAppointment(appointmentId) {
    return apiPatch(`${API_BASE}/${appointmentId}/complete`);
}
