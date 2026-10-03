package vn.namluongson.datlichkhambenhv.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import vn.namluongson.datlichkhambenhv.config.security.CustomUserDetails;
import vn.namluongson.datlichkhambenhv.domain.dtos.requests.appointment.CreateAppointmentRequest;
import vn.namluongson.datlichkhambenhv.domain.dtos.responses.appointment.AppointmentResponse;
import vn.namluongson.datlichkhambenhv.domain.dtos.responses.appointment.AvailableSlotResponse;
import vn.namluongson.datlichkhambenhv.domain.entities.Appointment;
import vn.namluongson.datlichkhambenhv.domain.entities.User;
import vn.namluongson.datlichkhambenhv.domain.enums.AppointmentStatus;
import vn.namluongson.datlichkhambenhv.domain.enums.Role;
import vn.namluongson.datlichkhambenhv.domain.enums.TimeSlot;
import vn.namluongson.datlichkhambenhv.domain.response.ApiResponse;
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
            throw new AccessDeniedException("Chua xac thuc");
        }
        User currentUser = userDetails.getUser();
        if (currentUser.getRole() != Role.PATIENT.getCode()) {
            throw new RuntimeException("Khong phai benh nhan");
        }

        if (request.getAppointmentDate().isBefore(LocalDate.now(VN_ZONE))) {
            throw new RuntimeException("Khong the dat lich qua khu");
        }
        var doctorUser = userRepository.findByUuid(request.getDoctorUuid());
        if (doctorUser == null) {
            throw new RuntimeException("Khong ton tai uuid bac si");
        }
        if (doctorUser.getRole() != Role.DOCTOR.getCode()) {
            throw new RuntimeException("Khong phai bac si");
        }
        var doctor = doctorRepository.findById(doctorUser.getId()).orElse(null);
        if (doctor == null) {
            throw new RuntimeException("Khong ton tai bac si");
        }
        var department = departmentRepository.findById(request.getDepartmentId()).orElse(null);
        if (department == null) {
            throw new RuntimeException("Khong ton tai khoa nay");
        }
        if (!doctor.getDepartment().getId().equals(request.getDepartmentId())) {
            throw new RuntimeException("Bac si ko thuoc khoa nay");
        }

        TimeSlot timeSlot = TimeSlot.fromValue(request.getTimeSlot());

        if(isSlotInPast(request.getAppointmentDate(), timeSlot)) {
            throw new RuntimeException("khung gio da qua");
        }

        boolean exists = appointmentRepository.existsByDoctor_IdAndAppointmentDateAndTimeSlotAndStatusIn(
                doctor.getId(), request.getAppointmentDate(), request.getTimeSlot(), List.of(1, 2, 3));
        if (exists) {
            throw new RuntimeException("Khong con lich trong");
        }

        Short dayOfWeek = (short) request.getAppointmentDate().getDayOfWeek().getValue();
        Short shiftType = (short) timeSlot.getShiftType().getCode();

        int countWorkingHour = doctorWorkingHourRepository.countWorkingHour(doctor.getId(), dayOfWeek, shiftType, (short) 1, (short) 2);
        if (countWorkingHour == 0) {
            throw new RuntimeException("Khong co Bac si lam viec gio nay");
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
            throw new RuntimeException("Khong con lich trong");
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
            throw new RuntimeException("Khong ton tai Uuid cuả bác sĩ");
        }
        if(doctorUser.getRole() != Role.DOCTOR.getCode()) {
            throw new RuntimeException("Khong phai bac si");
        }
        var doctor = doctorRepository.findById(doctorUser.getId()).orElse(null);
        if(doctor == null) {
            throw new RuntimeException("Khong ton tai bac si");
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
    private boolean isSlotInPast(LocalDate date, TimeSlot slot) {
        LocalDateTime now = LocalDateTime.now(VN_ZONE);
        LocalDateTime slotStart = LocalDateTime.of(date, slot.getStartTime());
        return !slotStart.isAfter(now);
    }
}
