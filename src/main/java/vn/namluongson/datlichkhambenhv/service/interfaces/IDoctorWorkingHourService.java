package vn.namluongson.datlichkhambenhv.service.interfaces;

import vn.namluongson.datlichkhambenhv.domain.dtos.requests.doctorworking.CreateDoctorWorkingHourRequest;
import vn.namluongson.datlichkhambenhv.domain.dtos.responses.doctorworking.DoctorWorkingHourResponse;
import vn.namluongson.datlichkhambenhv.domain.response.ApiResponse;

import java.util.List;

public interface IDoctorWorkingHourService {
    ApiResponse createDoctorWorkingHour(CreateDoctorWorkingHourRequest request);
    List<DoctorWorkingHourResponse> getWorkingHoursByDoctorUuid(String uuid) throws Exception;
    List<DoctorWorkingHourResponse> getWorkingHourByStatus(Short status) throws Exception;
}
