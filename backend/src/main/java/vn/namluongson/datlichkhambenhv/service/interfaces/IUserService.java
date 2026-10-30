package vn.namluongson.datlichkhambenhv.service.interfaces;

import vn.namluongson.datlichkhambenhv.domain.dtos.requests.user.*;
import vn.namluongson.datlichkhambenhv.domain.dtos.responses.user.UserResponse;
import vn.namluongson.datlichkhambenhv.domain.response.ApiResponse;

import java.util.List;

public interface IUserService {
    ApiResponse createUser(CreateUserRequest userRequest);
    ApiResponse createStaff(CreateStaffRequest request);
    ApiResponse updateUser(UpdateUserRequest userRequest) throws Exception;
    ApiResponse deleteUser(Long id) throws Exception;
    List<UserResponse> getListUsers(ListUserRequest request);
    UserResponse getUserByUuid(String uuid) throws Exception;

    List<UserResponse> getListUserByName(String name);
    UserResponse getCurrentUserByEmail(String email);
    UserResponse getCurrentUser();
    UserResponse updateMyProfile(UpdateMyProfileRequest request);
    ApiResponse updateUserStatus(String uuid, UpdateUserStatusRequest request);
    ApiResponse changePassword(ChangePasswordRequest request);
}
