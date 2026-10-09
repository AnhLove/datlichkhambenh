package vn.namluongson.datlichkhambenhv.domain.dtos.requests.appointmentservice;

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
    private Long quantity;
}