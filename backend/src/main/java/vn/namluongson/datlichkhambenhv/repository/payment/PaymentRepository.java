package vn.namluongson.datlichkhambenhv.repository.payment;

import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import vn.namluongson.datlichkhambenhv.domain.entities.Payment;

import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    boolean existsByAppointment_Id(Long appointmentId);
    Optional<Payment> findByAppointment_Id(Long appointmentId);
    Optional<Payment> findByAppointment_Uuid(String appointmentUuid);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select p from Payment p where p.appointment.uuid = :appointmentUuid")
    Optional<Payment> findByAppointmentUuidForUpdate(@Param("appointmentUuid") String appointmentUuid);
    Page<Payment> findAllByAppointment_Patient_Email(String email, Pageable pageable);
}
