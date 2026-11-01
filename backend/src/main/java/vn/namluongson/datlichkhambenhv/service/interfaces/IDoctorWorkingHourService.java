package vn.namluongson.datlichkhambenhv.service.interfaces;

import vn.namluongson.datlichkhambenhv.domain.dtos.requests.BasePagingRequest;
import vn.namluongson.datlichkhambenhv.domain.dtos.requests.doctorworking.CreateDoctorWorkingHourRequest;
import vn.namluongson.datlichkhambenhv.domain.dtos.requests.doctorworking.UpdateDoctorWorkingHourStatusRequest;
import vn.namluongson.datlichkhambenhv.domain.dtos.responses.doctorworking.DoctorWorkingHourResponse;
import vn.namluongson.datlichkhambenhv.domain.response.ApiResponse;
import vn.namluongson.datlichkhambenhv.domain.response.PageResponse;

import java.util.List;

public interface IDoctorWorkingHourService {
    ApiResponse createDoctorWorkingHour(CreateDoctorWorkingHourRequest request);

    List<DoctorWorkingHourResponse> getWorkingHoursByDoctorUuid(String uuid) throws Exception;

    PageResponse<DoctorWorkingHourResponse> getWorkingHourByStatus(Short status, BasePagingRequest paging);

    ApiResponse updateWorkingStatus(String uuid, UpdateDoctorWorkingHourStatusRequest request);

    ApiResponse saveMyWorkingHour(Short dayOfWeek, Short shiftType);
}
