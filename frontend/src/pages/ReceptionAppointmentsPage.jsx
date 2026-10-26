import { useEffect, useMemo, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import {
    CalendarDays,
    Clock3,
    UserRound,
    Stethoscope,
    ClipboardList,
    FileText,
    CheckCircle2,
    RefreshCw,
    AlertCircle,
    Search,
    X,
} from 'lucide-react';
import {
    getAppointmentsByDate,
    confirmAppointment,
    checkInAppointment,
    markNoShow,
    rejectAppointment,
} from '../services/receptionService';
import { unwrapList } from '../utils/unwrap';
import { getTodayString } from '../utils/date';
import './DoctorAppointmentsPage.css';
import './ReceptionPages.css';

const STATUS_MAP = {
    1: { label: 'Chờ xác nhận', className: 'pending' },
    2: { label: 'Đã xác nhận', className: 'confirmed' },
    3: { label: 'Đã check-in', className: 'checked-in' },
    4: { label: 'Đã hoàn thành', className: 'completed' },
    5: { label: 'Đã hủy', className: 'cancelled' },
    6: { label: 'Không đến', className: 'no-show' },
};

function getStatus(status) {
    return STATUS_MAP[Number(status)] || { label: 'Không xác định', className: 'unknown' };
}

function formatCheckIn(value) {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    return new Intl.DateTimeFormat('vi-VN', { hour: '2-digit', minute: '2-digit' }).format(date);
}

// Khung giờ có dạng "08:00-08:30". Chỉ cho đánh dấu "không đến" khi giờ bắt đầu đã qua.
function hasSlotStarted(appointment) {
    const date = appointment.appointmentDate;
    const start = String(appointment.timeSlot ?? '')
        .split('-')[0]
        .trim();

    if (!date || !/^\d{2}:\d{2}$/.test(start)) return false;

    const startTime = new Date(`${date}T${start}:00`);
    if (Number.isNaN(startTime.getTime())) return false;

    return startTime <= new Date();
}

function uniqueSorted(values) {
    return [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b, 'vi'));
}

