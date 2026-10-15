import { HeartPulse, Brain, Eye, Stethoscope, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import './SpecialtySection.css';

const specialties = [
    {
        id: 1,
        name: 'Tim mạch',
        description: 'Khám và tư vấn các vấn đề liên quan đến tim mạch.',
        icon: HeartPulse,
    },
    {
        id: 2,
        name: 'Thần kinh',
        description: 'Thăm khám và hỗ trợ điều trị bệnh lý thần kinh.',
        icon: Brain,
    },
    {
        id: 3,
        name: 'Mắt',
        description: 'Kiểm tra thị lực và tư vấn sức khỏe đôi mắt.',
        icon: Eye,
    },
    {
        id: 4,
        name: 'Đa khoa',
        description: 'Khám tổng quát và tư vấn sức khỏe ban đầu.',
        icon: Stethoscope,
    },
];

function SpecialtySection() {
    return (
        <section className="specialty-section" id="specialties">
            <div className="container">
                <div className="specialty-heading">
                    <div>
                        <span className="eyebrow">CHUYÊN KHOA</span>
                        <h2>Chăm sóc sức khỏe toàn diện</h2>
                        <p>Lựa chọn chuyên khoa phù hợp để bắt đầu hành trình chăm sóc sức khỏe của bạn.</p>
                    </div>

                    <Link to="/departments" className="specialty-view-all">
                        Xem tất cả
                        <ArrowRight size={17} />
                    </Link>
                </div>

                <div className="specialty-grid">
                    {specialties.map((specialty) => {
                        const Icon = specialty.icon;

                        return (
                            <article className="specialty-card" key={specialty.id}>
                                <div className="specialty-icon">
                                    <Icon size={25} strokeWidth={1.8} />
                                </div>

                                <h3>{specialty.name}</h3>

                                <p>{specialty.description}</p>

                                <Link
                                    to="/appointments"
                                    className="specialty-link"
                                    aria-label={`Đặt lịch khám ${specialty.name}`}
                                >
                                    Đặt lịch khám
                                    <ArrowRight size={16} />
                                </Link>
                            </article>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

export default SpecialtySection;
