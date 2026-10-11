package vn.namluongson.datlichkhambenhv.domain.dtos.responses.statistics;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class AppointmentStatisticsResponse {
    private Long totalAppointments;
    private Long completedAppointments;
    private Long cancelledAppointments;
    private Long noShowAppointments;
}