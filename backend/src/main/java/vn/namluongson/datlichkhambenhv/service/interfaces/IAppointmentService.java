package vn.namluongson.datlichkhambenhv.service.interfaces;

import vn.namluongson.datlichkhambenhv.domain.dtos.requests.BasePagingRequest;
import vn.namluongson.datlichkhambenhv.domain.dtos.requests.appointment.CancelAppointmentRequest;
import vn.namluongson.datlichkhambenhv.domain.dtos.requests.appointment.CreateAppointmentRequest;
import vn.namluongson.datlichkhambenhv.domain.dtos.responses.appointment.AvailableSlotResponse;
import vn.namluongson.datlichkhambenhv.domain.response.ApiResponse;

import java.time.LocalDate;
import java.util.List;

public interface IAppointmentService {
    ApiResponse createAppointment(CreateAppointmentRequest request);
    List<AvailableSlotResponse> getAvailableSlots(String doctorUuid, LocalDate appointmentDate);
    ApiResponse getMyAppointments(BasePagingRequest paging);
    ApiResponse cancelAppointment(String appointmentUuid, CancelAppointmentRequest request);
    ApiResponse confirmAppointment(String appointmentUuid);
    ApiResponse checkInAppointment(String appointmentUuid);
    ApiResponse noShowAppointment(String appointmentUuid);
    ApiResponse completeAppointment(String appointmentUuid);
    ApiResponse getTodayAppointments(BasePagingRequest paging);
    ApiResponse getMyDoctorAppointments(BasePagingRequest paging);
    ApiResponse getAppointmentsByDate(LocalDate date, BasePagingRequest paging);
    ApiResponse rejectAppointment(String appointmentUuid, CancelAppointmentRequest request);
}

