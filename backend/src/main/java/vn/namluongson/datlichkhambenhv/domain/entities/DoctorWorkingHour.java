package vn.namluongson.datlichkhambenhv.domain.entities;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "DOCTOR_WORKING_HOURS")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DoctorWorkingHour {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "doctor_working_hours_seq_gen")
    @SequenceGenerator(name = "doctor_working_hours_seq_gen", sequenceName = "DWH_SEQ", allocationSize = 1)
    @Column(name = "ID")
    private Long id;

    @ManyToOne
    @JoinColumn(name = "DOCTOR_ID")
    private Doctor doctor;

    @Column(name = "DAY_OF_WEEK")
    private Short dayOfWeek;

    @Column(name = "SHIFT_TYPE")
    private Short shiftType;

    @ManyToOne
    @JoinColumn(name = "SET_BY")
    private User setBy;

    @Column(name = "STATUS")
    private Short status;

}
