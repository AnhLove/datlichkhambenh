package vn.namluongson.datlichkhambenhv.domain.dtos.responses.appointment;

import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
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