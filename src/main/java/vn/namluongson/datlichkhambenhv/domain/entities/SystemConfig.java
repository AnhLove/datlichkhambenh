package vn.namluongson.datlichkhambenhv.domain.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "SYSTEM_CONFIG")
@Getter
@Setter
public class SystemConfig {
    @Id
    @Column(name = "CONFIG_KEY", length = 100)
    private String configKey;

    @Column(name = "CONFIG_VALUE", nullable = false, length = 500)
    private String configValue;

    @Column(name = "DESCRIPTION", length = 500)
    private String description;
}