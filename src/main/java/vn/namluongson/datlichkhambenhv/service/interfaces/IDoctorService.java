package vn.namluongson.datlichkhambenhv.service.interfaces;

import vn.namluongson.datlichkhambenhv.domain.dtos.requests.doctor.CreateDoctorRequest;
import vn.namluongson.datlichkhambenhv.domain.response.ApiResponse;

public interface IDoctorService {
    ApiResponse createDoctor(CreateDoctorRequest request);
}
