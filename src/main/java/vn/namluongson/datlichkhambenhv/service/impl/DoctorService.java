package vn.namluongson.datlichkhambenhv.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import vn.namluongson.datlichkhambenhv.domain.dtos.requests.doctor.CreateDoctorRequest;
import vn.namluongson.datlichkhambenhv.domain.entities.Department;
import vn.namluongson.datlichkhambenhv.domain.entities.Doctor;
import vn.namluongson.datlichkhambenhv.domain.entities.User;
import vn.namluongson.datlichkhambenhv.domain.response.ApiResponse;
import vn.namluongson.datlichkhambenhv.repository.DepartmentRepository;
import vn.namluongson.datlichkhambenhv.repository.DoctorRepository;
import vn.namluongson.datlichkhambenhv.repository.UserRepository;
import vn.namluongson.datlichkhambenhv.service.interfaces.IDoctorService;

import java.time.LocalDateTime;
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
}
