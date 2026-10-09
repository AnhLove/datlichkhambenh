package vn.namluongson.datlichkhambenhv.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.namluongson.datlichkhambenhv.config.security.CustomUserDetails;
import vn.namluongson.datlichkhambenhv.domain.dtos.requests.examreport.CreateExamReportRequest;
import vn.namluongson.datlichkhambenhv.domain.dtos.responses.examreport.ExamReportResponse;
import vn.namluongson.datlichkhambenhv.domain.response.ApiResponse;
import vn.namluongson.datlichkhambenhv.domain.entities.Appointment;
import vn.namluongson.datlichkhambenhv.domain.entities.ExamReport;
import vn.namluongson.datlichkhambenhv.domain.entities.User;
import vn.namluongson.datlichkhambenhv.domain.enums.AppointmentStatus;
import vn.namluongson.datlichkhambenhv.domain.enums.ReportStatus;
import vn.namluongson.datlichkhambenhv.domain.enums.Role;
import vn.namluongson.datlichkhambenhv.repository.appointment.AppointmentRepository;
import vn.namluongson.datlichkhambenhv.repository.examreport.ExamReportRepository;
import vn.namluongson.datlichkhambenhv.service.interfaces.IExamReportService;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ExamReportService implements IExamReportService {

    private final ExamReportRepository examReportRepository;
    private final AppointmentRepository appointmentRepository;

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !(authentication.getPrincipal() instanceof CustomUserDetails userDetails)) {
            throw new AccessDeniedException("Vui lòng đăng nhập");
        }

        return userDetails.getUser();
    }

    private void checkDoctor(User user) {
        if (user.getRole() != Role.DOCTOR.getCode()) {
            throw new AccessDeniedException("Chỉ bác sĩ mới được thực hiện chức năng này");
        }
    }

    private void checkPatient(User user) {
        if (user.getRole() != Role.PATIENT.getCode()) {
            throw new AccessDeniedException("Chỉ bệnh nhân mới được thực hiện chức năng này");
        }
    }

    @Override
    public ApiResponse createExamReport(CreateExamReportRequest request) {
        User currentUser = getCurrentUser();
        checkDoctor(currentUser);

        Appointment appointment = appointmentRepository.findById(request.getAppointmentId()).orElseThrow(() -> new RuntimeException("Không tìm thấy lịch hẹn"));

        if (!appointment.getDoctor().getUser().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("Bạn không phụ trách lịch hẹn này");
        }

        if (!appointment.getStatus().equals(AppointmentStatus.COMPLETED.getCode())) {
            throw new RuntimeException("Chỉ được lập phiếu khám khi lịch hẹn đã hoàn thành");
        }

        if (examReportRepository.findByAppointment_Id(appointment.getId()).isPresent()) {
            throw new RuntimeException("Lịch hẹn này đã có phiếu khám");
        }

        ExamReport report = ExamReport.builder()
                .appointment(appointment)
                .issuedBy(currentUser)
                .diagnosis(request.getDiagnosis())
                .notes(request.getNotes())
                .status((short) ReportStatus.DRAFT.getCode())
                .issuedAt(null)
                .build();

        ExamReport savedReport = examReportRepository.save(report);

        return new ApiResponse(200,"Tạo phiếu khám thành công", toResponse(savedReport));
    }

    @Override
    public ApiResponse issueExamReport(Long reportId) {
        User currentUser = getCurrentUser();
        checkDoctor(currentUser);

        ExamReport report = examReportRepository.findById(reportId).orElseThrow(() -> new RuntimeException("Không tìm thấy phiếu khám"));

        if (!report.getAppointment().getDoctor().getUser().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("Bạn không phụ trách lịch hẹn này");
        }

        if (!report.getStatus().equals((short) ReportStatus.DRAFT.getCode())) {
            throw new RuntimeException("Chỉ được phát hành phiếu đang ở trạng thái DRAFT");
        }

        report.setStatus((short) ReportStatus.ISSUED.getCode());
        report.setIssuedAt(LocalDateTime.now());

        ExamReport savedReport = examReportRepository.save(report);

        return new ApiResponse(200,"Phát hành phiếu khám thành công", toResponse(savedReport));
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse getMyDoctorReports() {
        User currentUser = getCurrentUser();
        checkDoctor(currentUser);

        List<ExamReportResponse> reports = examReportRepository
                        .findByIssuedBy_IdOrderByIssuedAtDesc(currentUser.getId())
                        .stream()
                        .map(this::toResponse)
                        .toList();

        return new ApiResponse(200, "Lấy danh sách phiếu khám thành công", reports);
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse getMyPatientReports() {
        User currentUser = getCurrentUser();
        checkPatient(currentUser);

        List<ExamReportResponse> reports = examReportRepository
                        .findByAppointment_Patient_IdOrderByIssuedAtDesc(currentUser.getId())
                        .stream()
                        .filter(report -> report.getStatus() != null && report.getStatus() == ReportStatus.ISSUED.getCode())
                        .map(this::toResponse)
                        .toList();

        return new ApiResponse(200, "Lấy danh sách phiếu khám thành công", reports);
    }

    private ExamReportResponse toResponse(ExamReport report) {
        ReportStatus reportStatus = null;

        if (report.getStatus() != null) {
            for (ReportStatus status : ReportStatus.values()) {
                if (status.getCode() == report.getStatus()) {
                    reportStatus = status;
                    break;
                }
            }
        }

        return ExamReportResponse.builder()
                .id(report.getId())
                .appointmentId(report.getAppointment().getId())
                .patientName(report.getAppointment().getPatient().getFullName())
                .doctorName(report.getAppointment().getDoctor().getUser().getFullName())
                .diagnosis(report.getDiagnosis())
                .notes(report.getNotes())
                .status(report.getStatus() == null ? null : report.getStatus().intValue())
                .statusName(reportStatus == null ? null : reportStatus.getName())
                .issuedAt(report.getIssuedAt())
                .build();
    }
}