package vn.namluongson.datlichkhambenhv.service.interfaces;


import org.springframework.data.domain.Page;
import vn.namluongson.datlichkhambenhv.domain.dtos.requests.department.CreateDepartmentRequest;
import vn.namluongson.datlichkhambenhv.domain.dtos.requests.department.DepartmentPagingRequest;
import vn.namluongson.datlichkhambenhv.domain.dtos.requests.department.UpdateDepartmentRequest;
import vn.namluongson.datlichkhambenhv.domain.entities.Department;
import vn.namluongson.datlichkhambenhv.domain.response.ApiResponse;

public interface IDepartmentService {
    ApiResponse createDepartment(CreateDepartmentRequest request);
    ApiResponse updateDepartment(UpdateDepartmentRequest request) throws Exception;
    ApiResponse deleteDepartment(Long id) throws Exception;
    Page<Department> getDepartments(DepartmentPagingRequest request);
}
