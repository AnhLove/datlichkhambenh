import { unwrapPage } from './unwrap';

export const MAX_PAGE_SIZE = 100;

// Tải lần lượt từng trang (mỗi request tối đa 100 dòng) rồi gộp thành một mảng.
// Dùng cho màn hình cần toàn bộ dữ liệu để lọc/tính thống kê ở client.
// maxPages chặn trường hợp dữ liệu quá lớn: tối đa maxPages * size dòng.
export async function fetchAllPages(fetchPage, { size = MAX_PAGE_SIZE, maxPages = 10 } = {}) {
    const items = [];

    for (let page = 1; page <= maxPages; page += 1) {
        const result = unwrapPage(await fetchPage(page, size));
        items.push(...result.content);

        if (page >= result.totalPages) break;
    }

    return items;
}

// Chuỗi tham số ?page=&size= (+ các bộ lọc không rỗng)
export function buildQuery(params) {
    const query = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && String(value).trim() !== '') {
            query.set(key, String(value).trim());
        }
    });

    return query.toString();
}
