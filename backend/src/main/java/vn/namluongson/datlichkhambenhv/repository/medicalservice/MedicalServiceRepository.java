package vn.namluongson.datlichkhambenhv.repository.medicalservice;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.namluongson.datlichkhambenhv.domain.entities.MedicalService;

import java.util.List;

@Repository
public interface MedicalServiceRepository extends JpaRepository<MedicalService, Long> {
    List<MedicalService> findByNameContainingIgnoreCase(String name);
    boolean existsByDepartment_IdAndNameIgnoreCase(Long departmentId, String name);
    boolean existsByDepartment_IdAndNameIgnoreCaseAndIdNot(Long departmentId, String name, Long id);
}
