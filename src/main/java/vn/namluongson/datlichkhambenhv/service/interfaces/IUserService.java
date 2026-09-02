package vn.namluongson.datlichkhambenhv.service.interfaces;

import vn.namluongson.datlichkhambenhv.domain.dtos.requests.user.CreateUserRequest;
import vn.namluongson.datlichkhambenhv.domain.dtos.requests.user.ListUserRequest;
import vn.namluongson.datlichkhambenhv.domain.dtos.requests.user.UpdateUserRequest;
import vn.namluongson.datlichkhambenhv.domain.dtos.responses.user.UserResponse;
import vn.namluongson.datlichkhambenhv.domain.response.ApiResponse;

import java.util.List;

public interface IUserService {
    ApiResponse createUser(CreateUserRequest userRequest);
    ApiResponse updateUser(UpdateUserRequest userRequest) throws Exception;
    ApiResponse deleteUser(Long id) throws Exception;
    List<UserResponse> getListUsers(ListUserRequest request);
    UserResponse getUserByUuid(String uuid) throws Exception;
}
