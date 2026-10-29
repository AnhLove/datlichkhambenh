package vn.namluongson.datlichkhambenhv.config.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

import java.time.Duration;

@Component
public class AuthCookieService {

    @Value("${jwt.expiration}")
    private long jwtExpirationMs;

    @Value("${app.auth.cookie-secure:false}")
    private boolean cookieSecure;

    @Value("${app.auth.cookie-same-site:Lax}")
    private String cookieSameSite;

    public ResponseCookie createAccessTokenCookie(String token) {
        return ResponseCookie.from("access_token", token)
                .httpOnly(true)
                .secure(cookieSecure)
                .path("/")
                .maxAge(Duration.ofMillis(jwtExpirationMs))
                .sameSite(cookieSameSite)
                .build();
    }

    public ResponseCookie clearAccessTokenCookie() {
        return ResponseCookie.from("access_token", "")
                .httpOnly(true)
                .secure(cookieSecure)
                .path("/")
                .maxAge(Duration.ZERO)
                .sameSite(cookieSameSite)
                .build();
    }
}