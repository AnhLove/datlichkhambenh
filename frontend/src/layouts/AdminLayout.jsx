import { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';

import {
    Activity,
    Building2,
    ClipboardList,
    Clock3,
    FileText,
    LayoutDashboard,
    LogOut,
    Menu,
    Settings,
    ShieldCheck,
    Stethoscope,
    Users,
    X,
} from 'lucide-react';

import { apiGet, apiPost } from '../services/api';
import { unwrapData } from '../utils/unwrap';
import './AdminLayout.css';

const navItems = [
    { to: '/admin/dashboard', label: 'Thống kê', icon: LayoutDashboard },
    { to: '/admin/users', label: 'Tài khoản', icon: Users },
    { to: '/admin/doctors', label: 'Bác sĩ', icon: Stethoscope },
    { to: '/admin/departments', label: 'Chuyên khoa', icon: Building2 },
    { to: '/admin/medical-services', label: 'Dịch vụ y tế', icon: ClipboardList },
    { to: '/admin/working-hours', label: 'Lịch làm việc', icon: Clock3 },
    { to: '/admin/exam-reports', label: 'Phiếu khám', icon: FileText },
    { to: '/admin/configs', label: 'Cấu hình hệ thống', icon: Settings },
];

function AdminLayout() {
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
        <div className="admin-layout">
            <aside className={`admin-sidebar ${isMenuOpen ? 'admin-sidebar-open' : ''}`}>
                <NavLink to="/admin/dashboard" className="admin-brand" onClick={closeMenu}>
                    <span className="admin-brand-icon">
                        <ShieldCheck size={25} />
                    </span>

                    <span className="admin-brand-text">
                        <strong>NAM LƯƠNG SƠN</strong>
                        <small>Khu vực quản trị</small>
                    </span>
                </NavLink>

                <div className="admin-sidebar-section">
                    <span className="admin-sidebar-heading">Quản trị</span>

                    <nav className="admin-nav" aria-label="Điều hướng quản trị">
                        {navItems.map(({ to, label, icon: Icon }) => (
                            <NavLink
                                key={to}
                                to={to}
                                onClick={closeMenu}
                                className={({ isActive }) =>
                                    `admin-nav-link ${isActive ? 'admin-nav-link-active' : ''}`
                                }
                            >
                                <Icon size={19} />
                                <span>{label}</span>
                            </NavLink>
                        ))}
                    </nav>
                </div>
            </aside>

            {isMenuOpen && (
                <button type="button" className="admin-sidebar-overlay" aria-label="Đóng menu" onClick={closeMenu} />
            )}

            <div className="admin-main">
                <header className="admin-topbar">
                    <div className="admin-topbar-left">
                        <button
                            type="button"
                            className="admin-mobile-menu"
                            aria-label={isMenuOpen ? 'Đóng menu' : 'Mở menu'}
                            onClick={() => setIsMenuOpen((open) => !open)}
                        >
                            {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
                        </button>

                        <div className="admin-topbar-title">
                            <span>Bệnh viện Nam Lương Sơn</span>
                            <strong>Cổng quản trị</strong>
                        </div>
                    </div>

                    <div className="admin-account">
                        <div className="admin-account-avatar">
                            <ShieldCheck size={20} />
                        </div>

                        <div className="admin-account-info">
                            <strong>{isLoading ? 'Đang tải...' : user?.fullName || 'Tài khoản quản trị'}</strong>
                            <span>Quản trị viên</span>
                        </div>

                        <button type="button" className="admin-logout-button" onClick={handleLogout} title="Đăng xuất">
                            <LogOut size={18} />
                            <span>Đăng xuất</span>
                        </button>
                    </div>
                </header>

                <main className="admin-content">
                    <Outlet />
                </main>

                <footer className="admin-footer">
                    <Activity size={15} />
                    <span>Hệ thống quản lý khám bệnh · Bệnh viện Nam Lương Sơn</span>
                </footer>
            </div>
        </div>
    );
}

export default AdminLayout;
