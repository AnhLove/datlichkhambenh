
package vn.namluongson.datlichkhambenhv.repository.payment;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.namluongson.datlichkhambenhv.domain.entities.Payment;

import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    boolean existsByAppointment_Id(Long appointmentId);
    Optional<Payment> findByAppointment_Id(Long appointmentId);
}
