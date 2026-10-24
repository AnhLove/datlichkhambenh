import { Link } from 'react-router-dom';
import { CalendarDays, ClipboardList, ArrowRight, Stethoscope } from 'lucide-react';

import './DoctorDashboardPage.css';

function DoctorDashboardPage() {
    return (
        <section className="doctor-dashboard">
            <div className="doctor-dashboard__heading">
                <div>
                    <p className="doctor-dashboard__eyebrow">KHU VỰC BÁC SĨ</p>

                    <h1>Trang chủ bác sĩ</h1>

                    <p>Quản lý lịch khám và kết quả khám bệnh tại Bệnh viện Nam Lương Sơn.</p>
                </div>

                <div className="doctor-dashboard__icon">
                    <Stethoscope size={32} />
                </div>
            </div>

            <div className="doctor-dashboard__grid">
                <Link to="/doctor/appointments" className="doctor-dashboard__card">
                    <div className="doctor-dashboard__card-icon">
                        <CalendarDays size={24} />
                    </div>

                    <h2>Lịch khám của tôi</h2>

                    <p>Theo dõi danh sách lịch hẹn và thông tin các lượt khám được phân công.</p>

                    <span>
                        Xem lịch khám <ArrowRight size={16} />
                    </span>
                </Link>

                <Link to="/doctor/exam-reports" className="doctor-dashboard__card">
                    <div className="doctor-dashboard__card-icon">
                        <ClipboardList size={24} />
                    </div>

                    <h2>Kết quả khám bệnh</h2>

                    <p>Quản lý kết quả khám theo các chức năng hiện có của bác sĩ.</p>

                    <span>
                        Xem kết quả khám <ArrowRight size={16} />
                    </span>
                </Link>
            </div>
        </section>
    );
}

export default DoctorDashboardPage;
