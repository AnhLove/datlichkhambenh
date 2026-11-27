package vn.namluongson.datlichkhambenhv.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.namluongson.datlichkhambenhv.config.security.CustomUserDetails;
import vn.namluongson.datlichkhambenhv.domain.dtos.requests.BasePagingRequest;
import vn.namluongson.datlichkhambenhv.domain.dtos.requests.appointment.CancelAppointmentRequest;
import vn.namluongson.datlichkhambenhv.domain.dtos.requests.appointment.CreateAppointmentRequest;
import vn.namluongson.datlichkhambenhv.domain.dtos.responses.appointment.AppointmentResponse;
import vn.namluongson.datlichkhambenhv.domain.dtos.responses.appointment.AvailableSlotResponse;
import vn.namluongson.datlichkhambenhv.domain.dtos.responses.appointment.EligibleDoctorResponse;
import vn.namluongson.datlichkhambenhv.domain.entities.Appointment;
import vn.namluongson.datlichkhambenhv.domain.entities.Department;
import vn.namluongson.datlichkhambenhv.domain.entities.Doctor;
import vn.namluongson.datlichkhambenhv.domain.entities.User;
import vn.namluongson.datlichkhambenhv.domain.enums.*;
import vn.namluongson.datlichkhambenhv.domain.response.ApiResponse;
import vn.namluongson.datlichkhambenhv.domain.response.PageResponse;
import vn.namluongson.datlichkhambenhv.exception.BusinessException;
import vn.namluongson.datlichkhambenhv.repository.appointment.AppointmentRepository;
import vn.namluongson.datlichkhambenhv.repository.department.DepartmentRepository;
import vn.namluongson.datlichkhambenhv.repository.doctor.DoctorRepository;
import vn.namluongson.datlichkhambenhv.repository.doctor.DoctorWorkingHourRepository;
import vn.namluongson.datlichkhambenhv.repository.user.UserRepository;
import vn.namluongson.datlichkhambenhv.service.interfaces.IAppointmentService;
import vn.namluongson.datlichkhambenhv.service.interfaces.ISystemConfigService;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Arrays;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class AppointmentService implements IAppointmentService {
    private final AppointmentRepository appointmentRepository;
    private final UserRepository userRepository;
    private final DoctorRepository doctorRepository;
    private final DoctorWorkingHourRepository doctorWorkingHourRepository;
    private final DepartmentRepository departmentRepository;
    private final ISystemConfigService systemConfigService;
    private static final ZoneId VN_ZONE = ZoneId.of("Asia/Ho_Chi_Minh");

    private static final List<Integer> ACTIVE_STATUSES = List.of(1, 2, 3);
    private static final int MAX_BOOKING_DAYS_AHEAD = 90;

    @Override
    @Transactional
    public ApiResponse createAppointment(CreateAppointmentRequest request, String currentUserUuid) {
        User currentUser = userRepository.findByUuid(currentUserUuid);

        if (currentUser == null) {
            throw BusinessException.unauthorized("Vui lòng đăng nhập");
        }

        User patient;

        // 1. Xác định bệnh nhân đặt lịch
        if (currentUser.getRole() == Role.PATIENT.getCode()) {
            patient = currentUser;
        } else if (currentUser.getRole() == Role.STAFF.getCode() || currentUser.getRole() == Role.ADMIN.getCode()) {

            if (request.getPatientUuid() == null || request.getPatientUuid().isBlank()) {
                throw BusinessException.badRequest("Vui lòng chọn bệnh nhân");
            }

            patient = userRepository.findByUuid(request.getPatientUuid());

            if (patient == null || patient.getRole() != Role.PATIENT.getCode()) {
                throw BusinessException.notFound("Không tìm thấy bệnh nhân");
            }
        } else {
            throw BusinessException.forbidden("Không có quyền đặt lịch");
        }

        // 2. Kiểm tra ngày khám
        LocalDate appointmentDate = request.getAppointmentDate();

        if (appointmentDate.isBefore(LocalDate.now(VN_ZONE))) {
            throw BusinessException.badRequest("Không thể đặt lịch quá khứ");
        }

        if (appointmentDate.isAfter(LocalDate.now(VN_ZONE).plusDays(MAX_BOOKING_DAYS_AHEAD))) {
            throw BusinessException.badRequest("Chỉ được đặt lịch trong vòng " + MAX_BOOKING_DAYS_AHEAD + " ngày tới");
        }

        // 3. Kiểm tra khoa và khóa khoa để đồng bộ lượt đặt lịch
        var department = departmentRepository.findByIdForUpdate(request.getDepartmentId())
                .orElseThrow(() -> BusinessException.notFound("Không tồn tại khoa này"));

        // 4. Kiểm tra khung giờ
        TimeSlot timeSlot;

        try {
            timeSlot = TimeSlot.fromValue(request.getTimeSlot());
        } catch (IllegalArgumentException e) {
            throw BusinessException.badRequest("Khung giờ không hợp lệ");
        }

        if (isSlotInPast(appointmentDate, timeSlot)) {
            throw BusinessException.badRequest("Khung giờ đã qua");
        }

        // 5. Kiểm tra giới hạn số lịch trong ngày của bệnh nhân
        int maxPerDay = systemConfigService.getInt(ISystemConfigService.MAX_APPOINTMENTS_PER_DAY, ISystemConfigService.DEFAULT_MAX_APPOINTMENTS_PER_DAY);

        long activeCount = appointmentRepository.countByPatient_IdAndAppointmentDateAndStatusIn(patient.getId(), appointmentDate, ACTIVE_STATUSES);

        if (activeCount >= maxPerDay) {
            throw BusinessException.badRequest("Bệnh nhân đã đặt tối đa " + maxPerDay + " lịch trong ngày");
        }

        // 6. Kiểm tra sức chứa của khoa trong khung giờ
        int slotCapacity = systemConfigService.getInt(
                ISystemConfigService.SLOT_CAPACITY_PER_DOCTOR,
                ISystemConfigService.DEFAULT_SLOT_CAPACITY_PER_DOCTOR
        );

        if (slotCapacity <= 0) {
            throw BusinessException.badRequest("Sức chứa lịch khám không hợp lệ");
        }

        // Lấy thứ trong tuần: Thứ 2 = 1, ..., Chủ nhật = 7
        Short dayOfWeek = (short) appointmentDate.getDayOfWeek().getValue();

        // Lấy danh sách bác sĩ đang hoạt động thuộc khoa
        List<Doctor> activeDoctors = doctorRepository.findActiveDoctorsByDepartment(department.getId(),(short) UserStatus.ACTIVE.getCode(), (short) Role.DOCTOR.getCode());

        // Đếm số bác sĩ có lịch làm việc phù hợp với khung giờ
        long eligibleDoctorCount = activeDoctors.stream()
                .filter(doctor -> doctorWorkingHourRepository.countWorkingHour(
                        doctor.getId(),
                        dayOfWeek,
                        (short) timeSlot.getShiftType().getCode(),
                        (short) ShiftType.FULL_DAY.getCode(),
                        (short) DoctorWorkingHourStatus.ACTIVE.getCode()
                ) > 0)
                .count();

        // Tổng sức chứa của khoa
        long departmentCapacity = eligibleDoctorCount * slotCapacity;

        // Đếm số lịch đang hoạt động của khoa trong khung giờ
        long departmentAppointmentCount = appointmentRepository.countByDepartment_IdAndAppointmentDateAndTimeSlotAndStatusIn(department.getId(), appointmentDate, request.getTimeSlot(), ACTIVE_STATUSES);

        if (departmentAppointmentCount >= departmentCapacity) {
            throw BusinessException.badRequest("Khung giờ này đã hết chỗ, vui lòng chọn khung giờ khác");
        }

        // 7. Tạo lịch khám chưa phân công bác sĩ
        Appointment appointment = new Appointment();

        appointment.setDoctor(null);
        appointment.setDepartment(department);
        appointment.setAppointmentDate(appointmentDate);
        appointment.setTimeSlot(request.getTimeSlot());
        appointment.setReason(request.getReason());
        appointment.setStatus(AppointmentStatus.PENDING.getCode());
        appointment.setPatient(patient);
        appointment.setCreatedBy(currentUser);
        appointment.setCreatedAt(LocalDateTime.now(VN_ZONE));

        // 8. Lưu lịch khám
        Appointment savedAppointment;

        try {
            savedAppointment = appointmentRepository.save(appointment);
        } catch (DataIntegrityViolationException e) {
            throw BusinessException.conflict("Không thể đặt lịch, vui lòng kiểm tra lại");
        }

        return new ApiResponse(200, "Đặt lịch thành công", toResponse(savedAppointment));
    }

    @Override
    @Transactional(readOnly = true)
    public List<AvailableSlotResponse> getAvailableSlots(Long departmentId, LocalDate appointmentDate) {
        // 1. Kiểm tra khoa
        var department = departmentRepository.findById(departmentId).orElseThrow(() -> BusinessException.notFound("Không tìm thấy khoa"));

        // 2. Kiểm tra ngày khám
        LocalDate today = LocalDate.now(VN_ZONE);

        if (appointmentDate.isBefore(today) || appointmentDate.isAfter(today.plusDays(MAX_BOOKING_DAYS_AHEAD))) {
            return List.of();
        }

        // 3. Lấy sức chứa mỗi bác sĩ trong một khung giờ
        int slotCapacity = systemConfigService.getInt(ISystemConfigService.SLOT_CAPACITY_PER_DOCTOR, ISystemConfigService.DEFAULT_SLOT_CAPACITY_PER_DOCTOR
        );

        if (slotCapacity <= 0) {
            throw BusinessException.badRequest("Sức chứa lịch khám không hợp lệ");
        }

        Short dayOfWeek = (short) appointmentDate.getDayOfWeek().getValue();

        // 4. Lấy bác sĩ đang hoạt động thuộc khoa
        List<Doctor> activeDoctors = doctorRepository.findActiveDoctorsByDepartment(
                department.getId(),
                (short) UserStatus.ACTIVE.getCode(),
                (short) Role.DOCTOR.getCode()
        );

        // 5. Đếm số bác sĩ đủ điều kiện làm việc buổi sáng
        long morningDoctorCount = activeDoctors.stream()
                .filter(doctor -> doctorWorkingHourRepository.countWorkingHour(
                        doctor.getId(),
                        dayOfWeek,
                        (short) ShiftType.MORNING.getCode(),
                        (short) ShiftType.FULL_DAY.getCode(),
                        (short) DoctorWorkingHourStatus.ACTIVE.getCode()
                ) > 0)
                .count();

        // 6. Đếm số bác sĩ đủ điều kiện làm việc buổi chiều
        long afternoonDoctorCount = activeDoctors.stream()
                .filter(doctor -> doctorWorkingHourRepository.countWorkingHour(
                        doctor.getId(),
                        dayOfWeek,
                        (short) ShiftType.AFTERNOON.getCode(),
                        (short) ShiftType.FULL_DAY.getCode(),
                        (short) DoctorWorkingHourStatus.ACTIVE.getCode()
                ) > 0)
                .count();

        // 7. Kiểm tra sức chứa từng khung giờ
        return Arrays.stream(TimeSlot.values())
                .filter(slot -> !isSlotInPast(appointmentDate, slot))
                .filter(slot -> {
                    long eligibleDoctorCount = slot.getShiftType() == ShiftType.MORNING ? morningDoctorCount : afternoonDoctorCount;

                    long departmentCapacity = eligibleDoctorCount * slotCapacity;

                    long bookedCount = appointmentRepository.countByDepartment_IdAndAppointmentDateAndTimeSlotAndStatusIn(department.getId(), appointmentDate, slot.getValue(),ACTIVE_STATUSES);

                    return bookedCount < departmentCapacity;
                })
                .map(slot -> {
                    AvailableSlotResponse response = new AvailableSlotResponse();
                    response.setTimeSlot(slot.getValue());
                    return response;
                })
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<EligibleDoctorResponse> getEligibleDoctorsForCheckIn(String appointmentUuid, String currentUserUuid) {
        User currentUser = userRepository.findByUuid(currentUserUuid);

        if (currentUser == null) {
            throw BusinessException.unauthorized("Vui lòng đăng nhập");
        }

        if (currentUser.getRole() != Role.STAFF.getCode() && currentUser.getRole() != Role.ADMIN.getCode()) {
            throw BusinessException.forbidden("Không có quyền xem danh sách bác sĩ tiếp nhận");
        }

        Appointment appointment = appointmentRepository.findByUuid(appointmentUuid).orElseThrow(() -> BusinessException.notFound("Không tìm thấy lịch hẹn"));

        if (!Objects.equals(appointment.getStatus(), AppointmentStatus.CONFIRMED.getCode())) {
            throw BusinessException.badRequest("Chỉ xem bác sĩ cho lịch hẹn đã xác nhận");
        }

        Department department = appointment.getDepartment();

        TimeSlot timeSlot;

        try {
            timeSlot = TimeSlot.fromValue(appointment.getTimeSlot());
        } catch (IllegalArgumentException exception) {
            throw BusinessException.badRequest(
                    "Khung giờ khám không hợp lệ"
            );
        }

        Short dayOfWeek = (short) appointment.getAppointmentDate()
                .getDayOfWeek().getValue();

        Short shiftType = (short) timeSlot.getShiftType().getCode();

        int slotCapacity = systemConfigService.getInt(
                ISystemConfigService.SLOT_CAPACITY_PER_DOCTOR,
                ISystemConfigService.DEFAULT_SLOT_CAPACITY_PER_DOCTOR
        );

        if (slotCapacity <= 0) {
            throw BusinessException.badRequest(
                    "Sức chứa lịch khám không hợp lệ"
            );
        }

        List<Doctor> activeDoctors = doctorRepository.findActiveDoctorsByDepartment( department.getId(), (short) UserStatus.ACTIVE.getCode(), (short) Role.DOCTOR.getCode());

        return activeDoctors.stream()
                .filter(doctor -> doctorWorkingHourRepository.countWorkingHour(doctor.getId(), dayOfWeek, shiftType, (short) ShiftType.FULL_DAY.getCode(), (short) DoctorWorkingHourStatus.ACTIVE.getCode()) > 0)
                .map(doctor -> {
                    long bookedCount = appointmentRepository.countByDoctor_IdAndAppointmentDateAndTimeSlotAndStatusIn(doctor.getId(), appointment.getAppointmentDate(), appointment.getTimeSlot(), ACTIVE_STATUSES);

                    int remainingCapacity = (int) (slotCapacity - bookedCount);

                    return EligibleDoctorResponse.builder()
                            .doctorUuid(doctor.getUuid())
                            .doctorName(doctor.getUser().getFullName())
                            .yearsExperience(doctor.getYearsExperience())
                            .remainingCapacity(remainingCapacity)
                            .build();
                })
                .filter(doctor -> doctor.getRemainingCapacity() > 0)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse getMyAppointments(BasePagingRequest paging, String currentUserUuid) {
        User currentUser = userRepository.findByUuid(currentUserUuid);

        if (currentUser == null) {
            throw BusinessException.unauthorized("Vui lòng đăng nhập");
        }

        if (currentUser.getRole() != Role.PATIENT.getCode()) {
            throw BusinessException.forbidden("Khong phai benh nhan");
        }

        Pageable pageable = paging.toPageable(Sort.by(Sort.Direction.DESC, "appointmentDate")
                .and(Sort.by(Sort.Direction.ASC, "timeSlot"))
                .and(Sort.by(Sort.Direction.ASC, "id")));

        Page<AppointmentResponse> page = appointmentRepository.findByPatient_Id(currentUser.getId(), pageable)
                .map(this::toResponse);

        return new ApiResponse(200, null, PageResponse.of(page));
    }

    @Override
    public ApiResponse cancelAppointment(String appointmentUuid, CancelAppointmentRequest request, String currentUserUuid) {
        User currentUser = userRepository.findByUuid(currentUserUuid);

        if (currentUser == null) {
            throw BusinessException.unauthorized("Vui lòng đăng nhập");
        }

        if (currentUser.getRole() != Role.PATIENT.getCode()) {
            throw BusinessException.forbidden("Khong phai benh nhan");
        }

        Appointment appointment = appointmentRepository.findByUuidAndPatient_Id(appointmentUuid, currentUser.getId())
                .orElseThrow(() -> BusinessException.notFound("Khong tim thay lich hen"));

        int currentStatus = appointment.getStatus();

        if (currentStatus != AppointmentStatus.PENDING.getCode() && currentStatus != AppointmentStatus.CONFIRMED.getCode()) {
            throw BusinessException.badRequest("Lich hen hien tai khong the huy");
        }

        int minHours = systemConfigService.getInt(ISystemConfigService.CANCEL_MIN_HOURS, ISystemConfigService.DEFAULT_CANCEL_MIN_HOURS);
        LocalDateTime slotStart = LocalDateTime.of(appointment.getAppointmentDate(), TimeSlot.fromValue(appointment.getTimeSlot()).getStartTime());
        if (LocalDateTime.now(VN_ZONE).plusHours(minHours).isAfter(slotStart)) {
            throw BusinessException.badRequest("Chi duoc huy lich truoc gio kham it nhat " + minHours + " gio");
        }

        appointment.setStatus(AppointmentStatus.CANCELLED.getCode());
        appointment.setCancelReason(request.getCancelReason());

        Appointment savedAppointment = appointmentRepository.save(appointment);

        return new ApiResponse(200, "Huy lich hen thanh cong", toResponse(savedAppointment));
    }

    @Override
    public ApiResponse confirmAppointment(String appointmentUuid, String currentUserUuid) {
        User currentUser = userRepository.findByUuid(currentUserUuid);

        if (currentUser == null) {
            throw BusinessException.unauthorized("Vui lòng đăng nhập");
        }

        if (currentUser.getRole() != Role.STAFF.getCode() && currentUser.getRole() != Role.ADMIN.getCode()) {
            throw BusinessException.forbidden("Khong co quyen xac nhan lich hen");
        }

        Appointment appointment = appointmentRepository.findByUuid(appointmentUuid)
                .orElseThrow(() -> BusinessException.notFound("Khong tim thay lich hen"));

        if (appointment.getStatus() != AppointmentStatus.PENDING.getCode()) {
            throw BusinessException.badRequest("Chi co lich hen dang cho xac nhan moi duoc xac nhan");
        }

        appointment.setStatus(AppointmentStatus.CONFIRMED.getCode());

        Appointment savedAppointment = appointmentRepository.save(appointment);

        return new ApiResponse(200, "Xac nhan lich hen thanh cong", toResponse(savedAppointment));
    }

    @Override
    @Transactional
    public ApiResponse checkInAppointment(String appointmentUuid, String doctorUuid, String currentUserUuid) {
        User currentUser = userRepository.findByUuid(currentUserUuid);

        if (currentUser == null) {
            throw BusinessException.unauthorized("Vui lòng đăng nhập");
        }

        if (currentUser.getRole() != Role.STAFF.getCode()
                && currentUser.getRole() != Role.ADMIN.getCode()) {
            throw BusinessException.forbidden("Không có quyền check-in lịch hẹn");
        }

        Appointment appointment = appointmentRepository.findByUuid(appointmentUuid)
                .orElseThrow(() -> BusinessException.notFound("Không tìm thấy lịch hẹn"));

        if (!Objects.equals(
                appointment.getStatus(),
                AppointmentStatus.CONFIRMED.getCode()
        )) {
            throw BusinessException.badRequest(
                    "Chỉ có lịch hẹn đã xác nhận mới được check-in"
            );
        }

        // Khóa khoa để đồng bộ với nghiệp vụ tạo lịch
        Department department = departmentRepository.findByIdForUpdate(
                appointment.getDepartment().getId()
        ).orElseThrow(() -> BusinessException.notFound("Không tìm thấy khoa"));

        // Tìm bác sĩ được nhân viên lựa chọn
        Doctor doctor = doctorRepository.findByUuid(doctorUuid)
                .orElseThrow(() -> BusinessException.notFound("Không tìm thấy bác sĩ"));

        // Kiểm tra bác sĩ thuộc đúng khoa
        if (!Objects.equals(
                doctor.getDepartment().getId(),
                department.getId()
        )) {
            throw BusinessException.badRequest(
                    "Bác sĩ không thuộc khoa của lịch hẹn"
            );
        }

        // Kiểm tra tài khoản bác sĩ
        User doctorUser = doctor.getUser();

        if (doctorUser == null
                || doctorUser.getStatus() != UserStatus.ACTIVE.getCode()
                || doctorUser.getRole() != Role.DOCTOR.getCode()) {
            throw BusinessException.badRequest(
                    "Tài khoản bác sĩ không hoạt động"
            );
        }

        // Kiểm tra khung giờ
        TimeSlot timeSlot;

        try {
            timeSlot = TimeSlot.fromValue(appointment.getTimeSlot());
        } catch (IllegalArgumentException exception) {
            throw BusinessException.badRequest("Khung giờ khám không hợp lệ");
        }

        Short dayOfWeek = (short) appointment.getAppointmentDate()
                .getDayOfWeek().getValue();

        Short shiftType = (short) timeSlot.getShiftType().getCode();

        // Kiểm tra lịch làm việc đã được duyệt
        int workingHourCount = doctorWorkingHourRepository.countWorkingHour(
                doctor.getId(),
                dayOfWeek,
                shiftType,
                (short) ShiftType.FULL_DAY.getCode(),
                (short) DoctorWorkingHourStatus.ACTIVE.getCode()
        );

        if (workingHourCount <= 0) {
            throw BusinessException.badRequest(
                    "Bác sĩ không có lịch làm việc trong khung giờ này"
            );
        }

        // Lấy sức chứa tối đa mỗi bác sĩ trong một khung giờ
        int slotCapacity = systemConfigService.getInt(
                ISystemConfigService.SLOT_CAPACITY_PER_DOCTOR,
                ISystemConfigService.DEFAULT_SLOT_CAPACITY_PER_DOCTOR
        );

        if (slotCapacity <= 0) {
            throw BusinessException.badRequest(
                    "Sức chứa lịch khám không hợp lệ"
            );
        }

        // Kiểm tra số lịch đang hoạt động của bác sĩ
        long bookedCount =
                appointmentRepository.countByDoctor_IdAndAppointmentDateAndTimeSlotAndStatusIn(
                        doctor.getId(),
                        appointment.getAppointmentDate(),
                        appointment.getTimeSlot(),
                        ACTIVE_STATUSES
                );

        if (bookedCount >= slotCapacity) {
            throw BusinessException.badRequest(
                    "Bác sĩ đã đủ số lượng lịch khám trong khung giờ này"
            );
        }

        // Phân bác sĩ và check-in
        appointment.setDoctor(doctor);
        appointment.setStatus(AppointmentStatus.CHECKED_IN.getCode());
        appointment.setCheckedInAt(LocalDateTime.now(VN_ZONE));

        Appointment savedAppointment = appointmentRepository.save(appointment);

        return new ApiResponse(
                200,
                "Phân bác sĩ và check-in lịch hẹn thành công",
                toResponse(savedAppointment)
        );
    }

    @Override
    public ApiResponse noShowAppointment(String appointmentUuid, String currentUserUuid) {
        User currentUser = userRepository.findByUuid(currentUserUuid);

        if (currentUser == null) {
            throw BusinessException.unauthorized("Vui lòng đăng nhập");
        }

        if (currentUser.getRole() != Role.STAFF.getCode() && currentUser.getRole() != Role.ADMIN.getCode()) {
            throw BusinessException.forbidden("Khong co quyen danh dau no-show");
        }

        Appointment appointment = appointmentRepository.findByUuid(appointmentUuid)
                .orElseThrow(() -> BusinessException.notFound("Khong tim thay lich hen"));

        if (appointment.getStatus() != AppointmentStatus.CONFIRMED.getCode()) {
            throw BusinessException.badRequest("Chi co lich hen da xac nhan moi duoc danh dau no-show");
        }

        appointment.setStatus(AppointmentStatus.NO_SHOW.getCode());

        Appointment savedAppointment = appointmentRepository.save(appointment);

        return new ApiResponse(200, "Da danh dau benh nhan khong den", toResponse(savedAppointment));
    }

    @Override
    public ApiResponse completeAppointment(String appointmentUuid, String currentUserUuid) {
        User currentUser = userRepository.findByUuid(currentUserUuid);

        if (currentUser == null) {
            throw BusinessException.unauthorized("Vui lòng đăng nhập");
        }

        if (currentUser.getRole() != Role.DOCTOR.getCode() && currentUser.getRole() != Role.ADMIN.getCode()) {
            throw BusinessException.forbidden("Khong co quyen hoan thanh lich hen");
        }

        Appointment appointment = appointmentRepository.findByUuid(appointmentUuid)
                .orElseThrow(() -> BusinessException.notFound("Khong tim thay lich hen"));

        if (currentUser.getRole() == Role.DOCTOR.getCode()
                && (appointment.getDoctor() == null
                || !appointment.getDoctor().getId().equals(currentUser.getId()))) {
            throw BusinessException.forbidden("Bạn không phụ trách lịch hẹn này");
        }

        if (appointment.getStatus() != AppointmentStatus.CHECKED_IN.getCode()) {
            throw BusinessException.badRequest("Chi co lich hen da check-in moi duoc hoan thanh");
        }

        appointment.setStatus(AppointmentStatus.COMPLETED.getCode());

        Appointment savedAppointment = appointmentRepository.save(appointment);

        return new ApiResponse(200, "Hoan thanh lich hen", toResponse(savedAppointment));
    }


    @Override
    @Transactional(readOnly = true)
    public ApiResponse getTodayAppointments(BasePagingRequest paging, String currentUserUuid) {
        requireStaffOrAdmin(currentUserUuid);

        LocalDate today = LocalDate.now(VN_ZONE);

        Page<AppointmentResponse> page = appointmentRepository
                .findByAppointmentDate(today, paging.toPageable(STAFF_SORT))
                .map(this::toResponseWithPatient);

        return new ApiResponse(200, "Danh sach lich hen hom nay", PageResponse.of(page));
    }


    @Override
    @Transactional(readOnly = true)
    public ApiResponse getAppointmentsByDate(LocalDate date, BasePagingRequest paging, String currentUserUuid) {
        requireStaffOrAdmin(currentUserUuid);

        Page<AppointmentResponse> page = appointmentRepository
                .findByAppointmentDate(date, paging.toPageable(STAFF_SORT))
                .map(this::toResponseWithPatient);

        return new ApiResponse(200, "Danh sach lich hen theo ngay", PageResponse.of(page));
    }

    @Override
    public ApiResponse rejectAppointment(String appointmentUuid, CancelAppointmentRequest request, String currentUserUuid) {
        User currentUser = userRepository.findByUuid(currentUserUuid);

        if (currentUser == null) {
            throw BusinessException.unauthorized("Vui lòng đăng nhập");
        }

        if (currentUser.getRole() != Role.STAFF.getCode() && currentUser.getRole() != Role.ADMIN.getCode()) {
            throw BusinessException.forbidden("Khong co quyen huy lich hen");
        }

        Appointment appointment = appointmentRepository.findByUuid(appointmentUuid)
                .orElseThrow(() -> BusinessException.notFound("Khong tim thay lich hen"));

        int currentStatus = appointment.getStatus();

        if (currentStatus != AppointmentStatus.PENDING.getCode() && currentStatus != AppointmentStatus.CONFIRMED.getCode()) {
            throw BusinessException.badRequest("Chi co lich cho xac nhan hoac da xac nhan moi duoc huy");
        }

        appointment.setStatus(AppointmentStatus.CANCELLED.getCode());
        appointment.setCancelReason(request.getCancelReason());

        Appointment savedAppointment = appointmentRepository.save(appointment);

        return new ApiResponse(200, "Da huy lich hen", toResponse(savedAppointment));
    }


    @Override
    @Transactional(readOnly = true)
    public ApiResponse getMyDoctorAppointments(BasePagingRequest paging, String currentUserUuid) {
        User currentUser = userRepository.findByUuid(currentUserUuid);

        if (currentUser == null) {
            throw BusinessException.unauthorized("Vui lòng đăng nhập");
        }

        if (currentUser.getRole() != Role.DOCTOR.getCode()) {
            throw BusinessException.forbidden("Chi bac si moi duoc xem lich cua minh");
        }

        Pageable pageable = paging.toPageable(Sort.by(Sort.Direction.DESC, "appointmentDate")
                .and(Sort.by(Sort.Direction.ASC, "timeSlot"))
                .and(Sort.by(Sort.Direction.ASC, "id")));

        Page<AppointmentResponse> page = appointmentRepository
                .findByDoctor_User_Id(currentUser.getId(), pageable)
                .map(appointment -> {
                    AppointmentResponse data = toResponse(appointment);
                    data.setPatientName(appointment.getPatient().getFullName());
                    return data;
                });

        return new ApiResponse(200, "Danh sach lich hen cua bac si", PageResponse.of(page));
    }

    private static final Sort STAFF_SORT = Sort.by(Sort.Direction.ASC, "timeSlot").and(Sort.by(Sort.Direction.ASC, "id"));

    private void requireStaffOrAdmin(String currentUserUuid) {
        User currentUser = userRepository.findByUuid(currentUserUuid);

        if (currentUser == null) {
            throw BusinessException.unauthorized("Vui lòng đăng nhập");
        }
        if (currentUser.getRole() != Role.STAFF.getCode() && currentUser.getRole() != Role.ADMIN.getCode()) {
            throw BusinessException.forbidden("Khong co quyen xem lich hen");
        }
    }

    private AppointmentResponse toResponseWithPatient(Appointment appointment) {
        AppointmentResponse data = toResponse(appointment);
        data.setPatientName(appointment.getPatient().getFullName());
        data.setPatientPhone(appointment.getPatient().getPhone());
        return data;
    }

    private boolean isSlotInPast(LocalDate date, TimeSlot slot) {
        LocalDateTime now = LocalDateTime.now(VN_ZONE);
        LocalDateTime slotStart = LocalDateTime.of(date, slot.getStartTime());
        return !slotStart.isAfter(now);
    }

    private boolean isLocked(User user) {
        return user.getStatus() == UserStatus.LOCKED.getCode();
    }

    private AppointmentResponse toResponse(Appointment a) {
        return AppointmentResponse.builder()
                .uuid(a.getUuid())
                .doctorName(a.getDoctor() != null ? a.getDoctor().getUser().getFullName() : null)
                .departmentName(a.getDepartment().getName())
                .appointmentDate(a.getAppointmentDate())
                .timeSlot(a.getTimeSlot())
                .reason(a.getReason())
                .status(a.getStatus())
                .checkedInAt(a.getCheckedInAt())
                .createdAt(a.getCreatedAt())
                .build();
    }
}
