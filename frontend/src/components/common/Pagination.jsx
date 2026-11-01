import { ChevronLeft, ChevronRight } from 'lucide-react';

import './Pagination.css';

function Pagination({ page, totalPages, totalElements, onChange, disabled = false }) {
    if (!totalPages || totalPages <= 1) {
        return totalElements ? <p className="pagination__summary">Tổng cộng {totalElements} kết quả</p> : null;
    }

    return (
        <nav className="pagination" aria-label="Phân trang">
            <p className="pagination__summary">
                Trang {page} / {totalPages} · {totalElements} kết quả
            </p>

            <div className="pagination__controls">
                <button
                    type="button"
                    className="pagination__btn"
                    onClick={() => onChange(page - 1)}
                    disabled={disabled || page <= 1}
                    aria-label="Trang trước"
                >
                    <ChevronLeft size={16} />
                    Trước
                </button>

                <button
                    type="button"
                    className="pagination__btn"
                    onClick={() => onChange(page + 1)}
                    disabled={disabled || page >= totalPages}
                    aria-label="Trang sau"
                >
                    Sau
                    <ChevronRight size={16} />
                </button>
            </div>
        </nav>
    );
}

export default Pagination;
