package vn.namluongson.datlichkhambenhv.domain.dtos.requests.department;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateDepartmentRequest {
    private Long id;

    private String name;

    private String description;
}
