import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

import DoctorCard from '../common/DoctorCard';
import { searchDoctors } from '../../services/doctorService';
import { unwrapList } from '../../utils/unwrap';

import './DoctorShowcaseSection.css';

const MAX_DOCTORS = 10;
const SKELETON_COUNT = 4;

function DoctorShowcaseSection() {
    const trackRef = useRef(null);
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        async function loadDoctors() {
            try {
                const response = await searchDoctors('', '');
                if (cancelled) return;
                setDoctors(unwrapList(response).slice(0, MAX_DOCTORS));
            } catch {
                if (!cancelled) setDoctors([]);
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        loadDoctors();

        return () => {
            cancelled = true;
        };
    }, []);

    const scrollTrack = (direction) => {
        const track = trackRef.current;
        if (!track) return;

        track.scrollBy({ left: direction * track.clientWidth * 0.8, behavior: 'smooth' });
    };

    if (!loading && doctors.length === 0) {
        return null;
    }

    return (
        <section className="doctor-showcase" aria-labelledby="doctor-showcase-title">
            <div className="container">
                <div className="doctor-showcase-header">
                    <div>
                        <span className="section-kicker">ĐỘI NGŨ BÁC SĨ</span>
                        <h2 id="doctor-showcase-title">Đặt khám bác sĩ</h2>
                        <p>Chọn bác sĩ phù hợp, xem khung giờ còn trống và đặt lịch ngay.</p>
                    </div>

                    <div className="doctor-showcase-actions">
                        <button
                            type="button"
                            className="doctor-showcase-arrow"
                            aria-label="Xem bác sĩ trước"
                            onClick={() => scrollTrack(-1)}
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <button
                            type="button"
                            className="doctor-showcase-arrow"
                            aria-label="Xem bác sĩ tiếp theo"
                            onClick={() => scrollTrack(1)}
                        >
                            <ChevronRight size={20} />
                        </button>

                        <Link to="/doctors" className="doctor-showcase-all">
                            Xem tất cả
                            <ArrowRight size={17} />
                        </Link>
                    </div>
                </div>

                <div className="doctor-showcase-track" ref={trackRef}>
                    {loading
                        ? Array.from({ length: SKELETON_COUNT }, (_, index) => (
                              <div className="doctor-showcase-skeleton" key={index} aria-hidden="true" />
                          ))
                        : doctors.map((doctor) => (
                              <div className="doctor-showcase-item" key={doctor.uuid}>
                                  <DoctorCard doctor={doctor} to={`/doctors/${doctor.uuid}`} />
                              </div>
                          ))}
                </div>
            </div>
        </section>
    );
}

export default DoctorShowcaseSection;
