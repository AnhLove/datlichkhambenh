package vn.namluongson.datlichkhambenhv.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.namluongson.datlichkhambenhv.domain.dtos.requests.systemconfig.SystemConfigRequest;
import vn.namluongson.datlichkhambenhv.domain.entities.SystemConfig;
import vn.namluongson.datlichkhambenhv.domain.response.ApiResponse;
import vn.namluongson.datlichkhambenhv.exception.BusinessException;
import vn.namluongson.datlichkhambenhv.repository.systemconfig.SystemConfigRepository;
import vn.namluongson.datlichkhambenhv.service.interfaces.ISystemConfigService;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class SystemConfigService implements ISystemConfigService {

    private final SystemConfigRepository systemConfigRepository;

    @Override
    @Transactional(readOnly = true)
    public List<SystemConfig> getAll() {
        return systemConfigRepository.findAll(Sort.by("configKey"));
    }

    @Override
    @Transactional
    public ApiResponse create(SystemConfigRequest request) {
        String key = request.getConfigKey().trim();
        String value = request.getConfigValue().trim();

        if (systemConfigRepository.existsById(key)) {
            throw BusinessException.conflict("Khóa cấu hình đã tồn tại");
        }
        validateKnownKey(key, value);

        SystemConfig config = new SystemConfig();
        config.setConfigKey(key);
        config.setConfigValue(value);
        config.setDescription(trimToNull(request.getDescription()));
        systemConfigRepository.save(config);

        return new ApiResponse(200, "Tạo cấu hình thành công", key);
    }

    @Override
    @Transactional
    public ApiResponse update(String key, SystemConfigRequest request) {
        SystemConfig config = systemConfigRepository.findById(key)
                .orElseThrow(() -> BusinessException.notFound("Không tìm thấy cấu hình"));

        if (!key.equals(request.getConfigKey().trim())) {
            throw BusinessException.badRequest("Khóa trong nội dung không khớp với khóa trên đường dẫn");
        }

        String value = request.getConfigValue().trim();
        validateKnownKey(key, value);

        config.setConfigValue(value);
        if (request.getDescription() != null) {
            config.setDescription(trimToNull(request.getDescription()));
        }
        systemConfigRepository.save(config);

        return new ApiResponse(200, "Cập nhật cấu hình thành công", key);
    }

    @Override
    @Transactional
    public ApiResponse delete(String key) {
        SystemConfig config = systemConfigRepository.findById(key)
                .orElseThrow(() -> BusinessException.notFound("Không tìm thấy cấu hình"));
        systemConfigRepository.delete(config);
        return new ApiResponse(200, "Đã xóa cấu hình (hệ thống sẽ dùng giá trị mặc định nếu khóa này được áp dụng)", key);
    }

    @Override
    @Transactional(readOnly = true)
    public int getInt(String key, int defaultValue) {
        return systemConfigRepository.findById(key)
                .map(SystemConfig::getConfigValue)
                .map(value -> {
                    try {
                        return Integer.parseInt(value.trim());
                    } catch (NumberFormatException e) {
                        log.warn("Cấu hình {} có giá trị không phải số: '{}', dùng mặc định {}", key, value, defaultValue);
                        return defaultValue;
                    }
                })
                .orElse(defaultValue);
    }

    private void validateKnownKey(String key, String value) {
        if (CANCEL_MIN_HOURS.equals(key)) {
            int hours = parseIntOrFail(value, "Số giờ tối thiểu phải là số nguyên");
            if (hours < 0 || hours > 720) {
                throw BusinessException.badRequest("Số giờ tối thiểu phải từ 0 đến 720");
            }
        } else if (MAX_APPOINTMENTS_PER_DAY.equals(key)) {
            int max = parseIntOrFail(value, "Số lịch tối đa phải là số nguyên");
            if (max < 1 || max > 50) {
                throw BusinessException.badRequest("Số lịch tối đa mỗi ngày phải từ 1 đến 50");
            }
        }
    }

    private int parseIntOrFail(String value, String message) {
        try {
            return Integer.parseInt(value);
        } catch (NumberFormatException e) {
            throw BusinessException.badRequest(message);
        }
    }

    private String trimToNull(String text) {
        if (text == null || text.trim().isEmpty()) {
            return null;
        }
        return text.trim();
    }
}
