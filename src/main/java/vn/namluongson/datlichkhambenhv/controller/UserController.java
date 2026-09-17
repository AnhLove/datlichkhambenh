package vn.namluongson.datlichkhambenhv.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.data.repository.query.Param;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.namluongson.datlichkhambenhv.domain.dtos.requests.user.CreateUserRequest;
import vn.namluongson.datlichkhambenhv.domain.dtos.requests.user.ListUserRequest;
import vn.namluongson.datlichkhambenhv.domain.dtos.requests.user.UpdateUserRequest;
import vn.namluongson.datlichkhambenhv.service.interfaces.IUserService;

@RestController
@RequiredArgsConstructor
@RequestMapping("/user")
public class UserController {
    private final IUserService iUserService;

    @PostMapping
    public ResponseEntity<?> createUser(@RequestBody CreateUserRequest createUserRequest) {
        return ResponseEntity.ok(iUserService.createUser(createUserRequest));
    }

    @PutMapping
    public ResponseEntity<?> updateUser(@RequestBody UpdateUserRequest updateUserRequest) throws Exception {
        return ResponseEntity.ok(iUserService.updateUser(updateUserRequest));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable("id") Long id) throws Exception {
        return ResponseEntity.ok(iUserService.deleteUser(id));
    }

    @GetMapping("/list")
    public ResponseEntity<?> getListUsers(ListUserRequest request) {
        return ResponseEntity.ok(iUserService.getListUsers(request));
    }

    @GetMapping("/{uuid}")
    public ResponseEntity<?> getUser(@PathVariable("uuid") String uuid) throws Exception {
        return ResponseEntity.ok(iUserService.getUserByUuid(uuid));
    }

    @GetMapping("/get-list-by-name")
    public ResponseEntity<?> getListUserByName(@Param("name") String name) {
        return ResponseEntity.ok(iUserService.getListUserByName(name));
    }
}
