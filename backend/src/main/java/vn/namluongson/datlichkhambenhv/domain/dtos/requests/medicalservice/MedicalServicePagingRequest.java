package vn.namluongson.datlichkhambenhv.domain.dtos.requests.medicalservice;

import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import vn.namluongson.datlichkhambenhv.domain.dtos.requests.BasePagingRequest;

@Getter
@Setter
public class MedicalServicePagingRequest extends BasePagingRequest {
    @Size(max = 150, message = "Từ khóa tìm kiếm không được vượt quá 150 ký tự")
    private String name;
}
