import { apiGet } from './api';

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

export async function createAppointment(request, token) {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

    if (!API_BASE_URL) {
        throw new Error('Chưa cấu hình VITE_API_BASE_URL');
    }

    if (!token) {
        throw new Error('Vui lòng đăng nhập để đặt lịch khám.');
    }

    const response = await fetch(`${API_BASE_URL}${API_BASE}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(request),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
        throw new Error(data?.message || `Không thể đặt lịch (HTTP ${response.status}).`);
    }

    return data;
}

export async function cancelAppointment(appointmentId, cancelReason, token) {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

    if (!API_BASE_URL) {
        throw new Error('Chưa cấu hình VITE_API_BASE_URL');
    }

    if (!token) {
        throw new Error('Vui lòng đăng nhập để tiếp tục.');
    }

    const response = await fetch(`${API_BASE_URL}${API_BASE}/my/${appointmentId}/cancel`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ cancelReason }),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
        throw new Error(data?.message || `Không thể hủy lịch (HTTP ${response.status}).`);
    }

    return data;
}
