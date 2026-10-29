
package vn.namluongson.datlichkhambenhv.domain.enums;

import lombok.Getter;

@Getter
public enum PaymentStatus {

    PENDING(1, "Chờ thanh toán"),
    PAID(2, "Đã thanh toán"),
    FAILED(3, "Thanh toán thất bại");

    private final int code;
    private final String name;

    PaymentStatus(int code, String name) {
        this.code = code;
        this.name = name;
    }
}
