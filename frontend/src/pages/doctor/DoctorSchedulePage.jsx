import { useEffect, useMemo, useRef, useState } from 'react';
import { Clock3, CalendarDays, RefreshCw, AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { apiGet } from '../../services/api';
import { getWorkingHoursByDoctorUuid, saveMyWorkingHour } from '../../services/workingHourService';
import { unwrapData, unwrapList } from '../../utils/unwrap';
import '../../styles/staff-portal.css';
import './DoctorSchedulePage.css';

const DAYS = [
    { value: 1, label: 'Thứ 2' },
    { value: 2, label: 'Thứ 3' },
    { value: 3, label: 'Thứ 4' },
    { value: 4, label: 'Thứ 5' },
    { value: 5, label: 'Thứ 6' },
    { value: 6, label: 'Thứ 7' },
    { value: 7, label: 'Chủ nhật' },
];

const SHIFTS = [
    { value: 1, label: 'Cả ngày' },
    { value: 2, label: 'Buổi sáng' },
    { value: 3, label: 'Buổi chiều' },
    { value: 4, label: 'Nghỉ' },
];

const SCHEDULE_STATUS = {
    1: { label: 'Chờ duyệt', className: 'pending' },
    2: { label: 'Đã duyệt', className: 'confirmed' },
    3: { label: 'Từ chối', className: 'cancelled' },
};

function getShiftLabel(value) {
    return SHIFTS.find((shift) => shift.value === Number(value))?.label || '—';
}

function DoctorSchedulePage() {
    const [items, setItems] = useState([]);
    const [drafts, setDrafts] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [reloadKey, setReloadKey] = useState(0);
    const [savingDay, setSavingDay] = useState(null);
    const [actionError, setActionError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    // uuid của bác sĩ lấy từ /me một lần, dùng cho các lần tải lại sau
    const doctorUuidRef = useRef(null);

    useEffect(() => {
        let cancelled = false;

        async function loadSchedule() {
            try {
                if (!doctorUuidRef.current) {
                    const me = unwrapData(await apiGet('/me'));
                    doctorUuidRef.current = me?.uuid ?? null;
                }

                if (!doctorUuidRef.current) {
                    throw new Error('Không xác định được tài khoản bác sĩ. Vui lòng đăng nhập lại.');
                }

                const response = await getWorkingHoursByDoctorUuid(doctorUuidRef.current);
                if (cancelled) return;
                setItems(unwrapList(response));
                setError('');
            } catch (err) {
                if (cancelled) return;
                setError(err?.message || 'Không thể tải lịch làm việc.');
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        }

        loadSchedule();

        return () => {
            cancelled = true;
        };
    }, [reloadKey]);

    const itemByDay = useMemo(() => {
        const map = new Map();
        items.forEach((item) => map.set(Number(item.dayOfWeek), item));
        return map;
    }, [items]);

    const pendingCount = items.filter((item) => Number(item.status) === 1).length;
    const rejectedCount = items.filter((item) => Number(item.status) === 3).length;

    const handleReload = () => {
        setIsLoading(true);
        setError('');
        setReloadKey((key) => key + 1);
    };

    const handleSelectChange = (day, value) => {
        setDrafts((current) => ({ ...current, [day]: value }));
    };

    const handleSave = async (day) => {
        const currentItem = itemByDay.get(day.value);
        const selected = drafts[day.value] ?? (currentItem ? String(currentItem.shiftType) : '');

        if (!selected) {
            setActionError('Vui lòng chọn ca làm việc.');
            return;
        }

        try {
            setSavingDay(day.value);
            setActionError('');
            setSuccessMessage('');

            const response = await saveMyWorkingHour(day.value, Number(selected));

            setSuccessMessage(response?.message || `Đã gửi lịch làm việc ${day.label}, vui lòng chờ quản trị duyệt.`);
            setDrafts((current) => {
                const next = { ...current };
                delete next[day.value];
                return next;
            });
            setIsLoading(true);
            setReloadKey((key) => key + 1);
        } catch (err) {
            setActionError(err?.message || 'Không thể lưu lịch làm việc.');
        } finally {
            setSavingDay(null);
        }
    };

    return (
        <main className="doctor-appointments-page">
            <section className="doctor-page-hero">
                <div>
                    <span className="doctor-page-eyebrow">
                        <Clock3 size={16} />
                        KHU VỰC BÁC SĨ
                    </span>
                    <h1>Lịch làm việc của tôi</h1>
                    <p>Đăng ký ca làm việc theo từng thứ trong tuần và theo dõi trạng thái duyệt.</p>
                </div>
                <Clock3 className="doctor-page-hero-icon" size={64} strokeWidth={1.3} />
            </section>

            <section className="doctor-summary-grid">
                <article className="doctor-summary-card">
                    <span className="doctor-summary-icon">
                        <CalendarDays size={21} />
                    </span>
                    <div>
                        <p>Ngày đã đăng ký</p>
                        <strong>{items.length}/7</strong>
                    </div>
                </article>
                <article className="doctor-summary-card">
                    <span className="doctor-summary-icon">
                        <Clock3 size={21} />
                    </span>
                    <div>
                        <p>Đang chờ duyệt</p>
                        <strong>{pendingCount}</strong>
                    </div>
                </article>
                <article className="doctor-summary-card">
                    <span className="doctor-summary-icon">
                        <AlertCircle size={21} />
                    </span>
                    <div>
                        <p>Bị từ chối</p>
                        <strong>{rejectedCount}</strong>
                    </div>
                </article>
            </section>

            {successMessage && (
                <p className="doctor-feedback doctor-feedback-success" role="status">
                    <CheckCircle2 size={18} /> {successMessage}
                </p>
            )}
            {actionError && (
                <p className="doctor-feedback doctor-feedback-error" role="alert">
                    <AlertCircle size={18} /> {actionError}
                </p>
            )}

            <section className="doctor-panel">
                <div className="doctor-panel-heading">
                    <div>
                        <h2>Ca làm việc trong tuần</h2>
                        <p>Mỗi thứ trong tuần có một ca, áp dụng cho mọi tuần.</p>
                    </div>
                    <button
                        type="button"
                        className="doctor-secondary-button"
                        onClick={handleReload}
                        disabled={isLoading}
                    >
                        <RefreshCw size={16} className={isLoading ? 'doctor-spin' : ''} />
                        Làm mới
                    </button>
                </div>

                <p className="doctor-schedule-note">
                    <Info size={17} />
                    <span>
                        Khi đổi ca, ngày đó chuyển về &quot;Chờ duyệt&quot; và bệnh nhân chưa đặt thêm được cho đến khi
                        quản trị duyệt. Không thể đổi nếu còn lịch hẹn chưa khám nằm ngoài ca mới.
                    </span>
                </p>

                {isLoading ? (
                    <div className="doctor-state" role="status">
                        <span className="doctor-spinner" />
                        <h3>Đang tải lịch làm việc</h3>
                        <p>Vui lòng đợi trong giây lát.</p>
                    </div>
                ) : error ? (
                    <div className="doctor-state doctor-state-error">
                        <AlertCircle size={30} />
                        <h3>Không thể tải lịch làm việc</h3>
                        <p>{error}</p>
                        <button type="button" className="doctor-primary-button" onClick={handleReload}>
                            Thử lại
                        </button>
                    </div>
                ) : (
                    <div className="doctor-schedule-list">
                        {DAYS.map((day) => {
                            const item = itemByDay.get(day.value);
                            const status = item ? SCHEDULE_STATUS[Number(item.status)] : null;
                            const currentShift = item ? String(item.shiftType) : '';
                            const selected = drafts[day.value] ?? currentShift;
                            const isRejected = Number(item?.status) === 3;
                            const canSave = selected !== '' && (selected !== currentShift || isRejected);
                            const isSaving = savingDay === day.value;

                            return (
                                <article className="doctor-schedule-row" key={day.value}>
                                    <div className="doctor-schedule-day">
                                        <strong>{day.label}</strong>
                                        <span
                                            className={`doctor-status doctor-status-${status ? status.className : 'unknown'}`}
                                        >
                                            {status ? status.label : 'Chưa đăng ký'}
                                        </span>
                                    </div>

                                    <div className="doctor-schedule-current">
                                        <small>Ca hiện tại</small>
                                        <strong>{item ? getShiftLabel(item.shiftType) : 'Chưa có'}</strong>
                                    </div>

                                    <label className="doctor-schedule-select">
                                        <span>Ca muốn đăng ký</span>
                                        <select
                                            value={selected}
                                            onChange={(event) => handleSelectChange(day.value, event.target.value)}
                                            disabled={savingDay !== null}
                                        >
                                            <option value="">Chọn ca...</option>
                                            {SHIFTS.map((shift) => (
                                                <option key={shift.value} value={shift.value}>
                                                    {shift.label}
                                                </option>
                                            ))}
                                        </select>
                                    </label>

                                    <button
                                        type="button"
                                        className="doctor-primary-button"
                                        onClick={() => handleSave(day)}
                                        disabled={!canSave || savingDay !== null}
                                    >
                                        {isSaving
                                            ? 'Đang gửi...'
                                            : isRejected
                                              ? 'Gửi lại'
                                              : item
                                                ? 'Cập nhật'
                                                : 'Đăng ký'}
                                    </button>
                                </article>
                            );
                        })}
                    </div>
                )}
            </section>
        </main>
    );
}

export default DoctorSchedulePage;
