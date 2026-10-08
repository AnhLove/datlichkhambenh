package vn.namluongson.datlichkhambenhv.domain.dtos.requests.appointment;

import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CancelAppointmentRequest {
    @Size(max = 500, message = "Lý do khám không được vượt quá 500 ký tự")
    private String cancelReason;
}
