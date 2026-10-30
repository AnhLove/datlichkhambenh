import { useCallback, useEffect, useState } from 'react';
import {
    UserRound,
    Mail,
    Phone,
    CalendarDays,
    Save,
    RefreshCw,
    AlertCircle,
    CheckCircle2,
    LoaderCircle,
} from 'lucide-react';

import { getMyProfile, updateMyProfile } from '../services/profileService';
import ChangePasswordCard from '../components/ChangePasswordCard';

import './ProfilePage.css';

const EMPTY_FORM = {
    fullName: '',
    phone: '',
    email: '',
    dateOfBirth: '',
};

function toFormData(profile) {
    return {
        fullName: profile?.fullName ?? '',
        phone: profile?.phone ?? '',
        email: profile?.email ?? '',
        dateOfBirth: profile?.dateOfBirth ? String(profile.dateOfBirth).slice(0, 10) : '',
    };
}

function getErrorMessage(error) {
    return error?.message || 'Đã xảy ra lỗi. Vui lòng thử lại.';
}

function ProfilePage() {
    const [form, setForm] = useState(EMPTY_FORM);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [pageError, setPageError] = useState('');
    const [formError, setFormError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const loadProfile = useCallback(async () => {
        setLoading(true);
        setPageError('');
        setFormError('');
        setSuccessMessage('');

        try {
            const profile = await getMyProfile();
            setForm(toFormData(profile));
        } catch (error) {
            setPageError(getErrorMessage(error));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        let cancelled = false;

        async function fetchProfile() {
            try {
                const profile = await getMyProfile();

                if (!cancelled) {
                    setForm(toFormData(profile));
                }
            } catch (error) {
                if (!cancelled) {
                    setPageError(getErrorMessage(error));
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        fetchProfile();

        return () => {
            cancelled = true;
        };
    }, []);

    function handleChange(event) {
        const { name, value } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));

        setFormError('');
        setSuccessMessage('');
    }

    async function handleSubmit(event) {
        event.preventDefault();

        setFormError('');
        setSuccessMessage('');

        const fullName = form.fullName.trim();
        const phone = form.phone.trim();

        if (!fullName) {
            setFormError('Vui lòng nhập họ và tên.');
            return;
        }

        if (fullName.length > 150) {
            setFormError('Họ và tên không được vượt quá 150 ký tự.');
            return;
        }

        if (!phone) {
            setFormError('Vui lòng nhập số điện thoại.');
            return;
        }

        if (!/^(0|\+84)\d{9}$/.test(phone)) {
            setFormError('Số điện thoại không đúng định dạng. Ví dụ: 0912345678.');
            return;
        }

        if (form.dateOfBirth) {
            const today = new Date();
            const selectedDate = new Date(`${form.dateOfBirth}T00:00:00`);

            const todayString = [
                today.getFullYear(),
                String(today.getMonth() + 1).padStart(2, '0'),
                String(today.getDate()).padStart(2, '0'),
            ].join('-');

            if (Number.isNaN(selectedDate.getTime()) || form.dateOfBirth >= todayString) {
                setFormError('Ngày sinh phải nằm trong quá khứ.');
                return;
            }
        }

        setSaving(true);

        try {
            const updatedProfile = await updateMyProfile({
                fullName,
                phone,
                dateOfBirth: form.dateOfBirth || null,
            });

            setForm(toFormData(updatedProfile));
            setSuccessMessage('Cập nhật hồ sơ thành công.');
        } catch (error) {
            setFormError(getErrorMessage(error));
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <section className="profile-page">
                <div className="profile-state">
                    <LoaderCircle className="profile-spinner" size={32} />
                    <p>Đang tải thông tin hồ sơ...</p>
                </div>
            </section>
        );
    }

    if (pageError) {
        return (
            <section className="profile-page">
                <div className="profile-state profile-state-error">
                    <AlertCircle size={36} />
                    <h2>Không thể tải hồ sơ</h2>
                    <p>{pageError}</p>
                    <button type="button" className="profile-button" onClick={loadProfile}>
                        <RefreshCw size={17} />
                        Thử lại
                    </button>
                </div>
            </section>
        );
    }

    return (
        <section className="profile-page">
            <div className="profile-container">
                <header className="profile-heading">
                    <div className="profile-heading-icon">
                        <UserRound size={28} />
                    </div>

                    <div>
                        <p className="profile-eyebrow">TÀI KHOẢN CỦA BẠN</p>
                        <h1>Hồ sơ cá nhân</h1>
                        <p className="profile-subtitle">
                            Quản lý thông tin cá nhân của bạn tại Bệnh viện Nam Lương Sơn.
                        </p>
                    </div>
                </header>

                <div className="profile-card">
                    <div className="profile-card-heading">
                        <div>
                            <h2>Thông tin cá nhân</h2>
                            <p>Vui lòng đảm bảo thông tin của bạn luôn chính xác.</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} noValidate>
                        {formError && (
                            <div className="profile-alert profile-alert-error" role="alert">
                                <AlertCircle size={19} />
                                <span>{formError}</span>
                            </div>
                        )}

                        {successMessage && (
                            <div className="profile-alert profile-alert-success" role="status">
                                <CheckCircle2 size={19} />
                                <span>{successMessage}</span>
                            </div>
                        )}

                        <div className="profile-form-grid">
                            <div className="profile-field">
                                <label htmlFor="profile-fullName">
                                    Họ và tên
                                    <span className="profile-required">*</span>
                                </label>

                                <div className="profile-input-wrap">
                                    <UserRound size={18} />
                                    <input
                                        id="profile-fullName"
                                        name="fullName"
                                        type="text"
                                        autoComplete="name"
                                        maxLength={150}
                                        value={form.fullName}
                                        onChange={handleChange}
                                        placeholder="Nhập họ và tên"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="profile-field">
                                <label htmlFor="profile-phone">
                                    Số điện thoại
                                    <span className="profile-required">*</span>
                                </label>

                                <div className="profile-input-wrap">
                                    <Phone size={18} />
                                    <input
                                        id="profile-phone"
                                        name="phone"
                                        type="tel"
                                        autoComplete="tel"
                                        value={form.phone}
                                        onChange={handleChange}
                                        placeholder="Ví dụ: 0912345678"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="profile-field">
                                <label htmlFor="profile-email">Email</label>

                                <div className="profile-input-wrap profile-input-readonly">
                                    <Mail size={18} />
                                    <input
                                        id="profile-email"
                                        name="email"
                                        type="email"
                                        value={form.email}
                                        readOnly
                                        aria-describedby="profile-email-note"
                                    />
                                </div>

                                <small id="profile-email-note" className="profile-field-note">
                                    Email đăng nhập không thể chỉnh sửa.
                                </small>
                            </div>

                            <div className="profile-field">
                                <label htmlFor="profile-dateOfBirth">Ngày sinh</label>

                                <div className="profile-input-wrap">
                                    <CalendarDays size={18} />
                                    <input
                                        id="profile-dateOfBirth"
                                        name="dateOfBirth"
                                        type="date"
                                        value={form.dateOfBirth}
                                        max={new Date().toLocaleDateString('en-CA')}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="profile-form-footer">
                            <p className="profile-hint">
                                <span className="profile-required">*</span> Thông tin bắt buộc.
                            </p>

                            <button type="submit" className="profile-button" disabled={saving}>
                                {saving ? <LoaderCircle size={18} className="profile-spinner" /> : <Save size={18} />}

                                {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                            </button>
                        </div>
                    </form>
                </div>
                <ChangePasswordCard />
                <p>Thông tin hồ sơ được cập nhật cho tài khoản đang đăng nhập. Email đăng nhập không thể thay đổi.</p>

                <div className="profile-security-note">
                    <CheckCircle2 size={20} />
                    <p>
                        Thông tin hồ sơ được cập nhật cho tài khoản đang đăng nhập. Mật khẩu và email không thay đổi
                        trong chức năng này.
                    </p>
                </div>
            </div>
        </section>
    );
}

export default ProfilePage;
