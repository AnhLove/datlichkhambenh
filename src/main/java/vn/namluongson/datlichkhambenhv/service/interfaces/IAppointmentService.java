package vn.namluongson.datlichkhambenhv.service.interfaces;

import vn.namluongson.datlichkhambenhv.domain.dtos.requests.appointment.CreateAppointmentRequest;
import vn.namluongson.datlichkhambenhv.domain.response.ApiResponse;

public interface IAppointmentService {
    ApiResponse createAppointment(CreateAppointmentRequest request);
}
