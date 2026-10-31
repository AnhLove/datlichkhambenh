import { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

import DepartmentCard from '../common/DepartmentCard';
import { getDepartments } from '../../services/departmentService';
import { unwrapList } from '../../utils/unwrap';

import './SpecialtySection.css';

const FEATURED_COUNT = 4;

function SpecialtySection() {
    const [specialties, setSpecialties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let cancelled = false;

        async function loadSpecialties() {
            try {
                const data = await getDepartments();
                if (cancelled) return;
                setSpecialties(unwrapList(data));
            } catch (err) {
                if (cancelled) return;
                console.error('Lỗi lấy danh sách khoa:', err);
                setError('Không thể tải danh sách chuyên khoa.');
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        loadSpecialties();

        return () => {
            cancelled = true;
        };
    }, []);

    return (
        <section className="specialty-section" id="specialties">
            <div className="container">
                <div className="specialty-heading">
                    <div>
                        <span className="section-kicker">CHUYÊN KHOA</span>
                        <h2>Chuyên khoa khám bệnh</h2>
                        <p>Lựa chọn chuyên khoa phù hợp với nhu cầu chăm sóc sức khỏe của bạn.</p>
                    </div>

                    <Link to="/departments" className="specialty-view-all">
                        Xem tất cả chuyên khoa
                        <ArrowRight size={17} />
                    </Link>
                </div>

                {!loading && error && <p role="alert">{error}</p>}

                {(loading || !error) && (
                    <div className="specialty-grid">
                        {loading
                            ? Array.from({ length: FEATURED_COUNT }, (_, index) => (
                                  <div className="specialty-skeleton" key={index} aria-hidden="true" />
                              ))
                            : specialties
                                  .slice(0, FEATURED_COUNT)
                                  .map((department) => <DepartmentCard department={department} key={department.id} />)}
                    </div>
                )}
            </div>
        </section>
    );
}

export default SpecialtySection;
