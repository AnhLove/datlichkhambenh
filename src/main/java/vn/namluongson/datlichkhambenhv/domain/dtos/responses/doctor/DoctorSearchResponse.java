package vn.namluongson.datlichkhambenhv.domain.dtos.responses.doctor;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DoctorSearchResponse {
    private Long id;
    private String departmentName;
    private String fullName;
    private Long yearsExperience;
    private String bio;
}
