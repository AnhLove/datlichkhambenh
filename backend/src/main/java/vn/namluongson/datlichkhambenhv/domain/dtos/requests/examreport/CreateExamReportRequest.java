package vn.namluongson.datlichkhambenhv.domain.dtos.requests.examreport;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateExamReportRequest {

    @NotBlank(message = "Mã lịch hẹn không được để trống")
    @Size(max = 36, message = "Mã không hợp lệ")
    private String appointmentUuid;

    @NotBlank(message = "Chẩn đoán không được để trống")
    @Size(max = 1000, message = "Chẩn đoán không được vượt quá 1000 ký tự")
    private String diagnosis;

    @Size(max = 1000, message = "Ghi chú không được vượt quá 1000 ký tự")
    private String notes;
}
