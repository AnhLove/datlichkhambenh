package vn.namluongson.datlichkhambenhv.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import vn.namluongson.datlichkhambenhv.domain.dtos.requests.medicalservice.CreateMedicalServiceRequest;
import vn.namluongson.datlichkhambenhv.domain.dtos.responses.medicalservice.MedicalServiceResponse;
import vn.namluongson.datlichkhambenhv.domain.entities.MedicalService;
import vn.namluongson.datlichkhambenhv.domain.response.ApiResponse;
import vn.namluongson.datlichkhambenhv.repository.department.DepartmentRepository;
import vn.namluongson.datlichkhambenhv.repository.medicalservice.MedicalServiceRepository;
import vn.namluongson.datlichkhambenhv.service.interfaces.IMedicalServiceService;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MedicalServiceService implements IMedicalServiceService {
    private final MedicalServiceRepository medicalServiceRepository;
    private final DepartmentRepository departmentRepository;

    @Override
    public List<MedicalServiceResponse> getListMedicalService(String name) throws Exception {
        List<MedicalService> medicalServices = medicalServiceRepository.findAll();

        if(name != null && !name.trim().isEmpty()) {
            medicalServices = medicalServiceRepository.findByNameContainingIgnoreCase(name.trim());
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

    @Override
    public MedicalServiceResponse getMedicalServiceById(Long id) throws Exception {
        if(id == null) {
            throw new Exception("Khong ton tai");
        }

        var data = medicalServiceRepository.findById(id).orElse(null);
        if (data == null) {
            throw new Exception("Khong co du lieu");
        }

        MedicalServiceResponse response = new MedicalServiceResponse();
        response.setDepartmentName(data.getDepartment().getName());
        response.setName(data.getName());
        response.setPrice(data.getPrice());
        response.setDescription(data.getDescription());
        return response;
    }

    @Override
    public ApiResponse createMedicalService(CreateMedicalServiceRequest request) {
        var department = departmentRepository.findById(request.getDepartmentId()).orElse(null);
        if(department == null) {
            throw new RuntimeException("Khong co khoa");
        }

        boolean exists = medicalServiceRepository.existsByDepartment_IdAndNameIgnoreCase(request.getDepartmentId(), request.getName().trim());

        if(exists) {
            throw new RuntimeException("Da ton tai");
        }
        MedicalService medicalService = new MedicalService();
        medicalService.setDepartment(department);
        medicalService.setName(request.getName().trim());
        medicalService.setPrice(request.getPrice());
        medicalService.setDescription(request.getDescription());
        medicalServiceRepository.save(medicalService);
        return new ApiResponse(200, null, medicalService.getId());
    }
}
