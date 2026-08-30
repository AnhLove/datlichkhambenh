package vn.namluongson.datlichkhambenhv.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.namluongson.datlichkhambenhv.domain.entities.Department;

public interface DepartmentRepository extends JpaRepository<Department, Long> {
}
