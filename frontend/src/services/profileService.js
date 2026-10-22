import { apiGet, apiPut } from './api';

export function getMyProfile() {
    return apiGet('/me');
}

export function updateMyProfile(profile) {
    return apiPut('/me', profile);
}
