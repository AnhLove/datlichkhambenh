package vn.namluongson.datlichkhambenhv.service.impl;

import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.namluongson.datlichkhambenhv.config.security.CustomUserDetails;
import vn.namluongson.datlichkhambenhv.domain.dtos.requests.user.*;
import vn.namluongson.datlichkhambenhv.domain.dtos.responses.user.UserResponse;
import vn.namluongson.datlichkhambenhv.domain.entities.User;
import vn.namluongson.datlichkhambenhv.domain.enums.Role;
import vn.namluongson.datlichkhambenhv.domain.enums.UserStatus;
import vn.namluongson.datlichkhambenhv.domain.response.ApiResponse;
import vn.namluongson.datlichkhambenhv.domain.response.PageResponse;
import vn.namluongson.datlichkhambenhv.exception.BusinessException;
import vn.namluongson.datlichkhambenhv.repository.user.UserRepository;
import vn.namluongson.datlichkhambenhv.service.interfaces.IUserService;
import vn.namluongson.datlichkhambenhv.util.LikeUtils;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService implements IUserService {
    private static final ZoneId VN_ZONE = ZoneId.of("Asia/Ho_Chi_Minh");
    private static final int AUTOCOMPLETE_LIMIT = 20;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public ApiResponse createUser(CreateUserRequest createUserRequest) {
        User user = createAccount(createUserRequest.getFullName(), createUserRequest.getPhone(), createUserRequest.getEmail(), createUserRequest.getPassword(), createUserRequest.getDateOfBirth(), Role.PATIENT);
        return new ApiResponse(200, "Đăng ký thành công", user.getUuid());
    }

    @Override
    public ApiResponse createStaff(CreateStaffRequest request) {
        User user = createAccount(request.getFullName(), request.getPhone(), request.getEmail(), request.getPassword(), request.getDateOfBirth(), Role.STAFF);
        return new ApiResponse(200, "Tạo tài khoản lễ tân thành công", user.getUuid());
    }

    private User createAccount(String fullName, String phone, String email, String rawPassword, LocalDate dateOfBirth, Role role) {
        String normalizedEmail = email.trim().toLowerCase();
        String normalizedPhone = phone.trim();

        if (userRepository.existsByPhone(normalizedPhone)) {
            throw BusinessException.conflict("Số điện thoại đã được sử dụng");
        }
        if (userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            throw BusinessException.conflict("Email đã được sử dụng");
        }

        var user = new User();
        user.setFullName(fullName.trim());
        user.setPhone(normalizedPhone);
        user.setEmail(normalizedEmail);
        user.setPasswordHash(passwordEncoder.encode(rawPassword));
        user.setDateOfBirth(dateOfBirth);

        user.setRole((short) role.getCode());
        user.setStatus((short) 0);
        user.setCreatedAt(LocalDateTime.now(VN_ZONE));
        user.setUuid(UUID.randomUUID().toString());

        return userRepository.save(user);
    }

    @Override
    @Transactional
    public ApiResponse updateUser(UpdateUserRequest request) {
        var entity = userRepository.findByUuid(request.getUuid());
        if (entity == null) {
            throw BusinessException.notFound("User not found");
        }

        String email = request.getEmail().trim().toLowerCase();
        String phone = request.getPhone().trim();

        if (userRepository.existsByPhoneAndIdNot(phone, entity.getId())) {
            throw BusinessException.conflict("Số điện thoại đã được sử dụng");
        }
        if (userRepository.existsByEmailIgnoreCaseAndIdNot(email, entity.getId())) {
            throw BusinessException.conflict("Email đã được sử dụng");
        }

        entity.setFullName(request.getFullName().trim());
        entity.setPhone(phone);
        entity.setEmail(email);
        entity.setDateOfBirth(request.getDateOfBirth());

        if (request.getPassword() != null) {
            entity.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        }

        userRepository.save(entity);
        return new ApiResponse(200, null, entity.getUuid());
    }

    @Override
    @Transactional
    public ApiResponse deleteUser(String uuid) {
        var entity = userRepository.findByUuid(uuid);
        if (entity == null) {
            throw BusinessException.notFound("User not found");
        }

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (entity.getEmail() != null && authentication != null && entity.getEmail().equalsIgnoreCase(authentication.getName())) {
            throw BusinessException.badRequest("Khong the tu xoa tai khoan cua minh");
        }
        if (entity.getRole() == Role.ADMIN.getCode()) {
            throw BusinessException.forbidden("Khong the xoa tai khoan quan tri vien");
        }

        try {
            userRepository.delete(entity);
            userRepository.flush();
        } catch (DataIntegrityViolationException e) {
            throw BusinessException.conflict("Tai khoan da co du lieu lien quan, hay khoa tai khoan thay vi xoa");
        }
        return new ApiResponse(200, null, uuid);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<UserResponse> getListUsers(UserPagingRequest request) {
        Short role = request.getRole();
        if (currentRole() == Role.STAFF.getCode()) {
            role = (short) Role.PATIENT.getCode();
        }

        Specification<User> spec = buildSpec(request.getFullName(), request.getPhone(), request.getEmail(), role, request.getStatus());
        Pageable pageable = request.toPageable(Sort.by(Sort.Direction.DESC, "createdAt").and(Sort.by(Sort.Direction.DESC, "id")));
        return PageResponse.of(userRepository.findAll(spec, pageable).map(this::toUserResponse));
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getUserByUuid(String uuid) {
        var data = userRepository.findByUuid(uuid);
        if (data == null) {
            throw BusinessException.notFound("User not found");
        }
        if (currentRole() == Role.STAFF.getCode() && data.getRole() != Role.PATIENT.getCode()) {
            throw BusinessException.forbidden("Khong co quyen xem tai khoan nay");
        }
        return toUserResponse(data);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserResponse> getListUserByName(String name) {
        Short role = currentRole() == Role.STAFF.getCode() ? (short) Role.PATIENT.getCode() : null;
        Specification<User> spec = buildSpec(name, null, null, role, (short) UserStatus.ACTIVE.getCode());
        Pageable pageable = PageRequest.of(0, AUTOCOMPLETE_LIMIT, Sort.by("fullName").and(Sort.by("id")));
        return userRepository.findAll(spec, pageable).stream().map(this::toUserResponse).toList();
    }

    @Override
    public UserResponse getCurrentUserByEmail(String email) {
        User user = userRepository.findByEmailIgnoreCase(email);

        if (user == null) {
            throw BusinessException.notFound("User not found");
        }

        return toUserResponse(user);
    }

    @Override
    public UserResponse getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        String email = authentication.getName();

        return getCurrentUserByEmail(email);
    }

    @Override
    public UserResponse updateMyProfile(UpdateMyProfileRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        User user = userRepository.findByEmailIgnoreCase(email);

        if (user == null) {
            throw BusinessException.notFound("Không tìm thấy tài khoản");
        }

        String normalizedPhone = request.getPhone().trim();

        if (userRepository.existsByPhoneAndIdNot(normalizedPhone, user.getId())) {
            throw BusinessException.conflict("Số điện thoại đã được sử dụng");
        }

        user.setFullName(request.getFullName().trim());
        user.setPhone(normalizedPhone);

        if (request.getDateOfBirth() != null) {
            user.setDateOfBirth(request.getDateOfBirth());
        }
        userRepository.save(user);
        return getCurrentUserByEmail(user.getEmail());
    }

    @Override
    public ApiResponse updateUserStatus(String uuid, UpdateUserStatusRequest request) {
        User target = userRepository.findByUuid(uuid);
        if (target == null) {
            throw BusinessException.notFound("Khong tim thay tai khoan");
        }

        UserStatus newStatus;
        try {
            newStatus = UserStatus.fromCode(request.getStatus());
        } catch (IllegalArgumentException e) {
            throw BusinessException.badRequest("Trang thai khong hop le");
        }

        if (newStatus == UserStatus.LOCKED) {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (target.getEmail() != null && target.getEmail().equalsIgnoreCase(authentication.getName())) {
                throw BusinessException.badRequest("Khong the tu khoa tai khoan cua minh");
            }
            if (target.getRole() == Role.ADMIN.getCode()) {
                throw BusinessException.forbidden("Khong the khoa tai khoan quan tri vien");
            }
        }

        target.setStatus((short) newStatus.getCode());
        userRepository.save(target);

        String message = newStatus == UserStatus.LOCKED ? "Da khoa tai khoan" : "Da mo khoa tai khoan";
        return new ApiResponse(200, message, uuid);
    }

    @Override
    public ApiResponse changePassword(ChangePasswordRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        User user = userRepository.findByEmailIgnoreCase(email);
        if (user == null) {
            throw BusinessException.notFound("Không tìm thấy tài khoản");
        }

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw BusinessException.badRequest("Mật khẩu cũ không chính xác");
        }

        if (request.getNewPassword().equals(request.getCurrentPassword())) {
            throw BusinessException.badRequest("Mật khẩu mới không giống mật khẩu cũ");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        return new ApiResponse(200, "Cập nhật mật khẩu thành công", null);
    }

    private int currentRole() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof CustomUserDetails userDetails)) {
            throw BusinessException.unauthorized("Vui lòng đăng nhập");
        }
        return userDetails.getUser().getRole();
    }

    private Specification<User> buildSpec(String fullName, String phone, String email, Short role, Short status) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (hasText(fullName)) {
                predicates.add(cb.like(cb.lower(root.<String>get("fullName")), LikeUtils.contains(fullName), '\\'));
            }
            if (hasText(phone)) {
                predicates.add(cb.like(root.<String>get("phone"), LikeUtils.containsRaw(phone), '\\'));
            }
            if (hasText(email)) {
                predicates.add(cb.like(cb.lower(root.<String>get("email")), LikeUtils.contains(email), '\\'));
            }
            if (role != null) {
                predicates.add(cb.equal(root.get("role"), role));
            }
            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    private boolean hasText(String value) {
        return value != null && !value.trim().isEmpty();
    }

    private UserResponse toUserResponse(User user) {
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
    }
}
