package vn.namluongson.datlichkhambenhv.domain.enums;

import lombok.Getter;

@Getter
public enum TimeSlot {

    SLOT_08_00_08_30("08:00-08:30", ShiftType.MORNING),
    SLOT_08_30_09_00("08:30-09:00", ShiftType.MORNING),
    SLOT_09_00_09_30("09:00-09:30", ShiftType.MORNING),
    SLOT_09_30_10_00("09:30-10:00", ShiftType.MORNING),
    SLOT_10_00_10_30("10:00-10:30", ShiftType.MORNING),
    SLOT_10_30_11_00("10:30-11:00", ShiftType.MORNING),
    SLOT_11_00_11_30("11:00-11:30", ShiftType.MORNING),
    SLOT_11_30_12_00("11:30-12:00", ShiftType.MORNING),

    SLOT_13_00_13_30("13:00-13:30", ShiftType.AFTERNOON),
    SLOT_13_30_14_00("13:30-14:00", ShiftType.AFTERNOON),
    SLOT_14_00_14_30("14:00-14:30", ShiftType.AFTERNOON),
    SLOT_14_30_15_00("14:30-15:00", ShiftType.AFTERNOON),
    SLOT_15_00_15_30("15:00-15:30", ShiftType.AFTERNOON),
    SLOT_15_30_16_00("15:30-16:00", ShiftType.AFTERNOON),
    SLOT_16_00_16_30("16:00-16:30", ShiftType.AFTERNOON),
    SLOT_16_30_17_00("16:30-17:00", ShiftType.AFTERNOON);

    private final String value;
    private final ShiftType shiftType;

    TimeSlot(String value, ShiftType shiftType) {
        this.value = value;
        this.shiftType = shiftType;
    }

    public static TimeSlot fromValue(String value) {
        for (TimeSlot slot : values()) {
            if (slot.value.equals(value)) {
                return slot;
            }
        }

        throw new IllegalArgumentException("Khung gio khong hop le: " + value);
    }
}