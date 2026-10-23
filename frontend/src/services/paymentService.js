import { apiGet } from './api';

export function getMyPayments() {
    return apiGet('/payments/my');
}
