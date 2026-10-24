import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    ClipboardList,
    CalendarDays,
    UserRound,
    RefreshCw,
    AlertCircle,
    FileText,
    CheckCircle2,
    Send,
} from 'lucide-react';
import { getMyDoctorExamReports, issueExamReport } from '../services/examReportService';
import { unwrapList } from '../utils/unwrap';
import './DoctorAppointmentsPage.css';
import './DoctorExamReportsPage.css';

function formatDateTime(value) {
    if (!value) return 'Chưa phát hành';
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

function DoctorExamReportsPage() {
    const [reports, setReports] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [reloadKey, setReloadKey] = useState(0);
    const [issuingId, setIssuingId] = useState(null);
    const [actionError, setActionError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        let cancelled = false;

        async function loadReports() {
            try {
                const response = await getMyDoctorExamReports();
                if (cancelled) return;
                setReports(unwrapList(response));
                setError('');
            } catch (err) {
                if (cancelled) return;
                setError(err?.message || 'Không thể tải danh sách báo cáo khám.');
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        }

        loadReports();

        return () => {
            cancelled = true;
        };
    }, [reloadKey]);

    const handleReload = () => {
        setIsLoading(true);
        setError('');
        setReloadKey((key) => key + 1);
    };

    const handleIssue = async (report) => {
        if (!report?.id) {
            setActionError('Không tìm thấy mã báo cáo.');
            return;
        }

        const confirmed = window.confirm(
            `Bạn có chắc chắn muốn phát hành báo cáo khám #${report.id}? Sau khi phát hành, bệnh nhân có thể xem kết quả.`
        );

        if (!confirmed) return;

        try {
            setIssuingId(report.id);
            setActionError('');
            setSuccessMessage('');
            await issueExamReport(report.id);
            setSuccessMessage(`Đã phát hành báo cáo #${report.id}. Bệnh nhân có thể xem kết quả khám.`);
            setIsLoading(true);
            setReloadKey((key) => key + 1);
        } catch (err) {
            setActionError(err?.message || 'Không thể phát hành báo cáo.');
        } finally {
            setIssuingId(null);
        }
    };

    const draftCount = reports.filter((report) => Number(report.status) === 1).length;
    const issuedCount = reports.filter((report) => Number(report.status) === 2).length;

    return (
        <main className="doctor-reports-page">
            <section className="doctor-page-hero">
                <div>
                    <span className="doctor-page-eyebrow">
                        <ClipboardList size={16} />
                        HỒ SƠ KHÁM BỆNH
                    </span>
                    <h1>Báo cáo khám của tôi</h1>
                    <p>Quản lý bản nháp và các báo cáo khám đã phát hành.</p>
                </div>
                <FileText className="doctor-page-hero-icon" size={64} strokeWidth={1.3} />
            </section>

            <section className="doctor-summary-grid doctor-report-summary">
                <article className="doctor-summary-card">
                    <span className="doctor-summary-icon">
                        <FileText size={21} />
                    </span>
                    <div>
                        <p>Tổng báo cáo</p>
                        <strong>{reports.length}</strong>
                    </div>
                </article>
                <article className="doctor-summary-card">
                    <span className="doctor-summary-icon">
                        <ClipboardList size={21} />
                    </span>
                    <div>
                        <p>Bản nháp</p>
                        <strong>{draftCount}</strong>
                    </div>
                </article>
                <article className="doctor-summary-card">
                    <span className="doctor-summary-icon">
                        <CheckCircle2 size={21} />
                    </span>
                    <div>
                        <p>Đã phát hành</p>
                        <strong>{issuedCount}</strong>
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
                        <h2>Danh sách báo cáo</h2>
                        <p>Báo cáo thuộc các lượt khám của bác sĩ đang đăng nhập.</p>
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

                {isLoading ? (
                    <div className="doctor-state" role="status">
                        <span className="doctor-spinner" />
                        <h3>Đang tải báo cáo</h3>
                        <p>Vui lòng đợi trong giây lát.</p>
                    </div>
                ) : error ? (
                    <div className="doctor-state doctor-state-error">
                        <AlertCircle size={30} />
                        <h3>Không thể tải báo cáo</h3>
                        <p>{error}</p>
                        <button type="button" className="doctor-primary-button" onClick={handleReload}>
                            Thử lại
                        </button>
                    </div>
                ) : reports.length === 0 ? (
                    <div className="doctor-state">
                        <ClipboardList size={34} />
                        <h3>Chưa có báo cáo khám</h3>
                        <p>Bạn có thể tạo báo cáo từ một lịch khám đã hoàn thành.</p>
                        <Link
                            to="/doctor/appointments"
                            className="doctor-primary-button"
                            style={{ textDecoration: 'none' }}
                        >
                            Đến lịch khám của tôi
                        </Link>
                    </div>
                ) : (
                    <div className="doctor-report-list">
                        {reports.map((report) => {
                            const isIssued = Number(report.status) === 2;
                            const isDraft = Number(report.status) === 1;

                            return (
                                <article className="doctor-report-card" key={report.id}>
                                    <div className="doctor-report-card-heading">
                                        <div className="doctor-report-title">
                                            <span className="doctor-report-icon">
                                                <FileText size={22} />
                                            </span>
                                            <div>
                                                <h3>Báo cáo #{report.id}</h3>
                                                <p>Mã lịch khám: {report.appointmentId ?? '—'}</p>
                                            </div>
                                        </div>
                                        <span className={`doctor-report-status ${isIssued ? 'issued' : 'draft'}`}>
                                            {isIssued ? <CheckCircle2 size={15} /> : <ClipboardList size={15} />}
                                            {report.statusName || (isIssued ? 'Đã phát hành' : 'Bản nháp')}
                                        </span>
                                    </div>

                                    <div className="doctor-report-meta">
                                        <div>
                                            <UserRound size={17} />
                                            <span>
                                                <small>Bệnh nhân</small>
                                                <strong>{report.patientName || 'Chưa có thông tin'}</strong>
                                            </span>
                                        </div>
                                        <div>
                                            <CalendarDays size={17} />
                                            <span>
                                                <small>Ngày phát hành</small>
                                                <strong>{formatDateTime(report.issuedAt)}</strong>
                                            </span>
                                        </div>
                                    </div>

                                    <div className="doctor-report-content">
                                        <section>
                                            <h4>Chẩn đoán</h4>
                                            <p>{report.diagnosis || 'Chưa có chẩn đoán'}</p>
                                        </section>
                                        <section>
                                            <h4>Ghi chú</h4>
                                            <p>{report.notes || 'Không có ghi chú'}</p>
                                        </section>
                                    </div>

                                    {isDraft && (
                                        <div className="doctor-report-actions">
                                            <button
                                                type="button"
                                                className="doctor-primary-button"
                                                onClick={() => handleIssue(report)}
                                                disabled={issuingId === report.id}
                                            >
                                                <Send size={16} />
                                                {issuingId === report.id ? 'Đang phát hành...' : 'Phát hành báo cáo'}
                                            </button>
                                        </div>
                                    )}
                                </article>
                            );
                        })}
                    </div>
                )}
            </section>
        </main>
    );
}

export default DoctorExamReportsPage;
