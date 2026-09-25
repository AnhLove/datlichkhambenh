package vn.namluongson.datlichkhambenhv.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import vn.namluongson.datlichkhambenhv.domain.dtos.requests.appointment.CreateAppointmentRequest;
import vn.namluongson.datlichkhambenhv.domain.dtos.responses.appointment.AvailableSlotResponse;
import vn.namluongson.datlichkhambenhv.domain.entities.Appointment;
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

    @Override
    public ApiResponse createAppointment(CreateAppointmentRequest request) {
        var doctorUser = userRepository.findByUuid(request.getDoctorUuid());
        if(doctorUser  == null) {
            throw new RuntimeException("Khong ton tai uuid bac si");
        }
        if(doctorUser.getRole() != Role.DOCTOR.getCode()){
            throw new RuntimeException("Khong phai bac si");
        }
        var doctor = doctorRepository.findById(doctorUser.getId()).orElse(null);
        if(doctor == null) {
            throw new RuntimeException("Khong ton tai bac si");
        }
        var department = departmentRepository.findById(request.getDepartmentId()).orElse(null);
        if(department == null){
            throw new RuntimeException("Khong ton tai khoa nay");
        }
        if(!doctor.getDepartment().getId().equals(request.getDepartmentId())) {
            throw new RuntimeException("Bac si ko thuoc khoa nay");
        }

        boolean exists = appointmentRepository.existsByDoctor_IdAndAppointmentDateAndTimeSlotAndStatusIn(doctor.getId(), request.getAppointmentDate(), request.getTimeSlot(), List.of(1, 2, 3));
        if(exists) {
            throw new RuntimeException("Khong con lich trong");
        }

        Short dayOfWeek = (short) request.getAppointmentDate().getDayOfWeek().getValue();

        TimeSlot timeSlot = TimeSlot.fromValue(request.getTimeSlot());

        Short shiftType = (short) timeSlot.getShiftType().getCode();

        int countWorkingHour = doctorWorkingHourRepository.countWorkingHour(doctor.getId(), dayOfWeek, shiftType, (short) 1, (short) 2);
        if(countWorkingHour == 0) {
            throw new RuntimeException("Khong co Bac si lam viec gio nay");
        }

        Appointment appointment = new Appointment();
        appointment.setDoctor(doctor);
        appointment.setDepartment(department);
        appointment.setAppointmentDate(request.getAppointmentDate());
        appointment.setTimeSlot(request.getTimeSlot());
        appointment.setReason(request.getReason());
        appointmentRepository.save(appointment);
        return new ApiResponse(200, null, appointment);
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
        Short dayOfWeek = (short) appointmentDate.getDayOfWeek().getValue();

        var workingHours = doctorWorkingHourRepository.findByDoctor_User_Uuid(doctorUser.getUuid());

        var workingHour = workingHours.stream().filter(item -> item.getDayOfWeek().equals(dayOfWeek)).findFirst().orElse(null);

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

        return availableTimeSlots.stream().map(timeSlot  ->{
                    AvailableSlotResponse availableSlotResponse = new AvailableSlotResponse();
                    availableSlotResponse.setTimeSlot(timeSlot.getValue());
                    return availableSlotResponse;
        }).toList();
    }
}
