
package vn.namluongson.datlichkhambenhv.service.interfaces;

import vn.namluongson.datlichkhambenhv.domain.dtos.requests.payment.CreatePaymentRequest;
import vn.namluongson.datlichkhambenhv.domain.response.ApiResponse;

public interface IPaymentService {
    ApiResponse createPayment(CreatePaymentRequest request);
    ApiResponse getPaymentByAppointmentId(Long appointmentId);
    ApiResponse confirmPayment(Long appointmentId);
}
