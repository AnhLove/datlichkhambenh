package vn.namluongson.datlichkhambenhv.service.interfaces;

import org.springframework.data.domain.Page;
import vn.namluongson.datlichkhambenhv.domain.dtos.requests.doctor.CreateDoctorRequest;
import vn.namluongson.datlichkhambenhv.domain.dtos.requests.doctor.ListDoctorRequest;
import vn.namluongson.datlichkhambenhv.domain.dtos.requests.doctor.UpdateDoctorRequest;
import vn.namluongson.datlichkhambenhv.domain.dtos.responses.doctor.DoctorResponse;
import vn.namluongson.datlichkhambenhv.domain.response.ApiResponse;

import java.util.List;

public interface IDoctorService {
    ApiResponse createDoctor(CreateDoctorRequest request);
    ApiResponse updateDoctor(UpdateDoctorRequest request) throws Exception;
    ApiResponse deleteDoctor(String uuid) throws Exception;
    List<DoctorResponse> getListDoctors(ListDoctorRequest request);
    Page<DoctorResponse> getDoctors(ListDoctorRequest request);
}
