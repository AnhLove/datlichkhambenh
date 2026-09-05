package vn.namluongson.datlichkhambenhv.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.data.repository.query.Param;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.namluongson.datlichkhambenhv.domain.dtos.requests.doctor.CreateDoctorRequest;
import vn.namluongson.datlichkhambenhv.domain.dtos.requests.doctor.ListDoctorRequest;
import vn.namluongson.datlichkhambenhv.service.interfaces.IDoctorService;

@RestController
@RequestMapping("/doctor")
@RequiredArgsConstructor
public class DoctorController {
    private final IDoctorService iDoctorService;

    @PostMapping
    public ResponseEntity<?> createDoctor(@RequestBody CreateDoctorRequest request) {
        return ResponseEntity.ok(iDoctorService.createDoctor(request));
    }

    @GetMapping("/list")
    public ResponseEntity<?> getListDoctors(@Param("fullName")ListDoctorRequest request) {
        return ResponseEntity.ok(iDoctorService.getListDoctors(request));
    }
}
