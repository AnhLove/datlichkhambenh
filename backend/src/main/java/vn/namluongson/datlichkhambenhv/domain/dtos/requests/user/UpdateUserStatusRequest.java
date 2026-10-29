package vn.namluongson.datlichkhambenhv.domain.dtos.requests.user;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateUserStatusRequest {
    @NotNull(message = "Trang thai khong duoc de trong")
    private Integer status; 
}