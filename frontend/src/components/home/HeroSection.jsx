import { ArrowRight, CalendarDays, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import './HeroSection.css';

function HeroSection() {
    return (
        <section className="hero">
            <div className="container hero-grid">
                <div className="hero-content">
                    <span className="eyebrow">BỆNH VIỆN NAM LƯƠNG SƠN</span>

                    <h1>
                        Chăm sóc sức khỏe
                        <br />
                        <span>bắt đầu từ hôm nay.</span>
                    </h1>

                    <p>Chủ động tìm kiếm chuyên khoa, lựa chọn bác sĩ và đăng ký lịch khám thuận tiện tại bệnh viện.</p>

                    <div className="hero-actions">
                        <Link to="/appointments" className="btn-primary">
                            <CalendarDays size={18} />
                            Đặt lịch khám
                            <ArrowRight size={18} />
                        </Link>

                        <Link to="/doctors" className="btn-secondary">
                            Tìm bác sĩ
                        </Link>
                    </div>

                    <div className="hero-note">
                        <ShieldCheck size={19} />
                        Thông tin rõ ràng, quy trình đặt lịch thuận tiện
                    </div>
                </div>

                <div className="hero-image">
                    <img src="/images/hospital-building.jpg" alt="Cơ sở Bệnh viện Nam Lương Sơn" />
                    <div className="image-caption">
                        <strong>Bệnh viện Nam Lương Sơn</strong>
                        <span>Đồng hành cùng sức khỏe cộng đồng</span>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default HeroSection;
