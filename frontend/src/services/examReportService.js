import { apiGet, apiPost, apiPatch } from './api';
import { buildQuery } from '../utils/paging';

// Ba hàm danh sách trả về trang { content, page, size, totalElements, totalPages } nằm trong response.data
export function getMyExamReports(page = 1, size = 20) {
    return apiGet(`/exam-reports/patient/my?${buildQuery({ page, size })}`);
}

export function getMyDoctorExamReports(page = 1, size = 20) {
    return apiGet(`/exam-reports/doctor/my?${buildQuery({ page, size })}`);
}

export function getAllExamReports(page = 1, size = 20) {
    return apiGet(`/admin/exam-reports?${buildQuery({ page, size })}`);
}

// request: { appointmentUuid, diagnosis, notes }
export function createExamReport(request) {
    return apiPost('/exam-reports', request);
}

export function issueExamReport(reportUuid) {
    return apiPatch(`/exam-reports/${encodeURIComponent(reportUuid)}/issue`);
}
