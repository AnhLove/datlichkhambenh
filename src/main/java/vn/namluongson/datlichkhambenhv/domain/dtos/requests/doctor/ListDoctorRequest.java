package vn.namluongson.datlichkhambenhv.domain.dtos.requests.doctor;

import lombok.Getter;
import lombok.Setter;
import vn.namluongson.datlichkhambenhv.domain.dtos.requests.BasePagingRequest;

@Getter
@Setter
public class ListDoctorRequest extends BasePagingRequest {
    private String fullName;
}
