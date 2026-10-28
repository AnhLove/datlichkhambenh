import { apiGet, apiPost, apiPut, apiDelete } from './api';

export function getSystemConfigs() {
    return apiGet('/admin/configs');
}

// request: { configKey, configValue, description }
export function createSystemConfig(request) {
    return apiPost('/admin/configs', request);
}

// Backend yêu cầu configKey trong body trùng với key trên đường dẫn
export function updateSystemConfig(key, request) {
    return apiPut(`/admin/configs/${encodeURIComponent(key)}`, request);
}

export function deleteSystemConfig(key) {
    return apiDelete(`/admin/configs/${encodeURIComponent(key)}`);
}
