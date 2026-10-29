package vn.namluongson.datlichkhambenhv.domain.dtos.requests.systemconfig;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SystemConfigRequest {

    @NotBlank(message = "Khóa cấu hình không được để trống")
    @Size(max = 100, message = "Khóa cấu hình không được vượt quá 100 ký tự")
    @Pattern(regexp = "^[A-Z][A-Z0-9_]*$", message = "Khóa cấu hình chỉ gồm chữ HOA, số và dấu gạch dưới")
    private String configKey;

    @NotBlank(message = "Giá trị cấu hình không được để trống")
    @Size(max = 255, message = "Giá trị cấu hình không được vượt quá 255 ký tự")
    private String configValue;

    @Size(max = 255, message = "Mô tả không được vượt quá 255 ký tự")
    private String description;
}
