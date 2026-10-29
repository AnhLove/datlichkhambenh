package vn.namluongson.datlichkhambenhv.service.interfaces;

import vn.namluongson.datlichkhambenhv.domain.dtos.requests.auth.LoginRequest;
import vn.namluongson.datlichkhambenhv.domain.dtos.responses.auth.LoginResult;

public interface IAuthService {
    LoginResult login(LoginRequest request);
}