import { useEffect, useMemo, useState } from 'react';
import {
    CalendarDays,
    Clock3,
    UserRound,
    RefreshCw,
    AlertCircle,
    FileText,
    CheckCircle2,
    Search,
    Stethoscope,
    X,
} from 'lucide-react';
import { getMyDoctorAppointments, completeAppointment } from '../services/appointmentService';
import { createExamReport, getMyDoctorExamReports } from '../services/examReportService';
import { unwrapList } from '../utils/unwrap';
import { getTodayString } from '../utils/date';
import './DoctorAppointmentsPage.css';
import './DoctorTabs.css';

const STATUS_MAP = {
    1: { label: 'Chờ xác nhận', className: 'pending' },
    2: { label: 'Đã xác nhận', className: 'confirmed' },
    3: { label: 'Đã check-in', className: 'checked-in' },
    4: { label: 'Đã hoàn thành', className: 'completed' },
    5: { label: 'Đã hủy', className: 'cancelled' },
    6: { label: 'Không đến', className: 'no-show' },
};

const TABS = [
    { key: 'today', label: 'Hôm nay' },
    { key: 'upcoming', label: 'Sắp tới' },
    { key: 'all', label: 'Tất cả' },
];

const EMPTY_HINT = {
    today: 'Hôm nay bạn chưa có lịch khám nào. Chuyển sang "Sắp tới" hoặc "Tất cả" để xem thêm.',
    upcoming: 'Chưa có lịch khám nào sắp tới.',
    all: 'Chưa có lịch khám nào được phân công cho bạn.',
};

function getStatus(status) {
    return (
        STATUS_MAP[Number(status)] || {
            label: 'Không xác định',
            className: 'unknown',
        }
    );
}

function formatDate(value) {
    if (!value) return 'Chưa có thông tin';
    const date = new Date(`${value}T00:00:00`);
    if (Number.isNaN(date.getTime())) return value;

    return new Intl.DateTimeFormat('vi-VN', {
        weekday: 'long',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    }).format(date);
}

// appointmentDate và today đều dạng YYYY-MM-DD nên so sánh chuỗi là đúng thứ tự thời gian
function matchesTab(appointment, tab, today) {
    const date = appointment.appointmentDate;

    if (tab === 'today') return date === today;
    if (tab === 'upcoming') return Boolean(date) && date > today;
    return true;
}

