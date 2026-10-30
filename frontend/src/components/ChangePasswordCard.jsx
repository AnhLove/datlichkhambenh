import { useState } from 'react';
import { AlertCircle, CheckCircle2, Lock, LoaderCircle, Save } from 'lucide-react';

import { changePassword } from '../services/profileService';

import '../pages/ProfilePage.css';

const EMPTY_FORM = { currentPassword: '', newPassword: '', confirmPassword: '' };

function validateForm(form) {
    if (!form.currentPassword) return 'Vui lòng nhập mật khẩu hiện tại.';
    if (form.newPassword.length < 8 || form.newPassword.length > 72) {
        return 'Mật khẩu mới phải từ 8 đến 72 ký tự.';
    }
    if (form.newPassword === form.currentPassword) return 'Mật khẩu mới phải khác mật khẩu hiện tại.';
    if (form.confirmPassword !== form.newPassword) return 'Xác nhận mật khẩu mới không khớp.';
    return '';
}

function ChangePasswordCard() {
    const [form, setForm] = useState(EMPTY_FORM);
    const [showPassword, setShowPassword] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    function handleChange(event) {
        const { name, value } = event.target;

        setForm((previous) => ({ ...previous, [name]: value }));
        setError('');
        setSuccess('');
    }

    async function handleSubmit(event) {
        event.preventDefault();

        if (saving) return;

        const message = validateForm(form);
        if (message) {
            setError(message);
            return;
        }

        setSaving(true);
        setError('');
        setSuccess('');

        try {
            await changePassword({
                currentPassword: form.currentPassword,
                newPassword: form.newPassword,
            });

            setForm(EMPTY_FORM);
            setSuccess('Đổi mật khẩu thành công.');
        } catch (err) {
            setError(err?.message || 'Không thể đổi mật khẩu. Vui lòng thử lại.');
        } finally {
            setSaving(false);
        }
    }

    const inputType = showPassword ? 'text' : 'password';

    return (
        <div className="profile-card" style={{ marginTop: 24 }}>
            <div className="profile-card-heading">
                <div>
                    <h2>Đổi mật khẩu</h2>
                    <p>Nhập mật khẩu hiện tại để đặt mật khẩu mới.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} noValidate>
                {error && (
                    <div className="profile-alert profile-alert-error" role="alert">
                        <AlertCircle size={19} />
                        <span>{error}</span>
                    </div>
                )}

                {success && (
                    <div className="profile-alert profile-alert-success" role="status">
                        <CheckCircle2 size={19} />
                        <span>{success}</span>
                    </div>
                )}

                <div className="profile-form-grid">
                    <div className="profile-field">
                        <label htmlFor="password-current">
                            Mật khẩu hiện tại
                            <span className="profile-required">*</span>
                        </label>

                        <div className="profile-input-wrap">
                            <Lock size={18} />
                            <input
                                id="password-current"
                                name="currentPassword"
                                type={inputType}
                                autoComplete="current-password"
                                value={form.currentPassword}
                                onChange={handleChange}
                                disabled={saving}
                            />
                        </div>
                    </div>

                    <div className="profile-field">
                        <label htmlFor="password-new">
                            Mật khẩu mới
                            <span className="profile-required">*</span>
                        </label>

                        <div className="profile-input-wrap">
                            <Lock size={18} />
                            <input
                                id="password-new"
                                name="newPassword"
                                type={inputType}
                                autoComplete="new-password"
                                maxLength={72}
                                value={form.newPassword}
                                onChange={handleChange}
                                disabled={saving}
                            />
                        </div>

                        <small className="profile-field-note">Từ 8 đến 72 ký tự.</small>
                    </div>

                    <div className="profile-field">
                        <label htmlFor="password-confirm">
                            Nhập lại mật khẩu mới
                            <span className="profile-required">*</span>
                        </label>

                        <div className="profile-input-wrap">
                            <Lock size={18} />
                            <input
                                id="password-confirm"
                                name="confirmPassword"
                                type={inputType}
                                autoComplete="new-password"
                                maxLength={72}
                                value={form.confirmPassword}
                                onChange={handleChange}
                                disabled={saving}
                            />
                        </div>
                    </div>
                </div>

                <div className="profile-form-footer">
                    <label className="profile-hint" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                        <input
                            type="checkbox"
                            checked={showPassword}
                            onChange={(event) => setShowPassword(event.target.checked)}
                        />
                        Hiển thị mật khẩu
                    </label>

                    <button type="submit" className="profile-button" disabled={saving}>
                        {saving ? <LoaderCircle size={18} className="profile-spinner" /> : <Save size={18} />}
                        {saving ? 'Đang lưu...' : 'Đổi mật khẩu'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default ChangePasswordCard;
