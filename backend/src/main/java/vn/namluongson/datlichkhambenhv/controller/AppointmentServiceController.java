package vn.namluongson.datlichkhambenhv.controller;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import vn.namluongson.datlichkhambenhv.domain.dtos.requests.appointmentservice.AddAppointmentServiceRequest;
import vn.namluongson.datlichkhambenhv.service.interfaces.IAppointmentServiceService;

@RestController
@RequestMapping("/appointment-services")
@RequiredArgsConstructor
@Validated
public class AppointmentServiceController {
    private final IAppointmentServiceService appointmentServiceService;

    @PostMapping
    public ResponseEntity<?> addServiceToAppointment(@Valid @RequestBody AddAppointmentServiceRequest request) {
        return ResponseEntity.ok(appointmentServiceService.addServiceToAppointment(request));
    }

    @GetMapping("/appointment/{appointmentUuid}")
    public ResponseEntity<?> getServicesByAppointmentUuid(@PathVariable @Size(max = 36) String appointmentUuid) {
        return ResponseEntity.ok(appointmentServiceService.getServicesByAppointmentUuid(appointmentUuid));
    }

    @DeleteMapping("/appointment/{appointmentUuid}/service/{serviceId}")
    public ResponseEntity<?> removeServiceFromAppointment(@PathVariable @Size(max = 36) String appointmentUuid, @PathVariable @Positive Long serviceId) {
        return ResponseEntity.ok(appointmentServiceService.removeServiceFromAppointment(appointmentUuid, serviceId));
    }
}
