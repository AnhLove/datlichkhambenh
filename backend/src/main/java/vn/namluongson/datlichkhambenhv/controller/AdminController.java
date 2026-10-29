package vn.namluongson.datlichkhambenhv.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.namluongson.datlichkhambenhv.domain.dtos.requests.user.CreateStaffRequest;
import vn.namluongson.datlichkhambenhv.service.interfaces.IExamReportService;
import vn.namluongson.datlichkhambenhv.service.interfaces.IUserService;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminController {
    private final IUserService userService;
    private final IExamReportService examReportService;

    @PostMapping("/staff")
    public ResponseEntity<?> createStaff(@Valid @RequestBody CreateStaffRequest request) {
        return ResponseEntity.ok(userService.createStaff(request));
    }

    @GetMapping("/exam-reports")
    public ResponseEntity<?> getAllReports() {
        return ResponseEntity.ok(examReportService.getAllReports());
    }
}
