package vn.namluongson.datlichkhambenhv.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.namluongson.datlichkhambenhv.domain.dtos.requests.user.CreateStaffRequest;
import vn.namluongson.datlichkhambenhv.service.interfaces.IUserService;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminController {
    private final IUserService userService;

    @PostMapping("/staff")
    public ResponseEntity<?> createStaff(@Valid @RequestBody CreateStaffRequest request) {
        return ResponseEntity.ok(userService.createStaff(request));
    }
}
