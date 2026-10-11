package vn.namluongson.datlichkhambenhv.domain.dtos.responses.statistics;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class CancellationStatisticsResponse {
    private Long totalAppointments;
    private Long cancelledAppointments;
    private Double cancellationRate;
}