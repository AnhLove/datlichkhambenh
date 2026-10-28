import { apiGet } from './api';

function buildQuery(from, to) {
    return new URLSearchParams({ from, to }).toString();
}

// from, to: chuỗi yyyy-MM-dd
export function getAppointmentStatistics(from, to) {
    return apiGet(`/admin/statistics/appointments?${buildQuery(from, to)}`);
}

export function getRevenueStatistics(from, to) {
    return apiGet(`/admin/statistics/revenue?${buildQuery(from, to)}`);
}

export function getCancellationStatistics(from, to) {
    return apiGet(`/admin/statistics/cancellations?${buildQuery(from, to)}`);
}

export function getTopDoctors(from, to) {
    return apiGet(`/admin/statistics/top-doctors?${buildQuery(from, to)}`);
}
