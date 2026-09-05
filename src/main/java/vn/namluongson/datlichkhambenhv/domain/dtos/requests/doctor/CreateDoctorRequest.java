package vn.namluongson.datlichkhambenhv.domain.dtos.requests.doctor;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateDoctorRequest {
    private String fullName;

    private String phone;

    private String email;

    private String password;

    private Long departmentId;

    private Long yearsExperience;

    private String bio;
}
