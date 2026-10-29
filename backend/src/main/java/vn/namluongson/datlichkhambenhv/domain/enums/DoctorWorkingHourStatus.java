package vn.namluongson.datlichkhambenhv.domain.enums;

import lombok.Getter;

@Getter
public enum DoctorWorkingHourStatus {
    PENDING(1, "Chờ duyệt"),
    ACTIVE(2, "Đã duyệt"),
    REJECTED(3, "Từ chối");

    private final int code;
    private final String name;

    DoctorWorkingHourStatus(int code, String name) {
        this.code = code;
        this.name = name;
    }
}
