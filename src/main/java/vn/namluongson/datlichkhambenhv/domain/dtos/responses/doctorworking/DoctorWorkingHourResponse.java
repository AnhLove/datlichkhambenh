package vn.namluongson.datlichkhambenhv.domain.dtos.responses.doctorworking;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DoctorWorkingHourResponse {
    private Long id;
    private String uuid;
    private Short dayOfWeek;
    private Short shiftType;
    private Short status;
    private String setByUuid;
}
