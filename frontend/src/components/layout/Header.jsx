import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
    Plus,
    Menu,
    X,
    UserRound,
    LogOut,
    CalendarDays,
    ClipboardCheck,
    ReceiptText,
} from 'lucide-react';

import { apiGet, apiPost } from '../../services/api';
import UserMenu from './UserMenu';
import './Header.css';

function Header() {
    const navigate = useNavigate();
    const location = useLocation();

    const [isHidden, setIsHidden] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [user, setUser] = useState(null);
    const [isAuthLoading, setIsAuthLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        async function fetchCurrentUser() {
            try {
                const currentUser = await apiGet('/me');

                if (!cancelled) {
                    setUser(currentUser);
                }
            } catch {
                if (!cancelled) {
                    setUser(null);
                }
            } finally {
                if (!cancelled) {
                    setIsAuthLoading(false);
                }
            }
        }

        fetchCurrentUser();

        return () => {
            cancelled = true;
        };
    }, [location.pathname]);

    useEffect(() => {
        let lastScrollY = window.scrollY;

        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            if (currentScrollY <= 80) {
                setIsHidden(false);
            } else if (currentScrollY > lastScrollY) {
                setIsHidden(true);
                setIsMenuOpen(false);
            } else {
                setIsHidden(false);
            }

            lastScrollY = currentScrollY;
        };

        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const closeMenu = () => {
        setIsMenuOpen(false);
    };

    const handleLogout = async () => {
        try {
            await apiPost('/auth/logout', {});
        } catch (error) {
            console.error('Lỗi đăng xuất:', error);
        } finally {
            setUser(null);
            closeMenu();
            navigate('/login', { replace: true });
        }
    };

    return (
        <header className={`site-header ${isHidden ? 'header-hidden' : ''}`}>
            <div className="header-inner">
                {/* Logo */}
                <Link to="/" className="brand" onClick={closeMenu}>
                    <span className="brand-mark">
                        <Plus size={30} strokeWidth={3} />
                    </span>

                    <span className="brand-text">
                        <strong>BỆNH VIỆN NAM LƯƠNG SƠN</strong>
                        <small>Chăm sóc tận tâm – Sức khỏe vẹn toàn</small>
                    </span>
                </Link>

                <nav className="main-nav" aria-label="Điều hướng chính">
                    <NavLink to="/" onClick={closeMenu}>
                        Trang chủ
                    </NavLink>

                    <NavLink to="/doctors" onClick={closeMenu}>
                        Đội ngũ bác sĩ
                    </NavLink>

                    <NavLink to="/departments" onClick={closeMenu}>
                        Chuyên khoa
                    </NavLink>

                    <NavLink to="/medical-services" onClick={closeMenu}>
                        Dịch vụ y tế
                    </NavLink>
                </nav>

                <div className="header-account">
                    {isAuthLoading ? (
                        <div className="account-loading" aria-label="Đang kiểm tra đăng nhập" />
                    ) : user ? (
                        <>
                            <UserMenu user={user} onNavigate={closeMenu} />

                            <button
                                type="button"
                                onClick={handleLogout}
                                className="header-login header-logout"
                                title="Đăng xuất"
                            >
                                <LogOut size={16} />
                                <span>Đăng xuất</span>
                            </button>
                        </>
                    ) : (
                        <Link to="/login" className="header-login" onClick={closeMenu}>
                            Đăng nhập
                        </Link>
                    )}
                </div>

                <button
                    type="button"
                    className="mobile-menu"
                    aria-label={isMenuOpen ? 'Đóng menu' : 'Mở menu'}
                    aria-expanded={isMenuOpen}
                    onClick={() => {
                        setIsMenuOpen((open) => !open);
                    }}
                >
                    {isMenuOpen ? <X size={23} /> : <Menu size={23} />}
                </button>
            </div>

            {isMenuOpen && (
                <nav className="mobile-nav" aria-label="Điều hướng di động">
                    <NavLink to="/" onClick={closeMenu}>
                        Trang chủ
                    </NavLink>

                    <NavLink to="/doctors" onClick={closeMenu}>
                        Đội ngũ bác sĩ
                    </NavLink>

                    <NavLink to="/departments" onClick={closeMenu}>
                        Chuyên khoa
                    </NavLink>

                    {!isAuthLoading && user && (
                        <div className="mobile-booking-submenu">
                            <NavLink to="/profile" onClick={closeMenu}>
                                <UserRound size={17} />
                                Hồ sơ cá nhân
                            </NavLink>

                            <NavLink to="/my-appointments" onClick={closeMenu}>
                                <CalendarDays size={17} />
                                Lịch khám của tôi
                            </NavLink>

                            <NavLink to="/my-exam-reports" onClick={closeMenu}>
                                <ClipboardCheck size={17} />
                                Kết quả khám của tôi
                            </NavLink>

                            <NavLink to="/my-payments" onClick={closeMenu}>
                                <ReceiptText size={17} />
                                Lịch sử thanh toán
                            </NavLink>

                            <NavLink to="/appointments" onClick={closeMenu}>
                                <Plus size={17} />
                                Đặt lịch khám mới
                            </NavLink>
                        </div>
                    )}

                    <NavLink to="/medical-services" onClick={closeMenu}>
                        Dịch vụ y tế
                    </NavLink>

                    {isAuthLoading ? null : user ? (
                        <button type="button" className="mobile-logout" onClick={handleLogout}>
                            <LogOut size={18} />
                            Đăng xuất
                        </button>
                    ) : (
                        <NavLink to="/login" onClick={closeMenu}>
                            Đăng nhập
                        </NavLink>
                    )}
                </nav>
            )}
        </header>
    );
}

export default Header;

