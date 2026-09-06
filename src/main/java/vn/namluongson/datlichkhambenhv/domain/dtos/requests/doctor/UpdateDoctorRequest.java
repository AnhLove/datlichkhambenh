package vn.namluongson.datlichkhambenhv.domain.dtos.requests.doctor;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateDoctorRequest {
    private String uuid;
    private String fullName;
    private String phone;
    private String email;
    private Long departmentId;
    private Long yearsExperience;
    private String bio;
}
