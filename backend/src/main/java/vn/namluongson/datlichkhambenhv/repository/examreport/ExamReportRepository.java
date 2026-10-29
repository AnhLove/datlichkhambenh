package vn.namluongson.datlichkhambenhv.repository.examreport;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.namluongson.datlichkhambenhv.domain.entities.ExamReport;

import java.util.List;
import java.util.Optional;

@Repository
public interface ExamReportRepository extends JpaRepository<ExamReport, Long> {
    Optional<ExamReport> findByAppointment_Id(Long appointmentId);
    List<ExamReport> findByIssuedBy_IdOrderByIssuedAtDesc(Long doctorId);
    List<ExamReport> findByAppointment_Patient_IdOrderByIssuedAtDesc(Long patientId);
}