function ReceptionAppointmentsPage() {
    const [searchParams] = useSearchParams();
    const location = useLocation();
    const [date, setDate] = useState(() => {
        const fromUrl = searchParams.get('date') ?? '';
        return /^\d{4}-\d{2}-\d{2}$/.test(fromUrl) ? fromUrl : getTodayString();
    });
    const [appointments, setAppointments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [reloadKey, setReloadKey] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [doctorFilter, setDoctorFilter] = useState('all');
    const [departmentFilter, setDepartmentFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [busyId, setBusyId] = useState(null);
    const [actionError, setActionError] = useState('');
    const [successMessage, setSuccessMessage] = useState(location.state?.message || '');
    const [rejectTarget, setRejectTarget] = useState(null);
    const [rejectReason, setRejectReason] = useState('');
    const [rejectError, setRejectError] = useState('');
    const [isRejecting, setIsRejecting] = useState(false);

    useEffect(() => {
        let cancelled = false;

        async function loadAppointments() {
            try {
                const response = await getAppointmentsByDate(date);
                if (cancelled) return;
                setAppointments(unwrapList(response));
                setError('');
            } catch (err) {
                if (cancelled) return;
                setError(err?.message || 'Không thể tải danh sách lịch hẹn.');
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        }

        loadAppointments();

        return () => {
            cancelled = true;
        };
    }, [date, reloadKey]);

    const doctorOptions = useMemo(() => uniqueSorted(appointments.map((item) => item.doctorName)), [appointments]);
    const departmentOptions = useMemo(
        () => uniqueSorted(appointments.map((item) => item.departmentName)),
        [appointments]
    );

    const filteredAppointments = useMemo(() => {
        const keyword = searchTerm.trim().toLowerCase();

        return appointments.filter((item) => {
            const matchesDoctor = doctorFilter === 'all' || item.doctorName === doctorFilter;
            const matchesDepartment = departmentFilter === 'all' || item.departmentName === departmentFilter;
            const matchesStatus = statusFilter === 'all' || Number(item.status) === Number(statusFilter);
            const matchesSearch =
                !keyword ||
                String(item.appointmentId ?? '').includes(keyword) ||
                String(item.patientName ?? '')
                    .toLowerCase()
                    .includes(keyword) ||
                String(item.patientPhone ?? '').includes(keyword) ||
                String(item.reason ?? '')
                    .toLowerCase()
                    .includes(keyword);

            return matchesDoctor && matchesDepartment && matchesStatus && matchesSearch;
        });
    }, [appointments, doctorFilter, departmentFilter, statusFilter, searchTerm]);

    const pendingCount = appointments.filter((item) => Number(item.status) === 1).length;
    const waitingCount = appointments.filter((item) => Number(item.status) === 3).length;

    const reload = () => {
        setIsLoading(true);
        setError('');
        setReloadKey((key) => key + 1);
    };

    const handleDateChange = (event) => {
        const value = event.target.value;
        if (!value) return;
        setDate(value);
        setIsLoading(true);
        setError('');
        setSuccessMessage('');
        setActionError('');
    };

    const runAction = async (appointment, action, confirmText, successText) => {
        const id = appointment?.appointmentId;

        if (!id) {
            setActionError('Không tìm thấy mã lịch khám.');
            return;
        }

        if (!window.confirm(confirmText)) return;

        try {
            setBusyId(id);
            setActionError('');
            setSuccessMessage('');

            await action(id);

            setSuccessMessage(successText);
            reload();
        } catch (err) {
            setActionError(err?.message || 'Thao tác thất bại.');
        } finally {
            setBusyId(null);
        }
    };

    const who = (appointment) => (appointment.patientName ? ` của ${appointment.patientName}` : '');

    const handleConfirm = (appointment) =>
        runAction(
            appointment,
            confirmAppointment,
            `Xác nhận lịch khám #${appointment.appointmentId}${who(appointment)}?`,
            `Đã xác nhận lịch khám #${appointment.appointmentId}.`
        );

    const handleCheckIn = (appointment) =>
        runAction(
            appointment,
            checkInAppointment,
            `Check-in cho lịch khám #${appointment.appointmentId}${who(appointment)}?`,
            `Đã check-in lịch khám #${appointment.appointmentId}. Bệnh nhân đang chờ khám.`
        );

    const handleNoShow = (appointment) =>
        runAction(
            appointment,
            markNoShow,
            `Đánh dấu bệnh nhân không đến cho lịch khám #${appointment.appointmentId}${who(appointment)}? Thao tác này không thể hoàn tác.`,
            `Đã đánh dấu lịch khám #${appointment.appointmentId} là bệnh nhân không đến.`
        );

    const openReject = (appointment) => {
        setRejectTarget(appointment);
        setRejectReason('');
        setRejectError('');
        setSuccessMessage('');
        setActionError('');
    };

    const closeReject = () => {
        if (isRejecting) return;
        setRejectTarget(null);
        setRejectReason('');
        setRejectError('');
    };

    const handleReject = async (event) => {
        event.preventDefault();

        const id = rejectTarget?.appointmentId;
        const reason = rejectReason.trim();

        if (!id) {
            setRejectError('Không tìm thấy mã lịch khám.');
            return;
        }

        if (!reason) {
            setRejectError('Vui lòng nhập lý do.');
            return;
        }

        if (reason.length > 500) {
            setRejectError('Lý do không được vượt quá 500 ký tự.');
            return;
        }

        try {
            setIsRejecting(true);
            setRejectError('');

            await rejectAppointment(id, reason);

            const isPending = Number(rejectTarget.status) === 1;
            setRejectTarget(null);
            setRejectReason('');
            setSuccessMessage(isPending ? `Đã từ chối lịch khám #${id}.` : `Đã hủy lịch khám #${id}.`);
            reload();
        } catch (err) {
            setRejectError(err?.message || 'Không thể hủy lịch hẹn.');
        } finally {
            setIsRejecting(false);
        }
    };

    const isRejectPending = Number(rejectTarget?.status) === 1;

    return (
        <main className="doctor-appointments-page">
            <section className="doctor-page-hero">
                <div>
                    <span className="doctor-page-eyebrow">
                        <CalendarDays size={16} />
                        QUẦY TIẾP ĐÓN
                    </span>
                    <h1>Lịch hẹn trong ngày</h1>
                    <p>Xác nhận hoặc từ chối lịch đặt online, check-in khi bệnh nhân đến khám.</p>
                </div>
                <CalendarDays className="doctor-page-hero-icon" size={64} strokeWidth={1.3} />
            </section>

            <section className="doctor-summary-grid">
                <article className="doctor-summary-card">
                    <span className="doctor-summary-icon">
                        <CalendarDays size={21} />
                    </span>
                    <div>
                        <p>Tổng lịch trong ngày</p>
                        <strong>{appointments.length}</strong>
                    </div>
                </article>
                <article className="doctor-summary-card">
                    <span className="doctor-summary-icon">
                        <Clock3 size={21} />
                    </span>
                    <div>
                        <p>Chờ xác nhận</p>
                        <strong>{pendingCount}</strong>
                    </div>
                </article>
                <article className="doctor-summary-card">
                    <span className="doctor-summary-icon">
                        <CheckCircle2 size={21} />
                    </span>
                    <div>
                        <p>Đang chờ khám</p>
                        <strong>{waitingCount}</strong>
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
                        <p>Chọn ngày để xem, lọc theo bác sĩ, chuyên khoa hoặc trạng thái.</p>
                    </div>
                    <button type="button" className="doctor-secondary-button" onClick={reload} disabled={isLoading}>
                        <RefreshCw size={16} className={isLoading ? 'doctor-spin' : ''} />
                        Làm mới
                    </button>
                </div>

                <div className="reception-toolbar">
                    <label className="doctor-filter-field">
                        <span>Ngày khám</span>
                        <input type="date" value={date} onChange={handleDateChange} />
                    </label>
                    <button
                        type="button"
                        className="doctor-secondary-button"
                        onClick={() => handleDateChange({ target: { value: getTodayString() } })}
                    >
                        Hôm nay
                    </button>
                </div>

                <div className="doctor-filters reception-filters">
                    <label className="doctor-search-field">
                        <Search size={17} />
                        <input
                            value={searchTerm}
                            onChange={(event) => setSearchTerm(event.target.value)}
                            placeholder="Tìm mã lịch, tên hoặc SĐT bệnh nhân..."
                            aria-label="Tìm lịch hẹn"
                        />
                    </label>
                    <label className="doctor-filter-field">
                        <span>Bác sĩ</span>
                        <select value={doctorFilter} onChange={(event) => setDoctorFilter(event.target.value)}>
                            <option value="all">Tất cả bác sĩ</option>
                            {doctorOptions.map((name) => (
                                <option key={name} value={name}>
                                    {name}
                                </option>
                            ))}
                        </select>
                    </label>
                    <label className="doctor-filter-field">
                        <span>Chuyên khoa</span>
                        <select value={departmentFilter} onChange={(event) => setDepartmentFilter(event.target.value)}>
                            <option value="all">Tất cả chuyên khoa</option>
                            {departmentOptions.map((name) => (
                                <option key={name} value={name}>
                                    {name}
                                </option>
                            ))}
                        </select>
                    </label>
                    <label className="doctor-filter-field">
                        <span>Trạng thái</span>
                        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                            <option value="all">Tất cả trạng thái</option>
                            {Object.entries(STATUS_MAP).map(([code, item]) => (
                                <option key={code} value={code}>
                                    {item.label}
                                </option>
                            ))}
                        </select>
                    </label>
                </div>

                {isLoading ? (
                    <div className="doctor-state" role="status">
                        <span className="doctor-spinner" />
                        <h3>Đang tải lịch hẹn</h3>
                        <p>Vui lòng đợi trong giây lát.</p>
                    </div>
                ) : error ? (
                    <div className="doctor-state doctor-state-error">
                        <AlertCircle size={30} />
                        <h3>Không thể tải lịch hẹn</h3>
                        <p>{error}</p>
                        <button type="button" className="doctor-primary-button" onClick={reload}>
                            Thử lại
                        </button>
                    </div>
                ) : filteredAppointments.length === 0 ? (
                    <div className="doctor-state">
                        <CalendarDays size={34} />
                        <h3>Không có lịch hẹn</h3>
                        <p>Ngày này chưa có lịch nào, hoặc không có lịch khớp điều kiện lọc.</p>
                    </div>
                ) : (
                    <div className="doctor-appointment-list">
                        {filteredAppointments.map((appointment, index) => {
                            const status = getStatus(appointment.status);
                            const statusCode = Number(appointment.status);
                            const isBusy = busyId !== null;
                            const isThisBusy = busyId === appointment.appointmentId;

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
                                                <strong>{appointment.doctorName || 'Chưa có thông tin'}</strong>
                                            </span>
                                        </div>
                                        <div>
                                            <ClipboardList size={18} />
                                            <span>
                                                <small>Chuyên khoa</small>
                                                <strong>{appointment.departmentName || 'Chưa có thông tin'}</strong>
                                            </span>
                                        </div>
                                        <div>
                                            <FileText size={18} />
                                            <span>
                                                <small>Lý do khám</small>
                                                <strong>{appointment.reason || 'Không có thông tin'}</strong>
                                            </span>
                                        </div>
                                        <div>
                                            <CheckCircle2 size={18} />
                                            <span>
                                                <small>Check-in lúc</small>
                                                <strong>{formatCheckIn(appointment.checkedInAt)}</strong>
                                            </span>
                                        </div>
                                    </div>

                                    {statusCode === 1 && (
                                        <div className="doctor-appointment-actions reception-actions">
                                            <button
                                                type="button"
                                                className="doctor-secondary-button"
                                                onClick={() => openReject(appointment)}
                                                disabled={isBusy}
                                            >
                                                Từ chối
                                            </button>
                                            <button
                                                type="button"
                                                className="doctor-primary-button"
                                                onClick={() => handleConfirm(appointment)}
                                                disabled={isBusy}
                                            >
                                                {isThisBusy ? 'Đang xử lý...' : 'Xác nhận'}
                                            </button>
                                        </div>
                                    )}

                                    {statusCode === 2 && (
                                        <div className="doctor-appointment-actions reception-actions">
                                            {hasSlotStarted(appointment) && (
                                                <button
                                                    type="button"
                                                    className="doctor-secondary-button"
                                                    onClick={() => handleNoShow(appointment)}
                                                    disabled={isBusy}
                                                >
                                                    Không đến
                                                </button>
                                            )}
                                            <button
                                                type="button"
                                                className="doctor-secondary-button"
                                                onClick={() => openReject(appointment)}
                                                disabled={isBusy}
                                            >
                                                Hủy lịch
                                            </button>
                                            <button
                                                type="button"
                                                className="doctor-primary-button"
                                                onClick={() => handleCheckIn(appointment)}
                                                disabled={isBusy}
                                            >
                                                {isThisBusy ? 'Đang xử lý...' : 'Check-in'}
                                            </button>
                                        </div>
                                    )}
                                </article>
                            );
                        })}
                    </div>
                )}
            </section>

            {rejectTarget && (
                <div
                    className="doctor-modal-backdrop"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) closeReject();
                    }}
                >
                    <section
                        className="doctor-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="reception-reject-title"
                    >
                        <div className="doctor-modal-heading">
                            <div>
                                <span className="doctor-page-eyebrow">
                                    <AlertCircle size={15} /> {isRejectPending ? 'TỪ CHỐI LỊCH' : 'HỦY LỊCH'}
                                </span>
                                <h2 id="reception-reject-title">Lịch khám #{rejectTarget.appointmentId}</h2>
                                {rejectTarget.patientName && <p>Bệnh nhân: {rejectTarget.patientName}</p>}
                            </div>
                            <button
                                type="button"
                                className="doctor-modal-close"
                                onClick={closeReject}
                                disabled={isRejecting}
                                aria-label="Đóng"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleReject}>
                            <label className="doctor-form-field">
                                <span>
                                    Lý do {isRejectPending ? 'từ chối' : 'hủy'} <b>*</b>
                                </span>
                                <textarea
                                    value={rejectReason}
                                    onChange={(event) => setRejectReason(event.target.value)}
                                    rows={4}
                                    maxLength={500}
                                    required
                                    placeholder="Nhập lý do..."
                                    disabled={isRejecting}
                                />
                                <small>{rejectReason.length}/500 ký tự</small>
                            </label>

                            {rejectError && (
                                <p className="doctor-feedback doctor-feedback-error" role="alert">
                                    <AlertCircle size={17} />
                                    {rejectError}
                                </p>
                            )}

                            <div className="doctor-modal-actions">
                                <button
                                    type="button"
                                    className="doctor-secondary-button"
                                    onClick={closeReject}
                                    disabled={isRejecting}
                                >
                                    Đóng
                                </button>
                                <button type="submit" className="doctor-primary-button" disabled={isRejecting}>
                                    {isRejecting ? 'Đang xử lý...' : isRejectPending ? 'Từ chối lịch' : 'Hủy lịch'}
                                </button>
                            </div>
                        </form>
                    </section>
                </div>
            )}
        </main>
    );
}

export default ReceptionAppointmentsPage;
