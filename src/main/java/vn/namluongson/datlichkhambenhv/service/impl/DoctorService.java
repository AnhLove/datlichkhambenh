package vn.namluongson.datlichkhambenhv.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import vn.namluongson.datlichkhambenhv.domain.dtos.requests.doctor.CreateDoctorRequest;
import vn.namluongson.datlichkhambenhv.domain.dtos.requests.doctor.ListDoctorRequest;
import vn.namluongson.datlichkhambenhv.domain.dtos.requests.doctor.UpdateDoctorRequest;
import vn.namluongson.datlichkhambenhv.domain.dtos.responses.doctor.DoctorResponse;
import vn.namluongson.datlichkhambenhv.domain.entities.Department;
import vn.namluongson.datlichkhambenhv.domain.entities.Doctor;
import vn.namluongson.datlichkhambenhv.domain.entities.User;
import vn.namluongson.datlichkhambenhv.domain.response.ApiResponse;
import vn.namluongson.datlichkhambenhv.repository.DepartmentRepository;
import vn.namluongson.datlichkhambenhv.repository.DoctorRepository;
import vn.namluongson.datlichkhambenhv.repository.UserRepository;
import vn.namluongson.datlichkhambenhv.service.interfaces.IDoctorService;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DoctorService implements IDoctorService {
    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final PasswordEncoder passwordEncoder;
    private final DoctorRepository doctorRepository;

    @Override
    public ApiResponse createDoctor(CreateDoctorRequest request) {
        Department department = departmentRepository.findById(request.getDepartmentId()).orElse(null);
        if (department == null){
            throw new RuntimeException("Khong co Khoa nay");
        }

        User user = new User();

        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        String password = request.getPassword();
        user.setPasswordHash(passwordEncoder.encode(password));

        user.setRole((short) 2);
        user.setStatus((short) 0);
        user.setCreatedAt(LocalDateTime.now());
        user.setUuid(UUID.randomUUID().toString());
        userRepository.save(user);

        Doctor doctor = new Doctor();
        doctor.setUser(user);
        doctor.setDepartment(department);
        doctor.setYearsExperience(request.getYearsExperience());
        doctor.setBio(request.getBio());
        doctorRepository.save(doctor);
        return new ApiResponse(200, null, user.getId());
    }

    @Override
    public ApiResponse updateDoctor(UpdateDoctorRequest request) throws Exception {
        Department department = departmentRepository.findById(request.getDepartmentId()).orElse(null);
        if(department == null) {
            throw new Exception("Khong co khoa");
        }
        User user = userRepository.findByUuid(request.getUuid());
        if (user == null) {
            throw new Exception("uuid not found");
        }
        Doctor doctor = doctorRepository.findById(user.getId()).orElse(null);
        if(doctor == null) {
            throw new Exception("doctor not found");
        }

        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        userRepository.save(user);

        doctor.setDepartment(department);
        doctor.setYearsExperience(request.getYearsExperience());
        doctor.setBio(request.getBio());
        doctorRepository.save(doctor);
        return new ApiResponse(200, null, user.getUuid());
    }

    @Override
    public ApiResponse deleteDoctor(String uuid) throws Exception {
        User user = userRepository.findByUuid(uuid);
        if(user == null){
            throw new Exception("User Not Found");
        }
        Doctor doctor = doctorRepository.findById(user.getId()).orElse(null);
        if(doctor == null) {
            throw new Exception("Doctor Not Found");
        }
        doctorRepository.delete(doctor);
        userRepository.delete(user);
        return new ApiResponse(200, null, user.getUuid());
    }

    @Override
    public List<DoctorResponse> getListDoctors(ListDoctorRequest request) {
        List<Doctor> doctors;
        if(request != null && request.getFullName() != null && !request.getFullName().trim().isEmpty()) {
            doctors = doctorRepository.findByUser_FullNameContainingIgnoreCase(request.getFullName().trim());
        }else {
            doctors = doctorRepository.findAll();
        }

        return doctors.stream().map(doctor -> {
            DoctorResponse response = new DoctorResponse();
            response.setUuid(doctor.getUser().getUuid());
            response.setFullName(doctor.getUser().getFullName());
            response.setPhone(doctor.getUser().getPhone());
            response.setEmail(doctor.getUser().getEmail());
            response.setDepartmentName(doctor.getDepartment().getName());
            response.setYearsExperience(doctor.getYearsExperience());
            response.setBio(doctor.getBio());
            return response;
        }).toList();
    }

    @Override
    public Page<DoctorResponse> getDoctors(ListDoctorRequest request) {
        Page<Doctor> doctors;
        Pageable pageable = PageRequest.of(request.getPage()-1, request.getSize());
        if(request.getFullName() != null && !request.getFullName().trim().isEmpty()) {
            doctors = doctorRepository.findByUser_FullNameContainingIgnoreCase(request.getFullName().trim(), pageable);
        }else {
            doctors = doctorRepository.findAll(pageable);
        }
        return doctors.map(doctor -> {
            DoctorResponse response = new DoctorResponse();
            response.setUuid(doctor.getUser().getUuid());
            response.setFullName(doctor.getUser().getFullName());
            response.setPhone(doctor.getUser().getPhone());
            response.setEmail(doctor.getUser().getEmail());
            response.setDepartmentName(doctor.getDepartment().getName());
            response.setYearsExperience(doctor.getYearsExperience());
            response.setBio(doctor.getBio());
            return response;
        });
    }
}
