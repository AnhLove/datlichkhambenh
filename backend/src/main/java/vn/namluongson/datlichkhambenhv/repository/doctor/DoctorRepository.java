package vn.namluongson.datlichkhambenhv.repository.doctor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import vn.namluongson.datlichkhambenhv.domain.entities.Doctor;
import vn.namluongson.datlichkhambenhv.repository.doctor.interfaces.IDoctorRepository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Long>, IDoctorRepository {
    Optional<Doctor> findByUser_Uuid(String uuid);
    Optional<Doctor> findByUuid(String uuid);

    @EntityGraph(attributePaths = {"user", "department"})
    Page<Doctor> findByUser_FullNameContainingIgnoreCase(String fullName, Pageable pageable);

    @Override
    @EntityGraph(attributePaths = {"user", "department"})
    Page<Doctor> findAll(Pageable pageable);

    @EntityGraph(attributePaths = {"user", "department"})
    @Query("""
    SELECT d
    FROM Doctor d
    JOIN d.user u
    WHERE d.department.id = :departmentId
      AND u.status = :activeStatus
      AND u.role = :doctorRole
    """)
    List<Doctor> findActiveDoctorsByDepartment(
            @Param("departmentId") Long departmentId,
            @Param("activeStatus") Short activeStatus,
            @Param("doctorRole") Short doctorRole
    );
}
