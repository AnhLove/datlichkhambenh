package vn.namluongson.datlichkhambenhv.domain.dtos.requests.department;

import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ListDepartmentRequest {

    @Size(max = 100, message = "Từ khóa tìm kiếm không được vượt quá 100 ký tự")
    private String name;
}