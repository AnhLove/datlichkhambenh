import { apiGet, apiPost, apiPatch, apiDelete } from './api';
import { buildQuery } from '../utils/paging';

// Trả về trang { content, page, size, totalElements, totalPages } nằm trong response.data
export function getAppointmentsByDate(date, page = 1, size = 20) {
    return apiGet(`/appointment/staff/by-date?${buildQuery({ date, page, size })}`);
}

export function confirmAppointment(appointmentUuid) {
    return apiPatch(`/appointment/${encodeURIComponent(appointmentUuid)}/confirm`);
}

export function checkInAppointment(appointmentUuid) {
    return apiPatch(`/appointment/${encodeURIComponent(appointmentUuid)}/check-in`);
}

export function markNoShow(appointmentUuid) {
    return apiPatch(`/appointment/${encodeURIComponent(appointmentUuid)}/no-show`);
}

export function rejectAppointment(appointmentUuid, cancelReason) {
    return apiPatch(`/appointment/${encodeURIComponent(appointmentUuid)}/reject`, { cancelReason });
}

// params: { page, size, fullName, phone, email, role, status } — backend trả thẳng { content, page, ... }
export function getAllUsers(params = {}) {
    return apiGet(`/user/list?${buildQuery(params)}`);
}

export function createPatient(payload) {
    return apiPost('/user', payload);
}

export function getUserByUuid(uuid) {
    return apiGet(`/user/${encodeURIComponent(uuid)}`);
}

export function getAppointmentServices(appointmentUuid) {
    return apiGet(`/appointment-services/appointment/${encodeURIComponent(appointmentUuid)}`);
}

export function addAppointmentService({ appointmentUuid, serviceId, quantity }) {
    return apiPost('/appointment-services', { appointmentUuid, serviceId, quantity });
}

export function removeAppointmentService(appointmentUuid, serviceId) {
    return apiDelete(`/appointment-services/appointment/${encodeURIComponent(appointmentUuid)}/service/${serviceId}`);
}

export function getPaymentByAppointment(appointmentUuid) {
    return apiGet(`/payments/appointment/${encodeURIComponent(appointmentUuid)}`);
}

export function createPayment(appointmentUuid, method) {
    return apiPost('/payments', { appointmentUuid, method });
}

export function confirmPayment(appointmentUuid) {
    return apiPatch(`/payments/appointment/${encodeURIComponent(appointmentUuid)}/confirm`);
}
