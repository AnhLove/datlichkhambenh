package vn.namluongson.datlichkhambenhv.domain.dtos.responses.appointment;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
public class AppointmentResponse {

    private String doctorName;
    private String departmentName;
    private LocalDate appointmentDate;
    private String timeSlot;
    private String reason;
    private Integer status;
    private LocalDateTime checkedInAt;
    private LocalDateTime createdAt;
}