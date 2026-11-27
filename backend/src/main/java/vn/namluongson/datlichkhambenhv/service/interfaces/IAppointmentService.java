package vn.namluongson.datlichkhambenhv.service.interfaces;

import vn.namluongson.datlichkhambenhv.domain.dtos.requests.BasePagingRequest;
import vn.namluongson.datlichkhambenhv.domain.dtos.requests.appointment.CancelAppointmentRequest;
import vn.namluongson.datlichkhambenhv.domain.dtos.requests.appointment.CreateAppointmentRequest;
import vn.namluongson.datlichkhambenhv.domain.dtos.responses.appointment.AvailableSlotResponse;
import vn.namluongson.datlichkhambenhv.domain.dtos.responses.appointment.EligibleDoctorResponse;
import vn.namluongson.datlichkhambenhv.domain.response.ApiResponse;

import java.time.LocalDate;
import java.util.List;

public interface IAppointmentService {
    ApiResponse createAppointment(CreateAppointmentRequest request, String currentUserUuid);
    List<AvailableSlotResponse> getAvailableSlots(Long departmentId, LocalDate appointmentDate);
    ApiResponse getMyAppointments(BasePagingRequest paging, String currentUserUuid);
    ApiResponse cancelAppointment(String appointmentUuid, CancelAppointmentRequest request, String currentUserUuid);
    ApiResponse confirmAppointment(String appointmentUuid, String currentUserUuid);
    ApiResponse checkInAppointment(String appointmentUuid, String doctorUuid, String currentUserUuid);
    ApiResponse noShowAppointment(String appointmentUuid, String currentUserUuid);
    ApiResponse completeAppointment(String appointmentUuid, String currentUserUuid);
    ApiResponse getTodayAppointments(BasePagingRequest paging, String currentUserUuid);
    ApiResponse getMyDoctorAppointments(BasePagingRequest paging, String currentUserUuid);
    ApiResponse getAppointmentsByDate(LocalDate date, BasePagingRequest paging, String currentUserUuid);
    ApiResponse rejectAppointment(String appointmentUuid, CancelAppointmentRequest request, String currentUserUuid);
    List<EligibleDoctorResponse> getEligibleDoctorsForCheckIn(String appointmentUuid, String currentUserUuid);
}

