package vn.namluongson.datlichkhambenhv.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import vn.namluongson.datlichkhambenhv.domain.dtos.requests.doctorworking.CreateDoctorWorkingHourRequest;
import vn.namluongson.datlichkhambenhv.domain.entities.Doctor;
import vn.namluongson.datlichkhambenhv.domain.entities.DoctorWorkingHour;
import vn.namluongson.datlichkhambenhv.domain.response.ApiResponse;
import vn.namluongson.datlichkhambenhv.repository.doctor.DoctorRepository;
import vn.namluongson.datlichkhambenhv.repository.doctor.DoctorWorkingHourRepository;
import vn.namluongson.datlichkhambenhv.service.interfaces.IDoctorWorkingHourService;

@Service
@RequiredArgsConstructor
public class DoctorWorkingHourService implements IDoctorWorkingHourService {
    private final DoctorWorkingHourRepository doctorWorkingHourRepository;
    private final DoctorRepository doctorRepository;

    @Override
    public ApiResponse createDoctorWorkingHour(CreateDoctorWorkingHourRequest request) {
        Doctor doctor = doctorRepository.findById(request.getDoctorId()).orElse(null);
        if(doctor == null) {
            throw new RuntimeException("Ko ton tai Bac Si");
        }

        boolean exists = doctorWorkingHourRepository.existsByDoctor_IdAndDayOfWeek(request.getDoctorId(), request.getDayOfWeek());

        if(exists){
            throw new RuntimeException("Da co lich");
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
}
