package vn.namluongson.datlichkhambenhv.service.interfaces;

import vn.namluongson.datlichkhambenhv.domain.dtos.requests.user.*;
import vn.namluongson.datlichkhambenhv.domain.dtos.responses.user.UserResponse;
import vn.namluongson.datlichkhambenhv.domain.response.ApiResponse;
import vn.namluongson.datlichkhambenhv.domain.response.PageResponse;

import java.util.List;

public interface IUserService {
    ApiResponse createUser(CreateUserRequest userRequest);
    ApiResponse createStaff(CreateStaffRequest request);
    ApiResponse updateUser(UpdateUserRequest userRequest);
    ApiResponse deleteUser(String uuid, String currentUserUuid);
    PageResponse<UserResponse> getListUsers(UserPagingRequest request, String currentUserUuid);
    UserResponse getUserByUuid(String uuid, String currentUserUuid);

    List<UserResponse> getListUserByName(String name, String currentUserUuid);
    UserResponse getCurrentUserByEmail(String email);
    UserResponse getCurrentUser(String currentUserUuid);
    UserResponse updateMyProfile(UpdateMyProfileRequest request,String currentUserUuid);
    ApiResponse updateUserStatus(String uuid, UpdateUserStatusRequest request, String currentUserUuid);
    ApiResponse changePassword(ChangePasswordRequest request, String currentUserUuid);
}
