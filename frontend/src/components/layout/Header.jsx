import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Plus, Menu, X, User, LogOut, CalendarDays } from 'lucide-react';
import { apiGet, apiPost } from '../../services/api';
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

        const fetchCurrentUser = async () => {
            setIsAuthLoading(true);

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
        };

        fetchCurrentUser();

        return () => {
            cancelled = true;
        };
    }, [location.pathname]);

    const handleLogout = async () => {
        try {
            await apiPost('/auth/logout', {});
        } catch (error) {
            console.error('Lỗi đăng xuất:', error);
        } finally {
            localStorage.removeItem('user');
            setUser(null);
            closeMenu();
            navigate('/login', { replace: true });
        }
    };

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

        window.addEventListener('scroll', handleScroll, {
            passive: true,
        });

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const closeMenu = () => setIsMenuOpen(false);

    return (
        <header className={`site-header ${isHidden ? 'header-hidden' : ''}`}>
            <div className="header-inner">
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

                    <NavLink to="/appointments" onClick={closeMenu}>
                        Đặt lịch khám
                    </NavLink>

                    <NavLink to="/medical-services" onClick={closeMenu}>
                        Dịch vụ y tế
                    </NavLink>

                    {!isAuthLoading && user && (
                        <NavLink to="/my-appointments" onClick={closeMenu}>
                            Lịch khám của tôi
                        </NavLink>
                    )}
                </nav>

                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        gap: '12px',
                        minWidth: '180px',
                        flexShrink: 0,
                    }}
                >
                    {isAuthLoading ? (
                        <div aria-label="Đang kiểm tra đăng nhập" style={{ width: '180px', height: '36px' }} />
                    ) : user ? (
                        <>
                            <span
                                style={{
                                    fontSize: '14px',
                                    fontWeight: 600,
                                    color: '#087f83',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                }}
                            >
                                <User size={16} />
                                {user.fullName || 'Tài khoản'}
                            </span>

                            <button
                                type="button"
                                onClick={handleLogout}
                                className="header-login"
                                style={{
                                    borderColor: '#f87171',
                                    color: '#dc2626',
                                }}
                                title="Đăng xuất"
                            >
                                <LogOut size={16} style={{ marginRight: '4px' }} />
                                Đăng xuất
                            </button>
                        </>
                    ) : (
                        <Link to="/login" className="header-login">
                            Đăng nhập
                        </Link>
                    )}
                </div>

                <button
                    type="button"
                    className="mobile-menu"
                    aria-label={isMenuOpen ? 'Đóng menu' : 'Mở menu'}
                    aria-expanded={isMenuOpen}
                    onClick={() => setIsMenuOpen((open) => !open)}
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

                    <NavLink to="/appointments" onClick={closeMenu}>
                        Đặt lịch khám
                    </NavLink>

                    <NavLink to="/medical-services" onClick={closeMenu}>
                        Dịch vụ y tế
                    </NavLink>

                    {!isAuthLoading && user && (
                        <NavLink
                            to="/my-appointments"
                            onClick={closeMenu}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                            }}
                        >
                            <CalendarDays size={18} />
                            Lịch khám của tôi
                        </NavLink>
                    )}

                    {isAuthLoading ? null : user ? (
                        <button
                            type="button"
                            onClick={handleLogout}
                            style={{
                                background: 'none',
                                border: 'none',
                                borderBottom: '1px solid #edf2f0',
                                textAlign: 'left',
                                padding: '13px 4px',
                                color: '#dc2626',
                                fontSize: '15px',
                                fontWeight: 550,
                                cursor: 'pointer',
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                            }}
                        >
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
