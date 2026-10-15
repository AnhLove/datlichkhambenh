import { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Plus, Menu, X } from 'lucide-react';
import './Header.css';

function Header() {
    const [isHidden, setIsHidden] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

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
                    <NavLink to="/">Trang chủ</NavLink>
                    <NavLink to="/doctors">Đội ngũ bác sĩ</NavLink>
                    <NavLink to="/departments">Chuyên khoa</NavLink>
                    <NavLink to="/appointments">Đặt lịch khám</NavLink>
                </nav>

                <Link to="/login" className="header-login">
                    Đăng nhập
                </Link>

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
                    <NavLink to="/login" onClick={closeMenu}>
                        Đăng nhập
                    </NavLink>
                </nav>
            )}
        </header>
    );
}

export default Header;
