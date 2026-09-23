package vn.namluongson.datlichkhambenhv.domain.dtos.requests.appointment;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class CreateAppointmentRequest {
    private String doctorUuid;
    private Long departmentId;
    private LocalDate appointmentDate;
    private String timeSlot;
    private String reason;
}
