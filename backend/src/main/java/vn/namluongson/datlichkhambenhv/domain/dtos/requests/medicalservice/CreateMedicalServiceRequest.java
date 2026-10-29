package vn.namluongson.datlichkhambenhv.domain.dtos.requests.medicalservice;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateMedicalServiceRequest {

    @NotNull(message = "Vui lòng chọn khoa")
    private Long departmentId;

    @NotBlank(message = "Tên dịch vụ không được để trống")
    @Size(max = 150, message = "Tên dịch vụ không được vượt quá 150 ký tự")
    private String name;

    @NotNull(message = "Giá dịch vụ không được để trống")
    @Min(value = 0, message = "Giá dịch vụ không được âm")
    @Max(value = 999999999999L, message = "Giá dịch vụ vượt quá giới hạn cho phép")
    private Long price;

    @Size(max = 500, message = "Mô tả không được vượt quá 500 ký tự")
    private String description;
}