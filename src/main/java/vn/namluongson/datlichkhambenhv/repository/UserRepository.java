package vn.namluongson.datlichkhambenhv.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import vn.namluongson.datlichkhambenhv.domain.entities.User;

import java.util.List;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Page<User> findByFullNameContainingIgnoreCase(String fullName, Pageable pageable);

    List<User> findByFullNameContainingIgnoreCase(String fullName);

    User findByUuid(String uuid);

    @Query(value = "SELECT * FROM USERS WHERE STATUS = 0 AND UPPER(FULL_NAME) LIKE UPPER(CONCAT(CONCAT('%', :fullName), '%'))", nativeQuery = true)
    List<User> getListUserByName(@Param("fullName") String fullName);
}
