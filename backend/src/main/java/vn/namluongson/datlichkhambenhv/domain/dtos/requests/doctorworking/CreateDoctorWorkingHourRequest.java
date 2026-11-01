package vn.namluongson.datlichkhambenhv.domain.dtos.requests.doctorworking;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateDoctorWorkingHourRequest {
    @NotBlank(message = "Vui lòng chọn bác sĩ")
    @Size(max = 36, message = "Mã bác sĩ không hợp lệ")
    private String doctorUuid;

    @NotNull(message = "Vui lòng chọn thứ trong tuần")
    @Min(value = 1, message = "Thứ trong tuần phải từ 1 (Thứ Hai) đến 7 (Chủ Nhật)")
    @Max(value = 7, message = "Thứ trong tuần phải từ 1 (Thứ Hai) đến 7 (Chủ Nhật)")
    private Short dayOfWeek;

    @NotNull(message = "Vui lòng chọn ca làm việc")
    @Min(value = 1, message = "Ca làm việc không hợp lệ")
    @Max(value = 4, message = "Ca làm việc không hợp lệ")
    private Short shiftType;
}
