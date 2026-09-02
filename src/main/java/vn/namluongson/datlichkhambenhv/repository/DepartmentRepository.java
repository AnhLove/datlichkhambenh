package vn.namluongson.datlichkhambenhv.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.namluongson.datlichkhambenhv.domain.entities.Department;

import java.util.List;

public interface DepartmentRepository extends JpaRepository<Department, Long> {
    List<Department> findByNameContainingIgnoreCase(String name);
}
