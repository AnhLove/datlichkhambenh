package vn.namluongson.datlichkhambenhv.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.*;
import vn.namluongson.datlichkhambenhv.config.security.AuthCookieService;
import vn.namluongson.datlichkhambenhv.domain.dtos.requests.auth.LoginRequest;
import vn.namluongson.datlichkhambenhv.domain.dtos.requests.user.CreateUserRequest;
import vn.namluongson.datlichkhambenhv.domain.dtos.responses.auth.LoginResult;
import vn.namluongson.datlichkhambenhv.domain.response.ApiResponse;
import vn.namluongson.datlichkhambenhv.service.interfaces.IAuthService;
import vn.namluongson.datlichkhambenhv.service.interfaces.IUserService;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {
    private final IAuthService authService;
    private final IUserService userService;
    private final AuthCookieService authCookieService;

    @GetMapping("/csrf")
    public ResponseEntity<Void> csrf(CsrfToken csrfToken) {
        csrfToken.getToken();
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse> login(@Valid @RequestBody LoginRequest request) {
        LoginResult result = authService.login(request);
        ResponseCookie cookie = authCookieService.createAccessTokenCookie(result.token());
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(new ApiResponse(200, "Đăng nhập thành công", null));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody CreateUserRequest request) {
        return ResponseEntity.ok(userService.createUser(request));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse> logout() {
        ResponseCookie cookie = authCookieService.clearAccessTokenCookie();
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(new ApiResponse(200, "Đăng xuất thành công", null));
    }
}