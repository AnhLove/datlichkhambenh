package vn.namluongson.datlichkhambenhv.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import vn.namluongson.datlichkhambenhv.domain.response.ApiResponse;
import vn.namluongson.datlichkhambenhv.domain.dtos.responses.statistics.AppointmentStatisticsResponse;
import vn.namluongson.datlichkhambenhv.domain.dtos.responses.statistics.CancellationStatisticsResponse;
import vn.namluongson.datlichkhambenhv.domain.dtos.responses.statistics.RevenueStatisticsResponse;
import vn.namluongson.datlichkhambenhv.domain.enums.AppointmentStatus;
import vn.namluongson.datlichkhambenhv.domain.enums.PaymentStatus;
import vn.namluongson.datlichkhambenhv.repository.statistics.StatisticsRepository;
import vn.namluongson.datlichkhambenhv.service.interfaces.IStatisticsService;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class StatisticsService implements IStatisticsService {

    private final StatisticsRepository statisticsRepository;

    @Override
    public ApiResponse getAppointmentStatistics(LocalDate from, LocalDate to) {
        validateDateRange(from, to);

        var total = statisticsRepository.countAppointments(from, to);
        var completed = statisticsRepository.countAppointmentsByStatus(from, to, AppointmentStatus.COMPLETED.getCode());
        var cancelled = statisticsRepository.countAppointmentsByStatus(from, to, AppointmentStatus.CANCELLED.getCode());
        var noShow = statisticsRepository.countAppointmentsByStatus(from, to, AppointmentStatus.NO_SHOW.getCode());

        var response = AppointmentStatisticsResponse.builder()
                .totalAppointments(total)
                .completedAppointments(completed)
                .cancelledAppointments(cancelled)
                .noShowAppointments(noShow)
                .build();

        return new ApiResponse(200, "Lấy thống kê lịch hẹn thành công", response);
    }

    @Override
    public ApiResponse getRevenueStatistics(LocalDate from, LocalDate to) {
        validateDateRange(from, to);

        var startAt = from.atStartOfDay();
        var endAt = to.plusDays(1).atStartOfDay();
        var paidStatus = (long) PaymentStatus.PAID.getCode();

        var revenue = statisticsRepository.sumPaidRevenue(paidStatus, startAt, endAt);

        var transactions = statisticsRepository.countPaidTransactions(paidStatus, startAt, endAt);

        var response = RevenueStatisticsResponse.builder()
                .totalRevenue(revenue)
                .paidTransactions(transactions)
                .build();

        return new ApiResponse(200, "Lấy thống kê doanh thu thành công", response);
    }

    @Override
    public ApiResponse getCancellationStatistics(LocalDate from, LocalDate to) {
        validateDateRange(from, to);

        var total = statisticsRepository.countAppointments(from, to);
        var cancelled = statisticsRepository.countAppointmentsByStatus(from, to, AppointmentStatus.CANCELLED.getCode());

        double rate = total == 0 ? 0.0 : cancelled * 100.0 / total;

        var response = CancellationStatisticsResponse.builder()
                .totalAppointments(total)
                .cancelledAppointments(cancelled)
                .cancellationRate(Math.round(rate * 100.0) / 100.0)
                .build();

        return new ApiResponse(200, "Lấy thống kê hủy lịch thành công", response);
    }

    @Override
    public ApiResponse getTopDoctors(LocalDate from, LocalDate to) {
        validateDateRange(from, to);

        var data = statisticsRepository.findTopDoctors(from, to, AppointmentStatus.COMPLETED.getCode(), PageRequest.of(0, 10));

        return new ApiResponse(200, "Lấy danh sách bác sĩ thành công", data);
    }

    private void validateDateRange(LocalDate from, LocalDate to) {
        if (from == null || to == null) {
            throw new IllegalArgumentException("Vui lòng cung cấp ngày bắt đầu và ngày kết thúc");
        }

        if (from.isAfter(to)) {
            throw new IllegalArgumentException("Ngày bắt đầu không được sau ngày kết thúc");
        }
    }
}