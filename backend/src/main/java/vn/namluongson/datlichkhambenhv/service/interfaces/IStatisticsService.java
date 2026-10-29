package vn.namluongson.datlichkhambenhv.service.interfaces;

import vn.namluongson.datlichkhambenhv.domain.response.ApiResponse;

import java.time.LocalDate;

public interface IStatisticsService {
    ApiResponse getAppointmentStatistics(LocalDate from, LocalDate to);
    ApiResponse getRevenueStatistics(LocalDate from, LocalDate to);
    ApiResponse getCancellationStatistics(LocalDate from, LocalDate to);
    ApiResponse getTopDoctors(LocalDate from, LocalDate to);
}