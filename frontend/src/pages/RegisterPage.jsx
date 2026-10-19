import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiPost } from '../services/api';
import './AuthPages.css';

const MAX_BIRTH_DATE = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

function RegisterPage() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        fullName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        dateOfBirth: '',
    });

    const [showPassword, setShowPassword] = useState(false);
    const [agree, setAgree] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((current) => ({
            ...current,
            [name]: value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (loading) return;

        setError('');
        setSuccess('');

        const fullName = form.fullName.trim();
        const email = form.email.trim();
        const phone = form.phone.trim();

        if (!fullName || !email || !phone || !form.dateOfBirth) {
            setError('Vui lòng điền đầy đủ các thông tin bắt buộc.');
            return;
        }

        if (form.password.length < 8 || form.password.length > 72) {
            setError('Mật khẩu phải từ 8 đến 72 ký tự.');
            return;
        }

        if (form.password !== form.confirmPassword) {
            setError('Mật khẩu xác nhận không khớp.');
            return;
        }

        // Khớp với biểu thức kiểm tra số điện thoại ở backend.
        if (!/^(0|\+84)\d{9}$/.test(phone)) {
            setError('Số điện thoại không đúng định dạng.');
            return;
        }

        if (form.dateOfBirth > MAX_BIRTH_DATE) {
            setError('Ngày sinh phải là một ngày hợp lệ trong quá khứ.');
            return;
        }

        if (!agree) {
            setError('Vui lòng đồng ý với điều khoản sử dụng.');
            return;
        }

        setLoading(true);

        try {
            const result = await apiPost('/auth/register', {
                fullName,
                phone,
                email,
                password: form.password,
                dateOfBirth: form.dateOfBirth,
            });

            setSuccess(result?.message || 'Đăng ký thành công. Bạn có thể đăng nhập.');
        } catch (err) {
            setError(err.message || 'Đăng ký thất bại. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="auth-page">
            <div className="auth-container auth-container-register">
                <section className="auth-intro">
                    <div className="auth-brand">
                        <div className="auth-brand-icon" aria-hidden="true">
                            ✚
                        </div>
                        <div>
                            <p className="auth-brand-name">Đặt lịch khám bệnh</p>
                            <p className="auth-brand-caption">Vì sức khỏe của bạn</p>
                        </div>
                    </div>

                    <h1>Bắt đầu hành trình chăm sóc sức khỏe của bạn</h1>
                    <p>Tạo tài khoản để đặt lịch khám, theo dõi lịch hẹn và sử dụng các tiện ích chăm sóc sức khỏe.</p>

                    <div className="auth-features">
                        <div className="auth-feature">
                            <span className="auth-feature-icon" aria-hidden="true">
                                ✓
                            </span>
                            <span>Quản lý lịch hẹn</span>
                        </div>
                        <div className="auth-feature">
                            <span className="auth-feature-icon" aria-hidden="true">
                                ◷
                            </span>
                            <span>Chủ động thời gian</span>
                        </div>
                        <div className="auth-feature">
                            <span className="auth-feature-icon" aria-hidden="true">
                                ♡
                            </span>
                            <span>Chăm sóc thuận tiện</span>
                        </div>
                    </div>
                </section>

                <section className="auth-card auth-card-register">
                    <div className="auth-card-header">
                        <div className="auth-card-icon" aria-hidden="true">
                            ♙
                        </div>
                        <h2>Đăng ký tài khoản</h2>
                        <p>Vui lòng điền thông tin để tạo tài khoản bệnh nhân.</p>
                    </div>

                    <form className="auth-form auth-form-register" onSubmit={handleSubmit}>
                        <div className="auth-field">
                            <label htmlFor="register-name">
                                Họ và tên <span className="auth-field-required">*</span>
                            </label>
                            <input
                                id="register-name"
                                name="fullName"
                                type="text"
                                autoComplete="name"
                                placeholder="Nhập họ và tên"
                                value={form.fullName}
                                onChange={handleChange}
                                maxLength={150}
                                required
                            />
                        </div>

                        <div className="auth-field">
                            <label htmlFor="register-email">
                                Email <span className="auth-field-required">*</span>
                            </label>
                            <input
                                id="register-email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                placeholder="Nhập email"
                                value={form.email}
                                onChange={handleChange}
                                maxLength={150}
                                required
                            />
                        </div>

                        <div className="auth-field">
                            <label htmlFor="register-phone">
                                Số điện thoại <span className="auth-field-required">*</span>
                            </label>
                            <input
                                id="register-phone"
                                name="phone"
                                type="tel"
                                autoComplete="tel"
                                placeholder="Nhập số điện thoại"
                                value={form.phone}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="auth-password-row">
                            <div className="auth-field">
                                <label htmlFor="register-password">
                                    Mật khẩu <span className="auth-field-required">*</span>
                                </label>
                                <input
                                    id="register-password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete="new-password"
                                    placeholder="Tạo mật khẩu"
                                    value={form.password}
                                    onChange={handleChange}
                                    minLength={8}
                                    maxLength={72}
                                    required
                                />
                            </div>

                            <div className="auth-field">
                                <label htmlFor="register-confirm-password">
                                    Xác nhận mật khẩu
                                    <span className="auth-field-required"> *</span>
                                </label>
                                <input
                                    id="register-confirm-password"
                                    name="confirmPassword"
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete="new-password"
                                    placeholder="Nhập lại mật khẩu"
                                    value={form.confirmPassword}
                                    onChange={handleChange}
                                    minLength={8}
                                    maxLength={72}
                                    required
                                />
                            </div>
                        </div>

                        <label className="auth-checkbox">
                            <input
                                type="checkbox"
                                checked={showPassword}
                                onChange={(event) => setShowPassword(event.target.checked)}
                            />
                            <span>Hiển thị mật khẩu</span>
                        </label>

                        <div className="auth-field">
                            <label htmlFor="register-dob">
                                Ngày sinh <span className="auth-field-required">*</span>
                            </label>
                            <input
                                id="register-dob"
                                name="dateOfBirth"
                                type="date"
                                autoComplete="bday"
                                max={MAX_BIRTH_DATE}
                                value={form.dateOfBirth}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        {error && (
                            <p className="auth-message auth-message-error" role="alert">
                                {error}
                            </p>
                        )}

                        {success && (
                            <p className="auth-message auth-message-success" role="status">
                                {success}
                            </p>
                        )}

                        <label className="auth-checkbox">
                            <input
                                type="checkbox"
                                checked={agree}
                                onChange={(event) => setAgree(event.target.checked)}
                            />
                            <span>Tôi đồng ý với các điều khoản sử dụng và chính sách bảo mật của hệ thống.</span>
                        </label>

                        <button className="auth-submit" type="submit" disabled={loading}>
                            {loading ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}
                        </button>
                    </form>

                    <p className="auth-switch">
                        Đã có tài khoản?{' '}
                        <Link className="auth-link" to="/login">
                            Đăng nhập ngay
                        </Link>
                    </p>

                    {success && (
                        <p className="auth-switch">
                            <button
                                type="button"
                                className="auth-link"
                                onClick={() => navigate('/login')}
                                style={{
                                    border: 0,
                                    background: 'none',
                                    padding: 0,
                                    cursor: 'pointer',
                                    font: 'inherit',
                                }}
                            >
                                Chuyển tới đăng nhập
                            </button>
                        </p>
                    )}

                    <div className="auth-footer">© 2026 Đặt lịch khám bệnh. Bảo lưu mọi quyền.</div>
                </section>
            </div>
        </main>
    );
}

export default RegisterPage;
