package vn.namluongson.datlichkhambenhv.domain.dtos.responses.appointment;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EligibleDoctorResponse {

    private String doctorUuid;
    private String doctorName;
    private Long yearsExperience;
    private Integer remainingCapacity;
}