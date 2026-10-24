import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, ClipboardList, ArrowRight, Stethoscope, Clock3, FileText } from 'lucide-react';

import { getMyDoctorAppointments } from '../services/appointmentService';
import { getMyDoctorExamReports } from '../services/examReportService';
import { unwrapList } from '../utils/unwrap';
import { getTodayString } from '../utils/date';

import './DoctorDashboardPage.css';
import './DoctorDashboardStats.css';

// status lịch: 3 = đã check-in, 4 = hoàn thành, 5 = đã hủy, 6 = không đến
// status báo cáo: 1 = bản nháp, 2 = đã phát hành
function computeStats(appointments, reports) {
    const today = getTodayString();
    const reportedAppointmentIds = new Set(reports.map((report) => Number(report.appointmentId)));

    return {
        todayCount: appointments.filter(
            (item) => item.appointmentDate === today && ![5, 6].includes(Number(item.status))
        ).length,
        waitingCount: appointments.filter((item) => Number(item.status) === 3).length,
        needReportCount: appointments.filter(
            (item) => Number(item.status) === 4 && !reportedAppointmentIds.has(Number(item.appointmentId))
        ).length,
        draftCount: reports.filter((report) => Number(report.status) === 1).length,
    };
}

function DoctorDashboardPage() {
    const [stats, setStats] = useState(null);
    const [statsLoading, setStatsLoading] = useState(true);
    const [statsError, setStatsError] = useState(false);

    useEffect(() => {
        let cancelled = false;

        async function loadStats() {
            try {
                const [appointmentResponse, reportResponse] = await Promise.all([
                    getMyDoctorAppointments(),
                    getMyDoctorExamReports(),
                ]);

                if (cancelled) return;

                setStats(computeStats(unwrapList(appointmentResponse), unwrapList(reportResponse)));
                setStatsError(false);
            } catch {
                if (!cancelled) setStatsError(true);
            } finally {
                if (!cancelled) setStatsLoading(false);
            }
        }

        loadStats();

        return () => {
            cancelled = true;
        };
    }, []);

    const display = (value) => {
        if (statsLoading) return '…';
        if (!stats) return '—';
        return value;
    };

    return (
        <section className="doctor-dashboard">
            <div className="doctor-dashboard__heading">
                <div>
                    <p className="doctor-dashboard__eyebrow">KHU VỰC BÁC SĨ</p>

                    <h1>Trang chủ bác sĩ</h1>

                    <p>Quản lý lịch khám và báo cáo khám bệnh tại Bệnh viện Nam Lương Sơn.</p>
                </div>

                <div className="doctor-dashboard__icon">
                    <Stethoscope size={32} />
                </div>
            </div>

            <div className="doctor-dashboard__stats">
                <div className="doctor-dashboard__stat">
                    <span className="doctor-dashboard__stat-icon">
                        <CalendarDays size={22} />
                    </span>
                    <div>
                        <strong className="doctor-dashboard__stat-value">{display(stats?.todayCount)}</strong>
                        <span className="doctor-dashboard__stat-label">Lịch khám hôm nay</span>
                    </div>
                </div>

                <div className="doctor-dashboard__stat">
                    <span className="doctor-dashboard__stat-icon">
                        <Clock3 size={22} />
                    </span>
                    <div>
                        <strong className="doctor-dashboard__stat-value">{display(stats?.waitingCount)}</strong>
                        <span className="doctor-dashboard__stat-label">Đã check-in, chờ khám</span>
                    </div>
                </div>

                <div className="doctor-dashboard__stat">
                    <span className="doctor-dashboard__stat-icon">
                        <FileText size={22} />
                    </span>
                    <div>
                        <strong className="doctor-dashboard__stat-value">{display(stats?.needReportCount)}</strong>
                        <span className="doctor-dashboard__stat-label">Chờ lập báo cáo</span>
                    </div>
                </div>

                <div className="doctor-dashboard__stat">
                    <span className="doctor-dashboard__stat-icon">
                        <ClipboardList size={22} />
                    </span>
                    <div>
                        <strong className="doctor-dashboard__stat-value">{display(stats?.draftCount)}</strong>
                        <span className="doctor-dashboard__stat-label">Bản nháp chưa phát hành</span>
                    </div>
                </div>
            </div>

            {statsError && (
                <p className="doctor-dashboard__stats-error" role="alert">
                    Không thể tải số liệu. Hãy tải lại trang để thử lại.
                </p>
            )}

            <div className="doctor-dashboard__grid">
                <Link to="/doctor/appointments" className="doctor-dashboard__card">
                    <div className="doctor-dashboard__card-icon">
                        <CalendarDays size={24} />
                    </div>

                    <h2>Lịch khám của tôi</h2>

                    <p>Theo dõi lịch hẹn, hoàn thành lượt khám và tạo báo cáo cho bệnh nhân.</p>

                    <span>
                        Xem lịch khám <ArrowRight size={16} />
                    </span>
                </Link>

                <Link to="/doctor/exam-reports" className="doctor-dashboard__card">
                    <div className="doctor-dashboard__card-icon">
                        <ClipboardList size={24} />
                    </div>

                    <h2>Báo cáo khám</h2>

                    <p>Xem bản nháp và phát hành báo cáo khám cho bệnh nhân.</p>

                    <span>
                        Xem báo cáo khám <ArrowRight size={16} />
                    </span>
                </Link>
            </div>
        </section>
    );
}

export default DoctorDashboardPage;
