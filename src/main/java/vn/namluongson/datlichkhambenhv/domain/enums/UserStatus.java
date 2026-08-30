package vn.namluongson.datlichkhambenhv.domain.enums;

import lombok.Getter;

@Getter
public enum UserStatus {
    ACTIVE(0, "Hoạt động"),
    LOCKED(1, "Ngừng hoạt động");

    private final int code;
    private final String name;

    UserStatus(int code, String name) {
        this.code = code;
        this.name = name;
    }
}
