package vn.namluongson.datlichkhambenhv.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.namluongson.datlichkhambenhv.domain.dtos.requests.appointmentservice.AddAppointmentServiceRequest;
import vn.namluongson.datlichkhambenhv.domain.dtos.responses.appointmentservice.AppointmentServiceResponse;
import vn.namluongson.datlichkhambenhv.domain.entities.Appointment;
import vn.namluongson.datlichkhambenhv.domain.entities.AppointmentService;
import vn.namluongson.datlichkhambenhv.domain.entities.MedicalService;
import vn.namluongson.datlichkhambenhv.domain.enums.AppointmentStatus;
import vn.namluongson.datlichkhambenhv.domain.response.ApiResponse;
import vn.namluongson.datlichkhambenhv.exception.BusinessException;
import vn.namluongson.datlichkhambenhv.repository.appointment.AppointmentRepository;
import vn.namluongson.datlichkhambenhv.repository.appointment.AppointmentServiceRepository;
import vn.namluongson.datlichkhambenhv.repository.medicalservice.MedicalServiceRepository;
import vn.namluongson.datlichkhambenhv.repository.payment.PaymentRepository;
import vn.namluongson.datlichkhambenhv.service.interfaces.IAppointmentServiceService;

import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class AppointmentServiceService implements IAppointmentServiceService {
    private static final Set<Integer> LOCKED_STATUSES = Set.of(AppointmentStatus.CANCELLED.getCode(), AppointmentStatus.NO_SHOW.getCode());

    private final AppointmentServiceRepository appointmentServiceRepository;
    private final AppointmentRepository appointmentRepository;
    private final MedicalServiceRepository medicalServiceRepository;
    private final PaymentRepository paymentRepository;

    @Override
    @Transactional
    public ApiResponse addServiceToAppointment(AddAppointmentServiceRequest request) {
        Appointment appointment = findAppointment(request.getAppointmentUuid());
        ensureServicesEditable(appointment);

        MedicalService medicalService = medicalServiceRepository.findById(request.getServiceId())
                .orElseThrow(() -> BusinessException.notFound("Không tìm thấy dịch vụ y tế"));

        boolean exists = appointmentServiceRepository.existsByAppointment_IdAndMedicalService_Id(appointment.getId(), medicalService.getId());

        if (exists) {
            throw BusinessException.conflict("Dịch vụ này đã được thêm vào lịch hẹn");
        }

        AppointmentService appointmentService = AppointmentService.builder()
                .appointment(appointment)
                .medicalService(medicalService)
                .priceAtTime(medicalService.getPrice())
                .quantity(request.getQuantity())
                .build();

        AppointmentService saved = appointmentServiceRepository.save(appointmentService);

        AppointmentServiceResponse response = toResponse(saved);

        return new ApiResponse(200, "Thêm dịch vụ vào lịch hẹn thành công", response);
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse getServicesByAppointmentUuid(String appointmentUuid) {
        Appointment appointment = findAppointment(appointmentUuid);

        List<AppointmentService> services = appointmentServiceRepository.findByAppointment_IdOrderByIdAsc(appointment.getId());

        List<AppointmentServiceResponse> response = services.stream()
                .map(this::toResponse)
                .toList();

        return new ApiResponse(200, "Lấy danh sách dịch vụ thành công", response);
    }

    @Override
    @Transactional
    public ApiResponse removeServiceFromAppointment(String appointmentUuid, Long serviceId) {
        Appointment appointment = findAppointment(appointmentUuid);
        ensureServicesEditable(appointment);

        AppointmentService appointmentService = appointmentServiceRepository.findByAppointment_IdAndMedicalService_Id(appointment.getId(), serviceId)
                .orElseThrow(() -> BusinessException.notFound("Dịch vụ không tồn tại trong lịch hẹn"));

        appointmentServiceRepository.delete(appointmentService);

        return new ApiResponse(200, "Xóa dịch vụ khỏi lịch hẹn thành công", null);
    }

    private Appointment findAppointment(String appointmentUuid) {
        return appointmentRepository.findByUuid(appointmentUuid).orElseThrow(() -> BusinessException.notFound("Không tìm thấy lịch hẹn"));
    }

    private void ensureServicesEditable(Appointment appointment) {
        if (LOCKED_STATUSES.contains(appointment.getStatus())) {
            throw BusinessException.badRequest("Lịch hẹn đã hủy hoặc không đến khám, không thể sửa dịch vụ");
        }
        if (paymentRepository.existsByAppointment_Id(appointment.getId())) {
            throw BusinessException.conflict("Lịch hẹn đã lập thanh toán, không thể sửa dịch vụ");
        }
    }

    private AppointmentServiceResponse toResponse(AppointmentService appointmentService) {
        Long price = appointmentService.getPriceAtTime();
        Long quantity = appointmentService.getQuantity();

        Long totalPrice = Math.multiplyExact(price, quantity);

        return AppointmentServiceResponse.builder()
                .appointmentUuid(appointmentService.getAppointment().getUuid())
                .serviceId(appointmentService.getMedicalService().getId())
                .serviceName(appointmentService.getMedicalService().getName())
                .priceAtTime(price)
                .quantity(quantity)
                .totalPrice(totalPrice)
                .build();
    }
}
