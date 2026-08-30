package vn.namluongson.datlichkhambenhv.domain.dtos.requests.department;

import lombok.Getter;
import lombok.Setter;
import vn.namluongson.datlichkhambenhv.domain.dtos.requests.BasePagingRequest;

@Getter
@Setter
public class DepartmentPagingRequest extends BasePagingRequest {
    private String name;
}
