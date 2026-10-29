package vn.namluongson.datlichkhambenhv.service.interfaces;

import vn.namluongson.datlichkhambenhv.domain.dtos.requests.systemconfig.SystemConfigRequest;
import vn.namluongson.datlichkhambenhv.domain.entities.SystemConfig;
import vn.namluongson.datlichkhambenhv.domain.response.ApiResponse;

import java.util.List;

public interface ISystemConfigService {
    String CANCEL_MIN_HOURS = "CANCEL_MIN_HOURS_BEFORE";
    String MAX_APPOINTMENTS_PER_DAY = "MAX_APPOINTMENTS_PER_PATIENT_PER_DAY";
    String WORKING_HOURS_TEXT = "WORKING_HOURS_DESCRIPTION";

    int DEFAULT_CANCEL_MIN_HOURS = 24;
    int DEFAULT_MAX_APPOINTMENTS_PER_DAY = 3;

    List<SystemConfig> getAll();

    ApiResponse create(SystemConfigRequest request);

    ApiResponse update(String key, SystemConfigRequest request);

    ApiResponse delete(String key);

    int getInt(String key, int defaultValue);
}
