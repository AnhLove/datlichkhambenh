package vn.namluongson.datlichkhambenhv.domain.dtos.requests.user;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class CreateUserRequest {
    private String fullName;

    private String phone;

    private String email;

    private String password;

    private LocalDate dateOfBirth;
}
