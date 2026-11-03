import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { CalendarDays, ClipboardCheck, Lock, ReceiptText, ShieldCheck, UserRound } from 'lucide-react';

import { apiGet } from '../services/api';
import { unwrapData } from '../utils/unwrap';

import './AccountLayout.css';

const NAV_GROUPS = [
    {
        title: 'Tài khoản',
        items: [
            { to: '/profile', label: 'Thông tin cá nhân', icon: UserRound, end: true },
            { to: '/profile/password', label: 'Đổi mật khẩu', icon: Lock },
        ],
    },
    {
        title: 'Hồ sơ y tế',
        items: [
            { to: '/my-appointments', label: 'Lịch khám của tôi', icon: CalendarDays },
            { to: '/my-exam-reports', label: 'Kết quả khám', icon: ClipboardCheck },
            { to: '/my-payments', label: 'Lịch sử thanh toán', icon: ReceiptText },
        ],
    },
];

// Khung chung cho khu vực tài khoản bệnh nhân: banner + thanh bên + nội dung từng trang
function AccountLayout() {
    const location = useLocation();
    const [fullName, setFullName] = useState('');

    useEffect(() => {
        let cancelled = false;

        apiGet('/me')
            .then((response) => {
                if (!cancelled) setFullName(unwrapData(response)?.fullName ?? '');
            })
            .catch(() => {});

        return () => {
            cancelled = true;
        };
    }, [location.pathname]);

    return (
        <div className="account-shell">
            <div className="account-container">
                <header className="account-hero">
                    <div className="account-hero-avatar" aria-hidden="true">
                        <UserRound size={34} />
                    </div>
                    <div>
                        <span className="account-hero-badge">
                            <ShieldCheck size={14} /> Tài khoản bệnh nhân
                        </span>
                        <h1>{fullName || 'Tài khoản của tôi'}</h1>
                        <p>Quản lý thông tin cá nhân, lịch khám, kết quả khám và thanh toán tại Bệnh viện Nam Lương Sơn.</p>
                    </div>
                </header>

                <div className="account-grid">
                    <aside className="account-sidebar" aria-label="Menu tài khoản">
                        {NAV_GROUPS.map((group) => (
                            <div className="account-nav-group" key={group.title}>
                                <span className="account-nav-title">{group.title}</span>

                                {group.items.map(({ to, label, icon: Icon, end }) => (
                                    <NavLink
                                        key={to}
                                        to={to}
                                        end={end}
                                        className={({ isActive }) => `account-nav-item${isActive ? ' active' : ''}`}
                                    >
                                        <Icon size={18} />
                                        <span>{label}</span>
                                    </NavLink>
                                ))}
                            </div>
                        ))}
                    </aside>

                    <main className="account-content">
                        <Outlet />
                    </main>
                </div>
            </div>
        </div>
    );
}

export default AccountLayout;
