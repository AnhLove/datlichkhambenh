import { useEffect, useState, useRef } from 'react';
import { ArrowRight, Search, Stethoscope } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getDepartments } from '../../services/departmentService';
import './DepartmentsPage.css';

function DepartmentsPage() {
    const [departments, setDepartments] = useState([]);
    const [keyword, setKeyword] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const isMounted = useRef(true);

    useEffect(() => {
        return () => {
            isMounted.current = false;
        };
    }, []);

    useEffect(() => {
        let active = true;

        const fetchDepartments = async () => {
            setLoading(true);
            setError('');

            try {
                const data = await getDepartments(keyword);
                if (active) {
                    setDepartments(data);
                }
            } catch (err) {
                if (active) {
                    console.error('Lỗi tải danh sách khoa:', err);
                    setError('Không thể tải danh sách chuyên khoa.');
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        };

        fetchDepartments();

        return () => {
            active = false;
        };
    }, [keyword]);

    return (
        <main className="departments-page">
            <section className="container departments-container">
                <div className="departments-heading">
                    <span className="section-kicker">BỆNH VIỆN NAM LƯƠNG SƠN</span>
                    <h1>Danh sách chuyên khoa</h1>
                    <p>Tìm hiểu các chuyên khoa và lựa chọn nơi khám phù hợp với nhu cầu của bạn.</p>
                </div>

                <div className="departments-search">
                    <Search size={20} />
                    <input
                        type="search"
                        placeholder="Tìm theo tên chuyên khoa..."
                        value={keyword}
                        onChange={(event) => setKeyword(event.target.value)}
                        aria-label="Tìm theo tên chuyên khoa"
                    />
                </div>

                {loading && <p>Đang tải danh sách chuyên khoa...</p>}

                {!loading && error && <p role="alert">{error}</p>}

                {!loading && !error && departments.length === 0 && <p>Không tìm thấy chuyên khoa phù hợp.</p>}

                {!loading && !error && departments.length > 0 && (
                    <div className="departments-grid">
                        {departments.map((department) => (
                            <article className="department-card" key={department.id}>
                                <div className="department-card-icon">
                                    <Stethoscope size={24} />
                                </div>

                                <h2>{department.name}</h2>
                                <p>{department.description || 'Thông tin đang được cập nhật.'}</p>

                                <Link to={`/doctors?departmentId=${department.id}`} className="department-card-link">
                                    Tìm bác sĩ
                                    <ArrowRight size={16} />
                                </Link>
                            </article>
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
}

export default DepartmentsPage;
