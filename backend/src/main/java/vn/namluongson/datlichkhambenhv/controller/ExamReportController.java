package vn.namluongson.datlichkhambenhv.controller;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import vn.namluongson.datlichkhambenhv.domain.dtos.requests.BasePagingRequest;
import vn.namluongson.datlichkhambenhv.domain.dtos.requests.examreport.CreateExamReportRequest;
import vn.namluongson.datlichkhambenhv.service.interfaces.IExamReportService;

@RestController
@RequestMapping("/exam-reports")
@RequiredArgsConstructor
@Validated
public class ExamReportController {

    private final IExamReportService examReportService;

    @PostMapping
    public ResponseEntity<?> createExamReport(@Valid @RequestBody CreateExamReportRequest request) {
        return ResponseEntity.ok(examReportService.createExamReport(request));
    }

    @PatchMapping("/{reportUuid}/issue")
    public ResponseEntity<?> issueExamReport(@PathVariable @Size(max = 36) String reportUuid) {
        return ResponseEntity.ok(examReportService.issueExamReport(reportUuid));
    }

    @GetMapping("/doctor/my")
    public ResponseEntity<?> getMyDoctorReports(@Valid BasePagingRequest paging) {
        return ResponseEntity.ok(examReportService.getMyDoctorReports(paging));
    }

    @GetMapping("/patient/my")
    public ResponseEntity<?> getMyPatientReports(@Valid BasePagingRequest paging) {
        return ResponseEntity.ok(examReportService.getMyPatientReports(paging));
    }
}
