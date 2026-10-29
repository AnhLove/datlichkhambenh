package vn.namluongson.datlichkhambenhv.domain.dtos.requests;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BasePagingRequest {
    @Min(value = 1)
    private Integer page = 1;
    @Min(value = 1)
    @Max(value = 100)
    private Integer size = 10;
}
