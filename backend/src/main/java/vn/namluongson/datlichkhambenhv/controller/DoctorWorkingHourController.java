package vn.namluongson.datlichkhambenhv.controller;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import vn.namluongson.datlichkhambenhv.domain.dtos.requests.BasePagingRequest;
import vn.namluongson.datlichkhambenhv.domain.dtos.requests.doctorworking.CreateDoctorWorkingHourRequest;
import vn.namluongson.datlichkhambenhv.domain.dtos.requests.doctorworking.UpdateDoctorWorkingHourStatusRequest;
import vn.namluongson.datlichkhambenhv.service.interfaces.IDoctorWorkingHourService;

@RestController
@RequestMapping("/doctor-working-hour")
@RequiredArgsConstructor
@Validated
public class DoctorWorkingHourController {
    private final IDoctorWorkingHourService service;

    @PostMapping
    public ResponseEntity<?> createDoctorWorkingHour(@Valid @RequestBody CreateDoctorWorkingHourRequest request) {
        return ResponseEntity.ok(service.createDoctorWorkingHour(request));
    }

    @GetMapping("/doctor/{uuid}")
    public ResponseEntity<?> getWorkingHoursByDoctorUuid(@PathVariable @Size(max = 36) String uuid) throws Exception {
        return ResponseEntity.ok(service.getWorkingHoursByDoctorUuid(uuid));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<?> getWorkingHourByStatus(@PathVariable Short status, @Valid BasePagingRequest paging) {
        return ResponseEntity.ok(service.getWorkingHourByStatus(status, paging));
    }

    @PutMapping("/{uuid}/status")
    public ResponseEntity<?> updateWorkingStatus(@PathVariable @Size(max = 36) String uuid, @Valid @RequestBody UpdateDoctorWorkingHourStatusRequest request) {
        return ResponseEntity.ok(service.updateWorkingStatus(uuid, request));
    }

    @PutMapping("/my/{dayOfWeek}/{shiftType}")
    public ResponseEntity<?> saveMyWorkingHour(@PathVariable Short dayOfWeek, @PathVariable Short shiftType) {
        return ResponseEntity.ok(service.saveMyWorkingHour(dayOfWeek, shiftType));
    }
}
