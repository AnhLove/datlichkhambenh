package vn.namluongson.datlichkhambenhv.domain.entities;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "APPOINTMENTS")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Appointment {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "appointments_seq_gen")
    @SequenceGenerator(name = "appointments_seq_gen", sequenceName = "APPOINTMENTS_SEQ", allocationSize = 1)
    @Column(name = "ID")
    private Long id;

    @ManyToOne
    @JoinColumn(name = "PATIENT_ID")
    private User patient;

    @ManyToOne
    @JoinColumn(name = "DOCTOR_ID")
    private Doctor doctor;

    @ManyToOne
    @JoinColumn(name = "DEPARTMENT_ID")
    private Department department;

    @ManyToOne
    @JoinColumn(name = "CREATED_BY")
    private User createdBy;

    @Column(name = "APPOINTMENT_DATE")
    private LocalDate appointmentDate;

    @Column(name = "TIME_SLOT")
    private String timeSlot;

    @Column(name = "REASON")
    private String reason;

    @Column(name = "STATUS")
    private Integer status;

    @Column(name = "CANCEL_REASON")
    private String cancelReason;

    @Column(name = "CHECKED_IN_AT")
    private LocalDateTime checkedInAt;

    @Column(name = "CREATED_AT")
    private LocalDateTime createdAt;

}
