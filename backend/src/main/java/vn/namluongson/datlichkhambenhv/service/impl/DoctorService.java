package vn.namluongson.datlichkhambenhv.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.namluongson.datlichkhambenhv.domain.dtos.requests.doctor.CreateDoctorRequest;
import vn.namluongson.datlichkhambenhv.domain.dtos.requests.doctor.ListDoctorRequest;
import vn.namluongson.datlichkhambenhv.domain.dtos.requests.doctor.UpdateDoctorRequest;
import vn.namluongson.datlichkhambenhv.domain.dtos.responses.doctor.DoctorResponse;
import vn.namluongson.datlichkhambenhv.domain.dtos.responses.doctor.DoctorSearchResponse;
import vn.namluongson.datlichkhambenhv.domain.entities.Department;
import vn.namluongson.datlichkhambenhv.domain.entities.Doctor;
import vn.namluongson.datlichkhambenhv.domain.entities.User;
import vn.namluongson.datlichkhambenhv.domain.response.ApiResponse;
import vn.namluongson.datlichkhambenhv.exception.BusinessException;
import vn.namluongson.datlichkhambenhv.repository.department.DepartmentRepository;
import vn.namluongson.datlichkhambenhv.repository.doctor.DoctorRepository;
import vn.namluongson.datlichkhambenhv.repository.user.UserRepository;
import vn.namluongson.datlichkhambenhv.service.interfaces.IDoctorService;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DoctorService implements IDoctorService {
    private static final ZoneId VN_ZONE = ZoneId.of("Asia/Ho_Chi_Minh");
    private static final int MAX_LIST_SIZE = 200;
    private static final Sort DOCTOR_SORT = Sort.by("user.fullName").and(Sort.by("id"));

    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final PasswordEncoder passwordEncoder;
    private final DoctorRepository doctorRepository;

    @Override
    @Transactional
    public ApiResponse createDoctor(CreateDoctorRequest request) {
        Department department = departmentRepository.findById(request.getDepartmentId()).orElse(null);
        if (department == null) {
            throw BusinessException.notFound("Không tìm thấy khoa");
        }

        String email = request.getEmail().trim().toLowerCase();
        String phone = request.getPhone().trim();
        if (userRepository.existsByPhone(phone)) {
            throw BusinessException.conflict("Số điện thoại đã được sử dụng");
        }
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw BusinessException.conflict("Email đã được sử dụng");
        }

        User user = new User();

        user.setFullName(request.getFullName().trim());
        user.setEmail(email);
        user.setPhone(phone);
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));

        user.setRole((short) 2);
        user.setStatus((short) 0);
        user.setCreatedAt(LocalDateTime.now(VN_ZONE));
        user.setUuid(UUID.randomUUID().toString());
        userRepository.save(user);

        Doctor doctor = new Doctor();
        doctor.setUser(user);
        doctor.setDepartment(department);
        doctor.setYearsExperience(request.getYearsExperience());
        doctor.setBio(request.getBio());
        doctorRepository.save(doctor);
        return new ApiResponse(200, null, user.getUuid());
    }

    @Override
    @Transactional
    public ApiResponse updateDoctor(UpdateDoctorRequest request) {
        Department department = departmentRepository.findById(request.getDepartmentId()).orElse(null);
        if (department == null) {
            throw BusinessException.notFound("Không tìm thấy khoa");
        }
        User user = userRepository.findByUuid(request.getUuid());
        if (user == null) {
            throw BusinessException.notFound("Không tìm thấy bác sĩ");
        }
        Doctor doctor = doctorRepository.findById(user.getId()).orElse(null);
        if (doctor == null) {
            throw BusinessException.notFound("Không tìm thấy bác sĩ");
        }

        String email = request.getEmail().trim().toLowerCase();
        String phone = request.getPhone().trim();
        if (userRepository.existsByPhoneAndIdNot(phone, user.getId())) {
            throw BusinessException.conflict("Số điện thoại đã được sử dụng");
        }
        if (userRepository.existsByEmailIgnoreCaseAndIdNot(email, user.getId())) {
            throw BusinessException.conflict("Email đã được sử dụng");
        }

        user.setFullName(request.getFullName().trim());
        user.setEmail(email);
        user.setPhone(phone);
        userRepository.save(user);

        doctor.setDepartment(department);
        doctor.setYearsExperience(request.getYearsExperience());
        doctor.setBio(request.getBio());
        doctorRepository.save(doctor);
        return new ApiResponse(200, null, user.getUuid());
    }

    @Override
    @Transactional
    public ApiResponse deleteDoctor(String uuid) {
        User user = userRepository.findByUuid(uuid);
        if (user == null) {
            throw BusinessException.notFound("Không tìm thấy bác sĩ");
        }
        Doctor doctor = doctorRepository.findById(user.getId()).orElse(null);
        if (doctor == null) {
            throw BusinessException.notFound("Không tìm thấy bác sĩ");
        }
        try {
            doctorRepository.delete(doctor);
            userRepository.delete(user);
            userRepository.flush();
        } catch (DataIntegrityViolationException e) {
            throw BusinessException.conflict("Bác sĩ đã có lịch hẹn hoặc dữ liệu liên quan, hãy khóa tài khoản thay vì xóa");
        }
        return new ApiResponse(200, null, user.getUuid());
    }

    @Override
    @Transactional(readOnly = true)
    public List<DoctorResponse> getListDoctors(ListDoctorRequest request) {
        Pageable pageable = PageRequest.of(0, MAX_LIST_SIZE, DOCTOR_SORT);
        Page<Doctor> doctors;
        if (request != null && request.getFullName() != null && !request.getFullName().trim().isEmpty()) {
            doctors = doctorRepository.findByUser_FullNameContainingIgnoreCase(request.getFullName().trim(), pageable);
        } else {
            doctors = doctorRepository.findAll(pageable);
        }
        return doctors.map(this::toResponse).getContent();
    }

    @Override
    @Transactional(readOnly = true)
    public Page<DoctorResponse> getDoctors(ListDoctorRequest request) {
        Pageable pageable = request.toPageable(DOCTOR_SORT);
        Page<Doctor> doctors;
        if (request.getFullName() != null && !request.getFullName().trim().isEmpty()) {
            doctors = doctorRepository.findByUser_FullNameContainingIgnoreCase(request.getFullName().trim(), pageable);
        } else {
            doctors = doctorRepository.findAll(pageable);
        }
        return doctors.map(this::toResponse);
    }

    @Override
    public List<DoctorSearchResponse> getListDepartment_DoctorName(String departmentName, String fullName) {
        return doctorRepository.getListDepartment_DoctorName(departmentName, fullName);
    }

    private DoctorResponse toResponse(Doctor doctor) {
        DoctorResponse response = new DoctorResponse();
        response.setUuid(doctor.getUser().getUuid());
        response.setFullName(doctor.getUser().getFullName());
        response.setDepartmentName(doctor.getDepartment().getName());
        response.setYearsExperience(doctor.getYearsExperience());
        response.setBio(doctor.getBio());
        return response;
    }
}
