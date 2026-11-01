package vn.namluongson.datlichkhambenhv.controller;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import vn.namluongson.datlichkhambenhv.domain.dtos.requests.medicalservice.CreateMedicalServiceRequest;
import vn.namluongson.datlichkhambenhv.domain.dtos.requests.medicalservice.MedicalServicePagingRequest;
import vn.namluongson.datlichkhambenhv.domain.dtos.requests.medicalservice.UpdateMedicalServiceRequest;
import vn.namluongson.datlichkhambenhv.service.interfaces.IMedicalServiceService;

@RestController
@RequiredArgsConstructor
@RequestMapping("/medical-services")
@Validated
public class MedicalServiceController {
    private final IMedicalServiceService service;

    @GetMapping("/list")
    public ResponseEntity<?> getListMedicalService(@RequestParam(value = "name", required = false) @Size(max = 150) String name) throws Exception {
        return ResponseEntity.ok(service.getListMedicalService(name));
    }

    @GetMapping("/paging")
    public ResponseEntity<?> getMedicalServices(@Valid MedicalServicePagingRequest request) {
        return ResponseEntity.ok(service.getMedicalServices(request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getMedicalServiceById(@PathVariable Long id) throws Exception {
        return ResponseEntity.ok(service.getMedicalServiceById(id));
    }

    @PostMapping
    public ResponseEntity<?> createMedicalService(@Valid @RequestBody CreateMedicalServiceRequest request) {
        return ResponseEntity.ok(service.createMedicalService(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateMedicalService(@PathVariable Long id, @Valid @RequestBody UpdateMedicalServiceRequest request) {
        return ResponseEntity.ok(service.updateMedicalService(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteMedicalService(@PathVariable Long id) {
        return ResponseEntity.ok(service.deleteMedicalService(id));
    }
}
