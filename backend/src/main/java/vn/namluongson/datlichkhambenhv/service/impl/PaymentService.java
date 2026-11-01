package vn.namluongson.datlichkhambenhv.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.namluongson.datlichkhambenhv.config.security.CustomUserDetails;
import vn.namluongson.datlichkhambenhv.domain.dtos.requests.BasePagingRequest;
import vn.namluongson.datlichkhambenhv.domain.dtos.requests.payment.CreatePaymentRequest;
import vn.namluongson.datlichkhambenhv.domain.dtos.responses.payment.PaymentResponse;
import vn.namluongson.datlichkhambenhv.domain.entities.Appointment;
import vn.namluongson.datlichkhambenhv.domain.entities.AppointmentService;
import vn.namluongson.datlichkhambenhv.domain.entities.Payment;
import vn.namluongson.datlichkhambenhv.domain.entities.User;
import vn.namluongson.datlichkhambenhv.domain.enums.AppointmentStatus;
import vn.namluongson.datlichkhambenhv.domain.enums.PaymentMethod;
import vn.namluongson.datlichkhambenhv.domain.enums.PaymentStatus;
import vn.namluongson.datlichkhambenhv.domain.response.ApiResponse;
import vn.namluongson.datlichkhambenhv.domain.response.PageResponse;
import vn.namluongson.datlichkhambenhv.exception.BusinessException;
import vn.namluongson.datlichkhambenhv.repository.appointment.AppointmentRepository;
import vn.namluongson.datlichkhambenhv.repository.appointment.AppointmentServiceRepository;
import vn.namluongson.datlichkhambenhv.repository.payment.PaymentRepository;
import vn.namluongson.datlichkhambenhv.service.interfaces.IPaymentService;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PaymentService implements IPaymentService {
    private static final long MAX_PAYMENT_AMOUNT = 999_999_999_999L;
    private final PaymentRepository paymentRepository;
    private final AppointmentRepository appointmentRepository;
    private final AppointmentServiceRepository appointmentServiceRepository;

    @Override
    @Transactional
    public ApiResponse createPayment(CreatePaymentRequest request) {
        Appointment appointment = appointmentRepository.findByUuid(request.getAppointmentUuid()).orElseThrow(() -> BusinessException.notFound("Lịch hẹn không tồn tại"));

        if (appointment.getStatus() == AppointmentStatus.CANCELLED.getCode() || appointment.getStatus() == AppointmentStatus.NO_SHOW.getCode()) {
            throw BusinessException.badRequest("Lịch hẹn đã hủy hoặc không đến khám, không thể tạo thanh toán");
        }

        if (paymentRepository.existsByAppointment_Id(appointment.getId())) {
            throw BusinessException.conflict("Lịch hẹn này đã có khoản thanh toán");
        }

        PaymentMethod method = findPaymentMethod(request.getMethod());

        List<AppointmentService> services = appointmentServiceRepository.findByAppointment_IdOrderByIdAsc(appointment.getId());

        if (services.isEmpty()) {
            throw BusinessException.badRequest("Lịch hẹn chưa có dịch vụ, không thể tạo thanh toán");
        }

        long amount = 0L;

        for (AppointmentService service : services) {
            long serviceTotal = Math.multiplyExact(
                    service.getPriceAtTime(),
                    service.getQuantity()
            );

            amount = Math.addExact(amount, serviceTotal);
        }

        if (amount > MAX_PAYMENT_AMOUNT) {
            throw BusinessException.badRequest("Tổng tiền vượt quá giới hạn cho phép");
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
    public ApiResponse getPaymentByAppointmentUuid(String appointmentUuid) {
        Payment payment = paymentRepository.findByAppointment_Uuid(appointmentUuid).orElseThrow(() -> BusinessException.notFound("Lịch hẹn chưa có khoản thanh toán"));
        return new ApiResponse(200, "Lấy thông tin thanh toán thành công", toResponse(payment));
    }


    @Override
    @Transactional
    public ApiResponse confirmPayment(String appointmentUuid) {
        Payment payment = paymentRepository.findByAppointmentUuidForUpdate(appointmentUuid)
                .orElseThrow(() -> BusinessException.notFound("Không tìm thấy khoản thanh toán"));

        if (payment.getStatus() != PaymentStatus.PENDING.getCode()) {
            throw BusinessException.badRequest("Chỉ khoản thanh toán đang chờ mới được xác nhận");
        }

        payment.setStatus((long) PaymentStatus.PAID.getCode());
        payment.setPaidAt(LocalDateTime.now(ZoneId.of("Asia/Ho_Chi_Minh")));
        payment.setReceivedBy(currentUser());

        Payment savedPayment = paymentRepository.save(payment);

        return new ApiResponse(200, "Xác nhận thanh toán thành công", toResponse(savedPayment));
    }

    private PaymentMethod findPaymentMethod(Long code) {
        for (PaymentMethod method : PaymentMethod.values()) {
            if (method.getCode() == code) {
                return method;
            }
        }

        throw BusinessException.badRequest("Phương thức thanh toán không hợp lệ");
    }

    private PaymentResponse toResponse(Payment payment) {
        Appointment appointment = payment.getAppointment();
        return PaymentResponse.builder()
                .appointmentUuid(appointment.getUuid())
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


    @Override
    @Transactional(readOnly = true)
    public ApiResponse getMyPayments(String email, BasePagingRequest paging) {
        if (email == null || email.isBlank()) {
            throw BusinessException.unauthorized("Không xác định được tài khoản đang đăng nhập");
        }

        Sort sort = Sort.by(Sort.Direction.DESC, "appointment.appointmentDate").and(Sort.by(Sort.Direction.DESC, "id"));
        Page<PaymentResponse> page = paymentRepository
                .findAllByAppointment_Patient_Email(email, paging.toPageable(sort))
                .map(this::toResponse);

        return new ApiResponse(200, "Lấy danh sách thanh toán thành công", PageResponse.of(page));
    }

    private User currentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof CustomUserDetails userDetails)) {
            throw BusinessException.unauthorized("Vui lòng đăng nhập");
        }
        return userDetails.getUser();
    }
}

