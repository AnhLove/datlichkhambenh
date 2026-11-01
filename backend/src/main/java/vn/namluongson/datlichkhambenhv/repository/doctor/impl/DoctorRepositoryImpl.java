package vn.namluongson.datlichkhambenhv.repository.doctor.impl;

import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import vn.namluongson.datlichkhambenhv.domain.dtos.responses.doctor.DoctorSearchResponse;
import vn.namluongson.datlichkhambenhv.repository.doctor.interfaces.IDoctorRepository;
import vn.namluongson.datlichkhambenhv.util.LikeUtils;

import java.util.List;

@Repository
@RequiredArgsConstructor
public class DoctorRepositoryImpl implements IDoctorRepository {
    private static final int MAX_RESULTS = 100;

    private final EntityManager entityManager;

    @Override
    public List<DoctorSearchResponse> getListDepartment_DoctorName(String departmentName, String fullName) {
        String dept = LikeUtils.contains(departmentName == null ? "" : departmentName);
        String name = LikeUtils.contains(fullName == null ? "" : fullName);

        var sql = """
                SELECT U.UUID,
                       DE.NAME,
                       U.FULL_NAME,
                       D.YEARS_EXPERIENCE,
                       D.BIO
                FROM DOCTORS D
                JOIN USERS U ON U.ID = D.ID
                JOIN DEPARTMENTS DE ON DE.ID = D.DEPARTMENT_ID
                WHERE LOWER(DE.NAME) LIKE :departmentName ESCAPE '\\'
                AND LOWER(U.FULL_NAME) LIKE :fullName ESCAPE '\\'
                ORDER BY U.FULL_NAME, U.ID
                """;
        var query = entityManager.createNativeQuery(sql);
        query.setParameter("departmentName", dept);
        query.setParameter("fullName", name);
        query.setMaxResults(MAX_RESULTS);

        List<Object[]> results = query.getResultList();

        return results.stream().map(row -> {
            DoctorSearchResponse response = new DoctorSearchResponse();

            response.setUuid(row[0] != null ? row[0].toString() : null);
            response.setDepartmentName(row[1] != null ? row[1].toString() : null);
            response.setFullName(row[2] != null ? row[2].toString() : null);
            response.setYearsExperience(row[3] != null ? ((Number) row[3]).longValue() : null);
            response.setBio(row[4] != null ? row[4].toString() : null);
            return response;
        }).toList();
    }
}
