package vn.namluongson.datlichkhambenhv.domain.enums;

import lombok.Getter;

@Getter
public enum Role {
    PATIENT(1, "Bệnh nhân"),
    DOCTOR(2, "Bác sĩ"),
    STAFF(3, "Lễ tân"),
    ADMIN(4, "Quản trị viên");

    private final int code;
    private final String name;

    Role(int code, String name) {
        this.code = code;
        this.name = name;
    }
}
