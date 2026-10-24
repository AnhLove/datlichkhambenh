// Bóc dữ liệu từ response của backend (ApiResponse có dạng { ..., message, data }).
// Dùng chung cho mọi nơi gọi API để không lệch cách parse giữa các file.

export function unwrapData(response) {
    return response?.data?.data ?? response?.data ?? response;
}

export function unwrapList(response) {
    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.data)) return response.data;
    if (Array.isArray(response?.data?.data)) return response.data.data;
    return [];
}
