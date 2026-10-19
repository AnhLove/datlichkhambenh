import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Plus, Menu, X, User, LogOut } from 'lucide-react';
import './Header.css';

function Header() {
    const navigate = useNavigate();
    const location = useLocation(); // Lắng nghe sự thay đổi đường dẫn trang
    const [isHidden, setIsHidden] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [user, setUser] = useState(null);

    // Kiểm tra trạng thái đăng nhập mỗi khi đổi URL hoặc component load
    useEffect(() => {
        const checkAuth = () => {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                try {
                    setUser(JSON.parse(storedUser));
                } catch {
                    setUser(null);
                }
            } else {
                setUser(null);
            }
        };

        checkAuth();
    }, [location.pathname]); // Chạy lại mỗi khi chuyển trang (ví dụ vừa login xong về '/')

    const handleLogout = () => {
        localStorage.removeItem('user');
        setUser(null);
        navigate('/login');
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

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
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
                    <NavLink to="/">Trang chủ</NavLink>
                    <NavLink to="/doctors">Đội ngũ bác sĩ</NavLink>
                    <NavLink to="/departments">Chuyên khoa</NavLink>
                    <NavLink to="/appointments">Đặt lịch khám</NavLink>
                </nav>

                {user ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                        <span
                            style={{
                                fontSize: '14px',
                                fontWeight: 600,
                                color: '#087f70',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                            }}
                        >
                            <User size={16} />
                            {user.fullName || user.email || 'Tài khoản'}
                        </span>
                        <button
                            type="button"
                            onClick={handleLogout}
                            className="header-login"
                            style={{ borderColor: '#f87171', color: '#dc2626' }}
                            title="Đăng xuất"
                        >
                            <LogOut size={16} style={{ marginRight: '4px' }} /> Đăng xuất
                        </button>
                    </div>
                ) : (
                    <Link to="/login" className="header-login">
                        Đăng nhập
                    </Link>
                )}

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
                    {user ? (
                        <button
                            type="button"
                            onClick={() => {
                                handleLogout();
                                closeMenu();
                            }}
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
                            }}
                        >
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
