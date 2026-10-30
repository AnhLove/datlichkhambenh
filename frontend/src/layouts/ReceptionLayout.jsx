import { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Activity, CalendarDays, LogOut, Menu, Receipt, Users, X, UserRound } from 'lucide-react';

import { apiGet, apiPost } from '../services/api';
import { unwrapData } from '../utils/unwrap';
import './DoctorLayout.css';

const NAV_ITEMS = [
    {
        to: '/reception/appointments',
        label: 'Lịch hẹn',
        icon: CalendarDays,
    },
    {
        to: '/reception/patients',
        label: 'Bệnh nhân',
        icon: Users,
    },
    {
        to: '/reception/billing',
        label: 'Thu ngân',
        icon: Receipt,
    },
    {
        to: '/reception/profile',
        label: 'Hồ sơ cá nhân',
        icon: UserRound,
    },
];

function ReceptionLayout() {
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        async function fetchCurrentUser() {
            try {
                const response = await apiGet('/me');

                if (!cancelled) {
                    setUser(unwrapData(response));
                }
            } catch {
                if (!cancelled) {
                    setUser(null);
                }
            } finally {
                if (!cancelled) {
                    setIsLoading(false);
                }
            }
        }

        fetchCurrentUser();

        return () => {
            cancelled = true;
        };
    }, []);

    const closeMenu = () => setIsMenuOpen(false);

    const handleLogout = async () => {
        try {
            await apiPost('/auth/logout', {});
        } catch (error) {
            console.error('Lỗi đăng xuất:', error);
        } finally {
            localStorage.removeItem('user');
            setUser(null);
            navigate('/login', { replace: true });
        }
    };

    return (
        <div className="doctor-layout">
            <aside className={`doctor-sidebar ${isMenuOpen ? 'doctor-sidebar-open' : ''}`}>
                <NavLink to="/reception/appointments" className="doctor-brand" onClick={closeMenu}>
                    <span className="doctor-brand-icon">
                        <Activity size={25} />
                    </span>

                    <span className="doctor-brand-text">
                        <strong>NAM LƯƠNG SƠN</strong>
                        <small>CỔNG THÔNG TIN LỄ TÂN</small>
                    </span>
                </NavLink>

                <div className="doctor-sidebar-section">
                    <span className="doctor-sidebar-heading">QUẦY TIẾP ĐÓN</span>

                    <nav className="doctor-nav" aria-label="Điều hướng lễ tân">
                        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
                            <NavLink
                                key={to}
                                to={to}
                                onClick={closeMenu}
                                className={({ isActive }) =>
                                    `doctor-nav-link ${isActive ? 'doctor-nav-link-active' : ''}`
                                }
                            >
                                <Icon size={19} />
                                <span>{label}</span>
                            </NavLink>
                        ))}
                    </nav>
                </div>

                <div className="doctor-sidebar-footer">
                    <div className="doctor-sidebar-footer-icon">
                        <Users size={20} />
                    </div>
                    <div>
                        <strong>Hệ thống lễ tân</strong>
                        <span>Tiếp đón và thu ngân</span>
                    </div>
                </div>
            </aside>

            {isMenuOpen && (
                <button type="button" className="doctor-sidebar-overlay" aria-label="Đóng menu" onClick={closeMenu} />
            )}

            <div className="doctor-main">
                <header className="doctor-topbar">
                    <div className="doctor-topbar-left">
                        <button
                            type="button"
                            className="doctor-mobile-menu"
                            aria-label={isMenuOpen ? 'Đóng menu' : 'Mở menu'}
                            onClick={() => setIsMenuOpen((open) => !open)}
                        >
                            {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
                        </button>

                        <div className="doctor-topbar-title">
                            <span className="doctor-topbar-eyebrow">BỆNH VIỆN NAM LƯƠNG SƠN</span>
                            <strong>Cổng làm việc lễ tân</strong>
                        </div>
                    </div>

                    <div className="doctor-account">
                        <div className="doctor-account-avatar">
                            <Users size={20} />
                        </div>

                        <div className="doctor-account-info">
                            <strong>{isLoading ? 'Đang tải...' : user?.fullName || 'Tài khoản lễ tân'}</strong>
                            <span>Lễ tân</span>
                        </div>

                        <button type="button" className="doctor-logout-button" onClick={handleLogout} title="Đăng xuất">
                            <LogOut size={18} />
                            <span>Đăng xuất</span>
                        </button>
                    </div>
                </header>

                <main className="doctor-content">
                    <Outlet />
                </main>

                <footer className="doctor-footer">
                    <Activity size={15} />
                    <span>Hệ thống quản lý khám bệnh · Bệnh viện Nam Lương Sơn</span>
                </footer>
            </div>
        </div>
    );
}

export default ReceptionLayout;
