import { useEffect, useState } from 'react';
import { Pencil, Plus, RefreshCw, Trash2, X } from 'lucide-react';

import { getDepartments } from '../services/departmentService';
import {
    createMedicalService,
    deleteMedicalService,
    getMedicalServices,
    updateMedicalService,
} from '../services/medicalService';
import { unwrapList } from '../utils/unwrap';

import './AdminPage.css';

const EMPTY_FORM = { id: null, departmentId: '', name: '', price: '', description: '' };

const formatMoney = (value) => `${Number(value || 0).toLocaleString('vi-VN')} ₫`;

function validateForm(form) {
    const name = form.name.trim();

    if (!form.departmentId) return 'Vui lòng chọn khoa.';
    if (!name) return 'Tên dịch vụ không được để trống.';
    if (name.length > 150) return 'Tên dịch vụ không được vượt quá 150 ký tự.';
    if (!/^\d+$/.test(String(form.price).trim())) return 'Giá dịch vụ phải là số nguyên không âm.';
    if (Number(form.price) > 999999999999) return 'Giá dịch vụ vượt quá giới hạn cho phép.';
    if (form.description.length > 500) return 'Mô tả không được vượt quá 500 ký tự.';
    return '';
}

function AdminMedicalServicesPage() {
    const [services, setServices] = useState([]);
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

        async function loadData() {
            try {
                const [serviceResponse, departmentResponse] = await Promise.all([
                    getMedicalServices(),
                    getDepartments(),
                ]);
                if (cancelled) return;
                setServices(unwrapList(serviceResponse));
                setDepartments(unwrapList(departmentResponse));
                setLoadError('');
            } catch (err) {
                if (cancelled) return;
                setLoadError(err.message || 'Không thể tải danh sách dịch vụ y tế.');
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        loadData();

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

    const getDepartmentName = (service) =>
        service.departmentName || departments.find((item) => item.id === service.departmentId)?.name || '—';

    const handleRefresh = () => {
        setLoading(true);
        setNotice('');
        reload();
    };

    const openCreate = () => {
        setFormError('');
        setForm({ ...EMPTY_FORM });
    };

    const openEdit = (service) => {
        const departmentId =
            service.departmentId ?? departments.find((item) => item.name === service.departmentName)?.id ?? '';

        setFormError('');
        setForm({
            id: service.id,
            departmentId: String(departmentId),
            name: service.name || '',
            price: String(service.price ?? ''),
            description: service.description || '',
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
            departmentId: Number(form.departmentId),
            name: form.name.trim(),
            price: Number(form.price),
            description: form.description.trim(),
        };

        setSaving(true);
        setFormError('');

        try {
            if (form.id) {
                await updateMedicalService(form.id, payload);
            } else {
                await createMedicalService(payload);
            }

            setForm(null);
            setNotice(form.id ? 'Đã lưu thay đổi.' : 'Đã thêm dịch vụ y tế.');
            reload();
        } catch (err) {
            setFormError(err.message || 'Không thể lưu dịch vụ y tế.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (service) => {
        const confirmed = window.confirm(
            `Xóa dịch vụ "${service.name}"? Nếu dịch vụ đã được dùng trong lịch khám, hệ thống có thể từ chối.`
        );
        if (!confirmed) return;

        setDeletingId(service.id);
        setLoadError('');

        try {
            await deleteMedicalService(service.id);
            setNotice('Đã xóa dịch vụ y tế.');
            reload();
        } catch (err) {
            setNotice('');
            setLoadError(err.message || 'Không thể xóa dịch vụ y tế.');
        } finally {
            setDeletingId(null);
        }
    };

    const normalizedKeyword = keyword.trim().toLowerCase();
    const visibleServices = services.filter((service) =>
        (service.name || '').toLowerCase().includes(normalizedKeyword)
    );

    return (
        <section className="admin-page">
            <div className="admin-page__heading">
                <div>
                    <h1>Quản lý dịch vụ y tế</h1>
                    <p>Danh mục dịch vụ và giá dùng khi lễ tân thanh toán cho bệnh nhân.</p>
                </div>

                <button type="button" className="admin-btn admin-btn-primary" onClick={openCreate}>
                    <Plus size={16} />
                    Thêm dịch vụ
                </button>
            </div>

            <div className="admin-toolbar">
                <label className="admin-field admin-field-grow">
                    <span>Tìm kiếm</span>
                    <input
                        type="text"
                        value={keyword}
                        placeholder="Tên dịch vụ"
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
                ) : visibleServices.length === 0 ? (
                    <p className="admin-empty">Không có dịch vụ y tế nào.</p>
                ) : (
                    <div className="admin-table-wrap">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Tên dịch vụ</th>
                                    <th>Khoa</th>
                                    <th>Giá</th>
                                    <th>Mô tả</th>
                                    <th className="admin-col-actions">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {visibleServices.map((service) => (
                                    <tr key={service.id}>
                                        <td>
                                            <strong>{service.name}</strong>
                                        </td>
                                        <td>{getDepartmentName(service)}</td>
                                        <td>{formatMoney(service.price)}</td>
                                        <td className="admin-muted">{service.description || '—'}</td>
                                        <td className="admin-col-actions">
                                            <button
                                                type="button"
                                                className="admin-icon-btn"
                                                title="Sửa"
                                                aria-label={`Sửa ${service.name}`}
                                                onClick={() => openEdit(service)}
                                            >
                                                <Pencil size={16} />
                                            </button>

                                            <button
                                                type="button"
                                                className="admin-icon-btn admin-icon-btn-danger"
                                                title="Xóa"
                                                aria-label={`Xóa ${service.name}`}
                                                onClick={() => handleDelete(service)}
                                                disabled={deletingId === service.id}
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
                        aria-labelledby="service-modal-title"
                        onMouseDown={(event) => event.stopPropagation()}
                        onSubmit={handleSave}
                    >
                        <div className="admin-modal__header">
                            <h2 id="service-modal-title">{form.id ? 'Sửa dịch vụ y tế' : 'Thêm dịch vụ y tế'}</h2>
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
                            <span>Khoa</span>
                            <select
                                value={form.departmentId}
                                onChange={(event) => setForm((prev) => ({ ...prev, departmentId: event.target.value }))}
                            >
                                <option value="">Chọn khoa</option>
                                {departments.map((department) => (
                                    <option key={department.id} value={String(department.id)}>
                                        {department.name}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label className="admin-field">
                            <span>Tên dịch vụ</span>
                            <input
                                type="text"
                                value={form.name}
                                maxLength={150}
                                autoFocus
                                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                            />
                        </label>

                        <label className="admin-field">
                            <span>Giá (₫)</span>
                            <input
                                type="number"
                                min={0}
                                value={form.price}
                                onChange={(event) => setForm((prev) => ({ ...prev, price: event.target.value }))}
                            />
                        </label>

                        <label className="admin-field">
                            <span>Mô tả</span>
                            <textarea
                                rows={3}
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

export default AdminMedicalServicesPage;
