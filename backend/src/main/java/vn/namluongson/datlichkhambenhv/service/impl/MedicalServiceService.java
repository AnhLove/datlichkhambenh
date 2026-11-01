package vn.namluongson.datlichkhambenhv.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.namluongson.datlichkhambenhv.domain.dtos.requests.medicalservice.CreateMedicalServiceRequest;
import vn.namluongson.datlichkhambenhv.domain.dtos.requests.medicalservice.MedicalServicePagingRequest;
import vn.namluongson.datlichkhambenhv.domain.dtos.requests.medicalservice.UpdateMedicalServiceRequest;
import vn.namluongson.datlichkhambenhv.domain.dtos.responses.medicalservice.MedicalServiceResponse;
import vn.namluongson.datlichkhambenhv.domain.entities.MedicalService;
import vn.namluongson.datlichkhambenhv.domain.response.ApiResponse;
import vn.namluongson.datlichkhambenhv.domain.response.PageResponse;
import vn.namluongson.datlichkhambenhv.exception.BusinessException;
import vn.namluongson.datlichkhambenhv.repository.department.DepartmentRepository;
import vn.namluongson.datlichkhambenhv.repository.medicalservice.MedicalServiceRepository;
import vn.namluongson.datlichkhambenhv.service.interfaces.IMedicalServiceService;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MedicalServiceService implements IMedicalServiceService {
    private static final int MAX_LIST_SIZE = 200;
    private static final Sort SERVICE_SORT = Sort.by("name").and(Sort.by("id"));
    private final MedicalServiceRepository medicalServiceRepository;
    private final DepartmentRepository departmentRepository;

    @Override
    @Transactional(readOnly = true)
    public List<MedicalServiceResponse> getListMedicalService(String name) throws Exception {
        Pageable pageable = PageRequest.of(0, MAX_LIST_SIZE, SERVICE_SORT);
        Page<MedicalService> medicalServices = hasText(name)
                ? medicalServiceRepository.findByNameContainingIgnoreCase(name.trim(), pageable)
                : medicalServiceRepository.findAll(pageable);

        return medicalServices.map(this::toResponse).getContent();
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<MedicalServiceResponse> getMedicalServices(MedicalServicePagingRequest request) {
        Pageable pageable = request.toPageable(SERVICE_SORT);
        Page<MedicalService> medicalServices = hasText(request.getName())
                ? medicalServiceRepository.findByNameContainingIgnoreCase(request.getName().trim(), pageable)
                : medicalServiceRepository.findAll(pageable);

        return PageResponse.of(medicalServices.map(this::toResponse));
    }

    private boolean hasText(String value) {
        return value != null && !value.trim().isEmpty();
    }

    private MedicalServiceResponse toResponse(MedicalService data) {
        MedicalServiceResponse response = new MedicalServiceResponse();
        response.setId(data.getId());
        response.setDepartmentName(data.getDepartment().getName());
        response.setName(data.getName());
        response.setPrice(data.getPrice());
        response.setDescription(data.getDescription());
        return response;
    }

    @Override
    public MedicalServiceResponse getMedicalServiceById(Long id) throws Exception {
        var data = medicalServiceRepository.findById(id).orElse(null);
        if (data == null) {
            throw BusinessException.notFound("Khong co du lieu");
        }

        MedicalServiceResponse response = new MedicalServiceResponse();
        response.setId(data.getId());
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
            throw BusinessException.notFound("Khong co khoa");
        }

        boolean exists = medicalServiceRepository.existsByDepartment_IdAndNameIgnoreCase(request.getDepartmentId(), request.getName().trim());

        if(exists) {
            throw BusinessException.conflict("Da ton tai");
        }
        MedicalService medicalService = new MedicalService();
        medicalService.setDepartment(department);
        medicalService.setName(request.getName().trim());
        medicalService.setPrice(request.getPrice());
        medicalService.setDescription(request.getDescription());
        medicalServiceRepository.save(medicalService);
        return new ApiResponse(200, null, medicalService.getId());
    }

    @Override
    public ApiResponse updateMedicalService(Long id, UpdateMedicalServiceRequest request) {
        var medicalService = medicalServiceRepository.findById(id).orElse(null);
        if(medicalService == null) {
            throw BusinessException.notFound("Khong ton tai");
        }

        var department = departmentRepository.findById(request.getDepartmentId()).orElse(null);
        if (department == null) {
            throw BusinessException.notFound("Khong ton tai khoa");
        }

        boolean exists = medicalServiceRepository.existsByDepartment_IdAndNameIgnoreCaseAndIdNot(request.getDepartmentId(), request.getName().trim(), medicalService.getId());
        if(exists) {
            throw BusinessException.conflict("Khong the cap nhap");
        }
        medicalService.setDepartment(department);
        medicalService.setName(request.getName().trim());
        medicalService.setPrice(request.getPrice());
        medicalService.setDescription(request.getDescription());
        medicalServiceRepository.save(medicalService);
        return new ApiResponse(200, null, medicalService.getId());
    }

    @Override
    public ApiResponse deleteMedicalService(Long id) {
        var entity = medicalServiceRepository.findById(id).orElse(null);
        if(entity == null) {
            throw BusinessException.notFound("Khong ton tai");
        }

        medicalServiceRepository.delete(entity);

        return new ApiResponse(200, null, entity.getId());
    }
}

