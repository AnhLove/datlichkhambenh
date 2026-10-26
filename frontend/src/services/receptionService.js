import { apiGet, apiPost, apiPatch } from './api';

export function getAppointmentsByDate(date) {
    return apiGet(`/appointment/staff/by-date?date=${encodeURIComponent(date)}`);
}

export function confirmAppointment(appointmentId) {
    return apiPatch(`/appointment/${appointmentId}/confirm`);
}

export function checkInAppointment(appointmentId) {
    return apiPatch(`/appointment/${appointmentId}/check-in`);
}

export function markNoShow(appointmentId) {
    return apiPatch(`/appointment/${appointmentId}/no-show`);
}

export function rejectAppointment(appointmentId, cancelReason) {
    return apiPatch(`/appointment/${appointmentId}/reject`, { cancelReason });
}

export function getAllUsers() {
    return apiGet('/user/list');
}

export function createPatient(payload) {
    return apiPost('/user', payload);
}

export function getUserByUuid(uuid) {
    return apiGet(`/user/${encodeURIComponent(uuid)}`);
}
