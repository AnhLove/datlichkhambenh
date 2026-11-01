package vn.namluongson.datlichkhambenhv.domain.dtos.responses.statistics;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class TopDoctorStatisticsResponse {
    private String doctorUuid;
    private String doctorName;
    private Long completedAppointments;
}
