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

// Bóc kết quả phân trang. Backend trả { content, page, size, totalElements, totalPages },
// nằm trong ApiResponse.data (lịch hẹn, thanh toán, phiếu khám) hoặc trả thẳng (user, giờ làm, dịch vụ).
export function unwrapPage(response) {
    const candidate = [response, response?.data, response?.data?.data].find(
        (item) => item && Array.isArray(item.content)
    );

    return {
        content: candidate?.content ?? [],
        page: candidate?.page ?? 1,
        size: candidate?.size ?? 0,
        totalElements: candidate?.totalElements ?? 0,
        totalPages: candidate?.totalPages ?? 0,
    };
}
