
package vn.namluongson.datlichkhambenhv.domain.entities;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "PAYMENTS")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "payments_seq_gen")
    @SequenceGenerator(name = "payments_seq_gen", sequenceName = "PAYMENTS_SEQ", allocationSize = 1)
    @Column(name = "ID")
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "APPOINTMENT_ID", nullable = false, unique = true)
    private Appointment appointment;

    @Column(name = "AMOUNT", nullable = false)
    private Long amount;

    @Column(name = "METHOD", nullable = false)
    private Long method;

    @Column(name = "STATUS", nullable = false)
    private Long status;

    @Column(name = "TRANSACTION_CODE", length = 100)
    private String transactionCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "RECEIVED_BY")
    private User receivedBy;

    @Column(name = "PAID_AT")
    private LocalDateTime paidAt;
}
