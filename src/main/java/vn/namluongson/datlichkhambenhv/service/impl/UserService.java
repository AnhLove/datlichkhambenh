package vn.namluongson.datlichkhambenhv.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import vn.namluongson.datlichkhambenhv.domain.dtos.requests.user.CreateUserRequest;
import vn.namluongson.datlichkhambenhv.domain.dtos.requests.user.ListUserRequest;
import vn.namluongson.datlichkhambenhv.domain.dtos.requests.user.UpdateUserRequest;
import vn.namluongson.datlichkhambenhv.domain.dtos.responses.user.UserResponse;
import vn.namluongson.datlichkhambenhv.domain.entities.User;
import vn.namluongson.datlichkhambenhv.domain.response.ApiResponse;
import vn.namluongson.datlichkhambenhv.repository.UserRepository;
import vn.namluongson.datlichkhambenhv.service.interfaces.IUserService;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService implements IUserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public ApiResponse createUser(CreateUserRequest createUserRequest) {
        var user =  new User();
        user.setFullName(createUserRequest.getFullName());
        user.setPhone(createUserRequest.getPhone());
        user.setEmail(createUserRequest.getEmail());
        user.setDateOfBirth(createUserRequest.getDateOfBirth());

        String rawPassword = createUserRequest.getPassword();
        String hashedPassword = passwordEncoder.encode(rawPassword);
        user.setPasswordHash(hashedPassword);

        user.setRole((short) 1);
        user.setStatus((short) 0);
        user.setCreatedAt(LocalDateTime.now());

        userRepository.save(user);
        return new ApiResponse(200, null, user.getId());
    }

    public ApiResponse updateUser(UpdateUserRequest updateUserRequest) throws Exception {
        var entity = userRepository.findById(updateUserRequest.getId()).orElse(null);
        if(entity == null) {
            throw new Exception("User not found");
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
            throw new Exception("User not found");
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
            response.setId(user.getId());
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
