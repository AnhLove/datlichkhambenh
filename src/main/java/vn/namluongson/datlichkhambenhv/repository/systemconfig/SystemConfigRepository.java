package vn.namluongson.datlichkhambenhv.repository.systemconfig;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.namluongson.datlichkhambenhv.domain.entities.SystemConfig;

public interface SystemConfigRepository extends JpaRepository<SystemConfig, String> {
}