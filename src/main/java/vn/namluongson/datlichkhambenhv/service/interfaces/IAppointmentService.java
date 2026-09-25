package vn.namluongson.datlichkhambenhv.service.interfaces;

import vn.namluongson.datlichkhambenhv.domain.dtos.requests.appointment.CreateAppointmentRequest;
import vn.namluongson.datlichkhambenhv.domain.dtos.responses.appointment.AvailableSlotResponse;
import vn.namluongson.datlichkhambenhv.domain.response.ApiResponse;

import java.time.LocalDate;
import java.util.List;

public interface IAppointmentService {
    ApiResponse createAppointment(CreateAppointmentRequest request);
    List<AvailableSlotResponse> getAvailableSlots(String doctorUuid, LocalDate appointmentDate);
}
