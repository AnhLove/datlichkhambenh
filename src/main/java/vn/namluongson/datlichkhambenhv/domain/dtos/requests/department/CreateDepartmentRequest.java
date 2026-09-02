package vn.namluongson.datlichkhambenhv.domain.dtos.requests.department;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateDepartmentRequest {
    @NotBlank(message = "Tên khoa không được để trống")
    private String name;

    private String description;
}
