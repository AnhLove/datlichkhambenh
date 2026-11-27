package vn.namluongson.datlichkhambenhv.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import vn.namluongson.datlichkhambenhv.config.security.CustomUserDetails;
import vn.namluongson.datlichkhambenhv.domain.dtos.requests.user.ChangePasswordRequest;
import vn.namluongson.datlichkhambenhv.domain.dtos.requests.user.UpdateMyProfileRequest;
import vn.namluongson.datlichkhambenhv.service.interfaces.IUserService;

@RestController
@RequestMapping("/me")
@RequiredArgsConstructor
public class MeController {

    private final IUserService userService;

    @GetMapping
    public ResponseEntity<?> getCurrentUser(@AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(userService.getCurrentUser(userDetails.getUser().getUuid()));
    }

    @PutMapping
    public ResponseEntity<?> updateMyProfile(@Valid @RequestBody UpdateMyProfileRequest request, @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(userService.updateMyProfile(request, userDetails.getUser().getUuid()));
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@Valid @RequestBody ChangePasswordRequest request, @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(userService.changePassword(request, userDetails.getUser().getUuid()));
    }
}