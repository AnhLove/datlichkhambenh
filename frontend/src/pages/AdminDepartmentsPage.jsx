import { useEffect, useState } from 'react';
import { Pencil, Plus, RefreshCw, Trash2, X } from 'lucide-react';

import { createDepartment, deleteDepartment, getDepartments, updateDepartment } from '../services/departmentService';
import { unwrapList } from '../utils/unwrap';

import './AdminPage.css';

const EMPTY_FORM = { id: null, name: '', description: '' };

function validateForm(form) {
    const name = form.name.trim();

    if (!name) return 'Tên khoa không được để trống.';
    if (name.length > 100) return 'Tên khoa không được vượt quá 100 ký tự.';
    if (form.description.length > 500) return 'Mô tả không được vượt quá 500 ký tự.';
    return '';
}

function AdminDepartmentsPage() {
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState('');
    const [notice, setNotice] = useState('');
    const [keyword, setKeyword] = useState('');
    const [deletingId, setDeletingId] = useState(null);
    const [form, setForm] = useState(null);
    const [formError, setFormError] = useState('');
    const [saving, setSaving] = useState(false);
    const [reloadKey, setReloadKey] = useState(0);

    const reload = () => setReloadKey((key) => key + 1);

    useEffect(() => {
        let cancelled = false;

        async function loadDepartments() {
            try {
                const response = await getDepartments();
                if (cancelled) return;
                setDepartments(unwrapList(response));
                setLoadError('');
            } catch (err) {
                if (cancelled) return;
                setLoadError(err.message || 'Không thể tải danh sách chuyên khoa.');
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        loadDepartments();

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

    const handleRefresh = () => {
        setLoading(true);
        setNotice('');
        reload();
    };

    const openCreate = () => {
        setFormError('');
        setForm({ ...EMPTY_FORM });
    };

    const openEdit = (department) => {
        setFormError('');
        setForm({
            id: department.id,
            name: department.name || '',
            description: department.description || '',
        });
    };

    const handleSave = async (event) => {
        event.preventDefault();

        const message = validateForm(form);
        if (message) {
            setFormError(message);
            return;
        }

        const payload = { name: form.name.trim(), description: form.description.trim() };

        setSaving(true);
        setFormError('');

        try {
            if (form.id) {
                await updateDepartment({ id: form.id, ...payload });
            } else {
                await createDepartment(payload);
            }

            setForm(null);
            setNotice(form.id ? 'Đã lưu thay đổi.' : 'Đã thêm chuyên khoa.');
            reload();
        } catch (err) {
            setFormError(err.message || 'Không thể lưu chuyên khoa.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (department) => {
        const confirmed = window.confirm(
            `Xóa chuyên khoa "${department.name}"? Nếu khoa đang có bác sĩ hoặc dịch vụ, hệ thống có thể từ chối.`
        );
        if (!confirmed) return;

        setDeletingId(department.id);
        setLoadError('');

        try {
            await deleteDepartment(department.id);
            setNotice('Đã xóa chuyên khoa.');
            reload();
        } catch (err) {
            setNotice('');
            setLoadError(err.message || 'Không thể xóa chuyên khoa.');
        } finally {
            setDeletingId(null);
        }
    };

    const normalizedKeyword = keyword.trim().toLowerCase();
    const visibleDepartments = departments.filter((department) =>
        (department.name || '').toLowerCase().includes(normalizedKeyword)
    );

    return (
        <section className="admin-page">
            <div className="admin-page__heading">
                <div>
                    <h1>Quản lý chuyên khoa</h1>
                    <p>Thêm, sửa hoặc xóa các chuyên khoa của bệnh viện.</p>
                </div>

                <button type="button" className="admin-btn admin-btn-primary" onClick={openCreate}>
                    <Plus size={16} />
                    Thêm chuyên khoa
                </button>
            </div>

            <div className="admin-toolbar">
                <label className="admin-field admin-field-grow">
                    <span>Tìm kiếm</span>
                    <input
                        type="text"
                        value={keyword}
                        placeholder="Tên chuyên khoa"
                        onChange={(event) => setKeyword(event.target.value)}
                    />
                </label>

                <button type="button" className="admin-btn" onClick={handleRefresh} disabled={loading}>
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
                ) : visibleDepartments.length === 0 ? (
                    <p className="admin-empty">Không có chuyên khoa nào.</p>
                ) : (
                    <div className="admin-table-wrap">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Tên chuyên khoa</th>
                                    <th>Mô tả</th>
                                    <th className="admin-col-actions">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {visibleDepartments.map((department) => (
                                    <tr key={department.id}>
                                        <td>
                                            <strong>{department.name}</strong>
                                        </td>
                                        <td className="admin-muted">{department.description || '—'}</td>
                                        <td className="admin-col-actions">
                                            <button
                                                type="button"
                                                className="admin-icon-btn"
                                                title="Sửa"
                                                aria-label={`Sửa ${department.name}`}
                                                onClick={() => openEdit(department)}
                                            >
                                                <Pencil size={16} />
                                            </button>

                                            <button
                                                type="button"
                                                className="admin-icon-btn admin-icon-btn-danger"
                                                title="Xóa"
                                                aria-label={`Xóa ${department.name}`}
                                                onClick={() => handleDelete(department)}
                                                disabled={deletingId === department.id}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
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
                        aria-labelledby="department-modal-title"
                        onMouseDown={(event) => event.stopPropagation()}
                        onSubmit={handleSave}
                    >
                        <div className="admin-modal__header">
                            <h2 id="department-modal-title">{form.id ? 'Sửa chuyên khoa' : 'Thêm chuyên khoa'}</h2>
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
                            <span>Tên chuyên khoa</span>
                            <input
                                type="text"
                                value={form.name}
                                maxLength={100}
                                autoFocus
                                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                            />
                        </label>

                        <label className="admin-field">
                            <span>Mô tả</span>
                            <textarea
                                rows={4}
                                value={form.description}
                                maxLength={500}
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
                                {saving ? 'Đang lưu...' : 'Lưu'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </section>
    );
}

export default AdminDepartmentsPage;
