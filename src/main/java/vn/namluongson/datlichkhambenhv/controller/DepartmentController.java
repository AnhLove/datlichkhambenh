package vn.namluongson.datlichkhambenhv.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.repository.query.Param;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.namluongson.datlichkhambenhv.domain.dtos.requests.department.CreateDepartmentRequest;
import vn.namluongson.datlichkhambenhv.domain.dtos.requests.department.DepartmentPagingRequest;
import vn.namluongson.datlichkhambenhv.domain.dtos.requests.department.UpdateDepartmentRequest;
import vn.namluongson.datlichkhambenhv.service.interfaces.IDepartmentService;

@RestController
@RequiredArgsConstructor
@RequestMapping("/department")
public class DepartmentController {
    private final IDepartmentService iDepartmentService;

    @PostMapping
    public ResponseEntity<?> createDepartment(@RequestBody CreateDepartmentRequest request) {
        return ResponseEntity.ok(iDepartmentService.createDepartment(request));
    }

    @PutMapping
    public ResponseEntity<?> updateDepartment(@RequestBody UpdateDepartmentRequest request) throws Exception {
        return ResponseEntity.ok(iDepartmentService.updateDepartment(request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDepartment(@PathVariable("id") Long id) throws Exception {
        return ResponseEntity.ok(iDepartmentService.deleteDepartment(id));
    }

    @DeleteMapping("/param")
    public ResponseEntity<?> deleteParam(@RequestParam("id") Long id) throws Exception {
        return ResponseEntity.ok(iDepartmentService.deleteDepartment(id));
    }

    @GetMapping("/paging")
    public ResponseEntity<?> getDepartments(@Valid DepartmentPagingRequest request) {
        return ResponseEntity.ok(iDepartmentService.getDepartments(request));
    }
}
