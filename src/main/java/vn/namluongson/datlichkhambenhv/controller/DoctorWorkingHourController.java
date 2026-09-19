package vn.namluongson.datlichkhambenhv.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.namluongson.datlichkhambenhv.domain.dtos.requests.doctorworking.CreateDoctorWorkingHourRequest;
import vn.namluongson.datlichkhambenhv.service.interfaces.IDoctorWorkingHourService;

@RestController
@RequestMapping("/doctor-working-hour")
@RequiredArgsConstructor
public class DoctorWorkingHourController {
    private final IDoctorWorkingHourService service;

    @PostMapping
    public ResponseEntity<?> createDoctorWorkingHour(@RequestBody CreateDoctorWorkingHourRequest request) {
        return ResponseEntity.ok(service.createDoctorWorkingHour(request));
    }

    @GetMapping("/doctor/{uuid}")
    public ResponseEntity<?> getWorkingHoursByDoctorUuid(@PathVariable String uuid) throws Exception{
        return ResponseEntity.ok(service.getWorkingHoursByDoctorUuid(uuid));
    }
}
