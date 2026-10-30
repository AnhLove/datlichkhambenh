import { useEffect, useState } from 'react';
import { Pencil, Plus, Trash2, X } from 'lucide-react';

import {
    createSystemConfig,
    deleteSystemConfig,
    getSystemConfigs,
    updateSystemConfig,
} from '../../services/systemConfigService';
import { unwrapList } from '../../utils/unwrap';

import './AdminPage.css';

const KNOWN_KEYS = {
    CANCEL_MIN_HOURS_BEFORE: {
        label: 'Hủy lịch trước giờ khám tối thiểu',
        unit: 'giờ',
        type: 'number',
        min: 0,
        max: 720,
        defaultValue: '24',
    },
    MAX_APPOINTMENTS_PER_PATIENT_PER_DAY: {
        label: 'Số lịch tối đa của một bệnh nhân mỗi ngày',
        unit: 'lịch',
        type: 'number',
        min: 1,
        max: 50,
        defaultValue: '3',
    },
    WORKING_HOURS_DESCRIPTION: {
        label: 'Giờ làm việc hiển thị cho bệnh nhân',
        type: 'text',
        defaultValue: '',
    },
};

const KEY_PATTERN = /^[A-Z][A-Z0-9_]*$/;
const EMPTY_FORM = { mode: 'create', lockKey: false, configKey: '', configValue: '', description: '' };

function buildRows(configs) {
    const byKey = new Map(configs.map((item) => [item.configKey, item]));

    const knownRows = Object.entries(KNOWN_KEYS).map(([key, meta]) => {
        const existing = byKey.get(key);
        return {
            configKey: key,
            configValue: existing ? existing.configValue : meta.defaultValue,
            description: existing ? existing.description : '',
            isDefault: !existing,
            known: true,
        };
    });

    const otherRows = configs
        .filter((item) => !KNOWN_KEYS[item.configKey])
        .map((item) => ({ ...item, isDefault: false, known: false }));

    return [...knownRows, ...otherRows];
}

function validateForm(form) {
    const key = form.configKey.trim();
    const value = form.configValue.trim();
    const description = form.description.trim();

    if (form.mode === 'create') {
        if (!key) return 'Khóa cấu hình không được để trống.';
        if (key.length > 100) return 'Khóa cấu hình không được vượt quá 100 ký tự.';
        if (!KEY_PATTERN.test(key)) return 'Khóa cấu hình chỉ gồm chữ HOA, số và dấu gạch dưới, bắt đầu bằng chữ.';
    }

    if (!value) return 'Giá trị cấu hình không được để trống.';
    if (value.length > 255) return 'Giá trị cấu hình không được vượt quá 255 ký tự.';
    if (description.length > 255) return 'Mô tả không được vượt quá 255 ký tự.';

    const meta = KNOWN_KEYS[key];
    if (meta?.type === 'number') {
        if (!/^\d+$/.test(value)) return `${meta.label} phải là số nguyên.`;
        const number = Number(value);
        if (number < meta.min || number > meta.max) return `${meta.label} phải từ ${meta.min} đến ${meta.max}.`;
    }

    return '';
}

