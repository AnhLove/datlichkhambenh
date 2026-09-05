package vn.namluongson.datlichkhambenhv.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.namluongson.datlichkhambenhv.domain.entities.Doctor;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Long> {
}
