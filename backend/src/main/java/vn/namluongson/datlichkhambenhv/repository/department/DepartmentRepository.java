package vn.namluongson.datlichkhambenhv.repository.department;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import vn.namluongson.datlichkhambenhv.domain.entities.Department;

import java.util.List;

public interface DepartmentRepository extends JpaRepository<Department, Long> {
    List<Department> findByNameContainingIgnoreCase(String name);
    Page<Department> findByNameContainingIgnoreCase(String name, Pageable pageable);
}
