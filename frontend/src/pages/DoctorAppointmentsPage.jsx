import { useEffect, useMemo, useState } from 'react';
import {
    CalendarDays,
    Clock3,
    ClipboardList,
    RefreshCw,
    AlertCircle,
    FileText,
    CheckCircle2,
    Search,
    X,
} from 'lucide-react';
import {
    getMyDoctorAppointments,
} from '../services/appointmentService';
import {
    createExamReport,
    getMyDoctorExamReports,
} from '../services/examReportService';
import './DoctorAppointmentsPage.css';

const STATUS_MAP = {
    1: { label: 'Chờ xác nhận', className: 'pending' },
    2: { label: 'Đã xác nhận', className: 'confirmed' },
    3: { label: 'Đã check-in', className: 'checked-in' },
    4: { label: 'Đã hoàn thành', className: 'completed' },
    5: { label: 'Đã hủy', className: 'cancelled' },
    6: { label: 'Không đến', className: 'no-show' },
};

function unwrapList(response) {
    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.data)) return response.data;
    if (Array.isArray(response?.data?.data)) return response.data.data;
    return [];
}

function getStatus(status) {
    return STATUS_MAP[Number(status)] || {
        label: 'Không xác định',
        className: 'unknown',
    };
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

function DoctorAppointmentsPage() {
    const [appointments, setAppointments] = useState([]);
    const [reports, setReports] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [reloadKey, setReloadKey] = useState(0);
    const [dateFilter, setDateFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [diagnosis, setDiagnosis] = useState('');
    const [notes, setNotes] = useState('');
    const [formError, setFormError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

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
        [reports],
    );

    const filteredAppointments = useMemo(() => {
        const normalizedSearch = searchTerm.trim().toLowerCase();

        return appointments.filter((appointment) => {
            const matchesDate = !dateFilter || appointment.appointmentDate === dateFilter;
            const matchesStatus = statusFilter === 'all'
                || Number(appointment.status) === Number(statusFilter);
            const matchesSearch = !normalizedSearch
                || String(appointment.appointmentId ?? '').includes(normalizedSearch)
                || String(appointment.reason ?? '').toLowerCase().includes(normalizedSearch)
                || String(appointment.departmentName ?? '').toLowerCase().includes(normalizedSearch);

            return matchesDate && matchesStatus && matchesSearch;
        });
    }, [appointments, dateFilter, statusFilter, searchTerm]);

    const completedCount = appointments.filter(
        (appointment) => Number(appointment.status) === 4,
    ).length;

    const pendingReportCount = reports.filter(
        (report) => Number(report.status) === 1,
    ).length;

    const handleReload = () => {
        setIsLoading(true);
        setError('');
        setReloadKey((key) => key + 1);
    };

    const openReportForm = (appointment) => {
        setSelectedAppointment(appointment);
        setDiagnosis('');
        setNotes('');
        setFormError('');
        setSuccessMessage('');
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

        if (!selectedAppointment?.appointmentId) {
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
                appointmentId: selectedAppointment.appointmentId,
                diagnosis: diagnosis.trim(),
                notes: notes.trim(),
            });

            setSelectedAppointment(null);
            setSuccessMessage(
                `Đã tạo báo cáo cho lịch khám #${selectedAppointment.appointmentId}. Báo cáo đang ở trạng thái bản nháp nếu backend tạo theo trạng thái mặc định.`,
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
                    <p>Theo dõi lịch hẹn và tạo báo cáo khám cho các lượt khám đã hoàn thành.</p>
                </div>
                <CalendarDays className="doctor-page-hero-icon" size={64} strokeWidth={1.3} />
            </section>

            <section className="doctor-summary-grid">
                <article className="doctor-summary-card">
                    <span className="doctor-summary-icon"><CalendarDays size={21} /></span>
                    <div><p>Tổng lịch khám</p><strong>{appointments.length}</strong></div>
                </article>
                <article className="doctor-summary-card">
                    <span className="doctor-summary-icon"><CheckCircle2 size={21} /></span>
                    <div><p>Đã hoàn thành</p><strong>{completedCount}</strong></div>
                </article>
                <article className="doctor-summary-card">
                    <span className="doctor-summary-icon"><FileText size={21} /></span>
                    <div><p>Bản nháp báo cáo</p><strong>{pendingReportCount}</strong></div>
                </article>
            </section>

            {successMessage && (
                <p className="doctor-feedback doctor-feedback-success" role="status">
                    <CheckCircle2 size={18} /> {successMessage}
                </p>
            )}

            <section className="doctor-panel">
                <div className="doctor-panel-heading">
                    <div>
                        <h2>Danh sách lịch hẹn</h2>
                        <p>Lọc theo ngày, trạng thái hoặc mã lịch khám.</p>
                    </div>
                    <button type="button" className="doctor-secondary-button" onClick={handleReload} disabled={isLoading}>
                        <RefreshCw size={16} className={isLoading ? 'doctor-spin' : ''} />
                        Làm mới
                    </button>
                </div>

                <div className="doctor-filters">
                    <label className="doctor-search-field">
                        <Search size={17} />
                        <input
                            value={searchTerm}
                            onChange={(event) => setSearchTerm(event.target.value)}
                            placeholder="Tìm mã lịch, lý do khám..."
                            aria-label="Tìm lịch khám"
                        />
                    </label>
                    <label className="doctor-filter-field">
                        <span>Ngày khám</span>
                        <input type="date" value={dateFilter} onChange={(event) => setDateFilter(event.target.value)} />
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
                        <button type="button" className="doctor-primary-button" onClick={handleReload}>Thử lại</button>
                    </div>
                ) : filteredAppointments.length === 0 ? (
                    <div className="doctor-state">
                        <CalendarDays size={34} />
                        <h3>Không tìm thấy lịch khám</h3>
                        <p>Thử thay đổi điều kiện lọc hoặc tải lại dữ liệu.</p>
                    </div>
                ) : (
                    <div className="doctor-appointment-list">
                        {filteredAppointments.map((appointment, index) => {
                            const status = getStatus(appointment.status);
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
                                            <span><small>Ngày khám</small><strong>{formatDate(appointment.appointmentDate)}</strong></span>
                                        </div>
                                        <div>
                                            <Clock3 size={18} />
                                            <span><small>Khung giờ</small><strong>{appointment.timeSlot || 'Chưa có thông tin'}</strong></span>
                                        </div>
                                        <div>
                                            <ClipboardList size={18} />
                                            <span><small>Chuyên khoa</small><strong>{appointment.departmentName || 'Chưa có thông tin'}</strong></span>
                                        </div>
                                        <div>
                                            <FileText size={18} />
                                            <span><small>Lý do khám</small><strong>{appointment.reason || 'Không có thông tin'}</strong></span>
                                        </div>
                                    </div>

                                    {Number(appointment.status) === 4 && (
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
                    <section className="doctor-modal" role="dialog" aria-modal="true" aria-labelledby="doctor-report-title">
                        <div className="doctor-modal-heading">
                            <div>
                                <span className="doctor-page-eyebrow"><FileText size={15} /> BÁO CÁO KHÁM</span>
                                <h2 id="doctor-report-title">Tạo báo cáo #{selectedAppointment.appointmentId}</h2>
                            </div>
                            <button type="button" className="doctor-modal-close" onClick={closeReportForm} disabled={isSubmitting} aria-label="Đóng">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateReport}>
                            <label className="doctor-form-field">
                                <span>Chẩn đoán <b>*</b></span>
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

                            {formError && <p className="doctor-feedback doctor-feedback-error" role="alert"><AlertCircle size={17} />{formError}</p>}

                            <div className="doctor-modal-actions">
                                <button type="button" className="doctor-secondary-button" onClick={closeReportForm} disabled={isSubmitting}>Hủy</button>
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
