package vn.namluongson.datlichkhambenhv.service.interfaces;


import org.springframework.data.domain.Page;
import vn.namluongson.datlichkhambenhv.domain.dtos.requests.department.CreateDepartmentRequest;
import vn.namluongson.datlichkhambenhv.domain.dtos.requests.department.DepartmentPagingRequest;
import vn.namluongson.datlichkhambenhv.domain.dtos.requests.department.ListDepartmentRequest;
import vn.namluongson.datlichkhambenhv.domain.dtos.requests.department.UpdateDepartmentRequest;
import vn.namluongson.datlichkhambenhv.domain.entities.Department;
import vn.namluongson.datlichkhambenhv.domain.response.ApiResponse;

import java.util.List;

public interface IDepartmentService {
    ApiResponse createDepartment(CreateDepartmentRequest request);
    ApiResponse updateDepartment(UpdateDepartmentRequest request) throws Exception;
    ApiResponse deleteDepartment(Long id) throws Exception;
    Page<Department> getDepartments(DepartmentPagingRequest request);
    List<Department> getListDepartments(ListDepartmentRequest request);
    Department getDepartmentById(Long id) throws Exception;
}
