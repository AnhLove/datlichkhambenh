package vn.namluongson.datlichkhambenhv.domain.dtos.requests.appointment;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class CreateAppointmentRequest {

    @NotBlank(message = "Vui lòng chọn bác sĩ")
    private String doctorUuid;

    @NotNull(message = "Vui lòng chọn khoa")
    private Long departmentId;

    @NotNull(message = "Vui lòng chọn ngày khám")
    private LocalDate appointmentDate;

    @NotBlank(message = "Vui lòng chọn khung giờ khám")
    private String timeSlot;

    @Size(max = 500, message = "Lý do khám không được vượt quá 500 ký tự")
    private String reason;
}