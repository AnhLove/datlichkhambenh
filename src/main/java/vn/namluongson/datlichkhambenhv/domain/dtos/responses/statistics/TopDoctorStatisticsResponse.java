package vn.namluongson.datlichkhambenhv.domain.dtos.responses.statistics;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class TopDoctorStatisticsResponse {
    private Long doctorId;
    private String doctorName;
    private Long completedAppointments;
}