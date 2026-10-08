package vn.namluongson.datlichkhambenhv.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.namluongson.datlichkhambenhv.domain.dtos.requests.appointment.CancelAppointmentRequest;
import vn.namluongson.datlichkhambenhv.domain.dtos.requests.appointment.CreateAppointmentRequest;
import vn.namluongson.datlichkhambenhv.service.interfaces.IAppointmentService;

import java.time.LocalDate;


@RestController
@RequestMapping("/appointment")
@RequiredArgsConstructor
public class AppointmentController {
    private final IAppointmentService appointmentService;
 
    @PostMapping
    public ResponseEntity<?> createAppointment(@Valid @RequestBody CreateAppointmentRequest request) {
        return ResponseEntity.ok(appointmentService.createAppointment(request));
    }

    @GetMapping("/available-slots")
    public ResponseEntity<?> getAvailableSlots(@RequestParam String doctorUuid, @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(appointmentService.getAvailableSlots(doctorUuid, date));
    }

    @GetMapping("/my")
    public ResponseEntity<?> getMyAppointments() {
        return ResponseEntity.ok(appointmentService.getMyAppointments());
    }

    @PostMapping("/my/{appointmentId}/cancel")
    public ResponseEntity<?> cancelAppointment(@PathVariable Long appointmentId, @Valid @RequestBody CancelAppointmentRequest request) {
        return ResponseEntity.ok(appointmentService.cancelAppointment(appointmentId, request));
    }

    @PatchMapping("/{appointmentId}/confirm")
    public ResponseEntity<?> confirmAppointment(@PathVariable Long appointmentId) {
        return ResponseEntity.ok(appointmentService.confirmAppointment(appointmentId));
    }

    @PatchMapping("/{appointmentId}/check-in")
    public ResponseEntity<?> checkInAppointment(@PathVariable Long appointmentId) {
        return ResponseEntity.ok(appointmentService.checkInAppointment(appointmentId));
    }

    @PatchMapping("/{appointmentId}/no-show")
    public ResponseEntity<?> noShowAppointment(@PathVariable Long appointmentId) {
        return ResponseEntity.ok(appointmentService.noShowAppointment(appointmentId));
    }

    @PatchMapping("/{appointmentId}/complete")
    public ResponseEntity<?> completeAppointment(@PathVariable Long appointmentId) {
        return ResponseEntity.ok(appointmentService.completeAppointment(appointmentId));
    }
}
