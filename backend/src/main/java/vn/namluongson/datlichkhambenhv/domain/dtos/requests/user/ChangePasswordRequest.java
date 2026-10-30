package vn.namluongson.datlichkhambenhv.domain.dtos.requests.user;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ChangePasswordRequest {
    @NotBlank(message = "Không được để trống")
    private String currentPassword;
    @NotBlank(message = "Không được để trống")
    @Size(min = 8, max = 72)
    private String newPassword;
}
