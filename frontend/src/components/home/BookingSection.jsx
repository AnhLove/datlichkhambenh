import { useState } from 'react';
import { CalendarDays, Search } from 'lucide-react';
import './BookingSection.css';

const departments = [
    { id: 1, name: 'Tim mạch' },
    { id: 2, name: 'Thần kinh' },
    { id: 3, name: 'Răng hàm mặt' },
    { id: 4, name: 'Mắt' },
];

function BookingSection() {
    const [departmentId, setDepartmentId] = useState('');
    const [appointmentDate, setAppointmentDate] = useState('');

    const today = new Date().toLocaleDateString('en-CA');

    function handleSearch(event) {
        event.preventDefault();

        if (!departmentId || !appointmentDate) {
            alert('Vui lòng chọn chuyên khoa và ngày khám.');
            return;
        }

        // Tạm thời kiểm tra dữ liệu.
        // Sau này sẽ chuyển sang trang danh sách bác sĩ và gọi API.
        console.log({
            departmentId,
            appointmentDate,
        });
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

                    <select value={departmentId} onChange={(event) => setDepartmentId(event.target.value)} required>
                        <option value="">Chọn chuyên khoa</option>

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

                <button className="booking-submit" type="submit">
                    <Search size={18} />
                    Tìm bác sĩ
                </button>
            </form>

            <p className="booking-note">Vui lòng chọn đúng chuyên khoa và ngày khám mong muốn.</p>
        </section>
    );
}

export default BookingSection;
