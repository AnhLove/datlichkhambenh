package vn.namluongson.datlichkhambenhv.domain.dtos.responses.examreport;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class ExamReportResponse {

    private Long id;

    private Long appointmentId;

    private String patientName;

    private String doctorName;

    private String diagnosis;

    private String notes;

    private Integer status;

    private String statusName;

    private LocalDateTime issuedAt;
}