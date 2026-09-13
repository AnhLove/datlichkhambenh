package vn.namluongson.datlichkhambenhv.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.namluongson.datlichkhambenhv.domain.entities.DoctorWorkingHour;

@Repository
public interface DoctorWorkingHourRepository extends JpaRepository<DoctorWorkingHour, Long> {
}
