package vn.namluongson.datlichkhambenhv.domain.enums;

import lombok.Getter;

@Getter
public enum ShiftType {
    FULL_DAY(1, "Cả ngày"),
    MORNING(2, "Buổi sáng"),
    AFTERNOON(3, "Buổi chiều"),
    OFF(4, "Nghỉ");

    private final int code;
    private final String name;

    ShiftType(int code, String name) {
        this.code = code;
        this.name = name;
    }
}
