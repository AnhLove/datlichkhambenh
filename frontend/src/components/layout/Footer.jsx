import { Clock3, Mail, MapPin, Phone, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

import { HOSPITAL } from '../../config/hospital';

import './Footer.css';

const QUICK_LINKS = [
    { to: '/', label: 'Trang chủ' },
    { to: '/doctors', label: 'Đội ngũ bác sĩ' },
    { to: '/departments', label: 'Chuyên khoa' },
    { to: '/medical-services', label: 'Dịch vụ y tế' },
    { to: '/appointments', label: 'Đặt lịch khám' },
];

function Footer() {
    return (
        <footer className="site-footer">
            <div className="container footer-grid">
                <div className="footer-col footer-about">
                    <div className="footer-brand">
                        <span className="footer-brand-mark">
                            <Plus size={26} strokeWidth={3} />
                        </span>

                        <div>
                            <strong>{HOSPITAL.name.toUpperCase()}</strong>
                            <small>{HOSPITAL.slogan}</small>
                        </div>
                    </div>

                    <p>{HOSPITAL.description}</p>
                </div>

                <nav className="footer-col" aria-label="Liên kết nhanh">
                    <h3>Liên kết nhanh</h3>

                    <ul className="footer-links">
                        {QUICK_LINKS.map((link) => (
                            <li key={link.to}>
                                <Link to={link.to}>{link.label}</Link>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div className="footer-col">
                    <h3>Giờ làm việc</h3>

                    <ul className="footer-hours">
                        {HOSPITAL.workingHours.map((item) => (
                            <li key={item.label}>
                                <span>{item.label}</span>
                                <span>{item.value}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="footer-col">
                    <h3>Liên hệ</h3>

                    <ul className="footer-contact">
                        <li>
                            <MapPin size={18} />
                            <span>{HOSPITAL.address}</span>
                        </li>
                        <li>
                            <Phone size={18} />
                            <span>{HOSPITAL.phone}</span>
                        </li>
                        <li>
                            <Mail size={18} />
                            <span>{HOSPITAL.email}</span>
                        </li>
                        <li>
                            <Clock3 size={18} />
                            <span>Đặt lịch trực tuyến 24/7</span>
                        </li>
                    </ul>
                </div>
            </div>

            <div className="footer-bottom">
                <div className="container footer-bottom-inner">
                    <small>
                        © {new Date().getFullYear()} {HOSPITAL.name}
                    </small>
                    <small>Website đặt lịch khám bệnh trực tuyến</small>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
