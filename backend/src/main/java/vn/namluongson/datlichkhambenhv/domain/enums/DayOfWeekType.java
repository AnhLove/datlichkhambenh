package vn.namluongson.datlichkhambenhv.domain.enums;

import lombok.Getter;

@Getter
public enum DayOfWeekType {
    MONDAY(1, "Thứ 2"),
    TUESDAY(2, "Thứ 3"),
    WEDNESDAY(3, "Thứ 4"),
    THURSDAY(4, "Thứ 5"),
    FRIDAY(5, "Thứ 6"),
    SATURDAY(6, "Thứ 7"),
    SUNDAY(7, "Chủ nhật");

    private final int code;
    private final String name;

    DayOfWeekType(int code, String name) {
        this.code = code;
        this.name = name;
    }
}
