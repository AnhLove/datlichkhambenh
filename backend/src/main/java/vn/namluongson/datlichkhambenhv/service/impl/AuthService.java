package vn.namluongson.datlichkhambenhv.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import vn.namluongson.datlichkhambenhv.config.security.CustomUserDetails;
import vn.namluongson.datlichkhambenhv.config.security.JwtTokenProvider;
import vn.namluongson.datlichkhambenhv.domain.dtos.requests.auth.LoginRequest;
import vn.namluongson.datlichkhambenhv.domain.dtos.responses.auth.LoginResult;
import vn.namluongson.datlichkhambenhv.service.interfaces.IAuthService;

@Service
@RequiredArgsConstructor
public class AuthService implements IAuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;

    @Override
    public LoginResult login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate( new UsernamePasswordAuthenticationToken( request.getEmail(), request.getPassword()));
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        String token = jwtTokenProvider.generateToken(userDetails);
        return new LoginResult(token);
    }
}