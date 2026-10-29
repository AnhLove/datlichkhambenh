package vn.namluongson.datlichkhambenhv.domain.dtos.requests.user;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserPagingRequest {

    @Size(max = 150, message = "Từ khóa tìm kiếm không được vượt quá 150 ký tự")
    private String fullName;

    @Size(max = 15, message = "Số điện thoại tìm kiếm không được vượt quá 15 ký tự")
    private String phone;

    @Size(max = 150, message = "Email tìm kiếm không được vượt quá 150 ký tự")
    private String email;

    @Min(value = 1, message = "Vai trò không hợp lệ")
    @Max(value = 4, message = "Vai trò không hợp lệ")
    private Short role;

    @Min(value = 0, message = "Trạng thái không hợp lệ")
    @Max(value = 1, message = "Trạng thái không hợp lệ")
    private Short status;
}