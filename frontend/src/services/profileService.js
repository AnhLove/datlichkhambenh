import { apiGet, apiPut, apiPost } from './api';

export function getMyProfile() {
    return apiGet('/me');
}

export function updateMyProfile(profile) {
    return apiPut('/me', profile);
}

export function changePassword(request) {
    return apiPost('/me/change-password', request);
}
