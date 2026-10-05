package vn.namluongson.datlichkhambenhv.config.security;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import vn.namluongson.datlichkhambenhv.domain.entities.User;
import vn.namluongson.datlichkhambenhv.domain.enums.Role;
import vn.namluongson.datlichkhambenhv.repository.user.UserRepository;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class AdminBootstrap implements ApplicationRunner {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.bootstrap.admin-email}")
    private String adminEmail;
    @Value("${app.bootstrap.admin-phone}")
    private String adminPhone;
    @Value("${app.bootstrap.admin-password}")
    private String adminPassword;

    @Override
    public void run(ApplicationArguments args){
        if(userRepository.existsByRole((short) Role.ADMIN.getCode())) {
            return;
        }
        if(adminEmail.isBlank() || adminPassword.length() < 8 || adminPhone.isBlank()) {
            log.warn("Chua cau hinh admin hoac mk qua ngan, bo qua viec tao admin");
            return;
        }

        String email = adminEmail.trim().toLowerCase();
        String phone = adminPhone.trim();

        if(userRepository.existsByPhone(phone) || userRepository.existsByEmailIgnoreCase(email)) {
            log.warn("Tai khoan da ton tai, bo qua");
            return;
        }

        User user = new User();
        user.setFullName("Admin");
        user.setEmail(email);
        user.setPhone(phone);
        user.setPasswordHash(passwordEncoder.encode(adminPassword));
        user.setRole((short) Role.ADMIN.getCode());
        user.setStatus((short) 0);
        user.setUuid(UUID.randomUUID().toString());
        user.setCreatedAt(LocalDateTime.now(ZoneId.of("Asia/Ho_Chi_Minh")));
        userRepository.save(user);
        log.info("Tao admin thanh cong: {}", email);
    }
}
