package vn.namluongson.datlichkhambenhv.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.namluongson.datlichkhambenhv.domain.dtos.requests.user.ChangePasswordRequest;
import vn.namluongson.datlichkhambenhv.domain.dtos.requests.user.UpdateMyProfileRequest;
import vn.namluongson.datlichkhambenhv.service.interfaces.IUserService;

@RestController
@RequestMapping("/me")
@RequiredArgsConstructor
public class MeController {

    private final IUserService userService;

    @GetMapping
    public ResponseEntity<?> getCurrentUser() {
        return ResponseEntity.ok(userService.getCurrentUser());
    }

    @PutMapping
    public ResponseEntity<?> updateMyProfile(@Valid @RequestBody UpdateMyProfileRequest request) {
        return ResponseEntity.ok(userService.updateMyProfile(request));
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        return ResponseEntity.ok(userService.changePassword(request));
    }
}