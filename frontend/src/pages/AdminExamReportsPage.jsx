import { useEffect, useState } from 'react';
import { Plus, RefreshCw, Send, X } from 'lucide-react';

import { createExamReport, getAllExamReports, issueExamReport } from '../services/examReportService';
import { unwrapList } from '../utils/unwrap';

import './AdminPage.css';

const STATUS_DRAFT = 1;
const STATUS_ISSUED = 2;
const EMPTY_FORM = { appointmentId: '', diagnosis: '', notes: '' };

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

function validateForm(form) {
    if (!/^\d+$/.test(form.appointmentId.trim()) || Number(form.appointmentId) < 1) {
        return 'Mã lịch khám phải là số nguyên dương.';
    }
    if (!form.diagnosis.trim()) return 'Chẩn đoán không được để trống.';
    return '';
}

function AdminExamReportsPage() {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState('');
    const [notice, setNotice] = useState('');
    const [filter, setFilter] = useState('all');
    const [issuingId, setIssuingId] = useState(null);
    const [form, setForm] = useState(null);
    const [formError, setFormError] = useState('');
    const [saving, setSaving] = useState(false);

    const [reloadKey, setReloadKey] = useState(0);

    const reload = () => setReloadKey((key) => key + 1);

    useEffect(() => {
        let cancelled = false;

        async function loadReports() {
            try {
                const response = await getAllExamReports();
                if (cancelled) return;
                setReports(unwrapList(response));
                setLoadError('');
            } catch (err) {
                if (cancelled) return;
                setLoadError(err.message || 'Không thể tải danh sách phiếu khám.');
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        loadReports();

        return () => {
            cancelled = true;
        };
    }, [reloadKey]);

    useEffect(() => {
        if (!form) return undefined;

        const handleKeyDown = (event) => {
            if (event.key === 'Escape' && !saving) setForm(null);
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [form, saving]);

    const handleReload = () => {
        setLoading(true);
        setNotice('');
        reload();
    };

    const openCreate = () => {
        setFormError('');
        setForm({ ...EMPTY_FORM });
    };

    const handleSave = async (event) => {
        event.preventDefault();

        const message = validateForm(form);
        if (message) {
            setFormError(message);
            return;
        }

        setSaving(true);
        setFormError('');

        try {
            await createExamReport({
                appointmentId: Number(form.appointmentId),
                diagnosis: form.diagnosis.trim(),
                notes: form.notes.trim(),
            });

            setForm(null);
            setNotice('Đã lập phiếu khám (bản nháp).');
            reload();
        } catch (err) {
            setFormError(err.message || 'Không thể lập phiếu khám.');
        } finally {
            setSaving(false);
        }
    };

    const handleIssue = async (report) => {
        const confirmed = window.confirm(
            `Phát hành phiếu khám #${report.id}? Sau khi phát hành, bệnh nhân có thể xem kết quả.`
        );
        if (!confirmed) return;

        setIssuingId(report.id);
        setLoadError('');

        try {
            await issueExamReport(report.id);
            setNotice(`Đã phát hành phiếu khám #${report.id}.`);
            reload();
        } catch (err) {
            setNotice('');
            setLoadError(err.message || 'Không thể phát hành phiếu khám.');
        } finally {
            setIssuingId(null);
        }
    };

    const visibleReports = reports.filter((report) => {
        if (filter === 'draft') return Number(report.status) === STATUS_DRAFT;
        if (filter === 'issued') return Number(report.status) === STATUS_ISSUED;
        return true;
    });

    return (
        <section className="admin-page">
            <div className="admin-page__heading">
                <div>
                    <h1>Quản lý phiếu khám</h1>
                    <p>Xem toàn bộ phiếu khám, lập và phát hành thay bác sĩ khi cần.</p>
                </div>

                <button type="button" className="admin-btn admin-btn-primary" onClick={openCreate}>
                    <Plus size={16} />
                    Lập phiếu khám
                </button>
            </div>

            <div className="admin-toolbar">
                <label className="admin-field">
                    <span>Trạng thái</span>
                    <select value={filter} onChange={(event) => setFilter(event.target.value)}>
                        <option value="all">Tất cả</option>
                        <option value="draft">Bản nháp</option>
                        <option value="issued">Đã phát hành</option>
                    </select>
                </label>

                <button type="button" className="admin-btn" onClick={handleReload} disabled={loading}>
                    <RefreshCw size={16} />
                    Làm mới
                </button>
            </div>

            {notice && (
                <p className="admin-alert admin-alert-success" role="status">
                    {notice}
                </p>
            )}

            {loadError && (
                <p className="admin-alert admin-alert-error" role="alert">
                    {loadError}
                </p>
            )}

            <div className="admin-panel">
                {loading ? (
                    <p className="admin-empty">Đang tải...</p>
                ) : visibleReports.length === 0 ? (
                    <p className="admin-empty">Không có phiếu khám nào.</p>
                ) : (
                    <div className="admin-table-wrap">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Mã</th>
                                    <th>Lịch khám</th>
                                    <th>Bệnh nhân</th>
                                    <th>Bác sĩ</th>
                                    <th>Chẩn đoán</th>
                                    <th>Trạng thái</th>
                                    <th>Ngày phát hành</th>
                                    <th className="admin-col-actions">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {visibleReports.map((report) => {
                                    const isDraft = Number(report.status) === STATUS_DRAFT;

                                    return (
                                        <tr key={report.id}>
                                            <td>#{report.id}</td>
                                            <td>{report.appointmentId ?? '—'}</td>
                                            <td>{report.patientName || '—'}</td>
                                            <td>{report.doctorName || '—'}</td>
                                            <td className="admin-muted">{report.diagnosis || '—'}</td>
                                            <td>
                                                <span className="admin-tag">
                                                    {report.statusName || (isDraft ? 'Bản nháp' : 'Đã phát hành')}
                                                </span>
                                            </td>
                                            <td className="admin-muted">{formatDateTime(report.issuedAt)}</td>
                                            <td className="admin-col-actions">
                                                {isDraft && (
                                                    <button
                                                        type="button"
                                                        className="admin-icon-btn"
                                                        title="Phát hành"
                                                        aria-label={`Phát hành phiếu khám ${report.id}`}
                                                        onClick={() => handleIssue(report)}
                                                        disabled={issuingId === report.id}
                                                    >
                                                        <Send size={16} />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {form && (
                <div className="admin-modal-backdrop" onMouseDown={() => !saving && setForm(null)}>
                    <form
                        className="admin-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="report-modal-title"
                        onMouseDown={(event) => event.stopPropagation()}
                        onSubmit={handleSave}
                    >
                        <div className="admin-modal__header">
                            <h2 id="report-modal-title">Lập phiếu khám</h2>
                            <button
                                type="button"
                                className="admin-icon-btn"
                                aria-label="Đóng"
                                onClick={() => setForm(null)}
                                disabled={saving}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <label className="admin-field">
                            <span>Mã lịch khám</span>
                            <input
                                type="number"
                                min={1}
                                value={form.appointmentId}
                                autoFocus
                                placeholder="Lịch khám đã hoàn thành, chưa có phiếu"
                                onChange={(event) =>
                                    setForm((prev) => ({ ...prev, appointmentId: event.target.value }))
                                }
                            />
                        </label>

                        <label className="admin-field">
                            <span>Chẩn đoán</span>
                            <textarea
                                rows={3}
                                value={form.diagnosis}
                                onChange={(event) => setForm((prev) => ({ ...prev, diagnosis: event.target.value }))}
                            />
                        </label>

                        <label className="admin-field">
                            <span>Ghi chú</span>
                            <textarea
                                rows={3}
                                value={form.notes}
                                onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))}
                            />
                        </label>

                        {formError && (
                            <p className="admin-alert admin-alert-error" role="alert">
                                {formError}
                            </p>
                        )}

                        <div className="admin-modal__footer">
                            <button type="button" className="admin-btn" onClick={() => setForm(null)} disabled={saving}>
                                Hủy
                            </button>
                            <button type="submit" className="admin-btn admin-btn-primary" disabled={saving}>
                                {saving ? 'Đang lưu...' : 'Lập phiếu'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </section>
    );
}

export default AdminExamReportsPage;
