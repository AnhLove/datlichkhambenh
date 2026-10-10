
package vn.namluongson.datlichkhambenhv.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.namluongson.datlichkhambenhv.domain.dtos.requests.payment.CreatePaymentRequest;
import vn.namluongson.datlichkhambenhv.domain.dtos.responses.payment.PaymentResponse;
import vn.namluongson.datlichkhambenhv.domain.entities.Appointment;
import vn.namluongson.datlichkhambenhv.domain.entities.AppointmentService;
import vn.namluongson.datlichkhambenhv.domain.entities.Payment;
import vn.namluongson.datlichkhambenhv.domain.enums.PaymentMethod;
import vn.namluongson.datlichkhambenhv.domain.enums.PaymentStatus;
import vn.namluongson.datlichkhambenhv.domain.response.ApiResponse;
import vn.namluongson.datlichkhambenhv.repository.appointment.AppointmentRepository;
import vn.namluongson.datlichkhambenhv.repository.appointment.AppointmentServiceRepository;
import vn.namluongson.datlichkhambenhv.repository.payment.PaymentRepository;
import vn.namluongson.datlichkhambenhv.service.interfaces.IPaymentService;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PaymentService implements IPaymentService {
    private final PaymentRepository paymentRepository;
    private final AppointmentRepository appointmentRepository;
    private final AppointmentServiceRepository appointmentServiceRepository;

    @Override
    @Transactional
    public ApiResponse createPayment(CreatePaymentRequest request) {
        Appointment appointment = appointmentRepository.findById(request.getAppointmentId()).orElseThrow(() -> new IllegalArgumentException("Lịch hẹn không tồn tại"));

        if (paymentRepository.existsByAppointment_Id(appointment.getId())) {
            throw new IllegalArgumentException("Lịch hẹn này đã có khoản thanh toán");
        }

        PaymentMethod method = findPaymentMethod(request.getMethod());

        List<AppointmentService> services = appointmentServiceRepository.findByAppointment_IdOrderByIdAsc(appointment.getId());

        if (services.isEmpty()) {
            throw new IllegalArgumentException("Lịch hẹn chưa có dịch vụ, không thể tạo thanh toán");
        }

        long amount = 0L;

        for (AppointmentService service : services) {
            long serviceTotal = Math.multiplyExact(
                    service.getPriceAtTime(),
                    service.getQuantity()
            );

            amount = Math.addExact(amount, serviceTotal);
        }

        Payment payment = Payment.builder()
                .appointment(appointment)
                .amount(amount)
                .method((long) method.getCode())
                .status((long) PaymentStatus.PENDING.getCode())
                .build();

        Payment savedPayment = paymentRepository.save(payment);

        return new ApiResponse(200, "Tạo khoản thanh toán thành công", toResponse(savedPayment)
        );
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse getPaymentByAppointmentId(Long appointmentId) {
        Payment payment = paymentRepository.findByAppointment_Id(appointmentId).orElseThrow(() -> new IllegalArgumentException("Lịch hẹn chưa có khoản thanh toán"));
        return new ApiResponse(200, "Lấy thông tin thanh toán thành công", toResponse(payment));
    }

    @Override
    @Transactional
    public ApiResponse confirmPayment(Long appointmentId) {
        Payment payment = paymentRepository.findByAppointment_Id(appointmentId).orElseThrow(() -> new IllegalArgumentException("Không tìm thấy khoản thanh toán"));

        if (payment.getStatus() != PaymentStatus.PENDING.getCode()) {
            throw new IllegalArgumentException("Chỉ khoản thanh toán đang chờ mới được xác nhận");
        }

        payment.setStatus((long) PaymentStatus.PAID.getCode());
        payment.setPaidAt(LocalDateTime.now());

        Payment savedPayment = paymentRepository.save(payment);

        return new ApiResponse(200, "Xác nhận thanh toán thành công", toResponse(savedPayment));
    }

    private PaymentMethod findPaymentMethod(Long code) {
        for (PaymentMethod method : PaymentMethod.values()) {
            if (method.getCode() == code) {
                return method;
            }
        }

        throw new IllegalArgumentException("Phương thức thanh toán không hợp lệ");
    }

    private PaymentResponse toResponse(Payment payment) {
        Appointment appointment = payment.getAppointment();
        return PaymentResponse.builder()
                .patientName(appointment.getPatient().getFullName())
                .doctorName(appointment.getDoctor().getUser().getFullName())
                .appointmentDate(appointment.getAppointmentDate())
                .amount(payment.getAmount())
                .method(payment.getMethod())
                .status(payment.getStatus())
                .transactionCode(payment.getTransactionCode())
                .paidAt(payment.getPaidAt())
                .build();
    }
}
