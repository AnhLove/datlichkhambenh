package vn.namluongson.datlichkhambenhv.controller;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
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
    public ResponseEntity<?> deleteUser(@PathVariable("uuid") @Size(max = 36) String uuid) {
        return ResponseEntity.ok(iUserService.deleteUser(uuid));
    }

    @GetMapping("/list")
    public ResponseEntity<?> getListUsers(@Valid UserPagingRequest request) {
        return ResponseEntity.ok(iUserService.getListUsers(request));
    }

    @GetMapping("/{uuid}")
    public ResponseEntity<?> getUser(@PathVariable("uuid") @Size(max = 36) String uuid) {
        return ResponseEntity.ok(iUserService.getUserByUuid(uuid));
    }

    @GetMapping("/get-list-by-name")
    public ResponseEntity<?> getListUserByName(@RequestParam(value = "name", required = false) @Size(max = 150) String name) {
        return ResponseEntity.ok(iUserService.getListUserByName(name));
    }

    @PatchMapping("/{uuid}/status")
    public ResponseEntity<?> updateUserStatus(@PathVariable @Size(max = 36) String uuid, @Valid @RequestBody UpdateUserStatusRequest request) {
        return ResponseEntity.ok(iUserService.updateUserStatus(uuid, request));
    }
}
