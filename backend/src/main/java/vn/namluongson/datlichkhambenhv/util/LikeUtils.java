package vn.namluongson.datlichkhambenhv.util;

import java.util.Locale;

public final class LikeUtils {
    private LikeUtils() {
    }

    public static String escape(String value) {
        return value.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_");
    }

    public static String contains(String keyword) {
        return "%" + escape(keyword.trim().toLowerCase(Locale.ROOT)) + "%";
    }

    public static String containsRaw(String keyword) {
        return "%" + escape(keyword.trim()) + "%";
    }
}
