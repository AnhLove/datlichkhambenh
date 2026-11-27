package vn.namluongson.datlichkhambenhv.controller;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import vn.namluongson.datlichkhambenhv.config.security.CustomUserDetails;
import vn.namluongson.datlichkhambenhv.domain.dtos.requests.BasePagingRequest;
import vn.namluongson.datlichkhambenhv.domain.dtos.requests.appointment.CancelAppointmentRequest;
import vn.namluongson.datlichkhambenhv.domain.dtos.requests.appointment.CreateAppointmentRequest;
import vn.namluongson.datlichkhambenhv.service.interfaces.IAppointmentService;

import java.time.LocalDate;


@RestController
@RequestMapping("/appointment")
@RequiredArgsConstructor
@Validated
public class AppointmentController {
    private final IAppointmentService appointmentService;

    @PostMapping
    public ResponseEntity<?> createAppointment(@Valid @RequestBody CreateAppointmentRequest request, @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(appointmentService.createAppointment(request, userDetails.getUser().getUuid()));
    }

    @GetMapping("/available-slots")
    public ResponseEntity<?> getAvailableSlots(@RequestParam @jakarta.validation.constraints.Positive Long departmentId, @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(appointmentService.getAvailableSlots(departmentId, date));
    }

    @GetMapping("/my")
    public ResponseEntity<?> getMyAppointments(@Valid BasePagingRequest paging, @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(appointmentService.getMyAppointments(paging, userDetails.getUser().getUuid()));
    }

    @PostMapping("/my/{appointmentUuid}/cancel")
    public ResponseEntity<?> cancelAppointment(@PathVariable @Size(max = 36) String appointmentUuid, @Valid @RequestBody CancelAppointmentRequest request, @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(appointmentService.cancelAppointment(appointmentUuid, request, userDetails.getUser().getUuid()));
    }

    @PatchMapping("/{appointmentUuid}/confirm")
    public ResponseEntity<?> confirmAppointment(@PathVariable @Size(max = 36) String appointmentUuid, @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(appointmentService.confirmAppointment(appointmentUuid, userDetails.getUser().getUuid()));
    }

    @PatchMapping("/{appointmentUuid}/check-in")
    public ResponseEntity<?> checkInAppointment(@PathVariable @Size(max = 36) String appointmentUuid, @RequestParam @Size(max = 36) String doctorUuid, @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(appointmentService.checkInAppointment(appointmentUuid, doctorUuid, userDetails.getUser().getUuid()));
    }

    @PatchMapping("/{appointmentUuid}/no-show")
    public ResponseEntity<?> noShowAppointment(@PathVariable @Size(max = 36) String appointmentUuid, @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(appointmentService.noShowAppointment(appointmentUuid, userDetails.getUser().getUuid()));
    }

    @PatchMapping("/{appointmentUuid}/complete")
    public ResponseEntity<?> completeAppointment(@PathVariable @Size(max = 36) String appointmentUuid, @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(appointmentService.completeAppointment(appointmentUuid, userDetails.getUser().getUuid()));
    }

    @GetMapping("/staff/today")
    public ResponseEntity<?> getTodayAppointments(@Valid BasePagingRequest paging, @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(appointmentService.getTodayAppointments(paging, userDetails.getUser().getUuid()));
    }

    @GetMapping("/doctor/my")
    public ResponseEntity<?> getMyDoctorAppointments(@Valid BasePagingRequest paging, @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(appointmentService.getMyDoctorAppointments(paging, userDetails.getUser().getUuid()));
    }

    @GetMapping("/staff/by-date")
    public ResponseEntity<?> getAppointmentsByDate(@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date, @Valid BasePagingRequest paging, @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(appointmentService.getAppointmentsByDate(date, paging, userDetails.getUser().getUuid()));
    }

    @PatchMapping("/{appointmentUuid}/reject")
    public ResponseEntity<?> rejectAppointment(@PathVariable @Size(max = 36) String appointmentUuid, @Valid @RequestBody CancelAppointmentRequest request, @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(appointmentService.rejectAppointment(appointmentUuid, request, userDetails.getUser().getUuid()));
    }

    @GetMapping("/{appointmentUuid}/eligible-doctors")
    public ResponseEntity<?> getEligibleDoctorsForCheckIn(@PathVariable @Size(max = 36) String appointmentUuid, @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(appointmentService.getEligibleDoctorsForCheckIn(appointmentUuid, userDetails.getUser().getUuid()));
    }
}
