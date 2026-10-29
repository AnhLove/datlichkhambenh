import { useEffect, useState } from 'react';
import { Pencil, Plus, RefreshCw, Trash2, X } from 'lucide-react';

import { getDepartments } from '../services/departmentService';
import { createDoctor, deleteDoctor, searchDoctors, updateDoctor } from '../services/doctorService';
import { getUserByUuid } from '../services/userService';
import { unwrapData, unwrapList } from '../utils/unwrap';

import './AdminPage.css';

const PHONE_PATTERN = /^(0|\+84)\d{9}$/;
const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;

const EMPTY_FORM = {
    mode: 'create',
    uuid: '',
    fullName: '',
    phone: '',
    email: '',
    password: '',
    departmentId: '',
    yearsExperience: '',
    bio: '',
    loadingUser: false,
};

function validateForm(form) {
    if (!form.fullName.trim()) return 'Họ tên không được để trống.';
    if (form.fullName.trim().length > 150) return 'Họ tên không được vượt quá 150 ký tự.';
    if (!PHONE_PATTERN.test(form.phone.trim())) return 'Số điện thoại không đúng định dạng (VD: 0912345678).';
    if (!EMAIL_PATTERN.test(form.email.trim())) return 'Email không đúng định dạng.';

    if (form.mode === 'create' && (form.password.length < 8 || form.password.length > 72)) {
        return 'Mật khẩu phải từ 8 đến 72 ký tự.';
    }

    if (!form.departmentId) return 'Vui lòng chọn khoa.';

    if (String(form.yearsExperience).trim() !== '') {
        if (!/^\d+$/.test(String(form.yearsExperience).trim()) || Number(form.yearsExperience) > 100) {
            return 'Số năm kinh nghiệm phải là số nguyên từ 0 đến 100.';
        }
    }

    if (form.bio.length > 1000) return 'Giới thiệu không được vượt quá 1000 ký tự.';
    return '';
}

