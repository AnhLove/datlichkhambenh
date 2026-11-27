package vn.namluongson.datlichkhambenhv.controller;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import vn.namluongson.datlichkhambenhv.config.security.CustomUserDetails;
import vn.namluongson.datlichkhambenhv.domain.dtos.requests.user.CreateUserRequest;
import vn.namluongson.datlichkhambenhv.domain.dtos.requests.user.UpdateUserRequest;
import vn.namluongson.datlichkhambenhv.domain.dtos.requests.user.UpdateUserStatusRequest;
import vn.namluongson.datlichkhambenhv.domain.dtos.requests.user.UserPagingRequest;
import vn.namluongson.datlichkhambenhv.service.interfaces.IUserService;

@RestController
@RequiredArgsConstructor
@RequestMapping("/user")
@Validated
public class UserController {
    private final IUserService iUserService;

    @PostMapping
    public ResponseEntity<?> createUser(@Valid @RequestBody CreateUserRequest createUserRequest) {
        return ResponseEntity.ok(iUserService.createUser(createUserRequest));
    }

    @PutMapping
    public ResponseEntity<?> updateUser(@Valid @RequestBody UpdateUserRequest updateUserRequest) {
        return ResponseEntity.ok(iUserService.updateUser(updateUserRequest));
    }

    @DeleteMapping("/{uuid}")
    public ResponseEntity<?> deleteUser(@PathVariable("uuid") @Size(max = 36) String uuid, @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(iUserService.deleteUser(uuid, userDetails.getUser().getUuid()));
    }

    @GetMapping("/list")
    public ResponseEntity<?> getListUsers(@Valid UserPagingRequest request, @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(iUserService.getListUsers(request, userDetails.getUser().getUuid()));
    }

    @GetMapping("/{uuid}")
    public ResponseEntity<?> getUser(@PathVariable("uuid") @Size(max = 36) String uuid, @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(iUserService.getUserByUuid(uuid, userDetails.getUser().getUuid()));
    }

    @GetMapping("/get-list-by-name")
    public ResponseEntity<?> getListUserByName(@RequestParam(value = "name", required = false) @Size(max = 150) String name, @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(iUserService.getListUserByName(name, userDetails.getUser().getUuid()));
    }

    @PatchMapping("/{uuid}/status")
    public ResponseEntity<?> updateUserStatus(@PathVariable @Size(max = 36) String uuid, @Valid @RequestBody UpdateUserStatusRequest request, @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(iUserService.updateUserStatus(uuid, request, userDetails.getUser().getUuid()));
    }
}
