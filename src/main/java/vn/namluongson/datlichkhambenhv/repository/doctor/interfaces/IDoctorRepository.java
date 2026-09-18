package vn.namluongson.datlichkhambenhv.repository.doctor.interfaces;

import vn.namluongson.datlichkhambenhv.domain.dtos.responses.doctor.DoctorSearchResponse;

import java.util.List;

public interface IDoctorRepository {
    List<DoctorSearchResponse> getListDepartment_DoctorName(String departmentName, String fullName) throws Exception;
}