function AdminSystemConfigPage() {
    const [configs, setConfigs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState('');
    const [notice, setNotice] = useState('');
    const [form, setForm] = useState(null);
    const [formError, setFormError] = useState('');
    const [saving, setSaving] = useState(false);

    const [reloadKey, setReloadKey] = useState(0);

    const reload = () => setReloadKey((key) => key + 1);

    useEffect(() => {
        let cancelled = false;

        async function loadConfigs() {
            try {
                const response = await getSystemConfigs();
                if (cancelled) return;
                setConfigs(unwrapList(response));
                setLoadError('');
            } catch (err) {
                if (cancelled) return;
                setLoadError(err.message || 'Không thể tải danh sách cấu hình.');
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        loadConfigs();

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

    const openCreate = () => {
        setFormError('');
        setForm({ ...EMPTY_FORM });
    };

    const openEdit = (row) => {
        setFormError('');
        setForm({
            mode: row.isDefault ? 'create' : 'edit',
            lockKey: true,
            configKey: row.configKey,
            configValue: row.configValue ?? '',
            description: row.description || KNOWN_KEYS[row.configKey]?.label || '',
        });
    };

    const handleSave = async (event) => {
        event.preventDefault();

        const message = validateForm(form);
        if (message) {
            setFormError(message);
            return;
        }

        const payload = {
            configKey: form.configKey.trim(),
            configValue: form.configValue.trim(),
            description: form.description.trim(),
        };

        setSaving(true);
        setFormError('');

        try {
            if (form.mode === 'create') {
                await createSystemConfig(payload);
            } else {
                await updateSystemConfig(payload.configKey, payload);
            }

            setForm(null);
            setNotice(form.mode === 'create' ? 'Đã tạo cấu hình.' : 'Đã lưu thay đổi.');
            reload();
        } catch (err) {
            setFormError(err.message || 'Không thể lưu cấu hình.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (row) => {
        const warning = row.known
            ? `Xóa cấu hình "${row.configKey}"? Hệ thống sẽ dùng giá trị mặc định (${KNOWN_KEYS[row.configKey].defaultValue || 'không có'}).`
            : `Xóa cấu hình "${row.configKey}"?`;

        if (!window.confirm(warning)) return;

        try {
            await deleteSystemConfig(row.configKey);
            setNotice('Đã xóa cấu hình.');
            reload();
        } catch (err) {
            setNotice('');
            setLoadError(err.message || 'Không thể xóa cấu hình.');
        }
    };

    const rows = buildRows(configs);
    const formMeta = form ? KNOWN_KEYS[form.configKey.trim()] : null;

    return (
        <section className="admin-page">
            <div className="admin-page__heading">
                <div>
                    <h1>Cấu hình hệ thống</h1>
                    <p>Quy định hủy lịch, giới hạn đặt lịch và thông tin giờ làm việc.</p>
                </div>

                <button type="button" className="admin-btn admin-btn-primary" onClick={openCreate}>
                    <Plus size={16} />
                    Thêm cấu hình
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
                ) : (
                    <div className="admin-table-wrap">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Cấu hình</th>
                                    <th>Giá trị</th>
                                    <th>Mô tả</th>
                                    <th className="admin-col-actions">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((row) => {
                                    const meta = KNOWN_KEYS[row.configKey];

                                    return (
                                        <tr key={row.configKey}>
                                            <td>
                                                <strong>{meta?.label || row.configKey}</strong>
                                                {meta && <code className="admin-code">{row.configKey}</code>}
                                            </td>
                                            <td>
                                                <span className="admin-value">
                                                    {row.configValue || '—'}
                                                    {meta?.unit ? ` ${meta.unit}` : ''}
                                                </span>
                                                {row.isDefault && <span className="admin-tag">Mặc định</span>}
                                            </td>
                                            <td className="admin-muted">{row.description || '—'}</td>
                                            <td className="admin-col-actions">
                                                <button
                                                    type="button"
                                                    className="admin-icon-btn"
                                                    title={row.isDefault ? 'Thiết lập' : 'Sửa'}
                                                    aria-label={`${row.isDefault ? 'Thiết lập' : 'Sửa'} ${row.configKey}`}
                                                    onClick={() => openEdit(row)}
                                                >
                                                    <Pencil size={16} />
                                                </button>

                                                {!row.isDefault && (
                                                    <button
                                                        type="button"
                                                        className="admin-icon-btn admin-icon-btn-danger"
                                                        title="Xóa"
                                                        aria-label={`Xóa ${row.configKey}`}
                                                        onClick={() => handleDelete(row)}
                                                    >
                                                        <Trash2 size={16} />
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
                        aria-labelledby="config-modal-title"
                        onMouseDown={(event) => event.stopPropagation()}
                        onSubmit={handleSave}
                    >
                        <div className="admin-modal__header">
                            <h2 id="config-modal-title">
                                {form.mode === 'edit'
                                    ? 'Sửa cấu hình'
                                    : form.lockKey
                                      ? 'Thiết lập cấu hình'
                                      : 'Thêm cấu hình'}
                            </h2>
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
                            <span>Khóa cấu hình</span>
                            <input
                                type="text"
                                value={form.configKey}
                                maxLength={100}
                                disabled={form.lockKey}
                                placeholder="VD: CANCEL_MIN_HOURS_BEFORE"
                                onChange={(event) =>
                                    setForm((prev) => ({ ...prev, configKey: event.target.value.toUpperCase() }))
                                }
                            />
                        </label>

                        <label className="admin-field">
                            <span>Giá trị{formMeta?.unit ? ` (${formMeta.unit})` : ''}</span>
                            <input
                                type={formMeta?.type === 'number' ? 'number' : 'text'}
                                value={form.configValue}
                                min={formMeta?.min}
                                max={formMeta?.max}
                                maxLength={255}
                                autoFocus
                                onChange={(event) => setForm((prev) => ({ ...prev, configValue: event.target.value }))}
                            />
                            {formMeta?.type === 'number' && (
                                <small>
                                    Từ {formMeta.min} đến {formMeta.max}.
                                </small>
                            )}
                        </label>

                        <label className="admin-field">
                            <span>Mô tả</span>
                            <textarea
                                rows={3}
                                value={form.description}
                                maxLength={255}
                                onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
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
                                {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </section>
    );
}

export default AdminSystemConfigPage;
