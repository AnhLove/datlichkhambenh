// Ngày hôm nay theo giờ máy người dùng, dạng YYYY-MM-DD (cùng dạng với appointmentDate từ backend).
// Không dùng toISOString() vì nó trả về giờ UTC, buổi sáng sớm ở Việt Nam sẽ bị lệch sang ngày hôm trước.
export function getTodayString() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}
