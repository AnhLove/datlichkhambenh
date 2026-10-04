package vn.namluongson.datlichkhambenhv.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.namluongson.datlichkhambenhv.domain.dtos.requests.doctorworking.CreateDoctorWorkingHourRequest;
import vn.namluongson.datlichkhambenhv.domain.dtos.requests.doctorworking.UpdateDoctorWorkingHourStatusRequest;
import vn.namluongson.datlichkhambenhv.service.interfaces.IDoctorWorkingHourService;

@RestController
@RequestMapping("/doctor-working-hour")
@RequiredArgsConstructor
public class DoctorWorkingHourController {
    private final IDoctorWorkingHourService service;

    @PostMapping
    public ResponseEntity<?> createDoctorWorkingHour(@Valid @RequestBody CreateDoctorWorkingHourRequest request) {
        return ResponseEntity.ok(service.createDoctorWorkingHour(request));
    }

    @GetMapping("/doctor/{uuid}")
    public ResponseEntity<?> getWorkingHoursByDoctorUuid(@PathVariable String uuid) throws Exception{
        return ResponseEntity.ok(service.getWorkingHoursByDoctorUuid(uuid));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<?> getWorkingHourByStatus(@PathVariable Short status) throws Exception {
        return ResponseEntity.ok(service.getWorkingHourByStatus(status));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateWorkingStatus(@Valid @PathVariable Long id,@RequestBody  UpdateDoctorWorkingHourStatusRequest request) throws Exception {
        return ResponseEntity.ok(service.updateWorkingStatus(id, request));
    }
}
