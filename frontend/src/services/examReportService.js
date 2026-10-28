import { apiGet, apiPost, apiPatch } from './api';

export function getMyExamReports() {
    return apiGet('/exam-reports/patient/my');
}

export function getMyDoctorExamReports() {
    return apiGet('/exam-reports/doctor/my');
}

export function getAllExamReports() {
    return apiGet('/admin/exam-reports');
}

export function createExamReport(request) {
    return apiPost('/exam-reports', request);
}

export function issueExamReport(reportId) {
    return apiPatch(`/exam-reports/${reportId}/issue`);
}
