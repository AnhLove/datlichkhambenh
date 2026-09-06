package vn.namluongson.datlichkhambenhv.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.namluongson.datlichkhambenhv.domain.entities.Doctor;

import java.util.List;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Long> {
    List<Doctor> findByUser_FullNameContainingIgnoreCase(String fullName);
    Page<Doctor> findByUser_FullNameContainingIgnoreCase(String fullName, Pageable pageable);
}
