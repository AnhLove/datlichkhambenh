package vn.namluongson.datlichkhambenhv.service.interfaces;

import vn.namluongson.datlichkhambenhv.domain.dtos.requests.auth.LoginRequest;
import vn.namluongson.datlichkhambenhv.domain.response.ApiResponse;

public interface IAuthService {
    ApiResponse login(LoginRequest request);
}
