package vn.namluongson.datlichkhambenhv.domain.entities;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "DOCTORS")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Doctor {

    @Id
    @Column(name = "ID")
    private Long id;

    @OneToOne
    @MapsId
    @JoinColumn(name = "ID")
    private User user;

    @ManyToOne
    @JoinColumn(name = "DEPARTMENT_ID")
    private Department department;

    @Column(name = "YEARS_EXPERIENCE")
    private Long yearsExperience;

    @Column(name = "BIO")
    private String bio;

    @Column(name = "UUID", nullable = false, unique = true, updatable = false, length = 36)
    private String uuid;

    @PrePersist
    void assignUuid() {
        if (uuid == null) {
            uuid = UUID.randomUUID().toString();
        }
    }

}
