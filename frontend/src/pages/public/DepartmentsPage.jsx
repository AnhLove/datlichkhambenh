import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';

import DepartmentCard from '../../components/common/DepartmentCard';
import { getDepartments } from '../../services/departmentService';
import { unwrapList } from '../../utils/unwrap';

import './DepartmentsPage.css';

const SKELETON_COUNT = 8;

function DepartmentsPage() {
    const [keyword, setKeyword] = useState('');
    const [debouncedKeyword, setDebouncedKeyword] = useState('');
    const [result, setResult] = useState({ key: null, items: [], error: '' });

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedKeyword(keyword.trim()), 300);

        return () => clearTimeout(timer);
    }, [keyword]);

    useEffect(() => {
        let cancelled = false;

        async function loadDepartments() {
            try {
                const data = await getDepartments(debouncedKeyword);
                if (cancelled) return;
                setResult({ key: debouncedKeyword, items: unwrapList(data), error: '' });
            } catch (err) {
                if (cancelled) return;
                console.error('Lỗi tải danh sách khoa:', err);
                setResult({ key: debouncedKeyword, items: [], error: 'Không thể tải danh sách chuyên khoa.' });
            }
        }

        loadDepartments();

        return () => {
            cancelled = true;
        };
    }, [debouncedKeyword]);

    const loading = result.key !== debouncedKeyword;

    return (
        <main className="departments-page">
            <section className="container departments-container">
                <div className="departments-heading">
                    <span className="section-kicker">BỆNH VIỆN NAM LƯƠNG SƠN</span>
                    <h1>Danh sách chuyên khoa</h1>
                    <p>Tìm hiểu các chuyên khoa và lựa chọn nơi khám phù hợp với nhu cầu của bạn.</p>
                </div>

                <div className="departments-search">
                    <Search size={20} aria-hidden="true" />
                    <input
                        type="search"
                        placeholder="Tìm theo tên chuyên khoa..."
                        value={keyword}
                        onChange={(event) => setKeyword(event.target.value)}
                        aria-label="Tìm theo tên chuyên khoa"
                    />
                </div>

                {loading ? (
                    <div className="departments-grid" role="status" aria-label="Đang tải danh sách chuyên khoa">
                        {Array.from({ length: SKELETON_COUNT }, (_, index) => (
                            <div className="departments-skeleton" key={index} aria-hidden="true" />
                        ))}
                    </div>
                ) : result.error ? (
                    <p className="departments-state departments-error" role="alert">
                        {result.error}
                    </p>
                ) : result.items.length === 0 ? (
                    <p className="departments-state">Không tìm thấy chuyên khoa phù hợp.</p>
                ) : (
                    <div className="departments-grid">
                        {result.items.map((department) => (
                            <DepartmentCard department={department} key={department.id} />
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
}

export default DepartmentsPage;
