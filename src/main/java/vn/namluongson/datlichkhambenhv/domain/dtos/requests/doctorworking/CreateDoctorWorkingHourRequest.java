package vn.namluongson.datlichkhambenhv.domain.dtos.requests.doctorworking;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateDoctorWorkingHourRequest {

    private Long doctorId;

    private Short dayOfWeek;

    private Short shiftType;
}
