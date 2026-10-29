package vn.namluongson.datlichkhambenhv.controller;

import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import vn.namluongson.datlichkhambenhv.domain.response.ApiResponse;
import vn.namluongson.datlichkhambenhv.service.interfaces.IStatisticsService;

import java.time.LocalDate;

@RestController
@RequestMapping("/admin/statistics")
@RequiredArgsConstructor
@Validated
public class StatisticsController {

    private final IStatisticsService statisticsService;

    @GetMapping("/appointments")
    public ResponseEntity<ApiResponse> getAppointmentStatistics(@RequestParam @NotNull @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from, @RequestParam @NotNull @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(statisticsService.getAppointmentStatistics(from, to));
    }

    @GetMapping("/revenue")
    public ResponseEntity<ApiResponse> getRevenueStatistics(@RequestParam @NotNull @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from, @RequestParam @NotNull @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(statisticsService.getRevenueStatistics(from, to));
    }

    @GetMapping("/cancellations")
    public ResponseEntity<ApiResponse> getCancellationStatistics(@RequestParam @NotNull @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from, @RequestParam @NotNull @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(statisticsService.getCancellationStatistics(from, to));
    }

    @GetMapping("/top-doctors")
    public ResponseEntity<ApiResponse> getTopDoctors(@RequestParam @NotNull @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from, @RequestParam @NotNull @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(statisticsService.getTopDoctors(from, to));
    }
}