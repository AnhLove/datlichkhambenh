package vn.namluongson.datlichkhambenhv.domain.entities;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "EXAM_REPORTS")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExamReport {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "exam_reports_seq_gen")
    @SequenceGenerator(name = "exam_reports_seq_gen", sequenceName = "EXAM_REPORTS_SEQ", allocationSize = 1)
    @Column(name = "ID")
    private Long id;

    @OneToOne
    @JoinColumn(name = "APPOINTMENT_ID", nullable = false, unique = true)
    private Appointment appointment;

    @ManyToOne
    @JoinColumn(name = "ISSUED_BY", nullable = false)
    private User issuedBy;

    @Column(name = "DIAGNOSIS", nullable = false, length = 1000)
    private String diagnosis;

    @Column(name = "NOTES", length = 1000)
    private String notes;

    @Column(name = "STATUS", nullable = false)
    private Short status;

    @Column(name = "ISSUED_AT")
    private LocalDateTime issuedAt;
}
