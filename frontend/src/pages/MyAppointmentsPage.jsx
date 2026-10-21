import { useEffect, useState } from 'react';
import {
    CalendarDays,
    Clock3,
    Stethoscope,
    Building2,
    ClipboardList,
    RefreshCw,
    X,
    Ban,
    AlertCircle,
    CheckCircle2,
} from 'lucide-react';
import { getMyAppointments, cancelAppointment } from '../services/appointmentService';
import './MyAppointmentsPage.css';
import { Link } from 'react-router-dom';

const STATUS_MAP = {
    1: { label: 'Chờ xác nhận', className: 'pending' },
    2: { label: 'Đã xác nhận', className: 'confirmed' },
    3: { label: 'Đã check-in', className: 'checked-in' },
    4: { label: 'Đã hoàn thành', className: 'completed' },
    5: { label: 'Đã hủy', className: 'cancelled' },
    6: { label: 'Không đến', className: 'no-show' },
};

const CANCELLABLE_STATUSES = [1, 2];

function getAppointmentList(response) {
    // Hỗ trợ API trả về mảng trực tiếp hoặc bọc trong ApiResponse.data.
    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.data)) return response.data;
    if (Array.isArray(response?.data?.data)) return response.data.data;
    return [];
}

function getStatus(status) {
    const key = String(status);
    return (
        STATUS_MAP[key] || {
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

function formatDateTime(value) {
    if (!value) return 'Chưa có thông tin';

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return value;

    return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
}

function MyAppointmentsPage() {
    const [appointments, setAppointments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [reloadKey, setReloadKey] = useState(0);

    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [cancelReason, setCancelReason] = useState('');
    const [cancelError, setCancelError] = useState('');
    const [isCancelling, setIsCancelling] = useState(false);

    useEffect(() => {
        let cancelled = false;

        getMyAppointments()
            .then((response) => {
                if (cancelled) return;

                setAppointments(getAppointmentList(response));
                setError('');
            })
            .catch((err) => {
                if (cancelled) return;

                setError(err?.message || 'Không thể tải danh sách lịch khám. Vui lòng thử lại.');
            })
            .finally(() => {
                if (!cancelled) {
                    setIsLoading(false);
                }
            });

        return () => {
            cancelled = true;
        };
    }, [reloadKey]);

    const handleRetry = () => {
        setError('');
        setIsLoading(true);
        setReloadKey((key) => key + 1);
    };

    const openCancelDialog = (appointment) => {
        setSelectedAppointment(appointment);
        setCancelReason('');
        setCancelError('');
    };

    const closeCancelDialog = () => {
        if (isCancelling) return;

        setSelectedAppointment(null);
        setCancelReason('');
        setCancelError('');
    };

    const handleCancelAppointment = async (event) => {
        event.preventDefault();

        if (!selectedAppointment?.appointmentId) {
            setCancelError('Không tìm thấy mã lịch khám. Vui lòng tải lại danh sách.');
            return;
        }

        if (cancelReason.length > 500) {
            setCancelError('Lý do hủy không được vượt quá 500 ký tự.');
            return;
        }

        try {
            setIsCancelling(true);
            setCancelError('');

            await cancelAppointment(selectedAppointment.appointmentId, cancelReason.trim());

            setSelectedAppointment(null);
            setCancelReason('');
            setIsLoading(true);
            setError('');
            setReloadKey((key) => key + 1);
        } catch (err) {
            setCancelError(err?.message || 'Không thể hủy lịch khám. Vui lòng thử lại.');
        } finally {
            setIsCancelling(false);
        }
    };

    const pendingCount = appointments.filter((appointment) => Number(appointment.status) === 1).length;

    const confirmedCount = appointments.filter((appointment) => Number(appointment.status) === 2).length;

    const completedCount = appointments.filter((appointment) => Number(appointment.status) === 4).length;

    return (
        <main className="my-appointments-page">
            <section className="my-appointments-hero">
                <div className="my-appointments-hero-content">
                    <span className="my-appointments-eyebrow">
                        <CalendarDays size={16} />
                        QUẢN LÝ LỊCH KHÁM
                    </span>

                    <h1>Lịch khám của tôi</h1>

                    <p>
                        Theo dõi lịch hẹn, kiểm tra thông tin khám và quản lý lịch khám của bạn tại Bệnh viện Nam Lương
                        Sơn.
                    </p>
                </div>

                <div className="my-appointments-hero-icon" aria-hidden="true">
                    <CalendarDays size={72} strokeWidth={1.3} />
                </div>
            </section>

            <section className="appointment-summary" aria-label="Tổng quan lịch khám">
                <article className="appointment-summary-card">
                    <span className="appointment-summary-icon pending-icon">
                        <Clock3 size={21} />
                    </span>
                    <div>
                        <p>Chờ xác nhận</p>
                        <strong>{pendingCount}</strong>
                    </div>
                </article>

                <article className="appointment-summary-card">
                    <span className="appointment-summary-icon confirmed-icon">
                        <CheckCircle2 size={21} />
                    </span>
                    <div>
                        <p>Đã xác nhận</p>
                        <strong>{confirmedCount}</strong>
                    </div>
                </article>

                <article className="appointment-summary-card">
                    <span className="appointment-summary-icon completed-icon">
                        <ClipboardList size={21} />
                    </span>
                    <div>
                        <p>Đã hoàn thành</p>
                        <strong>{completedCount}</strong>
                    </div>
                </article>

                <article className="appointment-summary-card">
                    <span className="appointment-summary-icon total-icon">
                        <CalendarDays size={21} />
                    </span>
                    <div>
                        <p>Tổng lịch khám</p>
                        <strong>{appointments.length}</strong>
                    </div>
                </article>
            </section>

            <section className="appointment-list-section">
                <div className="appointment-list-heading">
                    <div>
                        <h2>Danh sách lịch hẹn</h2>
                        <p>Thông tin các lịch khám của bạn</p>
                    </div>

                    <button
                        type="button"
                        className="appointment-refresh-button"
                        onClick={handleRetry}
                        disabled={isLoading}
                    >
                        <RefreshCw size={16} className={isLoading ? 'refresh-spinning' : ''} />
                        Làm mới
                    </button>
                </div>

                {isLoading ? (
                    <div className="appointment-state" role="status" aria-live="polite">
                        <span className="appointment-spinner" />
                        <h3>Đang tải lịch khám</h3>
                        <p>Vui lòng đợi trong giây lát...</p>
                    </div>
                ) : error ? (
                    <div className="appointment-state appointment-error-state">
                        <span className="appointment-state-icon">
                            <AlertCircle size={30} />
                        </span>
                        <h3>Không thể tải lịch khám</h3>
                        <p>{error}</p>
                        <button type="button" className="appointment-primary-button" onClick={handleRetry}>
                            <RefreshCw size={16} />
                            Thử lại
                        </button>
                    </div>
                ) : appointments.length === 0 ? (
                    <div className="appointment-state">
                        <span className="appointment-state-icon">
                            <CalendarDays size={32} />
                        </span>
                        <h3>Bạn chưa có lịch khám nào</h3>
                        <p>Khi đặt lịch khám thành công, thông tin sẽ hiển thị tại đây.</p>
                        <Link to="/appointments" className="appointment-primary-button">
                            Đặt lịch khám
                        </Link>
                    </div>
                ) : (
                    <div className="appointment-list">
                        {appointments.map((appointment, index) => {
                            const status = getStatus(appointment.status);
                            const canCancel = CANCELLABLE_STATUSES.includes(Number(appointment.status));

                            return (
                                <article
                                    className="appointment-card"
                                    key={
                                        appointment.appointmentId ??
                                        `${appointment.appointmentDate}-${appointment.timeSlot}-${index}`
                                    }
                                >
                                    <div className="appointment-card-top">
                                        <div className="appointment-card-date">
                                            <span className="appointment-date-icon">
                                                <CalendarDays size={20} />
                                            </span>
                                            <div>
                                                <span className="appointment-field-label">Ngày khám</span>
                                                <strong>{formatDate(appointment.appointmentDate)}</strong>
                                            </div>
                                        </div>

                                        <span className={`appointment-status appointment-status-${status.className}`}>
                                            {status.label}
                                        </span>
                                    </div>

                                    <div className="appointment-card-details">
                                        <div className="appointment-detail">
                                            <Stethoscope size={18} />
                                            <div>
                                                <span className="appointment-field-label">Bác sĩ</span>
                                                <strong>{appointment.doctorName || 'Chưa có thông tin'}</strong>
                                            </div>
                                        </div>

                                        <div className="appointment-detail">
                                            <Building2 size={18} />
                                            <div>
                                                <span className="appointment-field-label">Chuyên khoa</span>
                                                <strong>{appointment.departmentName || 'Chưa có thông tin'}</strong>
                                            </div>
                                        </div>

                                        <div className="appointment-detail">
                                            <Clock3 size={18} />
                                            <div>
                                                <span className="appointment-field-label">Khung giờ</span>
                                                <strong>{appointment.timeSlot || 'Chưa có thông tin'}</strong>
                                            </div>
                                        </div>

                                        <div className="appointment-detail">
                                            <ClipboardList size={18} />
                                            <div>
                                                <span className="appointment-field-label">Lý do khám</span>
                                                <strong className="appointment-reason">
                                                    {appointment.reason || 'Không có thông tin'}
                                                </strong>
                                            </div>
                                        </div>
                                    </div>

                                    {appointment.checkedInAt && (
                                        <p className="appointment-checkin-info">
                                            Thời gian check-in: {formatDateTime(appointment.checkedInAt)}
                                        </p>
                                    )}

                                    <div className="appointment-card-footer">
                                        <span className="appointment-created-at">
                                            Ngày tạo: {formatDateTime(appointment.createdAt)}
                                        </span>

                                        {canCancel && (
                                            <button
                                                type="button"
                                                className="appointment-cancel-button"
                                                onClick={() => openCancelDialog(appointment)}
                                            >
                                                <Ban size={16} />
                                                Hủy lịch
                                            </button>
                                        )}
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
            </section>

            {selectedAppointment && (
                <div
                    className="cancel-dialog-backdrop"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            closeCancelDialog();
                        }
                    }}
                >
                    <section
                        className="cancel-dialog"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="cancel-dialog-title"
                    >
                        <div className="cancel-dialog-heading">
                            <span className="cancel-dialog-icon">
                                <Ban size={23} />
                            </span>

                            <button
                                type="button"
                                className="cancel-dialog-close"
                                aria-label="Đóng hộp thoại"
                                onClick={closeCancelDialog}
                                disabled={isCancelling}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <h2 id="cancel-dialog-title">Xác nhận hủy lịch khám</h2>

                        <p className="cancel-dialog-description">
                            Bạn có chắc chắn muốn hủy lịch khám vào ngày{' '}
                            <strong>{formatDate(selectedAppointment.appointmentDate)}</strong> lúc{' '}
                            <strong>{selectedAppointment.timeSlot}</strong>?
                        </p>

                        <form onSubmit={handleCancelAppointment}>
                            <label htmlFor="cancel-reason">
                                Lý do hủy lịch <span className="cancel-optional">(không bắt buộc)</span>
                            </label>

                            <textarea
                                id="cancel-reason"
                                value={cancelReason}
                                onChange={(event) => {
                                    setCancelReason(event.target.value);
                                    setCancelError('');
                                }}
                                placeholder="Nhập lý do nếu bạn muốn..."
                                rows={4}
                                maxLength={500}
                                disabled={isCancelling}
                            />

                            <div className="cancel-character-count">{cancelReason.length}/500 ký tự</div>

                            {cancelError && (
                                <p className="cancel-dialog-error" role="alert">
                                    <AlertCircle size={16} />
                                    {cancelError}
                                </p>
                            )}

                            <div className="cancel-dialog-actions">
                                <button
                                    type="button"
                                    className="cancel-dialog-back-button"
                                    onClick={closeCancelDialog}
                                    disabled={isCancelling}
                                >
                                    Giữ lịch khám
                                </button>

                                <button type="submit" className="cancel-dialog-confirm-button" disabled={isCancelling}>
                                    {isCancelling ? 'Đang hủy...' : 'Xác nhận hủy'}
                                </button>
                            </div>
                        </form>
                    </section>
                </div>
            )}
        </main>
    );
}

export default MyAppointmentsPage;
