import { useEffect, useState } from 'react';
import { Search, Stethoscope, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getMedicalServices } from '../services/medicalService';
import './MedicalServicesPage.css';

function formatPrice(price) {
    if (price == null) {
        return 'Liên hệ';
    }

    return `${new Intl.NumberFormat('vi-VN').format(price)} VNĐ`;
}

function MedicalServicesPage() {
    const [services, setServices] = useState([]);
    const [keyword, setKeyword] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let active = true;

        async function fetchServices() {
            setLoading(true);
            setError('');

            try {
                const data = await getMedicalServices(keyword);

                if (active) {
                    // Hỗ trợ trường hợp API trả danh sách trực tiếp
                    // hoặc danh sách nằm trong thuộc tính data.
                    const list = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];

                    setServices(list);
                }
            } catch (err) {
                if (active) {
                    console.error('Lỗi tải danh sách dịch vụ:', err);
                    setError(err.message || 'Không thể tải danh sách dịch vụ y tế.');
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        }

        fetchServices();

        return () => {
            active = false;
        };
    }, [keyword]);

    return (
        <main className="medical-services-page">
            <section className="container medical-services-container">
                <div className="medical-services-heading">
                    <span className="section-kicker">BỆNH VIỆN NAM LƯƠNG SƠN</span>

                    <h1>Danh sách dịch vụ y tế</h1>

                    <p>
                        Tham khảo các dịch vụ khám chữa bệnh, thông tin chuyên khoa và chi phí trước khi lựa chọn lịch
                        khám.
                    </p>
                </div>

                <div className="medical-services-search">
                    <Search size={20} aria-hidden="true" />

                    <input
                        type="search"
                        placeholder="Tìm theo tên dịch vụ..."
                        value={keyword}
                        onChange={(event) => setKeyword(event.target.value)}
                        aria-label="Tìm theo tên dịch vụ"
                    />
                </div>

                {loading && <p className="medical-services-state">Đang tải danh sách dịch vụ...</p>}

                {!loading && error && (
                    <div className="medical-services-state medical-services-error" role="alert">
                        {error}
                    </div>
                )}

                {!loading && !error && services.length === 0 && (
                    <p className="medical-services-state">Chưa tìm thấy dịch vụ phù hợp.</p>
                )}

                {!loading && !error && services.length > 0 && (
                    <div className="medical-services-grid">
                        {services.map((service, index) => (
                            <article
                                className="medical-service-card"
                                key={`${service.departmentName}-${service.name}-${index}`}
                            >
                                <div className="medical-service-icon">
                                    <Stethoscope size={24} aria-hidden="true" />
                                </div>

                                <span className="medical-service-department">
                                    {service.departmentName || 'Chưa phân loại chuyên khoa'}
                                </span>

                                <h2>{service.name}</h2>

                                <p className="medical-service-description">
                                    {service.description || 'Thông tin dịch vụ đang được cập nhật.'}
                                </p>

                                <div className="medical-service-bottom">
                                    <div>
                                        <span className="medical-service-price-label">Chi phí tham khảo</span>

                                        <p className="medical-service-price">{formatPrice(service.price)}</p>
                                    </div>

                                    <Link to="/appointments" className="medical-service-link">
                                        Đặt lịch
                                        <ArrowRight size={16} aria-hidden="true" />
                                    </Link>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
}

export default MedicalServicesPage;
