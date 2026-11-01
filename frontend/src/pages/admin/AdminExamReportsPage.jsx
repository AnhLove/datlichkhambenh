import { useEffect, useState } from 'react';
import { Plus, RefreshCw, Send, X } from 'lucide-react';

import { createExamReport, getAllExamReports, issueExamReport } from '../../services/examReportService';
import { fetchAllPages } from '../../utils/paging';
import { shortCode } from '../../utils/code';

import './AdminPage.css';

const STATUS_DRAFT = 1;
const STATUS_ISSUED = 2;
const EMPTY_FORM = { appointmentUuid: '', diagnosis: '', notes: '' };
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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
    if (!UUID_REGEX.test(form.appointmentUuid.trim())) {
        return 'Mã lịch khám phải là uuid đầy đủ (36 ký tự, ví dụ 550e8400-e29b-41d4-a716-446655440000).';
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
                const response = await fetchAllPages(getAllExamReports);
                if (cancelled) return;
                setReports(response);
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
                appointmentUuid: form.appointmentUuid.trim(),
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
            `Phát hành phiếu khám #${shortCode(report.uuid)}? Sau khi phát hành, bệnh nhân có thể xem kết quả.`
        );
        if (!confirmed) return;

        setIssuingId(report.uuid);
        setLoadError('');

        try {
            await issueExamReport(report.uuid);
            setNotice(`Đã phát hành phiếu khám #${shortCode(report.uuid)}.`);
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
                                        <tr key={report.uuid}>
                                            <td>#{shortCode(report.uuid)}</td>
                                            <td>#{shortCode(report.appointmentUuid)}</td>
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
                                                        aria-label={`Phát hành phiếu khám ${shortCode(report.uuid)}`}
                                                        onClick={() => handleIssue(report)}
                                                        disabled={issuingId === report.uuid}
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
                                type="text"
                                maxLength={36}
                                value={form.appointmentUuid}
                                autoFocus
                                placeholder="Dán uuid đầy đủ của lịch khám đã hoàn thành"
                                onChange={(event) =>
                                    setForm((prev) => ({ ...prev, appointmentUuid: event.target.value }))
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

