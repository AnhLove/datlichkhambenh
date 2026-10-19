import { apiPost } from './api';

export function register(request) {
    return apiPost('/auth/register', request);
}

export function login(request) {
    return apiPost('/auth/login', request);
}
