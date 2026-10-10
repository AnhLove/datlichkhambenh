
package vn.namluongson.datlichkhambenhv.domain.enums;

import lombok.Getter;

@Getter
public enum PaymentMethod {

    CASH(1, "Tiền mặt"),
    BANK_TRANSFER(2, "Chuyển khoản"),
    CARD(3, "Thẻ"),
    VNPAY(4, "VNPay");

    private final int code;
    private final String name;

    PaymentMethod(int code, String name) {
        this.code = code;
        this.name = name;
    }
}
