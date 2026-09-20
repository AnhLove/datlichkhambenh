package vn.namluongson.datlichkhambenhv.service.interfaces;

import vn.namluongson.datlichkhambenhv.domain.dtos.responses.medicalservice.MedicalServiceResponse;

import java.util.List;

public interface IMedicalServiceService {
    List<MedicalServiceResponse> getListMedicalService(String name) throws Exception;
}
