import { useEffect, useState } from 'react';
import { HeartPulse, Brain, Eye, Stethoscope } from 'lucide-react';
import { getDepartments } from '../../services/departmentService';
import './SpecialtySection.css';

const specialtyIcons = [HeartPulse, Brain, Eye, Stethoscope];

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

    if (loading) {
        return (
            <section className="specialty-section">
                <div className="container">
                    <p>Đang tải danh sách chuyên khoa...</p>
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="specialty-section">
                <div className="container">
                    <p>{error}</p>
                </div>
            </section>
        );
    }

    return (
        <section className="specialty-section">
            <div className="container">
                <div className="section-heading">
                    <span className="section-kicker">CHUYÊN KHOA</span>
                    <h2>Chuyên khoa khám bệnh</h2>
                    <p>Lựa chọn chuyên khoa phù hợp với nhu cầu chăm sóc sức khỏe.</p>
                </div>

                <div className="specialty-grid">
                    {specialties.map((department, index) => {
                        const Icon = specialtyIcons[index % specialtyIcons.length];

                        return (
                            <article className="specialty-card" key={department.id}>
                                <div className="specialty-icon">
                                    <Icon size={24} />
                                </div>

                                <h3>{department.name}</h3>
                                <p>{department.description}</p>
                            </article>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

export default SpecialtySection;
