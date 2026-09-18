package vn.namluongson.datlichkhambenhv.repository.doctor.impl;

import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import vn.namluongson.datlichkhambenhv.domain.dtos.responses.doctor.DoctorSearchResponse;
import vn.namluongson.datlichkhambenhv.repository.doctor.interfaces.IDoctorRepository;

import java.util.List;

@Repository
@RequiredArgsConstructor
public class DoctorRepositoryImpl implements IDoctorRepository {
    private final EntityManager entityManager;

    @Override
    public List<DoctorSearchResponse> getListDepartment_DoctorName(String departmentName, String fullName) throws Exception {
        if(departmentName == null || departmentName.trim().isEmpty()){
            throw new Exception("Ten Khoa ko duoc de trong");
        }
        if(fullName == null || fullName.trim().isEmpty()){
            throw new Exception("Ten Bac si ko duoc de trong");
        }

        var sql = """
                SELECT D.ID,
                       DE.NAME,
                       U.FULL_NAME,
                       D.YEARS_EXPERIENCE,
                       D.BIO
                FROM DOCTORS D
                JOIN USERS U ON U.ID = D.ID
                JOIN DEPARTMENTS DE ON DE.ID = D.DEPARTMENT_ID
                WHERE UPPER(DE.NAME)
                      LIKE UPPER(CONCAT(CONCAT('%', :departmentName), '%'))
                AND UPPER(U.FULL_NAME)
                      LIKE UPPER(CONCAT(CONCAT('%', :fullName), '%'))
                """;
        var query = entityManager.createNativeQuery(sql);
        query.setParameter("departmentName", departmentName.trim());
        query.setParameter("fullName", fullName.trim());

        List<Object[]> results = query.getResultList();

        return results.stream().map(row -> {
            DoctorSearchResponse response = new DoctorSearchResponse();

            response.setId(row[0] != null ? ((Number) row[0]).longValue() : null);
            response.setDepartmentName(row[1] != null ? row[1].toString() : null);
            response.setFullName(row[2] != null ? row[2].toString() : null);
            response.setYearsExperience(row[3] != null ? ((Number) row[3]).longValue() : null);
            response.setBio(row[4] != null ? row[4].toString() : null);
            return response;
        }).toList();
    }
}
