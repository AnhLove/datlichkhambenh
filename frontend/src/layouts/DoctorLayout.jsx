import { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
    Activity,
    CalendarDays,
    ClipboardList,
    Clock3,
    LayoutDashboard,
    LogOut,
    Menu,
    Stethoscope,
    X,
    UserRound,
} from 'lucide-react';

import { apiGet, apiPost } from '../services/api';
import { unwrapData } from '../utils/unwrap';
import './DoctorLayout.css';

function DoctorLayout() {
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

    const navItems = [
        {
            to: '/doctor/dashboard',
            label: 'Tổng quan',
            icon: LayoutDashboard,
            end: true,
        },
        {
            to: '/doctor/appointments',
            label: 'Lịch khám của tôi',
            icon: CalendarDays,
        },
        {
            to: '/doctor/schedule',
            label: 'Lịch làm việc',
            icon: Clock3,
        },
        {
            to: '/doctor/exam-reports',
            label: 'Báo cáo khám',
            icon: ClipboardList,
        },
        {
            to: '/doctor/profile',
            label: 'Hồ sơ cá nhân',
            icon: UserRound,
        },
    ];

    return (
        <div className="doctor-layout">
            <aside className={`doctor-sidebar ${isMenuOpen ? 'doctor-sidebar-open' : ''}`}>
                <NavLink to="/doctor/dashboard" className="doctor-brand" onClick={closeMenu}>
                    <span className="doctor-brand-icon">
                        <Stethoscope size={25} />
                    </span>

                    <span className="doctor-brand-text">
                        <strong>NAM LƯƠNG SƠN</strong>
                        <small>CỔNG THÔNG TIN BÁC SĨ</small>
                    </span>
                </NavLink>

                <div className="doctor-sidebar-section">
                    <span className="doctor-sidebar-heading">KHÔNG GIAN LÀM VIỆC</span>

                    <nav className="doctor-nav" aria-label="Điều hướng bác sĩ">
                        {navItems.map(({ to, label, icon: Icon, end }) => (
                            <NavLink
                                key={to}
                                to={to}
                                end={end}
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
                        <Stethoscope size={20} />
                    </div>
                    <div>
                        <strong>Hệ thống bác sĩ</strong>
                        <span>Quản lý hoạt động khám</span>
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
                            <strong>Cổng làm việc bác sĩ</strong>
                        </div>
                    </div>

                    <div className="doctor-account">
                        <div className="doctor-account-avatar">
                            <Stethoscope size={20} />
                        </div>

                        <div className="doctor-account-info">
                            <strong>{isLoading ? 'Đang tải...' : user?.fullName || 'Tài khoản bác sĩ'}</strong>
                            <span>Bác sĩ</span>
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

export default DoctorLayout;
