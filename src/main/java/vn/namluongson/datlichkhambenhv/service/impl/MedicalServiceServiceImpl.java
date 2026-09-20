package vn.namluongson.datlichkhambenhv.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import vn.namluongson.datlichkhambenhv.domain.dtos.responses.medicalservice.MedicalServiceResponse;
import vn.namluongson.datlichkhambenhv.domain.entities.MedicalService;
import vn.namluongson.datlichkhambenhv.repository.medicalservice.MedicalServiceRepository;
import vn.namluongson.datlichkhambenhv.service.interfaces.IMedicalServiceService;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MedicalServiceServiceImpl implements IMedicalServiceService {
    private final MedicalServiceRepository medicalServiceRepository;

    @Override
    public List<MedicalServiceResponse> getListMedicalService(String name) throws Exception {
        List<MedicalService> medicalServices = medicalServiceRepository.findAll();

        if(name != null && !name.trim().isEmpty()) {
            medicalServices = medicalServiceRepository.findByNameContainingIgnoreCase(name);
        }

        return medicalServices.stream().map(res -> {
            MedicalServiceResponse response = new MedicalServiceResponse();
            response.setDepartmentName(res.getDepartment().getName());
            response.setName(res.getName());
            response.setPrice(res.getPrice());
            response.setDescription(res.getDescription());
            return response;
        }).toList();
    }
}
