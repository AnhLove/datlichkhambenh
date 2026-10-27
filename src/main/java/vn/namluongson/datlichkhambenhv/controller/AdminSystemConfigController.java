package vn.namluongson.datlichkhambenhv.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.namluongson.datlichkhambenhv.domain.dtos.requests.systemconfig.SystemConfigRequest;
import vn.namluongson.datlichkhambenhv.service.interfaces.ISystemConfigService;

@RestController
@RequestMapping("/admin/configs")
@RequiredArgsConstructor
public class AdminSystemConfigController {

    private final ISystemConfigService systemConfigService;

    @GetMapping
    public ResponseEntity<?> getAll() {
        return ResponseEntity.ok(systemConfigService.getAll());
    }

    @PostMapping
    public ResponseEntity<?> create(@Valid @RequestBody SystemConfigRequest request) {
        return ResponseEntity.ok(systemConfigService.create(request));
    }

    @PutMapping("/{key}")
    public ResponseEntity<?> update(@PathVariable String key, @Valid @RequestBody SystemConfigRequest request) {
        return ResponseEntity.ok(systemConfigService.update(key, request));
    }

    @DeleteMapping("/{key}")
    public ResponseEntity<?> delete(@PathVariable String key) {
        return ResponseEntity.ok(systemConfigService.delete(key));
    }
}