function AdminDoctorsPage() {
    const [doctors, setDoctors] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState('');
    const [notice, setNotice] = useState('');
    const [keyword, setKeyword] = useState('');
    const [departmentFilter, setDepartmentFilter] = useState('all');
    const [deletingUuid, setDeletingUuid] = useState(null);
    const [form, setForm] = useState(null);
    const [formError, setFormError] = useState('');
    const [saving, setSaving] = useState(false);
    const [reloadKey, setReloadKey] = useState(0);

    const reload = () => setReloadKey((key) => key + 1);

    useEffect(() => {
        let cancelled = false;

        async function loadData() {
            try {
                const [doctorResponse, departmentResponse] = await Promise.all([
                    searchDoctors('', ''),
                    getDepartments(),
                ]);
                if (cancelled) return;
                setDoctors(unwrapList(doctorResponse));
                setDepartments(unwrapList(departmentResponse));
                setLoadError('');
            } catch (err) {
                if (cancelled) return;
                setLoadError(err.message || 'Không thể tải danh sách bác sĩ.');
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

    const setField = (name) => (event) => {
        const { value } = event.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleRefresh = () => {
        setLoading(true);
        setNotice('');
        reload();
    };

    const openCreate = () => {
        setFormError('');
        setForm({ ...EMPTY_FORM });
    };

    const openEdit = async (doctor) => {
        const departmentId = departments.find((item) => item.name === doctor.departmentName)?.id ?? '';

        setFormError('');
        setForm({
            ...EMPTY_FORM,
            mode: 'edit',
            uuid: doctor.uuid,
            fullName: doctor.fullName || '',
            departmentId: String(departmentId),
            yearsExperience: doctor.yearsExperience == null ? '' : String(doctor.yearsExperience),
            bio: doctor.bio || '',
            loadingUser: true,
        });

        try {
            const user = unwrapData(await getUserByUuid(doctor.uuid));
            setForm((prev) =>
                prev && prev.uuid === doctor.uuid
                    ? { ...prev, phone: user?.phone ?? '', email: user?.email ?? '', loadingUser: false }
                    : prev
            );
        } catch (err) {
            setForm((prev) => (prev && prev.uuid === doctor.uuid ? { ...prev, loadingUser: false } : prev));
            setFormError(err.message || 'Không thể tải thông tin liên hệ của bác sĩ.');
        }
    };

    const handleSave = async (event) => {
        event.preventDefault();

        const message = validateForm(form);
        if (message) {
            setFormError(message);
            return;
        }

        const payload = {
            fullName: form.fullName.trim(),
            phone: form.phone.trim(),
            email: form.email.trim(),
            departmentId: Number(form.departmentId),
            yearsExperience: String(form.yearsExperience).trim() === '' ? null : Number(form.yearsExperience),
            bio: form.bio.trim(),
        };

        setSaving(true);
        setFormError('');

        try {
            if (form.mode === 'create') {
                await createDoctor({ ...payload, password: form.password });
            } else {
                await updateDoctor({ ...payload, uuid: form.uuid });
            }

            setForm(null);
            setNotice(form.mode === 'create' ? 'Đã thêm bác sĩ.' : 'Đã lưu thay đổi.');
            reload();
        } catch (err) {
            setFormError(err.message || 'Không thể lưu thông tin bác sĩ.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (doctor) => {
        const confirmed = window.confirm(
            `Xóa bác sĩ "${doctor.fullName}"? Nếu bác sĩ đã có lịch hẹn, nên khóa tài khoản ở trang Tài khoản thay vì xóa.`
        );
        if (!confirmed) return;

        setDeletingUuid(doctor.uuid);
        setLoadError('');

        try {
            await deleteDoctor(doctor.uuid);
            setNotice('Đã xóa bác sĩ.');
            reload();
        } catch (err) {
            setNotice('');
            setLoadError(err.message || 'Không thể xóa bác sĩ.');
        } finally {
            setDeletingUuid(null);
        }
    };

    const normalizedKeyword = keyword.trim().toLowerCase();
    const visibleDoctors = doctors.filter((doctor) => {
        if (departmentFilter !== 'all' && doctor.departmentName !== departmentFilter) return false;
        return (doctor.fullName || '').toLowerCase().includes(normalizedKeyword);
    });

    return (
        <section className="admin-page">
            <div className="admin-page__heading">
                <div>
                    <h1>Quản lý bác sĩ</h1>
                    <p>Tạo tài khoản bác sĩ và cập nhật chuyên khoa, kinh nghiệm, giới thiệu.</p>
                </div>

                <button type="button" className="admin-btn admin-btn-primary" onClick={openCreate}>
                    <Plus size={16} />
                    Thêm bác sĩ
                </button>
            </div>

            <div className="admin-toolbar">
                <label className="admin-field admin-field-grow">
                    <span>Tìm kiếm</span>
                    <input
                        type="text"
                        value={keyword}
                        placeholder="Họ tên bác sĩ"
                        onChange={(event) => setKeyword(event.target.value)}
                    />
                </label>

                <label className="admin-field">
                    <span>Chuyên khoa</span>
                    <select value={departmentFilter} onChange={(event) => setDepartmentFilter(event.target.value)}>
                        <option value="all">Tất cả</option>
                        {departments.map((department) => (
                            <option key={department.id} value={department.name}>
                                {department.name}
                            </option>
                        ))}
                    </select>
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
                ) : visibleDoctors.length === 0 ? (
                    <p className="admin-empty">Không có bác sĩ nào.</p>
                ) : (
                    <div className="admin-table-wrap">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Bác sĩ</th>
                                    <th>Chuyên khoa</th>
                                    <th>Kinh nghiệm</th>
                                    <th className="admin-col-actions">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {visibleDoctors.map((doctor) => (
                                    <tr key={doctor.uuid}>
                                        <td>
                                            <strong>{doctor.fullName}</strong>
                                        </td>
                                        <td>{doctor.departmentName || '—'}</td>
                                        <td>
                                            {doctor.yearsExperience == null ? '—' : `${doctor.yearsExperience} năm`}
                                        </td>
                                        <td className="admin-col-actions">
                                            <button
                                                type="button"
                                                className="admin-icon-btn"
                                                title="Sửa"
                                                aria-label={`Sửa ${doctor.fullName}`}
                                                onClick={() => openEdit(doctor)}
                                            >
                                                <Pencil size={16} />
                                            </button>

                                            <button
                                                type="button"
                                                className="admin-icon-btn admin-icon-btn-danger"
                                                title="Xóa"
                                                aria-label={`Xóa ${doctor.fullName}`}
                                                onClick={() => handleDelete(doctor)}
                                                disabled={deletingUuid === doctor.uuid}
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
                        aria-labelledby="doctor-modal-title"
                        onMouseDown={(event) => event.stopPropagation()}
                        onSubmit={handleSave}
                    >
                        <div className="admin-modal__header">
                            <h2 id="doctor-modal-title">{form.mode === 'edit' ? 'Sửa bác sĩ' : 'Thêm bác sĩ'}</h2>
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
                            <span>Họ tên</span>
                            <input
                                type="text"
                                value={form.fullName}
                                maxLength={150}
                                autoFocus
                                onChange={setField('fullName')}
                            />
                        </label>

                        <label className="admin-field">
                            <span>Số điện thoại</span>
                            <input
                                type="tel"
                                value={form.phone}
                                maxLength={12}
                                disabled={form.loadingUser}
                                onChange={setField('phone')}
                            />
                        </label>

                        <label className="admin-field">
                            <span>Email</span>
                            <input
                                type="email"
                                value={form.email}
                                maxLength={150}
                                disabled={form.loadingUser}
                                onChange={setField('email')}
                            />
                        </label>

                        {form.mode === 'create' && (
                            <label className="admin-field">
                                <span>Mật khẩu</span>
                                <input
                                    type="password"
                                    value={form.password}
                                    maxLength={72}
                                    autoComplete="new-password"
                                    onChange={setField('password')}
                                />
                                <small>Từ 8 đến 72 ký tự.</small>
                            </label>
                        )}

                        <label className="admin-field">
                            <span>Chuyên khoa</span>
                            <select value={form.departmentId} onChange={setField('departmentId')}>
                                <option value="">Chọn khoa</option>
                                {departments.map((department) => (
                                    <option key={department.id} value={String(department.id)}>
                                        {department.name}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label className="admin-field">
                            <span>Số năm kinh nghiệm (không bắt buộc)</span>
                            <input
                                type="number"
                                min={0}
                                max={100}
                                value={form.yearsExperience}
                                onChange={setField('yearsExperience')}
                            />
                        </label>

                        <label className="admin-field">
                            <span>Giới thiệu (không bắt buộc)</span>
                            <textarea rows={3} value={form.bio} maxLength={1000} onChange={setField('bio')} />
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
                            <button
                                type="submit"
                                className="admin-btn admin-btn-primary"
                                disabled={saving || form.loadingUser}
                            >
                                {saving ? 'Đang lưu...' : 'Lưu'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </section>
    );
}

export default AdminDoctorsPage;
