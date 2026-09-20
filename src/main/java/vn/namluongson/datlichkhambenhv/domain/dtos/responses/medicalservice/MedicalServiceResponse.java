package vn.namluongson.datlichkhambenhv.domain.dtos.responses.medicalservice;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MedicalServiceResponse {
    private String departmentName;
    private String name;
    private Long price;
    private String description;
}
