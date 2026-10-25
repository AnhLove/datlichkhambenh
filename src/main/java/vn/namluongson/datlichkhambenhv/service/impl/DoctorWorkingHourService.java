package vn.namluongson.datlichkhambenhv.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.namluongson.datlichkhambenhv.config.security.CustomUserDetails;
import vn.namluongson.datlichkhambenhv.domain.dtos.requests.doctorworking.CreateDoctorWorkingHourRequest;
import vn.namluongson.datlichkhambenhv.domain.dtos.requests.doctorworking.UpdateDoctorWorkingHourStatusRequest;
import vn.namluongson.datlichkhambenhv.domain.dtos.responses.doctorworking.DoctorWorkingHourResponse;
import vn.namluongson.datlichkhambenhv.domain.entities.Appointment;
import vn.namluongson.datlichkhambenhv.domain.entities.Doctor;
import vn.namluongson.datlichkhambenhv.domain.entities.DoctorWorkingHour;
import vn.namluongson.datlichkhambenhv.domain.entities.User;
import vn.namluongson.datlichkhambenhv.domain.enums.DoctorWorkingHourStatus;
import vn.namluongson.datlichkhambenhv.domain.enums.Role;
import vn.namluongson.datlichkhambenhv.domain.enums.ShiftType;
import vn.namluongson.datlichkhambenhv.domain.enums.TimeSlot;
import vn.namluongson.datlichkhambenhv.domain.response.ApiResponse;
import vn.namluongson.datlichkhambenhv.exception.BusinessException;
import vn.namluongson.datlichkhambenhv.repository.appointment.AppointmentRepository;
import vn.namluongson.datlichkhambenhv.repository.doctor.DoctorRepository;
import vn.namluongson.datlichkhambenhv.repository.doctor.DoctorWorkingHourRepository;
import vn.namluongson.datlichkhambenhv.service.interfaces.IDoctorWorkingHourService;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DoctorWorkingHourService implements IDoctorWorkingHourService {
    private static final ZoneId VN_ZONE = ZoneId.of("Asia/Ho_Chi_Minh");

    private final DoctorWorkingHourRepository doctorWorkingHourRepository;
    private final DoctorRepository doctorRepository;
    private final AppointmentRepository appointmentRepository;

    @Override
    public ApiResponse createDoctorWorkingHour(CreateDoctorWorkingHourRequest request) {
        Doctor doctor = doctorRepository.findById(request.getDoctorId()).orElse(null);
        if(doctor == null) {
            throw BusinessException.notFound("Ko ton tai Bac Si");
        }

        boolean exists = doctorWorkingHourRepository.existsByDoctor_IdAndDayOfWeek(request.getDoctorId(), request.getDayOfWeek());

        if(exists){
            throw BusinessException.conflict("Da co lich");
        }
        DoctorWorkingHour workingHour = new DoctorWorkingHour();
        workingHour.setDoctor(doctor);
        workingHour.setStatus((short) 1);
        workingHour.setDayOfWeek(request.getDayOfWeek());
        workingHour.setShiftType(request.getShiftType());
        workingHour.setSetBy(doctor.getUser());
        doctorWorkingHourRepository.save(workingHour);
        return new ApiResponse(200, null, workingHour.getId());
    }

    @Override
    public List<DoctorWorkingHourResponse> getWorkingHoursByDoctorUuid(String uuid) throws Exception{
        List<DoctorWorkingHour> workingHours = doctorWorkingHourRepository.findByDoctor_User_Uuid(uuid);
        if(workingHours.isEmpty()) {
            return List.of();
        }

        return workingHours.stream().map(res -> {
            DoctorWorkingHourResponse response = new DoctorWorkingHourResponse();
            response.setId(res.getId());
            response.setUuid(res.getDoctor().getUser().getUuid());
            response.setDayOfWeek(res.getDayOfWeek());
            response.setShiftType(res.getShiftType());
            response.setStatus(res.getStatus());
            response.setSetByUuid(res.getSetBy().getUuid());
            return response;
        }).toList();
    }

    @Override
    public List<DoctorWorkingHourResponse> getWorkingHourByStatus(Short status) throws Exception{
        List<DoctorWorkingHour> workingHours = doctorWorkingHourRepository.findByStatus(status);

        if(workingHours.isEmpty()) {
            return List.of();
        }

        return workingHours.stream().map(res -> {
            DoctorWorkingHourResponse response = new DoctorWorkingHourResponse();
            response.setId(res.getId());
            response.setUuid(res.getDoctor().getUser().getUuid());
            response.setDayOfWeek(res.getDayOfWeek());
            response.setShiftType(res.getShiftType());
            response.setStatus(res.getStatus());
            response.setSetByUuid(res.getSetBy().getUuid());
            return response;
        }).toList();
    }

    @Override
    public ApiResponse updateWorkingStatus(Long id, UpdateDoctorWorkingHourStatusRequest request) throws Exception {
        var entity = doctorWorkingHourRepository.findById(id).orElse(null);
        if(entity == null) {
            throw BusinessException.notFound("Khong tim thay lich lam viec");
        }

        if(entity.getStatus() == 1){
            var newStatus = request.getStatus();
            if(newStatus == 2 || newStatus == 3){
                entity.setStatus(newStatus);
                doctorWorkingHourRepository.save(entity);
            }else {
                throw BusinessException.badRequest("Chi co the la duyet hoac tu choi");
            }
        } else {
            throw BusinessException.badRequest("Chi co the sua tu dang cho");
        }
        return new ApiResponse(200, null, entity.getId());
    }

    @Override
    @Transactional
    public ApiResponse saveMyWorkingHour(Short dayOfWeek, Short shiftType) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof CustomUserDetails userDetails)) {
            throw BusinessException.unauthorized("Vui lòng đăng nhập");
        }
        User currentUser = userDetails.getUser();
        if (currentUser.getRole() != Role.DOCTOR.getCode()) {
            throw BusinessException.forbidden("Chi bac si moi duoc dang ky lich lam viec");
        }

        if (dayOfWeek == null || dayOfWeek < 1 || dayOfWeek > 7) {
            throw BusinessException.badRequest("Thu trong tuan phai tu 1 (Thu Hai) den 7 (Chu Nhat)");
        }
        if (shiftType == null || shiftType < 1 || shiftType > 4) {
            throw BusinessException.badRequest("Ca lam viec khong hop le");
        }

        Doctor doctor = doctorRepository.findById(currentUser.getId()).orElseThrow(() -> BusinessException.notFound("Khong ton tai bac si"));

        DoctorWorkingHour existing = doctorWorkingHourRepository.findByDoctor_IdAndDayOfWeek(doctor.getId(), dayOfWeek).orElse(null);

        if (existing != null && existing.getShiftType().equals(shiftType) && existing.getStatus() != DoctorWorkingHourStatus.REJECTED.getCode()) {
            return new ApiResponse(200, "Lich lam viec khong thay doi", existing.getId());
        }

        checkNoConflictingAppointments(doctor.getId(), dayOfWeek, shiftType);

        DoctorWorkingHour workingHour = existing != null ? existing : new DoctorWorkingHour();
        if (existing == null) {
            workingHour.setDoctor(doctor);
            workingHour.setDayOfWeek(dayOfWeek);
        }
        workingHour.setShiftType(shiftType);
        workingHour.setStatus((short) DoctorWorkingHourStatus.PENDING.getCode());
        workingHour.setSetBy(currentUser);

        DoctorWorkingHour saved = doctorWorkingHourRepository.save(workingHour);

        return new ApiResponse(200, "Da gui lich lam viec, vui long cho quan tri duyet", saved.getId());
    }

    private void checkNoConflictingAppointments(Long doctorId, Short dayOfWeek, Short newShift) {
        if (newShift == ShiftType.FULL_DAY.getCode()) {
            return;
        }

        LocalDate today = LocalDate.now(VN_ZONE);

        List<Appointment> activeAppointments = appointmentRepository.findByDoctor_IdAndAppointmentDateGreaterThanEqualAndStatusIn(doctorId, today, List.of(1, 2, 3));

        boolean hasConflict = activeAppointments.stream()
                .filter(appointment -> appointment.getAppointmentDate().getDayOfWeek().getValue() == dayOfWeek)
                .anyMatch(appointment -> {
                    if (newShift == ShiftType.OFF.getCode()) {
                        return true;
                    }
                    int appointmentShift = TimeSlot.fromValue(appointment.getTimeSlot()).getShiftType().getCode();
                    return appointmentShift != newShift;
                });

        if (hasConflict) {
            throw BusinessException.conflict("Con lich hen chua kham trong ca nay, khong the doi ca lam viec");
        }
    }
}