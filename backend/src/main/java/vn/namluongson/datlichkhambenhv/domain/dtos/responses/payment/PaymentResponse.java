
package vn.namluongson.datlichkhambenhv.domain.dtos.responses.payment;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Builder
public class PaymentResponse {
    private String patientName;
    private String doctorName;
    private LocalDate appointmentDate;

    private Long amount;
    private Long method;
    private Long status;

    private String transactionCode;
    private LocalDateTime paidAt;
}
