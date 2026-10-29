package vn.namluongson.datlichkhambenhv.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.namluongson.datlichkhambenhv.domain.dtos.requests.appointmentservice.AddAppointmentServiceRequest;
import vn.namluongson.datlichkhambenhv.domain.dtos.responses.appointmentservice.AppointmentServiceResponse;
import vn.namluongson.datlichkhambenhv.domain.entities.Appointment;
import vn.namluongson.datlichkhambenhv.domain.entities.AppointmentService;
import vn.namluongson.datlichkhambenhv.domain.entities.MedicalService;
import vn.namluongson.datlichkhambenhv.domain.response.ApiResponse;
import vn.namluongson.datlichkhambenhv.repository.appointment.AppointmentRepository;
import vn.namluongson.datlichkhambenhv.repository.appointment.AppointmentServiceRepository;
import vn.namluongson.datlichkhambenhv.repository.medicalservice.MedicalServiceRepository;
import vn.namluongson.datlichkhambenhv.service.interfaces.IAppointmentServiceService;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AppointmentServiceService implements IAppointmentServiceService {
    private final AppointmentServiceRepository appointmentServiceRepository;
    private final AppointmentRepository appointmentRepository;
    private final MedicalServiceRepository medicalServiceRepository;

    @Override
    @Transactional
    public ApiResponse addServiceToAppointment(AddAppointmentServiceRequest request) {
        Appointment appointment = appointmentRepository.findById(request.getAppointmentId()).orElseThrow(() -> new RuntimeException("Không tìm thấy lịch hẹn"));

        MedicalService medicalService = medicalServiceRepository.findById(request.getServiceId()).orElseThrow(() -> new RuntimeException("Không tìm thấy dịch vụ y tế"));

        boolean exists = appointmentServiceRepository.existsByAppointment_IdAndMedicalService_Id(appointment.getId(), medicalService.getId());

        if (exists) {
            throw new RuntimeException("Dịch vụ này đã được thêm vào lịch hẹn");
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
    public ApiResponse getServicesByAppointmentId(Long appointmentId) {
        appointmentRepository.findById(appointmentId).orElseThrow(() -> new RuntimeException("Không tìm thấy lịch hẹn"));

        List<AppointmentService> services = appointmentServiceRepository.findByAppointment_IdOrderByIdAsc(appointmentId);

        List<AppointmentServiceResponse> response = services.stream()
                .map(this::toResponse)
                .toList();

        return new ApiResponse(200, "Lấy danh sách dịch vụ thành công", response);
    }

    @Override
    @Transactional
    public ApiResponse removeServiceFromAppointment(Long appointmentId, Long serviceId) {
        appointmentRepository.findById(appointmentId).orElseThrow(() -> new RuntimeException("Không tìm thấy lịch hẹn"));

        AppointmentService appointmentService = appointmentServiceRepository.findByAppointment_IdAndMedicalService_Id(appointmentId, serviceId).orElseThrow(() -> new RuntimeException("Dịch vụ không tồn tại trong lịch hẹn"));

        appointmentServiceRepository.delete(appointmentService);

        return new ApiResponse(200, "Xóa dịch vụ khỏi lịch hẹn thành công", null);
    }

    private AppointmentServiceResponse toResponse(AppointmentService appointmentService) {
        Long price = appointmentService.getPriceAtTime();
        Long quantity = appointmentService.getQuantity();

        Long totalPrice = Math.multiplyExact(price, quantity);

        return AppointmentServiceResponse.builder()
                .id(appointmentService.getId())
                .appointmentId(appointmentService.getAppointment().getId())
                .serviceId(appointmentService.getMedicalService().getId())
                .serviceName(appointmentService.getMedicalService().getName())
                .priceAtTime(price)
                .quantity(quantity)
                .totalPrice(totalPrice)
                .build();
    }
}