package vn.namluongson.datlichkhambenhv.domain.dtos.requests.doctor;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateDoctorRequest {

    @NotBlank(message = "Họ tên không được để trống")
    @Size(max = 150, message = "Họ tên không được vượt quá 150 ký tự")
    private String fullName;

    @NotBlank(message = "Số điện thoại không được để trống")
    @Pattern(regexp = "^(0|\\+84)\\d{9}$", message = "Số điện thoại không đúng định dạng")
    private String phone;

    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không đúng định dạng")
    @Size(max = 150, message = "Email không được vượt quá 150 ký tự")
    private String email;

    @NotBlank(message = "Mật khẩu không được để trống")
    @Size(min = 8, max = 72, message = "Mật khẩu phải từ 8 đến 72 ký tự")
    private String password;

    @NotNull(message = "Vui lòng chọn khoa")
    private Long departmentId;

    @Min(value = 0, message = "Số năm kinh nghiệm không được âm")
    @Max(value = 100, message = "Số năm kinh nghiệm không hợp lệ")
    private Long yearsExperience;

    @Size(max = 1000, message = "Giới thiệu không được vượt quá 1000 ký tự")
    private String bio;
}