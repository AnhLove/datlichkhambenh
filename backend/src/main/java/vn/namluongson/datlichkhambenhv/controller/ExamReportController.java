package vn.namluongson.datlichkhambenhv.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.namluongson.datlichkhambenhv.domain.dtos.requests.examreport.CreateExamReportRequest;
import vn.namluongson.datlichkhambenhv.service.interfaces.IExamReportService;

@RestController
@RequestMapping("/exam-reports")
@RequiredArgsConstructor
public class ExamReportController {

    private final IExamReportService examReportService;

    @PostMapping
    public ResponseEntity<?> createExamReport(@Valid @RequestBody CreateExamReportRequest request) {
        return ResponseEntity.ok(examReportService.createExamReport(request));
    }

    @PatchMapping("/{reportId}/issue")
    public ResponseEntity<?> issueExamReport(@PathVariable Long reportId) {
        return ResponseEntity.ok(examReportService.issueExamReport(reportId));
    }

    @GetMapping("/doctor/my")
    public ResponseEntity<?> getMyDoctorReports() {
        return ResponseEntity.ok(examReportService.getMyDoctorReports());
    }

    @GetMapping("/patient/my")
    public ResponseEntity<?> getMyPatientReports() {
        return ResponseEntity.ok(examReportService.getMyPatientReports());
    }
}