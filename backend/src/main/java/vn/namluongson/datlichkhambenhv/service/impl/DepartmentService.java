package vn.namluongson.datlichkhambenhv.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import vn.namluongson.datlichkhambenhv.domain.dtos.requests.department.CreateDepartmentRequest;
import vn.namluongson.datlichkhambenhv.domain.dtos.requests.department.DepartmentPagingRequest;
import vn.namluongson.datlichkhambenhv.domain.dtos.requests.department.ListDepartmentRequest;
import vn.namluongson.datlichkhambenhv.domain.dtos.requests.department.UpdateDepartmentRequest;
import vn.namluongson.datlichkhambenhv.domain.entities.Department;
import vn.namluongson.datlichkhambenhv.domain.response.ApiResponse;
import vn.namluongson.datlichkhambenhv.exception.BusinessException;
import vn.namluongson.datlichkhambenhv.repository.department.DepartmentRepository;
import vn.namluongson.datlichkhambenhv.service.interfaces.IDepartmentService;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DepartmentService implements IDepartmentService {
    private static final int MAX_LIST_SIZE = 200;
    private static final Sort DEPARTMENT_SORT = Sort.by("name").and(Sort.by("id"));

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
            throw BusinessException.notFound("Department not found");
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
            throw BusinessException.notFound("Department not found");
        }

        departmentRepository.deleteById(id);
        return new ApiResponse(200, null, entity.getId());
    }

    public Page<Department> getDepartments(DepartmentPagingRequest request) {
        Pageable pageable = request.toPageable(DEPARTMENT_SORT);
        if (request.getName() != null && !request.getName().trim().isEmpty()) {
            return departmentRepository.findByNameContainingIgnoreCase(request.getName().trim(), pageable);
        }
        return departmentRepository.findAll(pageable);
    }

    @Override
    public List<Department> getListDepartments(ListDepartmentRequest request) {
        Pageable pageable = PageRequest.of(0, MAX_LIST_SIZE, DEPARTMENT_SORT);
        if(request != null && request.getName() != null && !request.getName().trim().isEmpty()) {
            return departmentRepository.findByNameContainingIgnoreCase(request.getName().trim(), pageable).getContent();
        }
        return departmentRepository.findAll(pageable).getContent();
    }

    @Override
    public Department getDepartmentById(Long id) throws Exception {
        var data = departmentRepository.findById(id).orElse(null);
        if(data == null) {
            throw BusinessException.notFound("Department not found");
        }
        return data;
    }
}

