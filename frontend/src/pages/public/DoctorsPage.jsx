import { useEffect, useState } from 'react';
import { CalendarDays, Search, Stethoscope } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

import DoctorCard from '../../components/common/DoctorCard';
import { getDepartments } from '../../services/departmentService';
import { searchDoctors } from '../../services/doctorService';
import { unwrapList } from '../../utils/unwrap';

import './DoctorsPage.css';

const SKELETON_COUNT = 6;

function formatDisplayDate(value) {
    return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value.split('-').reverse().join('/') : '';
}

function DoctorsPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const appointmentDate = searchParams.get('appointmentDate') || '';

    const [departments, setDepartments] = useState([]);
    const [departmentsLoading, setDepartmentsLoading] = useState(true);
    const [departmentError, setDepartmentError] = useState('');
    const [departmentRetryCount, setDepartmentRetryCount] = useState(0);

    const [departmentId, setDepartmentId] = useState(searchParams.get('departmentId') || '');
    const [keyword, setKeyword] = useState(searchParams.get('fullName') || '');
    const [submittedKeyword, setSubmittedKeyword] = useState(searchParams.get('fullName') || '');

    const [doctorResult, setDoctorResult] = useState({ key: null, doctors: [], error: '' });
    const [retryCount, setRetryCount] = useState(0);

    const selectedDepartment = departments.find((department) => String(department.id) === departmentId);
    const departmentName = selectedDepartment?.name || '';
    const requestKey = JSON.stringify([departmentName, submittedKeyword]);

    const doctors = doctorResult.doctors;
    const doctorsLoading = !departmentsLoading && !departmentError && doctorResult.key !== requestKey;
    const isLoading = departmentsLoading || doctorsLoading;
    const error = departmentError || doctorResult.error;
    const displayDate = formatDisplayDate(appointmentDate);

    useEffect(() => {
        let cancelled = false;

        async function loadDepartments() {
            try {
                const data = await getDepartments();
                if (cancelled) return;
                setDepartments(unwrapList(data));
            } catch (err) {
                if (cancelled) return;
                console.error('Lỗi tải danh sách khoa:', err);
                setDepartmentError('Không thể tải danh sách chuyên khoa. Vui lòng thử lại.');
            } finally {
                if (!cancelled) setDepartmentsLoading(false);
            }
        }

        loadDepartments();

        return () => {
            cancelled = true;
        };
    }, [departmentRetryCount]);

    useEffect(() => {
        if (departmentsLoading || departmentError) {
            return undefined;
        }

        let cancelled = false;

        async function loadDoctors() {
            try {
                const data = await searchDoctors(departmentName, submittedKeyword);
                if (cancelled) return;
                setDoctorResult({ key: requestKey, doctors: unwrapList(data), error: '' });
            } catch (err) {
                if (cancelled) return;
                console.error('Lỗi tải danh sách bác sĩ:', err);
                setDoctorResult({
                    key: requestKey,
                    doctors: [],
                    error: 'Không thể tải danh sách bác sĩ. Vui lòng thử lại.',
                });
            }
        }

        loadDoctors();

        return () => {
            cancelled = true;
        };
    }, [departmentsLoading, departmentError, departmentName, submittedKeyword, requestKey, retryCount]);

    function updateSearchParams(nextDepartmentId, nextKeyword) {
        const nextParams = new URLSearchParams();

        if (nextDepartmentId) nextParams.set('departmentId', nextDepartmentId);
        if (nextKeyword) nextParams.set('fullName', nextKeyword);
        if (appointmentDate) nextParams.set('appointmentDate', appointmentDate);

        setSearchParams(nextParams);
    }

    function handleSearch(event) {
        event.preventDefault();

        const trimmedKeyword = keyword.trim();

        setSubmittedKeyword(trimmedKeyword);
        updateSearchParams(departmentId, trimmedKeyword);
    }

    function handleDepartmentChange(event) {
        const nextDepartmentId = event.target.value;

        setDepartmentId(nextDepartmentId);
        updateSearchParams(nextDepartmentId, submittedKeyword);
    }

    function handleRetryDepartments() {
        setDepartmentError('');
        setDepartmentsLoading(true);
        setDepartmentRetryCount((count) => count + 1);
    }

    function handleRetryDoctors() {
        setDoctorResult((previous) => ({ ...previous, key: null, error: '' }));
        setRetryCount((count) => count + 1);
    }

    const getDoctorLink = (doctor) =>
        appointmentDate
            ? `/doctors/${doctor.uuid}?date=${encodeURIComponent(appointmentDate)}`
            : `/doctors/${doctor.uuid}`;

    let content;

    if (departmentError) {
        content = (
            <div className="doctors-message doctors-error" role="alert">
                <p>{departmentError}</p>
                <button type="button" onClick={handleRetryDepartments}>
                    Thử tải lại
                </button>
            </div>
        );
    } else if (isLoading) {
        content = (
            <div className="doctors-grid" role="status" aria-label="Đang tải danh sách bác sĩ">
                {Array.from({ length: SKELETON_COUNT }, (_, index) => (
                    <div className="doctors-skeleton" key={index} aria-hidden="true" />
                ))}
            </div>
        );
    } else if (doctorResult.error) {
        content = (
            <div className="doctors-message doctors-error" role="alert">
                <p>{doctorResult.error}</p>
                <button type="button" onClick={handleRetryDoctors}>
                    Thử tìm lại
                </button>
            </div>
        );
    } else if (doctors.length === 0) {
        content = (
            <div className="doctors-empty">
                <Stethoscope size={30} aria-hidden="true" />
                <h3>Chưa tìm thấy bác sĩ phù hợp</h3>
                <p>Hãy thử thay đổi tên bác sĩ hoặc chọn chuyên khoa khác.</p>
            </div>
        );
    } else {
        content = (
            <div className="doctors-grid">
                {doctors.map((doctor) => (
                    <DoctorCard key={doctor.uuid} doctor={doctor} to={getDoctorLink(doctor)} showBio />
                ))}
            </div>
        );
    }

    return (
        <main className="doctors-page">
            <section className="container doctors-container">
                <div className="doctors-heading">
                    <span className="section-kicker">BỆNH VIỆN NAM LƯƠNG SƠN</span>

                    <h1>Đội ngũ bác sĩ</h1>

                    <p>Tìm kiếm bác sĩ theo chuyên khoa và lựa chọn người phù hợp với nhu cầu khám bệnh của bạn.</p>

                    {displayDate && (
                        <p className="doctors-date-note">
                            <CalendarDays size={17} aria-hidden="true" />
                            Ngày khám dự kiến: <strong>{displayDate}</strong>
                        </p>
                    )}
                </div>

                <form className="doctors-filter" onSubmit={handleSearch}>
                    <label className="doctors-search-field">
                        <span>Tên bác sĩ</span>

                        <div className="doctors-input-wrap">
                            <Search size={19} aria-hidden="true" />

                            <input
                                type="search"
                                placeholder="Nhập tên bác sĩ..."
                                value={keyword}
                                onChange={(event) => setKeyword(event.target.value)}
                            />
                        </div>
                    </label>

                    <label className="doctors-department-field">
                        <span>Chuyên khoa</span>

                        <select value={departmentId} onChange={handleDepartmentChange} disabled={departmentsLoading}>
                            <option value="">Tất cả chuyên khoa</option>

                            {departments.map((department) => (
                                <option key={department.id} value={String(department.id)}>
                                    {department.name}
                                </option>
                            ))}
                        </select>
                    </label>

                    <button className="doctors-search-button" type="submit" disabled={isLoading}>
                        <Search size={17} aria-hidden="true" />
                        Tìm bác sĩ
                    </button>
                </form>

                <div className="doctors-results-heading">
                    <h2>Danh sách bác sĩ</h2>

                    {!isLoading && !error && <span>{doctors.length} bác sĩ</span>}
                </div>

                {content}
            </section>
        </main>
    );
}

export default DoctorsPage;
