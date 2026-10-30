import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
    Receipt,
    Clock3,
    UserRound,
    Stethoscope,
    ClipboardList,
    CheckCircle2,
    RefreshCw,
    AlertCircle,
    Search,
} from 'lucide-react';
import { getAppointmentsByDate } from '../../services/receptionService';
import { unwrapList } from '../../utils/unwrap';
import { getTodayString } from '../../utils/date';
import '../../styles/staff-portal.css';
import './ReceptionPages.css';

const BILLABLE = [3, 4];

const STATUS_MAP = {
    3: { label: 'Đã check-in', className: 'checked-in' },
    4: { label: 'Đã hoàn thành', className: 'completed' },
};

function ReceptionBillingPage() {
    const [searchParams] = useSearchParams();
    const [date, setDate] = useState(() => {
        const fromUrl = searchParams.get('date') ?? '';
        return /^\d{4}-\d{2}-\d{2}$/.test(fromUrl) ? fromUrl : getTodayString();
    });
    const [appointments, setAppointments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [reloadKey, setReloadKey] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        let cancelled = false;

        async function load() {
            try {
                const response = await getAppointmentsByDate(date);
                if (cancelled) return;

                setAppointments(unwrapList(response).filter((item) => BILLABLE.includes(Number(item.status))));
                setError('');
            } catch (err) {
                if (cancelled) return;
                setError(err?.message || 'Không thể tải danh sách lịch cần thu ngân.');
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        }

        load();

        return () => {
            cancelled = true;
        };
    }, [date, reloadKey]);

    const filtered = useMemo(() => {
        const keyword = searchTerm.trim().toLowerCase();

        return appointments.filter((item) => {
            const matchesStatus = statusFilter === 'all' || Number(item.status) === Number(statusFilter);
            const matchesSearch =
                !keyword ||
                String(item.appointmentId ?? '').includes(keyword) ||
                String(item.patientName ?? '')
                    .toLowerCase()
                    .includes(keyword) ||
                String(item.patientPhone ?? '').includes(keyword);

            return matchesStatus && matchesSearch;
        });
    }, [appointments, searchTerm, statusFilter]);

    const waitingCount = appointments.filter((item) => Number(item.status) === 3).length;
    const doneCount = appointments.filter((item) => Number(item.status) === 4).length;

    const reload = () => {
        setIsLoading(true);
        setError('');
        setReloadKey((key) => key + 1);
    };

    const handleDateChange = (value) => {
        if (!value) return;
        setDate(value);
        setIsLoading(true);
        setError('');
    };

    return (
        <main className="doctor-appointments-page">
            <section className="doctor-page-hero">
                <div>
                    <span className="doctor-page-eyebrow">
                        <Receipt size={16} />
                        QUẦY THU NGÂN
                    </span>
                    <h1>Thu ngân và hóa đơn</h1>
                    <p>Chọn lịch khám đã check-in hoặc đã hoàn thành để thêm dịch vụ, thu tiền và in hóa đơn.</p>
                </div>
                <Receipt className="doctor-page-hero-icon" size={64} strokeWidth={1.3} />
            </section>

            <section className="doctor-summary-grid">
                <article className="doctor-summary-card">
                    <span className="doctor-summary-icon">
                        <Receipt size={21} />
                    </span>
                    <div>
                        <p>Lịch cần xử lý</p>
                        <strong>{appointments.length}</strong>
                    </div>
                </article>
                <article className="doctor-summary-card">
                    <span className="doctor-summary-icon">
                        <Clock3 size={21} />
                    </span>
                    <div>
                        <p>Đang chờ khám</p>
                        <strong>{waitingCount}</strong>
                    </div>
                </article>
                <article className="doctor-summary-card">
                    <span className="doctor-summary-icon">
                        <CheckCircle2 size={21} />
                    </span>
                    <div>
                        <p>Đã khám xong</p>
                        <strong>{doneCount}</strong>
                    </div>
                </article>
            </section>

            <section className="doctor-panel">
                <div className="doctor-panel-heading">
                    <div>
                        <h2>Lịch khám trong ngày</h2>
                        <p>Chọn ngày, tìm theo mã lịch, tên hoặc số điện thoại bệnh nhân.</p>
                    </div>
                    <button type="button" className="doctor-secondary-button" onClick={reload} disabled={isLoading}>
                        <RefreshCw size={16} className={isLoading ? 'doctor-spin' : ''} />
                        Làm mới
                    </button>
                </div>

                <div className="reception-toolbar">
                    <label className="doctor-filter-field">
                        <span>Ngày khám</span>
                        <input type="date" value={date} onChange={(event) => handleDateChange(event.target.value)} />
                    </label>
                    <button
                        type="button"
                        className="doctor-secondary-button"
                        onClick={() => handleDateChange(getTodayString())}
                    >
                        Hôm nay
                    </button>
                </div>

                <div className="doctor-filters">
                    <label className="doctor-search-field">
                        <Search size={17} />
                        <input
                            value={searchTerm}
                            onChange={(event) => setSearchTerm(event.target.value)}
                            placeholder="Tìm mã lịch, tên hoặc SĐT bệnh nhân..."
                            aria-label="Tìm lịch cần thu ngân"
                        />
                    </label>
                    <label className="doctor-filter-field">
                        <span>Trạng thái</span>
                        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                            <option value="all">Tất cả</option>
                            <option value="3">Đã check-in</option>
                            <option value="4">Đã hoàn thành</option>
                        </select>
                    </label>
                </div>

                {isLoading ? (
                    <div className="doctor-state" role="status">
                        <span className="doctor-spinner" />
                        <h3>Đang tải danh sách</h3>
                        <p>Vui lòng đợi trong giây lát.</p>
                    </div>
                ) : error ? (
                    <div className="doctor-state doctor-state-error">
                        <AlertCircle size={30} />
                        <h3>Không thể tải danh sách</h3>
                        <p>{error}</p>
                        <button type="button" className="doctor-primary-button" onClick={reload}>
                            Thử lại
                        </button>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="doctor-state">
                        <Receipt size={34} />
                        <h3>Chưa có lịch cần thu ngân</h3>
                        <p>
                            Ngày này chưa có lịch nào đã check-in hoặc hoàn thành, hoặc không có lịch khớp điều kiện
                            lọc.
                        </p>
                    </div>
                ) : (
                    <div className="doctor-appointment-list">
                        {filtered.map((appointment) => {
                            const status = STATUS_MAP[Number(appointment.status)];

                            return (
                                <article className="doctor-appointment-card" key={appointment.appointmentId}>
                                    <div className="doctor-appointment-top">
                                        <div>
                                            <span className="doctor-field-label">Mã lịch khám</span>
                                            <h3>#{appointment.appointmentId}</h3>
                                        </div>
                                        <span className={`doctor-status doctor-status-${status.className}`}>
                                            {status.label}
                                        </span>
                                    </div>

                                    <div className="doctor-appointment-details">
                                        <div>
                                            <Clock3 size={18} />
                                            <span>
                                                <small>Khung giờ</small>
                                                <strong>{appointment.timeSlot || '—'}</strong>
                                            </span>
                                        </div>
                                        <div>
                                            <UserRound size={18} />
                                            <span>
                                                <small>Bệnh nhân</small>
                                                <strong>
                                                    {appointment.patientName || 'Chưa có thông tin'}
                                                    {appointment.patientPhone && (
                                                        <span className="reception-patient-phone">
                                                            {appointment.patientPhone}
                                                        </span>
                                                    )}
                                                </strong>
                                            </span>
                                        </div>
                                        <div>
                                            <Stethoscope size={18} />
                                            <span>
                                                <small>Bác sĩ</small>
                                                <strong>{appointment.doctorName || '—'}</strong>
                                            </span>
                                        </div>
                                        <div>
                                            <ClipboardList size={18} />
                                            <span>
                                                <small>Chuyên khoa</small>
                                                <strong>{appointment.departmentName || '—'}</strong>
                                            </span>
                                        </div>
                                    </div>

                                    <div className="doctor-appointment-actions reception-actions">
                                        <Link
                                            to={`/reception/billing/${appointment.appointmentId}?date=${appointment.appointmentDate ?? date}`}
                                            className="doctor-primary-button"
                                            style={{ textDecoration: 'none' }}
                                        >
                                            <Receipt size={16} />
                                            Thu ngân
                                        </Link>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
            </section>
        </main>
    );
}

export default ReceptionBillingPage;
