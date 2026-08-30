package vn.namluongson.datlichkhambenhv.domain.dtos.requests.user;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserPagingRequest {
    private String fullName;
    private String phone;
    private String email;
    private Short role;
    private Short status;
}
