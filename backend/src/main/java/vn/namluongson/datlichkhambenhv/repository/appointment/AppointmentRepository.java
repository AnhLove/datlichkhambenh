package vn.namluongson.datlichkhambenhv.repository.appointment;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.namluongson.datlichkhambenhv.domain.entities.Appointment;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    boolean existsByDoctor_IdAndAppointmentDateAndTimeSlotAndStatusIn(
            Long doctorId,
            LocalDate appointmentDate,
            String timeSlot,
            List<Integer> statuses
    );
    List<Appointment> findByDoctor_IdAndAppointmentDateAndStatusIn(Long doctorId, LocalDate appointmentDate, List<Integer> statuses);
    List<Appointment> findByPatient_IdOrderByAppointmentDateAsc(Long patientId);
    Optional<Appointment> findByIdAndPatient_Id(Long appointmentId, Long patientId);
    Optional<Appointment> findByUuid(String uuid);
    Optional<Appointment> findByUuidAndPatient_Id(String uuid, Long patientId);
    List<Appointment> findByAppointmentDateOrderByTimeSlotAsc(LocalDate appointmentDate);
    List<Appointment> findByDoctor_User_IdOrderByAppointmentDateAscTimeSlotAsc(Long userId);
    List<Appointment> findByDoctor_IdAndAppointmentDateGreaterThanEqualAndStatusIn(Long doctorId, LocalDate date, List<Integer> statuses);

    @EntityGraph(attributePaths = {"patient", "doctor", "doctor.user", "department"})
    Page<Appointment> findByPatient_Id(Long patientId, Pageable pageable);

    @EntityGraph(attributePaths = {"patient", "doctor", "doctor.user", "department"})
    Page<Appointment> findByAppointmentDate(LocalDate appointmentDate, Pageable pageable);

    @EntityGraph(attributePaths = {"patient", "doctor", "doctor.user", "department"})
    Page<Appointment> findByDoctor_User_Id(Long userId, Pageable pageable);

    long countByPatient_IdAndAppointmentDateAndStatusIn(Long patientId, LocalDate appointmentDate, List<Integer> statuses);
}

