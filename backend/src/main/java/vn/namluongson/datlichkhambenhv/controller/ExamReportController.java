package vn.namluongson.datlichkhambenhv.controller;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import vn.namluongson.datlichkhambenhv.config.security.CustomUserDetails;
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
    public ResponseEntity<?> createExamReport(@Valid @RequestBody CreateExamReportRequest request, @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(examReportService.createExamReport(request, userDetails.getUser().getUuid()));
    }

    @PatchMapping("/{reportUuid}/issue")
    public ResponseEntity<?> issueExamReport(@PathVariable @Size(max = 36) String reportUuid, @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(examReportService.issueExamReport(reportUuid, userDetails.getUser().getUuid()));
    }

    @GetMapping("/doctor/my")
    public ResponseEntity<?> getMyDoctorReports(@Valid BasePagingRequest paging, @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(examReportService.getMyDoctorReports(paging, userDetails.getUser().getUuid()));
    }

    @GetMapping("/patient/my")
    public ResponseEntity<?> getMyPatientReports(@Valid BasePagingRequest paging, @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(examReportService.getMyPatientReports(paging, userDetails.getUser().getUuid()));
    }
}
