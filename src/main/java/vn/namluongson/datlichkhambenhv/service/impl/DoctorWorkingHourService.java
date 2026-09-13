package vn.namluongson.datlichkhambenhv.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import vn.namluongson.datlichkhambenhv.repository.DoctorRepository;
import vn.namluongson.datlichkhambenhv.repository.DoctorWorkingHourRepository;
import vn.namluongson.datlichkhambenhv.service.interfaces.IDoctorWorkingHourService;

@Service
@RequiredArgsConstructor
public class DoctorWorkingHourService implements IDoctorWorkingHourService {
    private final DoctorWorkingHourRepository doctorWorkingHourRepository;
    private final DoctorRepository doctorRepository;
}
