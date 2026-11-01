package vn.namluongson.datlichkhambenhv.domain.dtos.requests;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

@Getter
@Setter
public class BasePagingRequest {
    @Min(value = 1, message = "Trang phải bắt đầu từ 1")
    private Integer page = 1;
    @Min(value = 1, message = "Kích thước trang phải từ 1 đến 100")
    @Max(value = 100, message = "Kích thước trang phải từ 1 đến 100")
    private Integer size = 10;

    public Pageable toPageable(Sort sort) {
        int p = page == null ? 1 : page;
        int s = size == null ? 10 : size;
        return PageRequest.of(p - 1, s, sort);
    }
}
