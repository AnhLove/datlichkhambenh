package vn.namluongson.datlichkhambenhv.repository.doctor;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.namluongson.datlichkhambenhv.domain.entities.DoctorWorkingHour;

import java.util.List;

@Repository
public interface DoctorWorkingHourRepository extends JpaRepository<DoctorWorkingHour, Long> {
    boolean existsByDoctor_IdAndDayOfWeek(Long doctorId, Short dayOfWeek);
    List<DoctorWorkingHour> findByDoctor_User_Uuid(String uuid);
}
