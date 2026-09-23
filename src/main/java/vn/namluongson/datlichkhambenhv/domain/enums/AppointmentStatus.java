package vn.namluongson.datlichkhambenhv.domain.enums;

import lombok.Getter;

@Getter
public enum AppointmentStatus {

    PENDING(1, "Chờ xác nhận"),
    CONFIRMED(2, "Đã xác nhận"),
    CHECKED_IN(3, "Đã check-in"),
    COMPLETED(4, "Đã hoàn thành"),
    CANCELLED(5, "Đã hủy"),
    NO_SHOW(6, "Không đến");

    private final int code;
    private final String name;

    AppointmentStatus(int code, String name) {
        this.code = code;
        this.name = name;
    }
}