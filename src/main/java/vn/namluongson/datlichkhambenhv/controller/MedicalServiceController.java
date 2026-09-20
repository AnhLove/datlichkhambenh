package vn.namluongson.datlichkhambenhv.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.namluongson.datlichkhambenhv.domain.dtos.requests.medicalservice.CreateMedicalServiceRequest;
import vn.namluongson.datlichkhambenhv.service.interfaces.IMedicalServiceService;

@RestController
@RequiredArgsConstructor
@RequestMapping("/medical-services")
public class MedicalServiceController {
    private final IMedicalServiceService service;

    @GetMapping("/list")
    public ResponseEntity<?> getListMedicalService(@RequestParam(value = "name", required = false) String name) throws Exception {
        return ResponseEntity.ok(service.getListMedicalService(name));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getMedicalServiceById(@PathVariable Long id) throws Exception{
        return ResponseEntity.ok(service.getMedicalServiceById(id));
    }

    @PostMapping
    public ResponseEntity<?> createMedicalService(@RequestBody CreateMedicalServiceRequest request) {
        return ResponseEntity.ok(service.createMedicalService(request));
    }
}
