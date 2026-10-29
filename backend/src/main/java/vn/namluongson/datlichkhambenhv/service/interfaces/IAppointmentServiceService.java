package vn.namluongson.datlichkhambenhv.service.interfaces;

import vn.namluongson.datlichkhambenhv.domain.dtos.requests.appointmentservice.AddAppointmentServiceRequest;
import vn.namluongson.datlichkhambenhv.domain.response.ApiResponse;

public interface IAppointmentServiceService {
    ApiResponse addServiceToAppointment(AddAppointmentServiceRequest request);
    ApiResponse getServicesByAppointmentId(Long appointmentId);
    ApiResponse removeServiceFromAppointment(Long appointmentId, Long serviceId);
}