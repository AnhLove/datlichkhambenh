package vn.namluongson.datlichkhambenhv.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.data.repository.query.Param;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.namluongson.datlichkhambenhv.domain.dtos.requests.doctor.CreateDoctorRequest;
import vn.namluongson.datlichkhambenhv.domain.dtos.requests.doctor.ListDoctorRequest;
import vn.namluongson.datlichkhambenhv.domain.dtos.requests.doctor.UpdateDoctorRequest;
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

    @PutMapping
    public ResponseEntity<?> updateDoctor(@RequestBody UpdateDoctorRequest request) throws Exception {
        return ResponseEntity.ok(iDoctorService.updateDoctor(request));
    }

    @DeleteMapping("/{uuid}")
    public ResponseEntity<?> deleteDoctor(@PathVariable("uuid") String uuid) throws Exception{
        return ResponseEntity.ok(iDoctorService.deleteDoctor(uuid));
    }

    @GetMapping("/list")
    public ResponseEntity<?> getListDoctors(@Param("fullName")ListDoctorRequest request) {
        return ResponseEntity.ok(iDoctorService.getListDoctors(request));
    }

    @GetMapping("/paging")
    public ResponseEntity<?> getDoctors(ListDoctorRequest request) {
        return ResponseEntity.ok(iDoctorService.getDoctors(request));
    }

    @GetMapping("/get-list-department-doctorname")
    public ResponseEntity<?> getListDepartment_DoctorName(@RequestParam("departmentName") String departmentName, @RequestParam("fullName") String fullName) throws Exception{
        return ResponseEntity.ok(iDoctorService.getListDepartment_DoctorName(departmentName, fullName));
    }
}
