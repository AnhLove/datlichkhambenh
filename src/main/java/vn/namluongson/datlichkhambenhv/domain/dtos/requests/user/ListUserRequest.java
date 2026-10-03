package vn.namluongson.datlichkhambenhv.domain.dtos.requests.user;

import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ListUserRequest {
    @Size(max = 150, message = "Từ khóa tìm kiếm không được vượt quá 150 ký tự")
    private String fullName;
}