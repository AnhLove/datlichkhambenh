import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, CalendarDays, CheckCircle2, Clock3, LoaderCircle, Stethoscope, UserRound } from 'lucide-react';

import { apiGet } from '../services/api';
import { getDepartments } from '../services/departmentService';
import { searchDoctors } from '../services/doctorService';
import { getAvailableSlots, createAppointment } from '../services/appointmentService';

import './AppointmentsPage.css';

function getToday() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

function formatDate(value) {
    if (!value) return '';
    const [year, month, day] = value.split('-');
    return `${day}/${month}/${year}`;
}

function AppointmentsPage() {
    const [user, setUser] = useState(null);
    const [isAuthLoading, setIsAuthLoading] = useState(true);

    const [searchParams] = useSearchParams();
    const initialDoctorUuid = searchParams.get('doctorUuid') || '';

    const [departments, setDepartments] = useState([]);
    const [allDoctors, setAllDoctors] = useState([]);
    const [slots, setSlots] = useState([]);

    const [departmentId, setDepartmentId] = useState('');
    const [doctorUuid, setDoctorUuid] = useState(initialDoctorUuid);
    const [appointmentDate, setAppointmentDate] = useState('');
    const [timeSlot, setTimeSlot] = useState('');
    const [reason, setReason] = useState('');

    const [loadingDepartments, setLoadingDepartments] = useState(true);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [slotReloadCount, setSlotReloadCount] = useState(0);

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const today = getToday();

    const selectedDepartment = useMemo(
        () => departments.find((department) => String(department.id) === departmentId),
        [departments, departmentId]
    );

    const doctors = useMemo(() => {
        if (!selectedDepartment) {
            return [];
        }

        return allDoctors.filter((doctor) => doctor.departmentName === selectedDepartment.name);
    }, [allDoctors, selectedDepartment]);

    const selectedDoctor = useMemo(() => doctors.find((doctor) => doctor.uuid === doctorUuid), [doctors, doctorUuid]);

    useEffect(() => {
        let cancelled = false;

        async function checkAuth() {
            try {
                const currentUser = await apiGet('/me');
                if (!cancelled) setUser(currentUser);
            } catch {
                if (!cancelled) setUser(null);
            } finally {
                if (!cancelled) setIsAuthLoading(false);
            }
        }

        checkAuth();

        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        let cancelled = false;

        async function loadInitialData() {
            setLoadingDepartments(true);
            setError('');

            try {
                const [departmentData, doctorData] = await Promise.all([getDepartments(), searchDoctors('', '')]);

                if (cancelled) return;

                const departmentList = Array.isArray(departmentData) ? departmentData : [];

                const doctorList = Array.isArray(doctorData) ? doctorData : [];

                setDepartments(departmentList);
                setAllDoctors(doctorList);

                if (initialDoctorUuid) {
                    const doctor = doctorList.find((item) => item.uuid === initialDoctorUuid);

                    if (!doctor) {
                        setError('Không tìm thấy bác sĩ đã chọn. Vui lòng chọn lại.');
                        setDoctorUuid('');
                        return;
                    }

                    const department = departmentList.find((item) => item.name === doctor.departmentName);

                    if (!department) {
                        setError('Không tìm thấy chuyên khoa của bác sĩ đã chọn.');
                        setDoctorUuid('');
                        return;
                    }

                    setDepartmentId(String(department.id));
                }
            } catch (err) {
                if (cancelled) return;

                console.error('Lỗi tải dữ liệu đặt lịch:', err);
                setError(err.message || 'Không thể tải dữ liệu đặt lịch. Vui lòng thử lại.');
            } finally {
                if (!cancelled) {
                    setLoadingDepartments(false);
                }
            }
        }

        loadInitialData();

        return () => {
            cancelled = true;
        };
    }, [initialDoctorUuid]);

    // Tải khung giờ theo bác sĩ và ngày đã chọn.
    useEffect(() => {
        if (!doctorUuid || !appointmentDate) {
            return undefined;
        }

        let cancelled = false;

        async function loadSlots() {
            setLoadingSlots(true);

            try {
                const data = await getAvailableSlots(doctorUuid, appointmentDate);

                if (cancelled) return;

                const availableSlots = Array.isArray(data) ? data : [];

                setSlots(availableSlots);

                setTimeSlot((currentSlot) =>
                    availableSlots.some((slot) => slot.timeSlot === currentSlot) ? currentSlot : ''
                );
            } catch (err) {
                if (cancelled) return;

                console.error('Lỗi tải khung giờ:', err);

                setSlots([]);
                setTimeSlot('');
                setError(err.message || 'Không thể tải khung giờ. Vui lòng thử lại.');
            } finally {
                if (!cancelled) {
                    setLoadingSlots(false);
                }
            }
        }

        loadSlots();

        return () => {
            cancelled = true;
        };
    }, [doctorUuid, appointmentDate, slotReloadCount]);

    function handleDepartmentChange(event) {
        setDepartmentId(event.target.value);
        setDoctorUuid('');
        setAppointmentDate('');
        setTimeSlot('');
        setSlots([]);
        setLoadingSlots(false);
        setError('');
        setSuccess('');
    }

    function handleDoctorChange(event) {
        setDoctorUuid(event.target.value);
        setAppointmentDate('');
        setTimeSlot('');
        setSlots([]);
        setLoadingSlots(false);
        setError('');
        setSuccess('');
    }

    function handleDateChange(event) {
        setAppointmentDate(event.target.value);
        setTimeSlot('');
        setSlots([]);
        setLoadingSlots(false);
        setError('');
        setSuccess('');
    }

    async function handleSubmit(event) {
        event.preventDefault();

        if (submitting) return;

        setError('');
        setSuccess('');

        if (!departmentId || !doctorUuid || !appointmentDate || !timeSlot) {
            setError('Vui lòng chọn đầy đủ chuyên khoa, bác sĩ, ngày và giờ khám.');
            return;
        }

        if (appointmentDate < getToday()) {
            setError('Ngày khám không được ở trong quá khứ.');
            return;
        }

        if (!selectedDoctor || !selectedDepartment) {
            setError('Thông tin bác sĩ hoặc chuyên khoa không hợp lệ. Vui lòng chọn lại.');
            return;
        }

        if (loadingSlots) {
            setError('Vui lòng chờ kiểm tra khung giờ.');
            return;
        }

        const slotIsAvailable = slots.some((slot) => slot.timeSlot === timeSlot);

        if (!slotIsAvailable) {
            setError('Khung giờ đã chọn không còn khả dụng. Vui lòng chọn lại.');
            setTimeSlot('');
            setSlotReloadCount((count) => count + 1);
            return;
        }

        setSubmitting(true);

        try {
            const response = await createAppointment({
                doctorUuid,
                departmentId: Number(departmentId),
                appointmentDate,
                timeSlot,
                reason: reason.trim(),
            });

            setSuccess(response?.message || 'Đặt lịch khám thành công!');

            setTimeSlot('');
            setReason('');
            setSlotReloadCount((count) => count + 1);
        } catch (err) {
            console.error('Lỗi đặt lịch khám:', err);

            setError(err.message || 'Không thể đặt lịch. Vui lòng thử lại.');

            setSlotReloadCount((count) => count + 1);
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <main className="appointments-page">
            <section className="container appointments-container">
                <Link to="/doctors" className="appointments-back">
                    <ArrowLeft size={17} />
                    Quay lại danh sách bác sĩ
                </Link>

                <header className="appointments-heading">
                    <span className="section-kicker">BỆNH VIỆN NAM LƯƠNG SƠN</span>

                    <h1>Đặt lịch khám bệnh</h1>

                    <p>Chọn chuyên khoa, bác sĩ và thời gian phù hợp để đăng ký lịch khám.</p>
                </header>

                <div className="appointments-layout">
                    <form className="appointment-form" onSubmit={handleSubmit}>
                        <section className="appointment-form-section">
                            <div className="appointment-section-heading">
                                <span className="appointment-step">1</span>

                                <div>
                                    <h2>Thông tin khám</h2>
                                    <p>Chọn khoa và bác sĩ bạn muốn khám.</p>
                                </div>
                            </div>

                            <label className="appointment-field">
                                <span>
                                    Chuyên khoa <b>*</b>
                                </span>

                                <select
                                    value={departmentId}
                                    onChange={handleDepartmentChange}
                                    disabled={loadingDepartments || submitting}
                                    required
                                >
                                    <option value="">
                                        {loadingDepartments ? 'Đang tải chuyên khoa...' : 'Chọn chuyên khoa'}
                                    </option>

                                    {departments.map((department) => (
                                        <option key={department.id} value={String(department.id)}>
                                            {department.name}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label className="appointment-field">
                                <span>
                                    Bác sĩ <b>*</b>
                                </span>

                                <select
                                    value={doctorUuid}
                                    onChange={handleDoctorChange}
                                    disabled={!departmentId || loadingDepartments || submitting}
                                    required
                                >
                                    <option value="">
                                        {!departmentId ? 'Vui lòng chọn chuyên khoa trước' : 'Chọn bác sĩ'}
                                    </option>

                                    {doctors.map((doctor) => (
                                        <option key={doctor.uuid} value={doctor.uuid}>
                                            {doctor.fullName}
                                        </option>
                                    ))}
                                </select>

                                {departmentId && !loadingDepartments && doctors.length === 0 && (
                                    <small>Chuyên khoa này hiện chưa có bác sĩ trong danh sách.</small>
                                )}
                            </label>
                        </section>

                        <section className="appointment-form-section">
                            <div className="appointment-section-heading">
                                <span className="appointment-step">2</span>

                                <div>
                                    <h2>Ngày và giờ khám</h2>
                                    <p>Khung giờ được tải từ lịch làm việc của bác sĩ.</p>
                                </div>
                            </div>

                            <label className="appointment-field">
                                <span>
                                    Ngày khám <b>*</b>
                                </span>

                                <div className="appointment-date-input">
                                    <CalendarDays size={19} aria-hidden="true" />

                                    <input
                                        type="date"
                                        value={appointmentDate}
                                        min={today}
                                        disabled={!doctorUuid || submitting}
                                        onChange={handleDateChange}
                                        required
                                    />
                                </div>
                            </label>

                            <div className="appointment-field">
                                <span>
                                    Khung giờ <b>*</b>
                                </span>

                                {!doctorUuid || !appointmentDate ? (
                                    <p className="appointment-hint">Vui lòng chọn bác sĩ và ngày khám trước.</p>
                                ) : loadingSlots ? (
                                    <p className="appointment-hint" role="status">
                                        <LoaderCircle size={17} className="appointment-spinner" />
                                        Đang kiểm tra giờ trống...
                                    </p>
                                ) : slots.length === 0 ? (
                                    <p className="appointment-hint">
                                        Không có khung giờ trống trong ngày đã chọn. Vui lòng chọn ngày khác.
                                    </p>
                                ) : (
                                    <div className="appointment-slots">
                                        {slots.map((slot) => (
                                            <button
                                                key={slot.timeSlot}
                                                type="button"
                                                className={
                                                    timeSlot === slot.timeSlot
                                                        ? 'appointment-slot selected'
                                                        : 'appointment-slot'
                                                }
                                                aria-pressed={timeSlot === slot.timeSlot}
                                                disabled={submitting}
                                                onClick={() => {
                                                    setTimeSlot(slot.timeSlot);
                                                    setError('');
                                                    setSuccess('');
                                                }}
                                            >
                                                <Clock3 size={16} />
                                                {slot.timeSlot}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </section>

                        <section className="appointment-form-section">
                            <div className="appointment-section-heading">
                                <span className="appointment-step">3</span>

                                <div>
                                    <h2>Lý do khám</h2>
                                    <p>Mô tả ngắn gọn nhu cầu khám của bạn.</p>
                                </div>
                            </div>

                            <label className="appointment-field">
                                <span>Lý do khám</span>

                                <textarea
                                    value={reason}
                                    onChange={(event) => {
                                        setReason(event.target.value);
                                        setError('');
                                    }}
                                    maxLength={500}
                                    rows={4}
                                    disabled={submitting}
                                    placeholder="Ví dụ: Khám định kỳ, tư vấn sức khỏe..."
                                />

                                <small>{reason.length}/500 ký tự</small>
                            </label>
                        </section>

                        {error && (
                            <div className="appointment-feedback error" role="alert">
                                {error}

                                {error.includes('401') || error.includes('403') ? (
                                    <Link to="/login">Đến trang đăng nhập</Link>
                                ) : null}
                            </div>
                        )}

                        {success && (
                            <div className="appointment-feedback success" role="status">
                                <CheckCircle2 size={19} />
                                {success}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="appointment-submit"
                            disabled={loadingDepartments || loadingSlots || submitting}
                        >
                            {submitting ? (
                                <>
                                    <LoaderCircle size={18} className="appointment-spinner" />
                                    Đang đặt lịch...
                                </>
                            ) : (
                                'Xác nhận đặt lịch'
                            )}
                        </button>

                        <p className="appointment-disclaimer">* Các thông tin có dấu sao là bắt buộc.</p>
                    </form>

                    <aside className="booking-summary">
                        <div className="booking-summary-icon">
                            <Stethoscope size={25} />
                        </div>

                        <h2 className="booking-summary-title">Thông tin lịch khám</h2>
                        <p className="booking-summary-desc">Kiểm tra lại lựa chọn của bạn trước khi tiếp tục.</p>

                        <dl className="booking-summary-list">
                            <div className="booking-summary-row">
                                <dt>Chuyên khoa</dt>
                                <dd className={selectedDepartment ? '' : 'is-empty'}>
                                    {selectedDepartment?.name || 'Chưa chọn'}
                                </dd>
                            </div>

                            <div className="booking-summary-row">
                                <dt>Bác sĩ</dt>
                                <dd className={selectedDoctor ? '' : 'is-empty'}>
                                    {selectedDoctor?.fullName || 'Chưa chọn'}
                                </dd>
                            </div>

                            <div className="booking-summary-row">
                                <dt>Ngày khám</dt>
                                <dd className={appointmentDate ? '' : 'is-empty'}>
                                    {appointmentDate ? formatDate(appointmentDate) : 'Chưa chọn'}
                                </dd>
                            </div>

                            <div className="booking-summary-row">
                                <dt>Giờ khám</dt>
                                <dd className={timeSlot ? '' : 'is-empty'}>{timeSlot || 'Chưa chọn'}</dd>
                            </div>

                            {selectedDoctor?.yearsExperience != null && (
                                <div className="booking-summary-row">
                                    <dt>Kinh nghiệm</dt>
                                    <dd>{selectedDoctor.yearsExperience} năm</dd>
                                </div>
                            )}
                        </dl>

                        {!isAuthLoading && !user && (
                            <div className="booking-summary-note">
                                <UserRound size={19} />
                                <p>
                                    Bạn cần <Link to="/login">đăng nhập</Link> bằng tài khoản bệnh nhân để đặt lịch.
                                </p>
                            </div>
                        )}
                    </aside>
                </div>
            </section>
        </main>
    );
}

export default AppointmentsPage;
