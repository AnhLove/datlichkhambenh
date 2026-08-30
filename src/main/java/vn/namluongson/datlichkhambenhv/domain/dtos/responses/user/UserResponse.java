package vn.namluongson.datlichkhambenhv.domain.dtos.responses.user;

import lombok.Getter;
import lombok.Setter;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
public class UserResponse {
    private Long id;
    private String fullName;
    private String phone;
    private String email;
    private LocalDate dateOfBirth;
    private Short role;
    private Short status;
    private LocalDateTime createdAt;
}