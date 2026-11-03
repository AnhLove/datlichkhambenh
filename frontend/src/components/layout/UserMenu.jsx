import { useEffect, useRef, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { CalendarDays, ChevronDown, ClipboardCheck, Plus, ReceiptText, UserRound } from 'lucide-react';

import './UserMenu.css';

const MENU_ITEMS = [
    { to: '/profile', label: 'Hồ sơ cá nhân', icon: UserRound, end: true },
    { to: '/my-appointments', label: 'Lịch khám của tôi', icon: CalendarDays },
    { to: '/my-exam-reports', label: 'Kết quả khám của tôi', icon: ClipboardCheck },
    { to: '/my-payments', label: 'Lịch sử thanh toán', icon: ReceiptText },
];

// Lấy chữ cái đầu của tên (từ cuối cùng trong họ tên Việt Nam) làm ảnh đại diện
function getInitial(name) {
    const parts = String(name ?? '').trim().split(/\s+/).filter(Boolean);
    return parts.length ? parts[parts.length - 1].charAt(0).toUpperCase() : 'U';
}

function UserMenu({ user, onNavigate }) {
    const [open, setOpen] = useState(false);
    const rootRef = useRef(null);

    useEffect(() => {
        if (!open) return undefined;

        const handlePointerDown = (event) => {
            if (rootRef.current && !rootRef.current.contains(event.target)) {
                setOpen(false);
            }
        };
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') setOpen(false);
        };

        document.addEventListener('mousedown', handlePointerDown);
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('mousedown', handlePointerDown);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [open]);

    const handleNavigate = () => {
        setOpen(false);
        onNavigate?.();
    };

    const displayName = user?.fullName || 'Tài khoản';

    return (
        <div className="user-menu" ref={rootRef}>
            <button
                type="button"
                className="user-menu-trigger"
                aria-haspopup="menu"
                aria-expanded={open}
                onClick={() => setOpen((value) => !value)}
            >
                <span className="user-menu-avatar" aria-hidden="true">
                    {getInitial(displayName)}
                </span>
                <span className="user-menu-name">{displayName}</span>
                <ChevronDown size={16} className="user-menu-chevron" aria-hidden="true" />
            </button>

            {open && (
                <div className="user-menu-panel" role="menu">
                    <div className="user-menu-profile">
                        <span className="user-menu-avatar user-menu-avatar-lg" aria-hidden="true">
                            {getInitial(displayName)}
                        </span>
                        <div>
                            <strong>{displayName}</strong>
                            {user?.email && <small>{user.email}</small>}
                        </div>
                    </div>

                    <nav className="user-menu-list" aria-label="Tài khoản">
                        {MENU_ITEMS.map(({ to, label, icon: Icon, end }) => (
                            <NavLink key={to} to={to} end={end} role="menuitem" onClick={handleNavigate}>
                                <Icon size={18} />
                                <span>{label}</span>
                            </NavLink>
                        ))}
                    </nav>

                    <NavLink to="/appointments" role="menuitem" className="user-menu-cta" onClick={handleNavigate}>
                        <Plus size={18} />
                        <span>Đặt lịch khám mới</span>
                    </NavLink>
                </div>
            )}
        </div>
    );
}

export default UserMenu;
