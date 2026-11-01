package vn.namluongson.datlichkhambenhv.controller;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import vn.namluongson.datlichkhambenhv.domain.dtos.requests.doctor.CreateDoctorRequest;
import vn.namluongson.datlichkhambenhv.domain.dtos.requests.doctor.ListDoctorRequest;
import vn.namluongson.datlichkhambenhv.domain.dtos.requests.doctor.UpdateDoctorRequest;
import vn.namluongson.datlichkhambenhv.service.interfaces.IDoctorService;

@RestController
@RequestMapping("/doctor")
@RequiredArgsConstructor
@Validated
public class DoctorController {
    private final IDoctorService iDoctorService;

    @PostMapping
    public ResponseEntity<?> createDoctor(@Valid @RequestBody CreateDoctorRequest request) {
        return ResponseEntity.ok(iDoctorService.createDoctor(request));
    }

    @PutMapping
    public ResponseEntity<?> updateDoctor(@Valid @RequestBody UpdateDoctorRequest request) {
        return ResponseEntity.ok(iDoctorService.updateDoctor(request));
    }

    @DeleteMapping("/{uuid}")
    public ResponseEntity<?> deleteDoctor(@PathVariable("uuid") @Size(max = 36) String uuid) {
        return ResponseEntity.ok(iDoctorService.deleteDoctor(uuid));
    }

    @GetMapping("/list")
    public ResponseEntity<?> getListDoctors(@Valid ListDoctorRequest request) {
        return ResponseEntity.ok(iDoctorService.getListDoctors(request));
    }

    @GetMapping("/paging")
    public ResponseEntity<?> getDoctors(@Valid ListDoctorRequest request) {
        return ResponseEntity.ok(iDoctorService.getDoctors(request));
    }

    @GetMapping("/get-list-department-doctorname")
    public ResponseEntity<?> getListDepartment_DoctorName(
            @RequestParam(value = "departmentName", required = false) @Size(max = 100) String departmentName,
            @RequestParam(value = "fullName", required = false) @Size(max = 150) String fullName) {
        return ResponseEntity.ok(iDoctorService.getListDepartment_DoctorName(departmentName, fullName));
    }
}
