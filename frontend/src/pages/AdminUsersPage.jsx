import { useCallback, useEffect, useState } from 'react';
import { Lock, Plus, RefreshCw, Unlock, X } from 'lucide-react';

import { createStaff, getUsers, updateUserStatus } from '../services/userService';
import { unwrapList } from '../utils/unwrap';

import './AdminPage.css';

const STATUS_ACTIVE = 0;
const STATUS_LOCKED = 1;
const ROLE_ADMIN = 4;

const ROLE_LABELS = {
    1: 'Bệnh nhân',
    2: 'Bác sĩ',
    3: 'Lễ tân',
    4: 'Quản trị viên',
};

const EMPTY_FORM = { fullName: '', phone: '', email: '', password: '', dateOfBirth: '' };

function formatDate(value) {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat('vi-VN').format(date);
}

function validateForm(form) {
    if (!form.fullName.trim()) return 'Họ tên không được để trống.';
    if (!/^\d{9,15}$/.test(form.phone.trim())) return 'Số điện thoại phải gồm 9 đến 15 chữ số.';
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) return 'Email không hợp lệ.';
    if (form.password.length < 6) return 'Mật khẩu phải có ít nhất 6 ký tự.';
    return '';
}

function AdminUsersPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState('');
    const [notice, setNotice] = useState('');
    const [keyword, setKeyword] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [togglingUuid, setTogglingUuid] = useState(null);
    const [form, setForm] = useState(null);
    const [formError, setFormError] = useState('');
    const [saving, setSaving] = useState(false);

    const loadUsers = useCallback(async () => {
        try {
            const response = await getUsers();
            setUsers(unwrapList(response));
            setLoadError('');
        } catch (err) {
            setLoadError(err.message || 'Không thể tải danh sách tài khoản.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadUsers(true);
    }, [loadUsers]);

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
        loadUsers();
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
            await createStaff({
                fullName: form.fullName.trim(),
                phone: form.phone.trim(),
                email: form.email.trim(),
                password: form.password,
                dateOfBirth: form.dateOfBirth || null,
            });

            setForm(null);
            setNotice('Đã tạo tài khoản lễ tân.');
            await loadUsers();
        } catch (err) {
            setFormError(err.message || 'Không thể tạo tài khoản.');
        } finally {
            setSaving(false);
        }
    };

    const handleToggleStatus = async (user) => {
        const willLock = Number(user.status) !== STATUS_LOCKED;
        const nextStatus = willLock ? STATUS_LOCKED : STATUS_ACTIVE;

        const confirmed = window.confirm(
            willLock
                ? `Khóa tài khoản "${user.fullName}"? Người này sẽ không thể sử dụng hệ thống.`
                : `Mở khóa tài khoản "${user.fullName}"?`
        );
        if (!confirmed) return;

        setTogglingUuid(user.uuid);
        setLoadError('');

        try {
            await updateUserStatus(user.uuid, nextStatus);
            setNotice(willLock ? 'Đã khóa tài khoản.' : 'Đã mở khóa tài khoản.');
            await loadUsers();
        } catch (err) {
            setNotice('');
            setLoadError(err.message || 'Không thể đổi trạng thái tài khoản.');
        } finally {
            setTogglingUuid(null);
        }
    };

    const normalizedKeyword = keyword.trim().toLowerCase();

    const visibleUsers = users.filter((user) => {
        if (roleFilter !== 'all' && Number(user.role) !== Number(roleFilter)) return false;
        if (statusFilter !== 'all' && Number(user.status) !== Number(statusFilter)) return false;

        if (!normalizedKeyword) return true;

        return [user.fullName, user.phone, user.email].some((field) =>
            (field || '').toLowerCase().includes(normalizedKeyword)
        );
    });

    return (
        <section className="admin-page">
            <div className="admin-page__heading">
                <div>
                    <h1>Quản lý tài khoản</h1>
                    <p>Xem danh sách người dùng, khóa hoặc mở khóa tài khoản và tạo tài khoản lễ tân.</p>
                </div>

                <button type="button" className="admin-btn admin-btn-primary" onClick={openCreate}>
                    <Plus size={16} />
                    Thêm lễ tân
                </button>
            </div>

            <div className="admin-toolbar">
                <label className="admin-field admin-field-grow">
                    <span>Tìm kiếm</span>
                    <input
                        type="text"
                        value={keyword}
                        placeholder="Họ tên, số điện thoại hoặc email"
                        onChange={(event) => setKeyword(event.target.value)}
                    />
                </label>

                <label className="admin-field">
                    <span>Vai trò</span>
                    <select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)}>
                        <option value="all">Tất cả</option>
                        {Object.entries(ROLE_LABELS).map(([code, label]) => (
                            <option key={code} value={code}>
                                {label}
                            </option>
                        ))}
                    </select>
                </label>

                <label className="admin-field">
                    <span>Trạng thái</span>
                    <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                        <option value="all">Tất cả</option>
                        <option value={STATUS_ACTIVE}>Hoạt động</option>
                        <option value={STATUS_LOCKED}>Ngừng hoạt động</option>
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
                ) : visibleUsers.length === 0 ? (
                    <p className="admin-empty">Không có tài khoản phù hợp.</p>
                ) : (
                    <div className="admin-table-wrap">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Họ tên</th>
                                    <th>Số điện thoại</th>
                                    <th>Vai trò</th>
                                    <th>Trạng thái</th>
                                    <th>Ngày tạo</th>
                                    <th className="admin-col-actions">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {visibleUsers.map((user) => {
                                    const isLocked = Number(user.status) === STATUS_LOCKED;
                                    const isAdmin = Number(user.role) === ROLE_ADMIN;

                                    return (
                                        <tr key={user.uuid}>
                                            <td>
                                                <strong>{user.fullName}</strong>
                                                <code className="admin-code">{user.email || '—'}</code>
                                            </td>
                                            <td>{user.phone || '—'}</td>
                                            <td>{ROLE_LABELS[Number(user.role)] || '—'}</td>
                                            <td>
                                                <span
                                                    className={`admin-tag ${isLocked ? 'admin-tag-danger' : 'admin-tag-success'}`}
                                                >
                                                    {isLocked ? 'Ngừng hoạt động' : 'Hoạt động'}
                                                </span>
                                            </td>
                                            <td className="admin-muted">{formatDate(user.createdAt)}</td>
                                            <td className="admin-col-actions">
                                                {!isAdmin && (
                                                    <button
                                                        type="button"
                                                        className={`admin-icon-btn ${isLocked ? '' : 'admin-icon-btn-danger'}`}
                                                        title={isLocked ? 'Mở khóa' : 'Khóa tài khoản'}
                                                        aria-label={`${isLocked ? 'Mở khóa' : 'Khóa'} ${user.fullName}`}
                                                        onClick={() => handleToggleStatus(user)}
                                                        disabled={togglingUuid === user.uuid}
                                                    >
                                                        {isLocked ? <Unlock size={16} /> : <Lock size={16} />}
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
                        aria-labelledby="staff-modal-title"
                        onMouseDown={(event) => event.stopPropagation()}
                        onSubmit={handleSave}
                    >
                        <div className="admin-modal__header">
                            <h2 id="staff-modal-title">Thêm tài khoản lễ tân</h2>
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
                                autoFocus
                                onChange={(event) => setForm((prev) => ({ ...prev, fullName: event.target.value }))}
                            />
                        </label>

                        <label className="admin-field">
                            <span>Số điện thoại</span>
                            <input
                                type="tel"
                                value={form.phone}
                                maxLength={15}
                                onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
                            />
                        </label>

                        <label className="admin-field">
                            <span>Email</span>
                            <input
                                type="email"
                                value={form.email}
                                onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                            />
                        </label>

                        <label className="admin-field">
                            <span>Mật khẩu</span>
                            <input
                                type="password"
                                value={form.password}
                                autoComplete="new-password"
                                onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
                            />
                        </label>

                        <label className="admin-field">
                            <span>Ngày sinh (không bắt buộc)</span>
                            <input
                                type="date"
                                value={form.dateOfBirth}
                                onChange={(event) => setForm((prev) => ({ ...prev, dateOfBirth: event.target.value }))}
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
                                {saving ? 'Đang lưu...' : 'Tạo tài khoản'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </section>
    );
}

export default AdminUsersPage;
