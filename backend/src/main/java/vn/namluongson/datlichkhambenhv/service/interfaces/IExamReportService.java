package vn.namluongson.datlichkhambenhv.service.interfaces;

import vn.namluongson.datlichkhambenhv.domain.dtos.requests.BasePagingRequest;
import vn.namluongson.datlichkhambenhv.domain.dtos.requests.examreport.CreateExamReportRequest;
import vn.namluongson.datlichkhambenhv.domain.response.ApiResponse;

public interface IExamReportService {
    ApiResponse createExamReport(CreateExamReportRequest request, String currentUserUuid);
    ApiResponse issueExamReport(String reportUuid, String currentUserUuid);
    ApiResponse getMyDoctorReports(BasePagingRequest paging, String currentUserUuid);
    ApiResponse getMyPatientReports(BasePagingRequest paging, String currentUserUuid);
    ApiResponse getAllReports(BasePagingRequest paging, String currentUserUuid);
}

