package vn.namluongson.datlichkhambenhv.domain.dtos.requests.medicalservice;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateMedicalServiceRequest {
    private Long departmentId;
    private String name;
    private Long price;
    private String description;
}
