import { useEffect, useState } from 'react';
import { Activity, ArrowRight, Brain, Eye, HeartPulse, Stethoscope, Bone, Baby, Ear, Scan } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getDepartments } from '../../services/departmentService';
import './SpecialtySection.css';

const defaultIcon = Stethoscope;

function getSpecialtyIcon(name = '') {
    const normalizedName = name.toLowerCase();

    if (normalizedName.includes('xương khớp')) return Bone;
    if (normalizedName.includes('mắt')) return Eye;
    if (normalizedName.includes('tim mạch')) return HeartPulse;
    if (normalizedName.includes('thần kinh')) return Brain;
    if (normalizedName.includes('sản')) return Baby;
    if (normalizedName.includes('tai mũi họng')) return Ear;
    if (normalizedName.includes('răng hàm mặt')) return Scan;
    if (normalizedName.includes('hô hấp')) return Activity;

    return defaultIcon;
}

function SpecialtySection() {
    const [specialties, setSpecialties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        getDepartments()
            .then((data) => {
                setSpecialties(data);
            })
            .catch((err) => {
                console.error('Lỗi lấy danh sách khoa:', err);
                setError('Không thể tải danh sách chuyên khoa.');
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    const featuredSpecialties = specialties.slice(0, 4);

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

                {loading && <p>Đang tải danh sách chuyên khoa...</p>}

                {!loading && error && <p role="alert">{error}</p>}

                {!loading && !error && (
                    <div className="specialty-grid">
                        {featuredSpecialties.map((department) => {
                            const Icon = getSpecialtyIcon(department.name);

                            return (
                                <article className="specialty-card" key={department.id}>
                                    <div className="specialty-icon">
                                        <Icon size={24} />
                                    </div>

                                    <h3>{department.name}</h3>

                                    <p>{department.description || 'Thông tin khám và tư vấn chuyên khoa.'}</p>

                                    <Link to={`/doctors?departmentId=${department.id}`} className="specialty-link">
                                        Tìm bác sĩ
                                        <ArrowRight size={15} />
                                    </Link>
                                </article>
                            );
                        })}
                    </div>
                )}
            </div>
        </section>
    );
}

export default SpecialtySection;
