import { useEffect, useState } from 'react';
import { CalendarDays, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getDepartments } from '../../services/departmentService';
import './BookingSection.css';

function BookingSection() {
    const navigate = useNavigate();

    const [departments, setDepartments] = useState([]);
    const [departmentId, setDepartmentId] = useState('');
    const [appointmentDate, setAppointmentDate] = useState('');

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const today = new Date().toLocaleDateString('en-CA');

    useEffect(() => {
        getDepartments()
            .then((data) => {
                setDepartments(data);
            })
            .catch((err) => {
                console.error('Lỗi tải danh sách khoa:', err);
                setError('Không thể tải danh sách chuyên khoa.');
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    function handleSearch(event) {
        event.preventDefault();

        if (!departmentId || !appointmentDate) {
            return;
        }

        navigate(
            `/doctors?departmentId=${encodeURIComponent(departmentId)}&appointmentDate=${encodeURIComponent(appointmentDate)}`
        );
    }

    return (
        <section className="booking-section" id="booking">
            <div className="booking-heading">
                <span className="section-kicker">ĐẶT LỊCH TRỰC TUYẾN</span>
                <h2>Đặt lịch khám bệnh</h2>
                <p>Chọn chuyên khoa và ngày khám để bắt đầu tìm kiếm bác sĩ.</p>
            </div>

            <form className="booking-panel" onSubmit={handleSearch}>
                <label className="booking-field">
                    <span>Chuyên khoa</span>

                    <select
                        value={departmentId}
                        onChange={(event) => setDepartmentId(event.target.value)}
                        required
                        disabled={loading || Boolean(error)}
                    >
                        <option value="">{loading ? 'Đang tải chuyên khoa...' : 'Chọn chuyên khoa'}</option>

                        {departments.map((department) => (
                            <option key={department.id} value={department.id}>
                                {department.name}
                            </option>
                        ))}
                    </select>
                </label>

                <label className="booking-field">
                    <span>Ngày khám dự kiến</span>

                    <div className="booking-date-input">
                        <CalendarDays size={18} aria-hidden="true" />

                        <input
                            type="date"
                            min={today}
                            value={appointmentDate}
                            onChange={(event) => setAppointmentDate(event.target.value)}
                            required
                        />
                    </div>
                </label>

                <button className="booking-submit" type="submit" disabled={loading || Boolean(error)}>
                    <Search size={18} />
                    Tìm bác sĩ
                </button>
            </form>

            {error && <p role="alert">{error}</p>}

            <p className="booking-note">Vui lòng chọn đúng chuyên khoa và ngày khám mong muốn.</p>
        </section>
    );
}

export default BookingSection;
