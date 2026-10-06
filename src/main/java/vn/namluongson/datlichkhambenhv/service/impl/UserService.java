package vn.namluongson.datlichkhambenhv.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import vn.namluongson.datlichkhambenhv.domain.dtos.requests.user.CreateUserRequest;
import vn.namluongson.datlichkhambenhv.domain.dtos.requests.user.ListUserRequest;
import vn.namluongson.datlichkhambenhv.domain.dtos.requests.user.UpdateUserRequest;
import vn.namluongson.datlichkhambenhv.domain.dtos.responses.user.UserResponse;
import vn.namluongson.datlichkhambenhv.domain.entities.User;
import vn.namluongson.datlichkhambenhv.domain.enums.Role;
import vn.namluongson.datlichkhambenhv.domain.response.ApiResponse;
import vn.namluongson.datlichkhambenhv.exception.BusinessException;
import vn.namluongson.datlichkhambenhv.repository.user.UserRepository;
import vn.namluongson.datlichkhambenhv.service.interfaces.IUserService;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService implements IUserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public ApiResponse createUser(CreateUserRequest createUserRequest) {
        String email = createUserRequest.getEmail().trim().toLowerCase();
        String phone = createUserRequest.getPhone().trim();

        if (userRepository.existsByPhone(phone)) {
            throw BusinessException.conflict("Số điện thoại đã được sử dụng");
        }
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw BusinessException.conflict("Email đã được sử dụng");
        }

        var user = new User();
        user.setFullName(createUserRequest.getFullName().trim());
        user.setPhone(phone);
        user.setEmail(email);
        user.setDateOfBirth(createUserRequest.getDateOfBirth());
        user.setPasswordHash(passwordEncoder.encode(createUserRequest.getPassword()));

        user.setRole((short) Role.PATIENT.getCode());
        user.setStatus((short) 0);
        user.setCreatedAt(LocalDateTime.now(ZoneId.of("Asia/Ho_Chi_Minh")));
        user.setUuid(UUID.randomUUID().toString());

        userRepository.save(user);
        return new ApiResponse(200, "Đăng ký thành công", user.getUuid());
    }

    public ApiResponse updateUser(UpdateUserRequest updateUserRequest) throws Exception {
        var entity = userRepository.findById(updateUserRequest.getId()).orElse(null);
        if(entity == null) {
            throw BusinessException.notFound("User not found");
        }

        entity.setFullName(updateUserRequest.getFullName());
        entity.setPhone(updateUserRequest.getPhone());
        entity.setEmail(updateUserRequest.getEmail());
        entity.setDateOfBirth(updateUserRequest.getDateOfBirth());

        if(updateUserRequest.getPassword() != null) {
            String hashedPassword = passwordEncoder.encode(updateUserRequest.getPassword());
            entity.setPasswordHash(hashedPassword);
        }

        userRepository.save(entity);
        return new ApiResponse(200, null, entity.getId());
    }

    public ApiResponse deleteUser(Long id) throws Exception{
        var entity = userRepository.findById(id).orElse(null);
        if (entity == null) {
            throw BusinessException.notFound("User not found");
        }

        userRepository.deleteById(id);
        return new ApiResponse(200, null, entity.getId());
    }

    @Override
    public List<UserResponse> getListUsers(ListUserRequest request) {
        List<User> users;

        if (request != null && request.getFullName() != null && !request.getFullName().trim().isEmpty()) {
            users = userRepository.findByFullNameContainingIgnoreCase(request.getFullName().trim());
        } else {
            users = userRepository.findAll();
        }

        return users.stream().map(user -> {
            UserResponse response = new UserResponse();
            response.setUuid(user.getUuid());
            response.setFullName(user.getFullName());
            response.setPhone(user.getPhone());
            response.setEmail(user.getEmail());
            response.setDateOfBirth(user.getDateOfBirth());
            response.setRole(user.getRole());
            response.setStatus(user.getStatus());
            response.setCreatedAt(user.getCreatedAt());
            return response;
        }).toList();
    }

    @Override
    public UserResponse getUserByUuid(String uuid) throws Exception {
        var data = userRepository.findByUuid(uuid);
        if(data == null) {
            throw BusinessException.notFound("User not found");
        }

        UserResponse response = new UserResponse();
        response.setUuid(data.getUuid());
        response.setFullName(data.getFullName());
        response.setEmail(data.getEmail());
        response.setPhone(data.getPhone());
        response.setDateOfBirth(data.getDateOfBirth());
        response.setRole(data.getRole());
        response.setStatus(data.getStatus());
        response.setCreatedAt(data.getCreatedAt());

        return response;
    }

    @Override
    public List<UserResponse> getListUserByName(String name) {
        List<User> users;
        if(name != null) {
            users = userRepository.getListUserByName(name.trim());
        }else {
            users = userRepository.findAll();
        }
        return users.stream().map(user -> {
            UserResponse response = new UserResponse();
            response.setUuid(user.getUuid());
            response.setFullName(user.getFullName());
            response.setPhone(user.getPhone());
            response.setEmail(user.getEmail());
            response.setDateOfBirth(user.getDateOfBirth());
            response.setRole(user.getRole());
            response.setStatus(user.getStatus());
            response.setCreatedAt(user.getCreatedAt());
            return response;
        }).toList();
    }
}
