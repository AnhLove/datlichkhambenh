package vn.namluongson.datlichkhambenhv.controller;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
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
    public ResponseEntity<?> createAppointment(@Valid @RequestBody CreateAppointmentRequest request) {
        return ResponseEntity.ok(appointmentService.createAppointment(request));
    }

    @GetMapping("/available-slots")
    public ResponseEntity<?> getAvailableSlots(@RequestParam @Size(max = 36) String doctorUuid, @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(appointmentService.getAvailableSlots(doctorUuid, date));
    }

    @GetMapping("/my")
    public ResponseEntity<?> getMyAppointments(@Valid BasePagingRequest paging) {
        return ResponseEntity.ok(appointmentService.getMyAppointments(paging));
    }

    @PostMapping("/my/{appointmentUuid}/cancel")
    public ResponseEntity<?> cancelAppointment(@PathVariable @Size(max = 36) String appointmentUuid, @Valid @RequestBody CancelAppointmentRequest request) {
        return ResponseEntity.ok(appointmentService.cancelAppointment(appointmentUuid, request));
    }

    @PatchMapping("/{appointmentUuid}/confirm")
    public ResponseEntity<?> confirmAppointment(@PathVariable @Size(max = 36) String appointmentUuid) {
        return ResponseEntity.ok(appointmentService.confirmAppointment(appointmentUuid));
    }

    @PatchMapping("/{appointmentUuid}/check-in")
    public ResponseEntity<?> checkInAppointment(@PathVariable @Size(max = 36) String appointmentUuid) {
        return ResponseEntity.ok(appointmentService.checkInAppointment(appointmentUuid));
    }

    @PatchMapping("/{appointmentUuid}/no-show")
    public ResponseEntity<?> noShowAppointment(@PathVariable @Size(max = 36) String appointmentUuid) {
        return ResponseEntity.ok(appointmentService.noShowAppointment(appointmentUuid));
    }

    @PatchMapping("/{appointmentUuid}/complete")
    public ResponseEntity<?> completeAppointment(@PathVariable @Size(max = 36) String appointmentUuid) {
        return ResponseEntity.ok(appointmentService.completeAppointment(appointmentUuid));
    }

    @GetMapping("/staff/today")
    public ResponseEntity<?> getTodayAppointments(@Valid BasePagingRequest paging) {
        return ResponseEntity.ok(appointmentService.getTodayAppointments(paging));
    }

    @GetMapping("/doctor/my")
    public ResponseEntity<?> getMyDoctorAppointments(@Valid BasePagingRequest paging) {
        return ResponseEntity.ok(appointmentService.getMyDoctorAppointments(paging));
    }

    @GetMapping("/staff/by-date")
    public ResponseEntity<?> getAppointmentsByDate(@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date, @Valid BasePagingRequest paging) {
        return ResponseEntity.ok(appointmentService.getAppointmentsByDate(date, paging));
    }

    @PatchMapping("/{appointmentUuid}/reject")
    public ResponseEntity<?> rejectAppointment(@PathVariable @Size(max = 36) String appointmentUuid, @Valid @RequestBody CancelAppointmentRequest request) {
        return ResponseEntity.ok(appointmentService.rejectAppointment(appointmentUuid, request));
    }
}
