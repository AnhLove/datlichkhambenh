package vn.namluongson.datlichkhambenhv.service.interfaces;

import vn.namluongson.datlichkhambenhv.domain.dtos.requests.medicalservice.CreateMedicalServiceRequest;
import vn.namluongson.datlichkhambenhv.domain.dtos.requests.medicalservice.UpdateMedicalServiceRequest;
import vn.namluongson.datlichkhambenhv.domain.dtos.responses.medicalservice.MedicalServiceResponse;
import vn.namluongson.datlichkhambenhv.domain.response.ApiResponse;

import java.util.List;

public interface IMedicalServiceService {
    List<MedicalServiceResponse> getListMedicalService(String name) throws Exception;
    MedicalServiceResponse getMedicalServiceById(Long id) throws Exception;
    ApiResponse createMedicalService(CreateMedicalServiceRequest request);
    ApiResponse updateMedicalService(Long id, UpdateMedicalServiceRequest request);
    ApiResponse deleteMedicalService(Long id);
}