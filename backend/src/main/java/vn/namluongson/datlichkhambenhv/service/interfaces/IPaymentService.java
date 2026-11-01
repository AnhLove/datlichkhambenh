package vn.namluongson.datlichkhambenhv.service.interfaces;

import vn.namluongson.datlichkhambenhv.domain.dtos.requests.BasePagingRequest;
import vn.namluongson.datlichkhambenhv.domain.dtos.requests.payment.CreatePaymentRequest;
import vn.namluongson.datlichkhambenhv.domain.response.ApiResponse;

public interface IPaymentService {
    ApiResponse createPayment(CreatePaymentRequest request);
    ApiResponse getPaymentByAppointmentUuid(String appointmentUuid);
    ApiResponse confirmPayment(String appointmentUuid);

    ApiResponse getMyPayments(String email, BasePagingRequest paging);
}

