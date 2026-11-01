package vn.namluongson.datlichkhambenhv.domain.response;

import org.springframework.data.domain.Page;

import java.util.List;

public record PageResponse<T>(List<T> content, int page, int size, long totalElements, int totalPages) {

    public static <T> PageResponse<T> of(Page<T> source) {
        return new PageResponse<>(
                source.getContent(),
                source.getNumber() + 1,
                source.getSize(),
                source.getTotalElements(),
                source.getTotalPages());
    }
}
