package vn.namluongson.datlichkhambenhv.domain.dtos.responses.doctor;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DoctorResponse {
    private String uuid;

    private String fullName;

    private String departmentName;

    private Long yearsExperience;

    private String bio;
}
