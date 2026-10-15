import './Footer.css';
import { Plus } from 'lucide-react';

function Footer() {
    return (
        <footer className="site-footer">
            <div className="footer-brand">
                <span className="brand-icon">
                    <Plus size={26} strokeWidth={3} />
                </span>

                <div>
                    <strong>BỆNH VIỆN NAM LƯƠNG SƠN</strong>
                    <p>Chăm sóc tận tâm – Sức khỏe vẹn toàn</p>
                </div>
            </div>

            <p>Website đặt lịch khám bệnh trực tuyến.</p>

            <small>© {new Date().getFullYear()} Bệnh viện Nam Lương Sơn</small>
        </footer>
    );
}

export default Footer;
