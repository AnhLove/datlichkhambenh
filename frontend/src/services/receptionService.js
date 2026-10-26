import { apiGet, apiPost, apiPatch, apiDelete } from './api';

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

export function getAppointmentServices(appointmentId) {
    return apiGet(`/appointment-services/appointment/${appointmentId}`);
}

export function addAppointmentService({ appointmentId, serviceId, quantity }) {
    return apiPost('/appointment-services', { appointmentId, serviceId, quantity });
}

export function removeAppointmentService(appointmentId, serviceId) {
    return apiDelete(`/appointment-services/appointment/${appointmentId}/service/${serviceId}`);
}
export function getPaymentByAppointment(appointmentId) {
    return apiGet(`/payments/appointment/${appointmentId}`);
}

export function createPayment(appointmentId, method) {
    return apiPost('/payments', { appointmentId, method });
}

export function confirmPayment(appointmentId) {
    return apiPatch(`/payments/appointment/${appointmentId}/confirm`);
}