function DoctorAppointmentsPage() {
    const [appointments, setAppointments] = useState([]);
    const [reports, setReports] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [reloadKey, setReloadKey] = useState(0);
    const [tab, setTab] = useState('today');
    const [dateFilter, setDateFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [diagnosis, setDiagnosis] = useState('');
    const [notes, setNotes] = useState('');
    const [formError, setFormError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [actionError, setActionError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [completingId, setCompletingId] = useState(null);

    const today = getTodayString();

    useEffect(() => {
        let cancelled = false;

        async function loadData() {
            try {
                const [appointmentResponse, reportResponse] = await Promise.all([
                    getMyDoctorAppointments(),
                    getMyDoctorExamReports(),
                ]);

                if (cancelled) return;

                setAppointments(unwrapList(appointmentResponse));
                setReports(unwrapList(reportResponse));
                setError('');
            } catch (err) {
                if (cancelled) return;
                setError(err?.message || 'Không thể tải dữ liệu lịch khám.');
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        }

        loadData();

        return () => {
            cancelled = true;
        };
    }, [reloadKey]);

    const reportAppointmentIds = useMemo(
        () => new Set(reports.map((report) => Number(report.appointmentId))),
        [reports]
    );

    const tabCounts = useMemo(
        () => ({
            today: appointments.filter((item) => matchesTab(item, 'today', today)).length,
            upcoming: appointments.filter((item) => matchesTab(item, 'upcoming', today)).length,
            all: appointments.length,
        }),
        [appointments, today]
    );

    const hasActiveFilter = Boolean(dateFilter) || statusFilter !== 'all' || Boolean(searchTerm.trim());

    const filteredAppointments = useMemo(() => {
        const normalizedSearch = searchTerm.trim().toLowerCase();

        return appointments.filter((appointment) => {
            const matchesTime = matchesTab(appointment, tab, today);
            const matchesDate = !dateFilter || appointment.appointmentDate === dateFilter;
            const matchesStatus = statusFilter === 'all' || Number(appointment.status) === Number(statusFilter);
            const matchesSearch =
                !normalizedSearch ||
                String(appointment.appointmentId ?? '').includes(normalizedSearch) ||
                String(appointment.patientName ?? '')
                    .toLowerCase()
                    .includes(normalizedSearch) ||
                String(appointment.reason ?? '')
                    .toLowerCase()
                    .includes(normalizedSearch);

            return matchesTime && matchesDate && matchesStatus && matchesSearch;
        });
    }, [appointments, tab, today, dateFilter, statusFilter, searchTerm]);

    const completedCount = appointments.filter((appointment) => Number(appointment.status) === 4).length;

    const pendingReportCount = reports.filter((report) => Number(report.status) === 1).length;

    const handleReload = () => {
        setIsLoading(true);
        setError('');
        setReloadKey((key) => key + 1);
    };

    const handleTabChange = (nextTab) => {
        setTab(nextTab);
        // Đổi tab thì bỏ lọc theo ngày, tránh hai điều kiện loại trừ nhau và ra danh sách rỗng
        setDateFilter('');
    };

    const handleDateChange = (event) => {
        const value = event.target.value;
        setDateFilter(value);
        // Chọn một ngày cụ thể thì xem trên toàn bộ lịch
        if (value) setTab('all');
    };

    const handleComplete = async (appointment) => {
        const id = appointment?.appointmentId;

        if (!id) {
            setActionError('Không tìm thấy mã lịch khám.');
            return;
        }

        const who = appointment.patientName ? ` của ${appointment.patientName}` : '';
        const confirmed = window.confirm(
            `Hoàn thành lịch khám #${id}${who}? Sau khi hoàn thành, bạn có thể lập báo cáo khám. Thao tác này không thể hoàn tác.`
        );

        if (!confirmed) return;

        try {
            setCompletingId(id);
            setActionError('');
            setSuccessMessage('');

            await completeAppointment(id);

            setSuccessMessage(`Đã hoàn thành lịch khám #${id}. Bạn có thể tạo báo cáo khám ngay bây giờ.`);
            setIsLoading(true);
            setReloadKey((key) => key + 1);
        } catch (err) {
            setActionError(err?.message || 'Không thể hoàn thành lịch khám.');
        } finally {
            setCompletingId(null);
        }
    };

    const openReportForm = (appointment) => {
        setSelectedAppointment(appointment);
        setDiagnosis('');
        setNotes('');
        setFormError('');
        setSuccessMessage('');
        setActionError('');
    };

    const closeReportForm = () => {
        if (isSubmitting) return;
        setSelectedAppointment(null);
        setDiagnosis('');
        setNotes('');
        setFormError('');
    };

    const handleCreateReport = async (event) => {
        event.preventDefault();

        const appointmentId = selectedAppointment?.appointmentId;

        if (!appointmentId) {
            setFormError('Không tìm thấy mã lịch khám.');
            return;
        }

        if (!diagnosis.trim()) {
            setFormError('Vui lòng nhập chẩn đoán.');
            return;
        }

        if (diagnosis.trim().length > 1000 || notes.length > 1000) {
            setFormError('Chẩn đoán và ghi chú không được vượt quá 1000 ký tự.');
            return;
        }

        try {
            setIsSubmitting(true);
            setFormError('');

            await createExamReport({
                appointmentId,
                diagnosis: diagnosis.trim(),
                notes: notes.trim(),
            });

            setSelectedAppointment(null);
            setSuccessMessage(
                `Đã tạo báo cáo nháp cho lịch khám #${appointmentId}. Vào mục Báo cáo khám để phát hành cho bệnh nhân.`
            );
            setIsLoading(true);
            setReloadKey((key) => key + 1);
        } catch (err) {
            setFormError(err?.message || 'Không thể tạo báo cáo khám.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="doctor-appointments-page">
            <section className="doctor-page-hero">
                <div>
                    <span className="doctor-page-eyebrow">
                        <CalendarDays size={16} />
                        KHU VỰC BÁC SĨ
                    </span>
                    <h1>Lịch khám của tôi</h1>
                    <p>Theo dõi lịch hẹn, hoàn thành lượt khám và tạo báo cáo khám.</p>
                </div>
                <CalendarDays className="doctor-page-hero-icon" size={64} strokeWidth={1.3} />
            </section>

            <section className="doctor-summary-grid">
                <article className="doctor-summary-card">
                    <span className="doctor-summary-icon">
                        <CalendarDays size={21} />
                    </span>
                    <div>
                        <p>Tổng lịch khám</p>
                        <strong>{appointments.length}</strong>
                    </div>
                </article>
                <article className="doctor-summary-card">
                    <span className="doctor-summary-icon">
                        <CheckCircle2 size={21} />
                    </span>
                    <div>
                        <p>Đã hoàn thành</p>
                        <strong>{completedCount}</strong>
                    </div>
                </article>
                <article className="doctor-summary-card">
                    <span className="doctor-summary-icon">
                        <FileText size={21} />
                    </span>
                    <div>
                        <p>Bản nháp báo cáo</p>
                        <strong>{pendingReportCount}</strong>
                    </div>
                </article>
            </section>

            {successMessage && (
                <p className="doctor-feedback doctor-feedback-success" role="status">
                    <CheckCircle2 size={18} /> {successMessage}
                </p>
            )}
            {actionError && (
                <p className="doctor-feedback doctor-feedback-error" role="alert">
                    <AlertCircle size={18} /> {actionError}
                </p>
            )}

            <section className="doctor-panel">
                <div className="doctor-panel-heading">
                    <div>
                        <h2>Danh sách lịch hẹn</h2>
                        <p>Xem theo thời gian, hoặc lọc theo ngày, trạng thái và tên bệnh nhân.</p>
                    </div>
                    <button
                        type="button"
                        className="doctor-secondary-button"
                        onClick={handleReload}
                        disabled={isLoading}
                    >
                        <RefreshCw size={16} className={isLoading ? 'doctor-spin' : ''} />
                        Làm mới
                    </button>
                </div>

                <div className="doctor-tabs" role="tablist" aria-label="Xem lịch theo thời gian">
                    {TABS.map((item) => (
                        <button
                            key={item.key}
                            type="button"
                            role="tab"
                            aria-selected={tab === item.key}
                            className={`doctor-tab ${tab === item.key ? 'doctor-tab-active' : ''}`}
                            onClick={() => handleTabChange(item.key)}
                        >
                            {item.label}
                            <span className="doctor-tab-count">{tabCounts[item.key]}</span>
                        </button>
                    ))}
                </div>

                <div className="doctor-filters">
                    <label className="doctor-search-field">
                        <Search size={17} />
                        <input
                            value={searchTerm}
                            onChange={(event) => setSearchTerm(event.target.value)}
                            placeholder="Tìm mã lịch, tên bệnh nhân, lý do khám..."
                            aria-label="Tìm lịch khám"
                        />
                    </label>
                    <label className="doctor-filter-field">
                        <span>Ngày khám</span>
                        <input type="date" value={dateFilter} onChange={handleDateChange} />
                    </label>
                    <label className="doctor-filter-field">
                        <span>Trạng thái</span>
                        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                            <option value="all">Tất cả trạng thái</option>
                            <option value="1">Chờ xác nhận</option>
                            <option value="2">Đã xác nhận</option>
                            <option value="3">Đã check-in</option>
                            <option value="4">Đã hoàn thành</option>
                            <option value="5">Đã hủy</option>
                            <option value="6">Không đến</option>
                        </select>
                    </label>
                </div>

                {isLoading ? (
                    <div className="doctor-state" role="status">
                        <span className="doctor-spinner" />
                        <h3>Đang tải lịch khám</h3>
                        <p>Vui lòng đợi trong giây lát.</p>
                    </div>
                ) : error ? (
                    <div className="doctor-state doctor-state-error">
                        <AlertCircle size={30} />
                        <h3>Không thể tải lịch khám</h3>
                        <p>{error}</p>
                        <button type="button" className="doctor-primary-button" onClick={handleReload}>
                            Thử lại
                        </button>
                    </div>
                ) : filteredAppointments.length === 0 ? (
                    <div className="doctor-state">
                        <CalendarDays size={34} />
                        <h3>Không tìm thấy lịch khám</h3>
                        <p>{hasActiveFilter ? 'Thử thay đổi điều kiện lọc hoặc tải lại dữ liệu.' : EMPTY_HINT[tab]}</p>
                    </div>
                ) : (
                    <div className="doctor-appointment-list">
                        {filteredAppointments.map((appointment, index) => {
                            const status = getStatus(appointment.status);
                            const statusCode = Number(appointment.status);
                            const appointmentId = Number(appointment.appointmentId);
                            const hasReport = reportAppointmentIds.has(appointmentId);

                            return (
                                <article className="doctor-appointment-card" key={appointment.appointmentId ?? index}>
                                    <div className="doctor-appointment-top">
                                        <div>
                                            <span className="doctor-field-label">Mã lịch khám</span>
                                            <h3>#{appointment.appointmentId ?? '—'}</h3>
                                        </div>
                                        <span className={`doctor-status doctor-status-${status.className}`}>
                                            {status.label}
                                        </span>
                                    </div>

                                    <div className="doctor-appointment-details">
                                        <div>
                                            <CalendarDays size={18} />
                                            <span>
                                                <small>Ngày khám</small>
                                                <strong>{formatDate(appointment.appointmentDate)}</strong>
                                            </span>
                                        </div>
                                        <div>
                                            <Clock3 size={18} />
                                            <span>
                                                <small>Khung giờ</small>
                                                <strong>{appointment.timeSlot || 'Chưa có thông tin'}</strong>
                                            </span>
                                        </div>
                                        <div>
                                            <UserRound size={18} />
                                            <span>
                                                <small>Bệnh nhân</small>
                                                <strong>{appointment.patientName || 'Chưa có thông tin'}</strong>
                                            </span>
                                        </div>
                                        <div>
                                            <FileText size={18} />
                                            <span>
                                                <small>Lý do khám</small>
                                                <strong>{appointment.reason || 'Không có thông tin'}</strong>
                                            </span>
                                        </div>
                                    </div>

                                    {statusCode === 3 && (
                                        <div className="doctor-appointment-actions">
                                            <button
                                                type="button"
                                                className="doctor-primary-button"
                                                onClick={() => handleComplete(appointment)}
                                                disabled={completingId !== null}
                                            >
                                                <Stethoscope size={16} />
                                                {completingId === appointment.appointmentId
                                                    ? 'Đang xử lý...'
                                                    : 'Hoàn thành khám'}
                                            </button>
                                        </div>
                                    )}

                                    {statusCode === 4 && (
                                        <div className="doctor-appointment-actions">
                                            {hasReport ? (
                                                <span className="doctor-report-exists">
                                                    <CheckCircle2 size={16} /> Đã có báo cáo
                                                </span>
                                            ) : (
                                                <button
                                                    type="button"
                                                    className="doctor-primary-button"
                                                    onClick={() => openReportForm(appointment)}
                                                >
                                                    <FileText size={16} /> Tạo báo cáo khám
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </article>
                            );
                        })}
                    </div>
                )}
            </section>

            {selectedAppointment && (
                <div
                    className="doctor-modal-backdrop"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) closeReportForm();
                    }}
                >
                    <section
                        className="doctor-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="doctor-report-title"
                    >
                        <div className="doctor-modal-heading">
                            <div>
                                <span className="doctor-page-eyebrow">
                                    <FileText size={15} /> BÁO CÁO KHÁM
                                </span>
                                <h2 id="doctor-report-title">Tạo báo cáo #{selectedAppointment.appointmentId}</h2>
                                {selectedAppointment.patientName && <p>Bệnh nhân: {selectedAppointment.patientName}</p>}
                            </div>
                            <button
                                type="button"
                                className="doctor-modal-close"
                                onClick={closeReportForm}
                                disabled={isSubmitting}
                                aria-label="Đóng"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateReport}>
                            <label className="doctor-form-field">
                                <span>
                                    Chẩn đoán <b>*</b>
                                </span>
                                <textarea
                                    value={diagnosis}
                                    onChange={(event) => setDiagnosis(event.target.value)}
                                    rows={4}
                                    maxLength={1000}
                                    required
                                    placeholder="Nhập chẩn đoán..."
                                    disabled={isSubmitting}
                                />
                                <small>{diagnosis.length}/1000 ký tự</small>
                            </label>
                            <label className="doctor-form-field">
                                <span>Ghi chú</span>
                                <textarea
                                    value={notes}
                                    onChange={(event) => setNotes(event.target.value)}
                                    rows={4}
                                    maxLength={1000}
                                    placeholder="Nhập ghi chú cho bệnh nhân..."
                                    disabled={isSubmitting}
                                />
                                <small>{notes.length}/1000 ký tự</small>
                            </label>

                            {formError && (
                                <p className="doctor-feedback doctor-feedback-error" role="alert">
                                    <AlertCircle size={17} />
                                    {formError}
                                </p>
                            )}

                            <div className="doctor-modal-actions">
                                <button
                                    type="button"
                                    className="doctor-secondary-button"
                                    onClick={closeReportForm}
                                    disabled={isSubmitting}
                                >
                                    Hủy
                                </button>
                                <button type="submit" className="doctor-primary-button" disabled={isSubmitting}>
                                    {isSubmitting ? 'Đang lưu...' : 'Tạo báo cáo'}
                                </button>
                            </div>
                        </form>
                    </section>
                </div>
            )}
        </main>
    );
}

export default DoctorAppointmentsPage;
