package vn.namluongson.datlichkhambenhv.domain.entities;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "APPOINTMENT_SERVICES")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AppointmentService {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "appointment_services_seq_gen")
    @SequenceGenerator(name = "appointment_services_seq_gen", sequenceName = "APPTSVC_SEQ", allocationSize = 1)
    @Column(name = "ID")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "APPOINTMENT_ID", nullable = false)
    private Appointment appointment;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "SERVICE_ID", nullable = false)
    private MedicalService medicalService;

    @Column(name = "PRICE_AT_TIME", nullable = false)
    private Long priceAtTime;

    @Column(name = "QUANTITY", nullable = false)
    private Long quantity;
}