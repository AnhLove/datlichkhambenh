package vn.namluongson.datlichkhambenhv.repository.statistics;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.Repository;
import org.springframework.data.repository.query.Param;
import vn.namluongson.datlichkhambenhv.domain.dtos.responses.statistics.TopDoctorStatisticsResponse;
import vn.namluongson.datlichkhambenhv.domain.entities.Appointment;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public interface StatisticsRepository extends Repository<Appointment, Long> {

    @Query("""
        SELECT COUNT(a.id)
        FROM Appointment a
        WHERE a.appointmentDate BETWEEN :fromDate AND :toDate
        """)
    Long countAppointments(
            @Param("fromDate") LocalDate fromDate,
            @Param("toDate") LocalDate toDate
    );

    @Query("""
        SELECT COUNT(a.id)
        FROM Appointment a
        WHERE a.appointmentDate BETWEEN :fromDate AND :toDate
          AND a.status = :status
        """)
    Long countAppointmentsByStatus(
            @Param("fromDate") LocalDate fromDate,
            @Param("toDate") LocalDate toDate,
            @Param("status") Integer status
    );

    @Query("""
        SELECT COALESCE(SUM(p.amount), 0)
        FROM Payment p
        WHERE p.status = :paidStatus
          AND p.paidAt >= :startAt
          AND p.paidAt < :endAt
        """)
    Long sumPaidRevenue(
            @Param("paidStatus") Long paidStatus,
            @Param("startAt") LocalDateTime startAt,
            @Param("endAt") LocalDateTime endAt
    );

    @Query("""
        SELECT COUNT(p.id)
        FROM Payment p
        WHERE p.status = :paidStatus
          AND p.paidAt >= :startAt
          AND p.paidAt < :endAt
        """)
    Long countPaidTransactions(
            @Param("paidStatus") Long paidStatus,
            @Param("startAt") LocalDateTime startAt,
            @Param("endAt") LocalDateTime endAt
    );

    @Query("""
        SELECT new vn.namluongson.datlichkhambenhv.domain.dtos.responses.statistics.TopDoctorStatisticsResponse(
            d.id,
            d.user.fullName,
            COUNT(a.id)
        )
        FROM Appointment a
        JOIN a.doctor d
        WHERE a.appointmentDate BETWEEN :fromDate AND :toDate
          AND a.status = :completedStatus
        GROUP BY d.id, d.user.fullName
        ORDER BY COUNT(a.id) DESC
        """)
    List<TopDoctorStatisticsResponse> findTopDoctors(
            @Param("fromDate") LocalDate fromDate,
            @Param("toDate") LocalDate toDate,
            @Param("completedStatus") Integer completedStatus,
            Pageable pageable
    );
}