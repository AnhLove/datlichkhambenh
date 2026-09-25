package vn.namluongson.datlichkhambenhv.repository.appointment;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.namluongson.datlichkhambenhv.domain.entities.Appointment;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    boolean existsByDoctor_IdAndAppointmentDateAndTimeSlotAndStatusIn(
            Long doctorId,
            LocalDate appointmentDate,
            String timeSlot,
            List<Integer> statuses
    );
    List<Appointment> findByDoctor_IdAndAppointmentDateAndStatusIn(Long doctorId, LocalDate appointmentDate, List<Integer> statuses);
}
