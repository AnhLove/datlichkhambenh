package vn.namluongson.datlichkhambenhv.domain.dtos.responses.statistics;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class RevenueStatisticsResponse {
    private Long totalRevenue;
    private Long paidTransactions;
}