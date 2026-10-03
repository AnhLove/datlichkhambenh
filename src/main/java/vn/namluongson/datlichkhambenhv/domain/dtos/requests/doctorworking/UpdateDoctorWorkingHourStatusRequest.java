package vn.namluongson.datlichkhambenhv.domain.dtos.requests.doctorworking;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateDoctorWorkingHourStatusRequest {
    @NotNull(message = "Trạng thái không được để trống")
    @Min(value = 2, message = "Trạng thái chỉ được là 2 (duyệt) hoặc 3 (từ chối)")
    @Max(value = 3, message = "Trạng thái chỉ được là 2 (duyệt) hoặc 3 (từ chối)")
    private Short status;
}