import { apiGet } from './api';

export function getMyExamReports() {
    return apiGet('/exam-reports/patient/my');
}
