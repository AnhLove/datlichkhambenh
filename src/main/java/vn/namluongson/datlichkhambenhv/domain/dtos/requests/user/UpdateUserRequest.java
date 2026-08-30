package vn.namluongson.datlichkhambenhv.domain.dtos.requests.user;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class UpdateUserRequest {
    private Long id;

    private String fullName;

    private String phone;

    private String email;

    private String password;

    private LocalDate dateOfBirth;
}
