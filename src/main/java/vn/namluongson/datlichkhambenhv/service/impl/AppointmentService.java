package vn.namluongson.datlichkhambenhv.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import vn.namluongson.datlichkhambenhv.config.security.CustomUserDetails;
import vn.namluongson.datlichkhambenhv.domain.dtos.requests.appointment.CancelAppointmentRequest;
import vn.namluongson.datlichkhambenhv.domain.dtos.requests.appointment.CreateAppointmentRequest;
import vn.namluongson.datlichkhambenhv.domain.dtos.responses.appointment.AppointmentResponse;
import vn.namluongson.datlichkhambenhv.domain.dtos.responses.appointment.AvailableSlotResponse;
import vn.namluongson.datlichkhambenhv.domain.entities.Appointment;
import vn.namluongson.datlichkhambenhv.domain.entities.User;
import vn.namluongson.datlichkhambenhv.domain.enums.AppointmentStatus;
import vn.namluongson.datlichkhambenhv.domain.enums.Role;
import vn.namluongson.datlichkhambenhv.domain.enums.TimeSlot;
import vn.namluongson.datlichkhambenhv.domain.response.ApiResponse;
import vn.namluongson.datlichkhambenhv.exception.BusinessException;
import vn.namluongson.datlichkhambenhv.repository.appointment.AppointmentRepository;
import vn.namluongson.datlichkhambenhv.repository.department.DepartmentRepository;
import vn.namluongson.datlichkhambenhv.repository.doctor.DoctorRepository;
import vn.namluongson.datlichkhambenhv.repository.doctor.DoctorWorkingHourRepository;
import vn.namluongson.datlichkhambenhv.repository.user.UserRepository;
import vn.namluongson.datlichkhambenhv.service.interfaces.IAppointmentService;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AppointmentService implements IAppointmentService {
    private final AppointmentRepository appointmentRepository;
    private final UserRepository userRepository;
    private final DoctorRepository doctorRepository;
    private final DoctorWorkingHourRepository doctorWorkingHourRepository;
    private final DepartmentRepository departmentRepository;
    private static final ZoneId VN_ZONE = ZoneId.of("Asia/Ho_Chi_Minh");

    @Override
    public ApiResponse createAppointment(CreateAppointmentRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof CustomUserDetails userDetails)) {
            throw BusinessException.unauthorized("Vui lòng đăng nhập");
        }
        User currentUser = userDetails.getUser();
        if (currentUser.getRole() != Role.PATIENT.getCode()) {
            throw BusinessException.forbidden("Khong phai benh nhan");
        }

        if (request.getAppointmentDate().isBefore(LocalDate.now(VN_ZONE))) {
            throw BusinessException.badRequest("Khong the dat lich qua khu");
        }
        var doctorUser = userRepository.findByUuid(request.getDoctorUuid());
        if (doctorUser == null) {
            throw BusinessException.notFound("Khong ton tai uuid bac si");
        }
        if (doctorUser.getRole() != Role.DOCTOR.getCode()) {
            throw BusinessException.badRequest("Khong phai bac si");
        }
        var doctor = doctorRepository.findById(doctorUser.getId()).orElse(null);
        if (doctor == null) {
            throw BusinessException.notFound("Khong ton tai bac si");
        }
        var department = departmentRepository.findById(request.getDepartmentId()).orElse(null);
        if (department == null) {
            throw BusinessException.notFound("Khong ton tai khoa nay");
        }
        if (!doctor.getDepartment().getId().equals(request.getDepartmentId())) {
            throw BusinessException.badRequest("Bac si ko thuoc khoa nay");
        }

        TimeSlot timeSlot = TimeSlot.fromValue(request.getTimeSlot());

        if(isSlotInPast(request.getAppointmentDate(), timeSlot)) {
            throw BusinessException.badRequest("khung gio da qua");
        }

        boolean exists = appointmentRepository.existsByDoctor_IdAndAppointmentDateAndTimeSlotAndStatusIn(
                doctor.getId(), request.getAppointmentDate(), request.getTimeSlot(), List.of(1, 2, 3));
        if (exists) {
            throw BusinessException.conflict("Khong con lich trong");
        }

        Short dayOfWeek = (short) request.getAppointmentDate().getDayOfWeek().getValue();
        Short shiftType = (short) timeSlot.getShiftType().getCode();

        int countWorkingHour = doctorWorkingHourRepository.countWorkingHour(doctor.getId(), dayOfWeek, shiftType, (short) 1, (short) 2);
        if (countWorkingHour == 0) {
            throw BusinessException.badRequest("Khong co Bac si lam viec gio nay");
        }

        Appointment appointment = new Appointment();
        appointment.setDoctor(doctor);
        appointment.setDepartment(department);
        appointment.setAppointmentDate(request.getAppointmentDate());
        appointment.setTimeSlot(request.getTimeSlot());
        appointment.setReason(request.getReason());
        appointment.setStatus(AppointmentStatus.PENDING.getCode());
        appointment.setPatient(currentUser);
        appointment.setCreatedBy(currentUser);
        appointment.setCreatedAt(LocalDateTime.now(VN_ZONE));

        try {
            appointmentRepository.save(appointment);
        } catch (DataIntegrityViolationException e) {
            throw BusinessException.conflict("Khong con lich trong");
        }

        AppointmentResponse response = new AppointmentResponse();
        response.setDoctorName(doctor.getUser().getFullName());
        response.setDepartmentName(department.getName());
        response.setAppointmentDate(appointment.getAppointmentDate());
        response.setTimeSlot(appointment.getTimeSlot());
        response.setReason(appointment.getReason());
        response.setStatus(appointment.getStatus());
        response.setCheckedInAt(appointment.getCheckedInAt());
        response.setCreatedAt(appointment.getCreatedAt());

        return new ApiResponse(200, null, response);
    }

    @Override
    public List<AvailableSlotResponse> getAvailableSlots(String doctorUuid, LocalDate appointmentDate) {
        var doctorUser = userRepository.findByUuid(doctorUuid);
        if(doctorUser == null) {
            throw BusinessException.notFound("Khong ton tai Uuid cuả bác sĩ");
        }
        if(doctorUser.getRole() != Role.DOCTOR.getCode()) {
            throw BusinessException.badRequest("Khong phai bac si");
        }
        var doctor = doctorRepository.findById(doctorUser.getId()).orElse(null);
        if(doctor == null) {
            throw BusinessException.notFound("Khong ton tai bac si");
        }

        if(appointmentDate.isBefore(LocalDate.now(VN_ZONE))) {
            return List.of();
        }
        Short dayOfWeek = (short) appointmentDate.getDayOfWeek().getValue();

        var workingHour = doctorWorkingHourRepository.findByDoctor_IdAndDayOfWeekAndStatus(doctor.getId(), dayOfWeek, (short) 2).orElse(null);

        if(workingHour == null || workingHour.getShiftType() == 4) {
            return List.of();
        }

        Short shiftType = workingHour.getShiftType();

        List<TimeSlot> availableTimeSlots;
        if(shiftType == 1) {
            availableTimeSlots = Arrays.asList(TimeSlot.values());
        } else {
            availableTimeSlots = Arrays.stream(TimeSlot.values()).filter(slot -> slot.getShiftType().getCode() == shiftType).toList();
        }

        var bookedAppointments = appointmentRepository.findByDoctor_IdAndAppointmentDateAndStatusIn(doctor.getId(), appointmentDate, List.of(1, 2, 3));
        var bookedTimeSlots = bookedAppointments.stream().map(Appointment::getTimeSlot).toList();

        availableTimeSlots = availableTimeSlots.stream().filter(slot -> !bookedTimeSlots.contains(slot.getValue())).toList();

        availableTimeSlots = availableTimeSlots.stream()
                .filter(slot -> !isSlotInPast(appointmentDate, slot))
                .toList();

        return availableTimeSlots.stream().map(timeSlot  ->{
                    AvailableSlotResponse availableSlotResponse = new AvailableSlotResponse();
                    availableSlotResponse.setTimeSlot(timeSlot.getValue());
                    return availableSlotResponse;
        }).toList();
    }

    @Override
    public ApiResponse getMyAppointments() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !(authentication.getPrincipal() instanceof CustomUserDetails userDetails)) {
            throw BusinessException.unauthorized("Vui lòng đăng nhập");
        }

        User currentUser = userDetails.getUser();

        if (currentUser.getRole() != Role.PATIENT.getCode()) {
            throw BusinessException.forbidden("Khong phai benh nhan");
        }

        var appointments = appointmentRepository.findByPatient_IdOrderByAppointmentDateAsc(currentUser.getId());

        var response = appointments.stream().map(appointment -> {
            AppointmentResponse data = new AppointmentResponse();

            data.setDoctorName(appointment.getDoctor().getUser().getFullName());
            data.setDepartmentName(appointment.getDepartment().getName());
            data.setAppointmentDate(appointment.getAppointmentDate());
            data.setTimeSlot(appointment.getTimeSlot());
            data.setReason(appointment.getReason());
            data.setStatus(appointment.getStatus());
            data.setCheckedInAt(appointment.getCheckedInAt());
            data.setCreatedAt(appointment.getCreatedAt());
            return data;
        }).toList();
        return new ApiResponse(200, null, response);
    }

    @Override
    public ApiResponse cancelAppointment(Long appointmentId, CancelAppointmentRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !(authentication.getPrincipal() instanceof CustomUserDetails userDetails)) {
            throw BusinessException.unauthorized("Vui lòng đăng nhập");
        }

        User currentUser = userDetails.getUser();

        if (currentUser.getRole() != Role.PATIENT.getCode()) {
            throw BusinessException.forbidden("Khong phai benh nhan");
        }

        Appointment appointment = appointmentRepository.findByIdAndPatient_Id(appointmentId, currentUser.getId()).orElseThrow(() -> BusinessException.notFound("Khong tim thay lich hen"));

        int currentStatus = appointment.getStatus();

        if (currentStatus != AppointmentStatus.PENDING.getCode() && currentStatus != AppointmentStatus.CONFIRMED.getCode()) {
            throw BusinessException.badRequest("Lich hen hien tai khong the huy");
        }

        appointment.setStatus(AppointmentStatus.CANCELLED.getCode());
        appointment.setCancelReason(request.getCancelReason());

        Appointment savedAppointment = appointmentRepository.save(appointment);

        AppointmentResponse response = AppointmentResponse.builder()
                .doctorName(savedAppointment.getDoctor().getUser().getFullName())
                .departmentName(savedAppointment.getDepartment().getName())
                .appointmentDate(savedAppointment.getAppointmentDate())
                .timeSlot(savedAppointment.getTimeSlot())
                .reason(savedAppointment.getReason())
                .status(savedAppointment.getStatus())
                .checkedInAt(savedAppointment.getCheckedInAt())
                .createdAt(savedAppointment.getCreatedAt())
                .build();
        return new ApiResponse(200, "Huy lich hen thanh cong", response);
    }

    @Override
    public ApiResponse confirmAppointment(Long appointmentId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !(authentication.getPrincipal() instanceof CustomUserDetails userDetails)) {
            throw BusinessException.unauthorized("Vui lòng đăng nhập");
        }

        User currentUser = userDetails.getUser();

        if (currentUser.getRole() != Role.STAFF.getCode() && currentUser.getRole() != Role.ADMIN.getCode()) {
            throw BusinessException.forbidden("Khong co quyen xac nhan lich hen");
        }

        Appointment appointment = appointmentRepository.findById(appointmentId).orElseThrow(() -> BusinessException.notFound("Khong tim thay lich hen"));

        if (appointment.getStatus() != AppointmentStatus.PENDING.getCode()) {
            throw BusinessException.badRequest("Chi co lich hen dang cho xac nhan moi duoc xac nhan");
        }

        appointment.setStatus(AppointmentStatus.CONFIRMED.getCode());

        Appointment savedAppointment = appointmentRepository.save(appointment);

        AppointmentResponse response = AppointmentResponse.builder()
                .doctorName(savedAppointment.getDoctor().getUser().getFullName())
                .departmentName(savedAppointment.getDepartment().getName())
                .appointmentDate(savedAppointment.getAppointmentDate())
                .timeSlot(savedAppointment.getTimeSlot())
                .reason(savedAppointment.getReason())
                .status(savedAppointment.getStatus())
                .checkedInAt(savedAppointment.getCheckedInAt())
                .createdAt(savedAppointment.getCreatedAt())
                .build();

        return new ApiResponse(200, "Xac nhan lich hen thanh cong", response);
    }

    private boolean isSlotInPast(LocalDate date, TimeSlot slot) {
        LocalDateTime now = LocalDateTime.now(VN_ZONE);
        LocalDateTime slotStart = LocalDateTime.of(date, slot.getStartTime());
        return !slotStart.isAfter(now);
    }
}
