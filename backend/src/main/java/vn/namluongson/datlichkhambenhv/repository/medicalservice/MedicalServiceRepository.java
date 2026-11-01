package vn.namluongson.datlichkhambenhv.repository.medicalservice;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.namluongson.datlichkhambenhv.domain.entities.MedicalService;

import java.util.List;

@Repository
public interface MedicalServiceRepository extends JpaRepository<MedicalService, Long> {
    List<MedicalService> findByNameContainingIgnoreCase(String name);

    @EntityGraph(attributePaths = {"department"})
    Page<MedicalService> findByNameContainingIgnoreCase(String name, Pageable pageable);

    @Override
    @EntityGraph(attributePaths = {"department"})
    Page<MedicalService> findAll(Pageable pageable);

    boolean existsByDepartment_IdAndNameIgnoreCase(Long departmentId, String name);
    boolean existsByDepartment_IdAndNameIgnoreCaseAndIdNot(Long departmentId, String name, Long id);
}
