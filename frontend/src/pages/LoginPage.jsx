import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiPost, apiGet } from '../services/api';
import './AuthPages.css';

function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [remember, setRemember] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (loading) return;

        setError('');
        setLoading(true);

        try {
            await apiPost('/auth/login', {
                email: email.trim(),
                password,
            });
            const response = await apiGet('/me');
            const user = response?.data?.data ?? response?.data ?? response;

            localStorage.setItem(
                'user',
                JSON.stringify({
                    email: user.email ?? email.trim(),
                    role: Number(user.role),
                })
            );

            const role = Number(user.role);

            if (role === 2) {
                navigate('/doctor/dashboard', { replace: true });
            } else if (role === 1) {
                navigate('/', { replace: true });
            } else {
                navigate('/', { replace: true });
            }
        } catch (err) {
            setError(err.message || 'Đăng nhập thất bại. Vui lòng kiểm tra email và mật khẩu.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="auth-page">
            <div className="auth-container">
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

                    <h1>Chăm sóc sức khỏe của bạn là ưu tiên của chúng tôi</h1>
                    <p>
                        Đặt lịch khám bệnh nhanh chóng, thuận tiện và an toàn. Chủ động lựa chọn lịch khám phù hợp với
                        bạn.
                    </p>

                    <div className="auth-features">
                        <div className="auth-feature">
                            <span className="auth-feature-icon" aria-hidden="true">
                                ♡
                            </span>
                            <span>Đội ngũ bác sĩ tận tâm</span>
                        </div>
                        <div className="auth-feature">
                            <span className="auth-feature-icon" aria-hidden="true">
                                ◷
                            </span>
                            <span>Đặt lịch nhanh chóng</span>
                        </div>
                        <div className="auth-feature">
                            <span className="auth-feature-icon" aria-hidden="true">
                                ✓
                            </span>
                            <span>Thông tin thuận tiện</span>
                        </div>
                    </div>
                </section>

                <section className="auth-card">
                    <div className="auth-card-header">
                        <div className="auth-card-icon" aria-hidden="true">
                            ♙
                        </div>
                        <h2>Đăng nhập</h2>
                        <p>Vui lòng đăng nhập để tiếp tục sử dụng dịch vụ.</p>
                    </div>

                    <form className="auth-form" onSubmit={handleSubmit}>
                        <div className="auth-field">
                            <label htmlFor="login-email">Email</label>
                            <input
                                id="login-email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                placeholder="Nhập email của bạn"
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                maxLength={150}
                                required
                            />
                        </div>

                        <div className="auth-field">
                            <label htmlFor="login-password">Mật khẩu</label>
                            <input
                                id="login-password"
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                autoComplete="current-password"
                                placeholder="Nhập mật khẩu"
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                                required
                            />

                            <label className="auth-checkbox">
                                <input
                                    type="checkbox"
                                    checked={showPassword}
                                    onChange={(event) => setShowPassword(event.target.checked)}
                                />
                                <span>Hiển thị mật khẩu</span>
                            </label>
                        </div>

                        <div className="auth-options">
                            <label className="auth-checkbox">
                                <input
                                    type="checkbox"
                                    checked={remember}
                                    onChange={(event) => setRemember(event.target.checked)}
                                />
                                <span>Ghi nhớ đăng nhập</span>
                            </label>

                            <Link className="auth-link" to="/login">
                                Quên mật khẩu?
                            </Link>
                        </div>

                        {error && (
                            <p className="auth-message auth-message-error" role="alert">
                                {error}
                            </p>
                        )}

                        <button className="auth-submit" type="submit" disabled={loading}>
                            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                        </button>
                    </form>

                    <p className="auth-switch">
                        Chưa có tài khoản?{' '}
                        <Link className="auth-link" to="/register">
                            Đăng ký ngay
                        </Link>
                    </p>

                    <div className="auth-footer">© 2026 Đặt lịch khám bệnh. Bảo lưu mọi quyền.</div>
                </section>
            </div>
        </main>
    );
}

export default LoginPage;
