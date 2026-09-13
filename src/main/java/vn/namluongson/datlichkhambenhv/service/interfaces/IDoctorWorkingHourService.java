package vn.namluongson.datlichkhambenhv.service.interfaces;

import vn.namluongson.datlichkhambenhv.domain.dtos.requests.doctorworking.CreateDoctorWorkingHourRequest;
import vn.namluongson.datlichkhambenhv.domain.response.ApiResponse;

public interface IDoctorWorkingHourService {
    ApiResponse createDoctorWorkingHour(CreateDoctorWorkingHourRequest request);
}
