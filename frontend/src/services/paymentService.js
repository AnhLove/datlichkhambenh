import { apiGet } from './api';
import { buildQuery } from '../utils/paging';

// Trả về trang { content, page, size, totalElements, totalPages } nằm trong response.data
export function getMyPayments(page = 1, size = 20) {
    return apiGet(`/payments/my?${buildQuery({ page, size })}`);
}
