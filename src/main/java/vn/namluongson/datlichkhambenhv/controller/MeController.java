package vn.namluongson.datlichkhambenhv.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
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
}