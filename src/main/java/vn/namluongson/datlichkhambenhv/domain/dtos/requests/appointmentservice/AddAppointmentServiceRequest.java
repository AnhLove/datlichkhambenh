package vn.namluongson.datlichkhambenhv.domain.dtos.requests.appointmentservice;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AddAppointmentServiceRequest {

    @NotNull(message = "Vui lòng chọn lịch hẹn")
    private Long appointmentId;

    @NotNull(message = "Vui lòng chọn dịch vụ")
    private Long serviceId;

    @NotNull(message = "Vui lòng nhập số lượng")
    @Min(value = 1, message = "Số lượng phải lớn hơn hoặc bằng 1")
    @Max(value = 1000, message = "Số lượng không được vượt quá 1000")
    private Long quantity;
}
