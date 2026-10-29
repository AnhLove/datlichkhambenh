package vn.namluongson.datlichkhambenhv.repository.appointment;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.namluongson.datlichkhambenhv.domain.entities.AppointmentService;

import java.util.List;
import java.util.Optional;

@Repository
public interface AppointmentServiceRepository extends JpaRepository<AppointmentService, Long> {
    List<AppointmentService> findByAppointment_IdOrderByIdAsc(Long appointmentId);
    boolean existsByAppointment_IdAndMedicalService_Id(Long appointmentId, Long serviceId);
    Optional<AppointmentService> findByAppointment_IdAndMedicalService_Id(Long appointmentId, Long serviceId);
}