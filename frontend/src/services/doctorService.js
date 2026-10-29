import { apiGet, apiPost, apiPut, apiDelete } from './api';

export function searchDoctors(departmentName = '', fullName = '') {
    const params = new URLSearchParams();

    if (departmentName.trim()) {
        params.set('departmentName', departmentName.trim());
    }

    if (fullName.trim()) {
        params.set('fullName', fullName.trim());
    }

    const query = params.toString();

    return apiGet(`/doctor/get-list-department-doctorname?${query}`);
}

export function createDoctor(request) {
    return apiPost('/doctor', request);
}

export function updateDoctor(request) {
    return apiPut('/doctor', request);
}

export function deleteDoctor(uuid) {
    return apiDelete(`/doctor/${encodeURIComponent(uuid)}`);
}
