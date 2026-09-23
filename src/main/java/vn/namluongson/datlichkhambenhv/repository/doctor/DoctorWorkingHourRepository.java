package vn.namluongson.datlichkhambenhv.repository.doctor;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import vn.namluongson.datlichkhambenhv.domain.entities.DoctorWorkingHour;

import java.util.List;

@Repository
public interface DoctorWorkingHourRepository extends JpaRepository<DoctorWorkingHour, Long> {
    boolean existsByDoctor_IdAndDayOfWeek(Long doctorId, Short dayOfWeek);
    List<DoctorWorkingHour> findByDoctor_User_Uuid(String uuid);
    List<DoctorWorkingHour> findByStatus(Short status);
    @Query(value = """
                SELECT COUNT(*) 
                FROM DOCTOR_WORKING_HOURS DWH 
                WHERE DWH.DOCTOR_ID = :doctorId 
                    AND DWH.DAY_OF_WEEK = :dayOfWeek 
                    AND DWH.STATUS = :status 
                    AND ( 
                        DWH.SHIFT_TYPE = :shiftType 
                        OR DWH.SHIFT_TYPE = :fullDay
                        )
                """, nativeQuery = true)
    int countWorkingHour(@Param("doctorId") Long doctorId, @Param("dayOfWeek") Short dayOfWeek, @Param("shiftType") Short shiftType, @Param("fullDay") Short fullDay ,@Param("status") Short status);
}
