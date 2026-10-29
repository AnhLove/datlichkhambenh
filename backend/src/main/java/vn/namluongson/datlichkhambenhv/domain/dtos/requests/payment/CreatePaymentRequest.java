
package vn.namluongson.datlichkhambenhv.domain.dtos.requests.payment;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreatePaymentRequest {

    @NotNull(message = "Vui lòng chọn lịch hẹn")
    private Long appointmentId;

    @NotNull(message = "Vui lòng chọn phương thức thanh toán")
    @Positive(message = "Mã phương thức thanh toán không hợp lệ")
    private Long method;
}
