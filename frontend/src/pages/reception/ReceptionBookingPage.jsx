import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, CalendarDays, Clock3, UserRound, AlertCircle, LoaderCircle } from 'lucide-react';

import { getDepartments } from '../../services/departmentService';
import { searchDoctors } from '../../services/doctorService';
import { getAvailableSlots, createAppointment } from '../../services/appointmentService';
import { getUserByUuid } from '../../services/receptionService';
import { unwrapData, unwrapList } from '../../utils/unwrap';
import { getTodayString } from '../../utils/date';
import '../../styles/staff-portal.css';
import './ReceptionPages.css';

function formatDate(value) {
    if (!value) return '';
    const [year, month, day] = value.split('-');
    return `${day}/${month}/${year}`;
}

function ReceptionBookingPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const patientUuid = searchParams.get('patient') || '';

    const [patient, setPatient] = useState(null);
    const [loadingPatient, setLoadingPatient] = useState(Boolean(patientUuid));
    const [patientError, setPatientError] = useState('');

    const [departments, setDepartments] = useState([]);
    const [allDoctors, setAllDoctors] = useState([]);
    const [loadingData, setLoadingData] = useState(true);
    const [dataError, setDataError] = useState('');

    const [departmentId, setDepartmentId] = useState('');
    const [doctorUuid, setDoctorUuid] = useState('');
    const [appointmentDate, setAppointmentDate] = useState('');
    const [timeSlot, setTimeSlot] = useState('');
    const [reason, setReason] = useState('');

    const [slots, setSlots] = useState([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [slotReloadCount, setSlotReloadCount] = useState(0);

    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState('');

    const today = getTodayString();

    const selectedDepartment = useMemo(
        () => departments.find((department) => String(department.id) === departmentId),
        [departments, departmentId]
    );

    // Danh sách bác sĩ không có departmentId nên ghép theo tên chuyên khoa, giống trang đặt lịch của bệnh nhân
    const doctors = useMemo(() => {
        if (!selectedDepartment) return [];
        return allDoctors.filter((doctor) => doctor.departmentName === selectedDepartment.name);
    }, [allDoctors, selectedDepartment]);

    const selectedDoctor = useMemo(() => doctors.find((doctor) => doctor.uuid === doctorUuid), [doctors, doctorUuid]);

    // Thông tin bệnh nhân được chọn từ trang Bệnh nhân
    useEffect(() => {
        if (!patientUuid) return undefined;

        let cancelled = false;

        async function loadPatient() {
            try {
                const data = unwrapData(await getUserByUuid(patientUuid));
                if (cancelled) return;

                if (!data || Number(data.role) !== 1) {
                    setPatientError('Tài khoản này không phải bệnh nhân.');
                    return;
                }

                if (Number(data.status) === 1) {
                    setPatientError('Tài khoản bệnh nhân này đã bị khóa.');
                    return;
                }

                setPatient(data);
            } catch (err) {
                if (cancelled) return;
                setPatientError(err?.message || 'Không thể tải thông tin bệnh nhân.');
            } finally {
                if (!cancelled) setLoadingPatient(false);
            }
        }

        loadPatient();

        return () => {
            cancelled = true;
        };
    }, [patientUuid]);

    useEffect(() => {
        let cancelled = false;

        async function loadData() {
            try {
                const [departmentData, doctorData] = await Promise.all([getDepartments(), searchDoctors('', '')]);
                if (cancelled) return;

                setDepartments(unwrapList(departmentData));
                setAllDoctors(unwrapList(doctorData));
                setDataError('');
            } catch (err) {
                if (cancelled) return;
                setDataError(err?.message || 'Không thể tải danh sách chuyên khoa và bác sĩ.');
            } finally {
                if (!cancelled) setLoadingData(false);
            }
        }

        loadData();

        return () => {
            cancelled = true;
        };
    }, []);

    // Khung giờ trống theo bác sĩ và ngày
    useEffect(() => {
        if (!doctorUuid || !appointmentDate) return undefined;

        let cancelled = false;

        async function loadSlots() {
            setLoadingSlots(true);

            try {
                const data = unwrapList(await getAvailableSlots(doctorUuid, appointmentDate));
                if (cancelled) return;

                setSlots(data);
                setTimeSlot((current) => (data.some((slot) => slot.timeSlot === current) ? current : ''));
            } catch (err) {
                if (cancelled) return;
                setSlots([]);
                setTimeSlot('');
                setFormError(err?.message || 'Không thể tải khung giờ. Vui lòng thử lại.');
            } finally {
                if (!cancelled) setLoadingSlots(false);
            }
        }

        loadSlots();

        return () => {
            cancelled = true;
        };
    }, [doctorUuid, appointmentDate, slotReloadCount]);

    const resetFrom = (level) => {
        if (level <= 1) setDoctorUuid('');
        if (level <= 2) setAppointmentDate('');
        setTimeSlot('');
        setSlots([]);
        setLoadingSlots(false);
        setFormError('');
    };

    const handleDepartmentChange = (event) => {
        setDepartmentId(event.target.value);
        resetFrom(1);
    };

    const handleDoctorChange = (event) => {
        setDoctorUuid(event.target.value);
        resetFrom(2);
    };

    const handleDateChange = (event) => {
        setAppointmentDate(event.target.value);
        resetFrom(3);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (submitting) return;

        setFormError('');

        if (!patient) {
            setFormError('Chưa có thông tin bệnh nhân.');
            return;
        }

        if (!departmentId || !doctorUuid || !appointmentDate || !timeSlot) {
            setFormError('Vui lòng chọn đầy đủ chuyên khoa, bác sĩ, ngày và giờ khám.');
            return;
        }

        if (appointmentDate < today) {
            setFormError('Ngày khám không được ở trong quá khứ.');
            return;
        }

        if (!slots.some((slot) => slot.timeSlot === timeSlot)) {
            setFormError('Khung giờ đã chọn không còn khả dụng. Vui lòng chọn lại.');
            setTimeSlot('');
            setSlotReloadCount((count) => count + 1);
            return;
        }

        const bookedDate = appointmentDate;
        const bookedSlot = timeSlot;
        const patientName = patient.fullName;

        try {
            setSubmitting(true);

            await createAppointment({
                doctorUuid,
                departmentId: Number(departmentId),
                appointmentDate: bookedDate,
                timeSlot: bookedSlot,
                reason: reason.trim(),
                patientUuid: patient.uuid,
            });

            // Chuyển sang đúng ngày vừa đặt để lễ tân xác nhận lịch ngay
            navigate(`/reception/appointments?date=${bookedDate}`, {
                state: {
                    message: `Đã tạo lịch ${bookedSlot} ngày ${formatDate(bookedDate)} cho ${patientName}. Hãy xác nhận lịch để tiếp tục.`,
                },
            });
        } catch (err) {
            setFormError(err?.message || 'Không thể đặt lịch. Vui lòng thử lại.');
            setSlotReloadCount((count) => count + 1);
        } finally {
            setSubmitting(false);
        }
    };

    const canSubmit = Boolean(patient) && !loadingData && !loadingSlots && !submitting;

    return (
        <main className="doctor-appointments-page">
            <section className="doctor-page-hero">
                <div>
                    <span className="doctor-page-eyebrow">
                        <CalendarDays size={16} />
                        QUẦY TIẾP ĐÓN
                    </span>
                    <h1>Đặt lịch hộ bệnh nhân</h1>
                    <p>Chọn chuyên khoa, bác sĩ và giờ khám trống cho bệnh nhân đang ở quầy hoặc gọi điện.</p>
                </div>
                <CalendarDays className="doctor-page-hero-icon" size={64} strokeWidth={1.3} />
            </section>

            <section className="doctor-panel">
                <Link to="/reception/patients" className="reception-back">
                    <ArrowLeft size={17} />
                    Quay lại danh sách bệnh nhân
                </Link>

                {!patientUuid ? (
                    <div className="doctor-state">
                        <UserRound size={34} />
                        <h3>Chưa chọn bệnh nhân</h3>
                        <p>Hãy chọn một bệnh nhân ở trang Hồ sơ bệnh nhân rồi bấm &quot;Đặt lịch khám&quot;.</p>
                        <Link
                            to="/reception/patients"
                            className="doctor-primary-button"
                            style={{ textDecoration: 'none' }}
                        >
                            Đến hồ sơ bệnh nhân
                        </Link>
                    </div>
                ) : loadingPatient ? (
                    <div className="doctor-state" role="status">
                        <span className="doctor-spinner" />
                        <h3>Đang tải thông tin bệnh nhân</h3>
                        <p>Vui lòng đợi trong giây lát.</p>
                    </div>
                ) : patientError ? (
                    <div className="doctor-state doctor-state-error">
                        <AlertCircle size={30} />
                        <h3>Không thể đặt lịch</h3>
                        <p>{patientError}</p>
                    </div>
                ) : (
                    <>
                        <div className="reception-patient-box">
                            <span className="doctor-summary-icon">
                                <UserRound size={21} />
                            </span>
                            <div>
                                <small>Đặt lịch cho bệnh nhân</small>
                                <strong>{patient?.fullName}</strong>
                                <span>{[patient?.phone, patient?.email].filter(Boolean).join(' · ')}</span>
                            </div>
                        </div>

                        {dataError && (
                            <p className="doctor-feedback doctor-feedback-error" role="alert">
                                <AlertCircle size={17} />
                                {dataError}
                            </p>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className="reception-form-grid">
                                <label className="reception-input">
                                    <span>
                                        Chuyên khoa <b>*</b>
                                    </span>
                                    <select
                                        value={departmentId}
                                        onChange={handleDepartmentChange}
                                        disabled={loadingData || submitting}
                                    >
                                        <option value="">
                                            {loadingData ? 'Đang tải chuyên khoa...' : 'Chọn chuyên khoa'}
                                        </option>
                                        {departments.map((department) => (
                                            <option key={department.id} value={String(department.id)}>
                                                {department.name}
                                            </option>
                                        ))}
                                    </select>
                                </label>

                                <label className="reception-input">
                                    <span>
                                        Bác sĩ <b>*</b>
                                    </span>
                                    <select
                                        value={doctorUuid}
                                        onChange={handleDoctorChange}
                                        disabled={!departmentId || loadingData || submitting}
                                    >
                                        <option value="">
                                            {departmentId ? 'Chọn bác sĩ' : 'Chọn chuyên khoa trước'}
                                        </option>
                                        {doctors.map((doctor) => (
                                            <option key={doctor.uuid} value={doctor.uuid}>
                                                {doctor.fullName}
                                            </option>
                                        ))}
                                    </select>
                                    {departmentId && !loadingData && doctors.length === 0 && (
                                        <small>Chuyên khoa này chưa có bác sĩ.</small>
                                    )}
                                </label>

                                <label className="reception-input reception-input-full">
                                    <span>
                                        Ngày khám <b>*</b>
                                    </span>
                                    <input
                                        type="date"
                                        value={appointmentDate}
                                        min={today}
                                        onChange={handleDateChange}
                                        disabled={!doctorUuid || submitting}
                                    />
                                </label>
                            </div>

                            <div className="reception-slot-block">
                                <span className="reception-slot-label">
                                    Khung giờ <b>*</b>
                                </span>

                                {!doctorUuid || !appointmentDate ? (
                                    <p className="reception-hint">Chọn bác sĩ và ngày khám trước.</p>
                                ) : loadingSlots ? (
                                    <p className="reception-hint" role="status">
                                        <LoaderCircle size={17} className="doctor-spin" />
                                        Đang kiểm tra giờ trống...
                                    </p>
                                ) : slots.length === 0 ? (
                                    <p className="reception-hint">
                                        Không còn khung giờ trống ngày này (bác sĩ nghỉ, chưa được duyệt ca hoặc đã kín
                                        lịch). Hãy chọn ngày khác.
                                    </p>
                                ) : (
                                    <>
                                        <div className="reception-slots">
                                            {slots.map((slot) => (
                                                <button
                                                    key={slot.timeSlot}
                                                    type="button"
                                                    className={`reception-slot ${timeSlot === slot.timeSlot ? 'reception-slot-selected' : ''}`}
                                                    aria-pressed={timeSlot === slot.timeSlot}
                                                    disabled={submitting}
                                                    onClick={() => {
                                                        setTimeSlot(slot.timeSlot);
                                                        setFormError('');
                                                    }}
                                                >
                                                    <Clock3 size={15} />
                                                    {slot.timeSlot}
                                                </button>
                                            ))}
                                        </div>
                                        <p className="reception-hint">Khung giờ đã bắt đầu sẽ không hiển thị.</p>
                                    </>
                                )}
                            </div>

                            <label className="doctor-form-field">
                                <span>Lý do khám</span>
                                <textarea
                                    value={reason}
                                    onChange={(event) => setReason(event.target.value)}
                                    rows={3}
                                    maxLength={500}
                                    placeholder="Ví dụ: Khám định kỳ, đau đầu kéo dài..."
                                    disabled={submitting}
                                />
                                <small>{reason.length}/500 ký tự</small>
                            </label>

                            {selectedDoctor && timeSlot && appointmentDate && (
                                <p className="reception-summary">
                                    Lịch sẽ tạo: <strong>{timeSlot}</strong> ngày{' '}
                                    <strong>{formatDate(appointmentDate)}</strong>, bác sĩ{' '}
                                    <strong>{selectedDoctor.fullName}</strong>.
                                </p>
                            )}

                            {formError && (
                                <p className="doctor-feedback doctor-feedback-error" role="alert">
                                    <AlertCircle size={17} />
                                    {formError}
                                </p>
                            )}

                            <div className="doctor-modal-actions">
                                <Link
                                    to="/reception/patients"
                                    className="doctor-secondary-button"
                                    style={{ textDecoration: 'none' }}
                                >
                                    Hủy
                                </Link>
                                <button type="submit" className="doctor-primary-button" disabled={!canSubmit}>
                                    {submitting ? 'Đang đặt lịch...' : 'Tạo lịch hẹn'}
                                </button>
                            </div>
                        </form>
                    </>
                )}
            </section>
        </main>
    );
}

export default ReceptionBookingPage;
