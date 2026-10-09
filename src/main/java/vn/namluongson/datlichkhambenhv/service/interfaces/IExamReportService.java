package vn.namluongson.datlichkhambenhv.service.interfaces;

import vn.namluongson.datlichkhambenhv.domain.dtos.requests.examreport.CreateExamReportRequest;
import vn.namluongson.datlichkhambenhv.domain.response.ApiResponse;

public interface IExamReportService {
    ApiResponse createExamReport(CreateExamReportRequest request);
    ApiResponse issueExamReport(Long reportId);
    ApiResponse getMyDoctorReports();
    ApiResponse getMyPatientReports();
}
