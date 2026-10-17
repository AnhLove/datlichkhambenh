import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, CalendarDays, CheckCircle2, Clock3, LoaderCircle, Stethoscope, UserRound } from 'lucide-react';

import { getDepartments } from '../services/departmentService';
import { searchDoctors } from '../services/doctorService';
import { getAvailableSlots } from '../services/appointmentService';

import './AppointmentsPage.css';

function getToday() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

function AppointmentsPage() {
    const [searchParams] = useSearchParams();

    const initialDoctorUuid = searchParams.get('doctorUuid') || '';

    // Dữ liệu lấy từ API
    const [departments, setDepartments] = useState([]);
    const [allDoctors, setAllDoctors] = useState([]);
    const [slots, setSlots] = useState([]);

    // Dữ liệu người dùng lựa chọn
    const [departmentId, setDepartmentId] = useState('');
    const [doctorUuid, setDoctorUuid] = useState(initialDoctorUuid);
    const [appointmentDate, setAppointmentDate] = useState('');
    const [timeSlot, setTimeSlot] = useState('');
    const [reason, setReason] = useState('');

    // Trạng thái giao diện
    const [loadingDepartments, setLoadingDepartments] = useState(true);
    const [loadingDoctors, setLoadingDoctors] = useState(false);
    const [loadingSlots, setLoadingSlots] = useState(false);

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const today = getToday();

    // Tính từ state hiện tại, không tạo state trùng lặp.
    const selectedDepartment = useMemo(
        () => departments.find((department) => String(department.id) === departmentId),
        [departments, departmentId]
    );

    const doctors = useMemo(() => {
        if (!selectedDepartment) {
            return allDoctors;
        }

        return allDoctors.filter((doctor) => doctor.departmentName === selectedDepartment.name);
    }, [allDoctors, selectedDepartment]);

    const selectedDoctor = useMemo(() => doctors.find((doctor) => doctor.uuid === doctorUuid), [doctors, doctorUuid]);

    // Tải khoa và danh sách bác sĩ khi mở trang.
    useEffect(() => {
        let cancelled = false;

        async function loadInitialData() {
            try {
                const [departmentData, doctorData] = await Promise.all([getDepartments(), searchDoctors('', '')]);

                if (cancelled) return;

                const departmentList = Array.isArray(departmentData) ? departmentData : [];

                const doctorList = Array.isArray(doctorData) ? doctorData : [];

                setDepartments(departmentList);
                setAllDoctors(doctorList);

                // Nếu người dùng đi từ trang bác sĩ sang,
                // tự chọn khoa tương ứng với bác sĩ trên URL.
                if (initialDoctorUuid) {
                    const doctor = doctorList.find((item) => item.uuid === initialDoctorUuid);

                    if (doctor) {
                        const department = departmentList.find((item) => item.name === doctor.departmentName);

                        if (department) {
                            setDepartmentId(String(department.id));
                        } else {
                            setError('Không tìm thấy chuyên khoa của bác sĩ đã chọn.');
                        }
                    } else {
                        setError('Không tìm thấy bác sĩ được chọn. Vui lòng chọn lại.');
                        setDoctorUuid('');
                    }
                }
            } catch (err) {
                if (cancelled) return;

                console.error('Lỗi tải dữ liệu đặt lịch:', err);
                setError('Không thể tải dữ liệu đặt lịch. Vui lòng thử tải lại trang.');
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

    useEffect(() => {
        if (!doctorUuid || !appointmentDate) {
            return undefined;
        }

        let cancelled = false;

        async function loadSlots() {
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
                setError('Không thể tải khung giờ. Vui lòng thử chọn lại ngày khám.');
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
    }, [doctorUuid, appointmentDate]);

    function handleDepartmentChange(event) {
        const nextDepartmentId = event.target.value;

        setDepartmentId(nextDepartmentId);
        setDoctorUuid('');
        setAppointmentDate('');
        setTimeSlot('');
        setSlots([]);
        setLoadingDoctors(false);
        setLoadingSlots(false);
        setError('');
        setSuccess('');
    }

    function handleDoctorChange(event) {
        const nextDoctorUuid = event.target.value;

        setDoctorUuid(nextDoctorUuid);
        setAppointmentDate('');
        setTimeSlot('');
        setSlots([]);
        setLoadingSlots(false);
        setError('');
        setSuccess('');
    }

    function handleDateChange(event) {
        const nextDate = event.target.value;

        setAppointmentDate(nextDate);
        setTimeSlot('');
        setSlots([]);
        setError('');
        setSuccess('');

        setLoadingSlots(Boolean(doctorUuid && nextDate));
    }

    function handleSubmit(event) {
        event.preventDefault();

        setError('');
        setSuccess('');

        if (!departmentId || !doctorUuid || !appointmentDate || !timeSlot) {
            setError('Vui lòng chọn đầy đủ khoa, bác sĩ, ngày và giờ khám.');
            return;
        }

        if (appointmentDate < today) {
            setError('Ngày khám không được ở trong quá khứ.');
            return;
        }

        if (!slots.some((slot) => slot.timeSlot === timeSlot)) {
            setError('Khung giờ này không còn trong danh sách giờ trống. Vui lòng chọn lại.');
            return;
        }

        // Chưa gửi yêu cầu đặt lịch khi chưa tích hợp đăng nhập.
        setError(
            'Giao diện đăng nhập chưa được tích hợp. Vui lòng đăng nhập bằng tài khoản bệnh nhân trước khi xác nhận đặt lịch.'
        );
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
                        {/* Phần 1: Chọn khoa và bác sĩ */}
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
                                    disabled={loadingDepartments}
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
                                    disabled={!departmentId || loadingDepartments || loadingDoctors}
                                    required
                                >
                                    <option value="">
                                        {!departmentId
                                            ? 'Vui lòng chọn chuyên khoa trước'
                                            : loadingDoctors
                                              ? 'Đang tải bác sĩ...'
                                              : 'Chọn bác sĩ'}
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

                        {/* Phần 2: Chọn ngày và giờ */}
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
                                        disabled={!doctorUuid}
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

                        {/* Phần 3: Lý do khám */}
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
                                    placeholder="Ví dụ: Khám định kỳ, tư vấn sức khỏe..."
                                />

                                <small>{reason.length}/500 ký tự</small>
                            </label>
                        </section>

                        {error && (
                            <div className="appointment-feedback error" role="alert">
                                {error}
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
                            disabled={loadingDepartments || loadingDoctors || loadingSlots}
                        >
                            Tiếp tục đặt lịch
                        </button>

                        <p className="appointment-disclaimer">* Các thông tin có dấu sao là bắt buộc.</p>
                    </form>

                    {/* Khung tóm tắt */}
                    <aside className="appointment-summary">
                        <div className="appointment-summary-icon">
                            <Stethoscope size={25} />
                        </div>

                        <h2>Thông tin lịch khám</h2>

                        <p className="appointment-summary-description">
                            Kiểm tra lại lựa chọn của bạn trước khi tiếp tục.
                        </p>

                        <div className="appointment-summary-item">
                            <span>Chuyên khoa</span>
                            <strong>{selectedDepartment?.name || 'Chưa chọn chuyên khoa'}</strong>
                        </div>

                        <div className="appointment-summary-item">
                            <span>Bác sĩ</span>
                            <strong>{selectedDoctor?.fullName || 'Chưa chọn bác sĩ'}</strong>
                        </div>

                        <div className="appointment-summary-item">
                            <span>Ngày khám</span>
                            <strong>{appointmentDate || 'Chưa chọn ngày'}</strong>
                        </div>

                        <div className="appointment-summary-item">
                            <span>Giờ khám</span>
                            <strong>{timeSlot || 'Chưa chọn khung giờ'}</strong>
                        </div>

                        {selectedDoctor?.yearsExperience != null && (
                            <div className="appointment-summary-item">
                                <span>Kinh nghiệm</span>
                                <strong>{selectedDoctor.yearsExperience} năm</strong>
                            </div>
                        )}

                        <div className="appointment-summary-note">
                            <UserRound size={19} />
                            <p>Bạn cần đăng nhập bằng tài khoản bệnh nhân để gửi yêu cầu đặt lịch.</p>
                        </div>
                    </aside>
                </div>
            </section>
        </main>
    );
}

export default AppointmentsPage;
