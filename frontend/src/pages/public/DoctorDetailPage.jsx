import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, BadgeCheck, UserRound } from 'lucide-react';

import LocalImage from '../../components/common/LocalImage';
import { getAvailableSlots } from '../../services/appointmentService';
import { searchDoctors } from '../../services/doctorService';
import { unwrapList } from '../../utils/unwrap';

import './DoctorDetailPage.css';

const WEEKDAYS = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
const DAYS_AHEAD = 7;

function toDateString(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function buildDays() {
    const today = new Date();

    return Array.from({ length: DAYS_AHEAD }, (_, index) => {
        const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() + index);
        const label = `${WEEKDAYS[date.getDay()]}, ${String(date.getDate()).padStart(2, '0')}-${String(
            date.getMonth() + 1
        ).padStart(2, '0')}`;

        return { value: toDateString(date), label };
    });
}

function groupSlots(slots) {
    const groups = { morning: [], afternoon: [], other: [] };

    slots.forEach((slot) => {
        const hour = Number.parseInt(String(slot.timeSlot).slice(0, 2), 10);

        if (Number.isNaN(hour)) groups.other.push(slot);
        else if (hour < 12) groups.morning.push(slot);
        else groups.afternoon.push(slot);
    });

    return [
        { key: 'morning', label: 'Buổi sáng', items: groups.morning },
        { key: 'afternoon', label: 'Buổi chiều', items: groups.afternoon },
        { key: 'other', label: 'Khung giờ', items: groups.other },
    ].filter((group) => group.items.length > 0);
}

function DoctorDetailPage() {
    const { uuid } = useParams();
    const days = useMemo(() => buildDays(), []);

    const [data, setData] = useState(null);
    const [error, setError] = useState('');
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedSlot, setSelectedSlot] = useState('');

    useEffect(() => {
        let cancelled = false;

        async function loadData() {
            try {
                const [doctorResponse, ...slotResponses] = await Promise.all([
                    searchDoctors('', ''),
                    ...days.map((day) => getAvailableSlots(uuid, day.value).catch(() => [])),
                ]);

                if (cancelled) return;

                const doctor = unwrapList(doctorResponse).find((item) => item.uuid === uuid) || null;
                const slotsByDate = {};

                days.forEach((day, index) => {
                    slotsByDate[day.value] = unwrapList(slotResponses[index]);
                });

                setData({ uuid, doctor, slotsByDate });
                setError('');
            } catch (err) {
                if (cancelled) return;
                setError(err?.message || 'Không thể tải thông tin bác sĩ.');
            }
        }

        loadData();

        return () => {
            cancelled = true;
        };
    }, [uuid, days]);

    const isLoading = !error && (!data || data.uuid !== uuid);
    const doctor = data?.uuid === uuid ? data.doctor : null;
    const slotsByDate = data?.uuid === uuid ? data.slotsByDate : {};

    const firstDayWithSlots = days.find((day) => (slotsByDate[day.value] || []).length > 0);
    const activeDate = selectedDate ?? firstDayWithSlots?.value ?? days[0].value;
    const groups = groupSlots(slotsByDate[activeDate] || []);

    const bookingParams = new URLSearchParams({ doctorUuid: uuid, date: activeDate });
    if (selectedSlot) bookingParams.set('slot', selectedSlot);

    const handleSelectDate = (value) => {
        setSelectedDate(value);
        setSelectedSlot('');
    };

    return (
        <main className="doctor-detail-page">
            <Link to="/doctors" className="doctor-detail-back">
                <ArrowLeft size={17} />
                Quay lại danh sách bác sĩ
            </Link>

            {isLoading ? (
                <p className="doctor-detail-state" role="status">
                    Đang tải thông tin bác sĩ...
                </p>
            ) : error ? (
                <p className="doctor-detail-state" role="alert">
                    {error}
                </p>
            ) : !doctor ? (
                <p className="doctor-detail-state">Không tìm thấy bác sĩ này.</p>
            ) : (
                <>
                    <section className="doctor-detail-card doctor-detail-hero">
                        <div className="doctor-detail-avatar">
                            <LocalImage
                                folder="doctors"
                                name={doctor.fullName}
                                alt={doctor.fullName}
                                fallback={<UserRound size={72} strokeWidth={1.5} />}
                            />
                        </div>

                        <div className="doctor-detail-info">
                            <h1 className="doctor-detail-name">{doctor.fullName}</h1>

                            <div className="doctor-detail-meta">
                                <span className="doctor-detail-badge">
                                    <BadgeCheck size={19} />
                                    Bác sĩ
                                </span>
                                {doctor.yearsExperience != null && (
                                    <span>{doctor.yearsExperience} năm kinh nghiệm</span>
                                )}
                            </div>

                            <dl className="doctor-detail-rows">
                                <dt>Chuyên khoa</dt>
                                <dd>{doctor.departmentName || '—'}</dd>
                                <dt>Nơi công tác</dt>
                                <dd>Bệnh viện Nam Lương Sơn</dd>
                            </dl>
                        </div>
                    </section>

                    <section className="doctor-detail-card">
                        <h2>Giới thiệu</h2>
                        <p className="doctor-detail-text">
                            {doctor.bio ||
                                `Bác sĩ chuyên khoa ${doctor.departmentName || ''} tại Bệnh viện Nam Lương Sơn.`}
                        </p>
                    </section>

                    <section className="doctor-detail-card">
                        <h2>Đặt khám nhanh</h2>

                        <div className="doctor-detail-days" role="tablist" aria-label="Chọn ngày khám">
                            {days.map((day) => {
                                const count = (slotsByDate[day.value] || []).length;
                                const isActive = day.value === activeDate;

                                return (
                                    <button
                                        key={day.value}
                                        type="button"
                                        role="tab"
                                        aria-selected={isActive}
                                        className={`doctor-detail-day ${isActive ? 'doctor-detail-day-active' : ''} ${
                                            count === 0 ? 'doctor-detail-day-empty' : ''
                                        }`}
                                        onClick={() => handleSelectDate(day.value)}
                                    >
                                        <strong>{day.label}</strong>
                                        <span>{count > 0 ? `${count} khung giờ` : 'Hết lịch'}</span>
                                    </button>
                                );
                            })}
                        </div>

                        {groups.length === 0 ? (
                            <p className="doctor-detail-empty">Ngày này chưa có khung giờ trống. Hãy chọn ngày khác.</p>
                        ) : (
                            groups.map((group) => (
                                <div className="doctor-detail-group" key={group.key}>
                                    <h3>{group.label}</h3>

                                    <div className="doctor-detail-slots">
                                        {group.items.map((slot) => (
                                            <button
                                                key={slot.timeSlot}
                                                type="button"
                                                aria-pressed={selectedSlot === slot.timeSlot}
                                                className={`doctor-detail-slot ${
                                                    selectedSlot === slot.timeSlot ? 'doctor-detail-slot-selected' : ''
                                                }`}
                                                onClick={() => setSelectedSlot(slot.timeSlot)}
                                            >
                                                {slot.timeSlot}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))
                        )}

                        <div className="doctor-detail-cta-bar">
                            <p className="doctor-detail-note">
                                Cần đăng nhập bằng tài khoản bệnh nhân để hoàn tất đặt lịch.
                            </p>

                            <Link to={`/appointments?${bookingParams.toString()}`} className="doctor-detail-cta">
                                ĐẶT KHÁM NGAY
                            </Link>
                        </div>
                    </section>
                </>
            )}
        </main>
    );
}

export default DoctorDetailPage;
