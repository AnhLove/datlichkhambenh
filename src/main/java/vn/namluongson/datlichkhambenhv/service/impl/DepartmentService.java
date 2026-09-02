package vn.namluongson.datlichkhambenhv.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import vn.namluongson.datlichkhambenhv.domain.dtos.requests.department.CreateDepartmentRequest;
import vn.namluongson.datlichkhambenhv.domain.dtos.requests.department.DepartmentPagingRequest;
import vn.namluongson.datlichkhambenhv.domain.dtos.requests.department.ListDepartmentRequest;
import vn.namluongson.datlichkhambenhv.domain.dtos.requests.department.UpdateDepartmentRequest;
import vn.namluongson.datlichkhambenhv.domain.entities.Department;
import vn.namluongson.datlichkhambenhv.domain.response.ApiResponse;
import vn.namluongson.datlichkhambenhv.repository.DepartmentRepository;
import vn.namluongson.datlichkhambenhv.service.interfaces.IDepartmentService;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DepartmentService implements IDepartmentService {
    private final DepartmentRepository departmentRepository;

    public ApiResponse createDepartment(CreateDepartmentRequest request) {
        var department = new Department();

        department.setName(request.getName());
        department.setDescription(request.getDescription());

        departmentRepository.save(department);
        return new ApiResponse(200, null, department.getId());
    }

    public ApiResponse updateDepartment(UpdateDepartmentRequest request) throws Exception {
        var entity = departmentRepository.findById(request.getId()).orElse(null);
        if(entity == null) {
            throw new Exception("Department not found");
        }

        entity.setName(request.getName());
        entity.setDescription(request.getDescription());
        departmentRepository.save(entity);

        return new ApiResponse(200, null, entity.getId());
    }

    @Override
    public ApiResponse deleteDepartment(Long id) throws Exception {
        var entity = departmentRepository.findById(id).orElse(null);
        if(entity == null) {
            throw new Exception("Department not found");
        }

        departmentRepository.deleteById(id);
        return new ApiResponse(200, null, entity.getId());
    }

    public Page<Department> getDepartments(DepartmentPagingRequest request) {
        Pageable pageable = PageRequest.of(request.getPage() - 1, request.getSize());
        return departmentRepository.findAll(pageable);
    }

    @Override
    public List<Department> getListDepartments(ListDepartmentRequest request) {
        if(request != null && request.getName() != null && !request.getName().trim().isEmpty()) {
            return departmentRepository.findByNameContainingIgnoreCase(request.getName().trim());
        }
        return departmentRepository.findAll();
    }

    @Override
    public Department getDepartmentById(Long id) throws Exception {
        if(id == null) {
            throw new Exception("id is empty");
        }

        var data = departmentRepository.findById(id).orElse(null);
        if(data == null) {
            throw new Exception("Department not found");
        }
        return data;
    }
}
