package vn.namluongson.datlichkhambenhv.domain.dtos.responses.appointmentservice;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AppointmentServiceResponse {
    private Long id;
    private Long appointmentId;
    private Long serviceId;
    private String serviceName;
    private Long priceAtTime;
    private Long quantity;
    private Long totalPrice;
}