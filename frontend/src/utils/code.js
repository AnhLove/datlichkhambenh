// Id số đã được thay bằng uuid ở API. Với người dùng chỉ hiển thị mã ngắn 8 ký tự đầu.
export function shortCode(uuid) {
    return uuid ? String(uuid).slice(0, 8).toUpperCase() : '—';
}

// Khớp từ khóa tìm kiếm với mã ngắn hoặc uuid đầy đủ (không phân biệt hoa thường)
export function matchesCode(uuid, keyword) {
    const normalized = String(keyword ?? '').trim().toLowerCase();
    if (!normalized) return true;
    return String(uuid ?? '').toLowerCase().includes(normalized);
}
