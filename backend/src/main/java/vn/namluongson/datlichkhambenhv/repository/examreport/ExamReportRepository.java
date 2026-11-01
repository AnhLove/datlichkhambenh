package vn.namluongson.datlichkhambenhv.repository.examreport;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.namluongson.datlichkhambenhv.domain.entities.ExamReport;

import java.util.List;
import java.util.Optional;

@Repository
public interface ExamReportRepository extends JpaRepository<ExamReport, Long> {
    Optional<ExamReport> findByAppointment_Id(Long appointmentId);
    Optional<ExamReport> findByUuid(String uuid);
    List<ExamReport> findByIssuedBy_IdOrderByIssuedAtDesc(Long doctorId);
    List<ExamReport> findByAppointment_Patient_IdOrderByIssuedAtDesc(Long patientId);

    @EntityGraph(attributePaths = {"appointment", "appointment.patient", "appointment.doctor", "appointment.doctor.user"})
    Page<ExamReport> findByIssuedBy_Id(Long doctorId, Pageable pageable);

    @EntityGraph(attributePaths = {"appointment", "appointment.patient", "appointment.doctor", "appointment.doctor.user"})
    Page<ExamReport> findByAppointment_Patient_IdAndStatus(Long patientId, Short status, Pageable pageable);

    @Override
    @EntityGraph(attributePaths = {"appointment", "appointment.patient", "appointment.doctor", "appointment.doctor.user"})
    Page<ExamReport> findAll(Pageable pageable);
}
