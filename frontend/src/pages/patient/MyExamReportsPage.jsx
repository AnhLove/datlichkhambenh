import { useEffect, useState } from 'react';
import {
    ClipboardList,
    CalendarDays,
    Stethoscope,
    UserRound,
    RefreshCw,
    AlertCircle,
    FileText,
    CheckCircle2,
} from 'lucide-react';

import { getMyExamReports } from '../../services/examReportService';
import './MyExamReportsPage.css';

function getReportList(response) {
    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.data)) return response.data;
    if (Array.isArray(response?.data?.data)) return response.data.data;

    return [];
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

function MyExamReportsPage() {
    const [reports, setReports] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [reloadKey, setReloadKey] = useState(0);

    useEffect(() => {
        let cancelled = false;

        async function loadReports() {
            try {
                const response = await getMyExamReports();

                if (cancelled) return;

                setReports(getReportList(response));
                setError('');
            } catch (err) {
                if (cancelled) return;

                setError(err?.message || 'Không thể tải kết quả khám. Vui lòng thử lại.');
            } finally {
                if (!cancelled) {
                    setIsLoading(false);
                }
            }
        }

        loadReports();

        return () => {
            cancelled = true;
        };
    }, [reloadKey]);

    const handleRetry = () => {
        setError('');
        setReloadKey((key) => key + 1);
    };

    return (
        <main className="exam-reports-page">
            <section className="exam-reports-hero">
                <div className="exam-reports-hero-content">
                    <span className="exam-reports-eyebrow">
                        <ClipboardList size={16} />
                        HỒ SƠ SỨC KHỎE
                    </span>

                    <h1>Kết quả khám của tôi</h1>

                    <p>Theo dõi kết quả khám bệnh, chẩn đoán và những ghi chú từ bác sĩ tại Bệnh viện Nam Lương Sơn.</p>
                </div>

                <div className="exam-reports-hero-icon" aria-hidden="true">
                    <FileText size={68} strokeWidth={1.3} />
                </div>
            </section>

            <section className="exam-reports-section">
                <div className="exam-reports-heading">
                    <div>
                        <h2>Danh sách kết quả khám</h2>
                        <p>Các phiếu khám đã được bác sĩ phát hành</p>
                    </div>

                    <button type="button" className="exam-reports-refresh" onClick={handleRetry} disabled={isLoading}>
                        <RefreshCw size={16} className={isLoading ? 'exam-reports-spinning' : ''} />
                        Làm mới
                    </button>
                </div>

                {isLoading ? (
                    <div className="exam-reports-state" role="status">
                        <span className="exam-reports-spinner" />
                        <h3>Đang tải kết quả khám</h3>
                        <p>Vui lòng đợi trong giây lát...</p>
                    </div>
                ) : error ? (
                    <div className="exam-reports-state exam-reports-error">
                        <AlertCircle size={32} />
                        <h3>Không thể tải kết quả khám</h3>
                        <p>{error}</p>

                        <button type="button" className="exam-reports-primary-button" onClick={handleRetry}>
                            <RefreshCw size={16} />
                            Thử lại
                        </button>
                    </div>
                ) : reports.length === 0 ? (
                    <div className="exam-reports-state">
                        <span className="exam-reports-empty-icon">
                            <ClipboardList size={34} />
                        </span>

                        <h3>Chưa có kết quả khám</h3>

                        <p>Kết quả sẽ xuất hiện tại đây sau khi bác sĩ hoàn tất và phát hành phiếu khám.</p>
                    </div>
                ) : (
                    <div className="exam-reports-list">
                        {reports.map((report) => (
                            <article className="exam-report-card" key={report.id}>
                                <div className="exam-report-card-header">
                                    <div className="exam-report-title">
                                        <span className="exam-report-icon">
                                            <FileText size={22} />
                                        </span>

                                        <div>
                                            <h3>Kết quả khám #{report.id}</h3>
                                            <p>Mã lịch khám: {report.appointmentId}</p>
                                        </div>
                                    </div>

                                    <span className="exam-report-issued">
                                        <CheckCircle2 size={15} />
                                        Đã phát hành
                                    </span>
                                </div>

                                <div className="exam-report-meta">
                                    <div>
                                        <Stethoscope size={17} />
                                        <span>
                                            <small>Bác sĩ</small>
                                            <strong>{report.doctorName || 'Chưa có thông tin'}</strong>
                                        </span>
                                    </div>

                                    <div>
                                        <CalendarDays size={17} />
                                        <span>
                                            <small>Ngày phát hành</small>
                                            <strong>{formatDateTime(report.issuedAt)}</strong>
                                        </span>
                                    </div>

                                    <div>
                                        <UserRound size={17} />
                                        <span>
                                            <small>Bệnh nhân</small>
                                            <strong>{report.patientName || 'Chưa có thông tin'}</strong>
                                        </span>
                                    </div>
                                </div>

                                <div className="exam-report-content">
                                    <div className="exam-report-field">
                                        <h4>Chẩn đoán</h4>
                                        <p>{report.diagnosis || 'Chưa có thông tin'}</p>
                                    </div>

                                    <div className="exam-report-field">
                                        <h4>Ghi chú của bác sĩ</h4>
                                        <p>{report.notes || 'Không có ghi chú'}</p>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
}

export default MyExamReportsPage;
