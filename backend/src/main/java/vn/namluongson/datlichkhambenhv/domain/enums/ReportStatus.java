package vn.namluongson.datlichkhambenhv.domain.enums;

import lombok.Getter;

@Getter
public enum ReportStatus {
    DRAFT(1, "BẢN NHÁP"),
    ISSUED(2, "Đã phát hành");

    private final int code;
    private final String name;

    ReportStatus(int code, String name) {
        this.code = code;
        this.name = name;
    }
}
