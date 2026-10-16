import { apiGet } from './api';

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
