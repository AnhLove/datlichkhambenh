import { Building2, UserRound, CalendarDays, ClipboardCheck } from 'lucide-react';
import './StepsSection.css';

const steps = [
    {
        id: 1,
        title: 'Chọn chuyên khoa',
        description: 'Tìm chuyên khoa phù hợp với nhu cầu khám và tư vấn sức khỏe.',
        icon: Building2,
    },
    {
        id: 2,
        title: 'Chọn bác sĩ',
        description: 'Xem thông tin và lựa chọn bác sĩ phù hợp với bạn.',
        icon: UserRound,
    },
    {
        id: 3,
        title: 'Chọn lịch khám',
        description: 'Chọn ngày khám và khung giờ còn trống của bác sĩ.',
        icon: CalendarDays,
    },
    {
        id: 4,
        title: 'Xác nhận đặt lịch',
        description: 'Kiểm tra thông tin và gửi yêu cầu đặt lịch khám.',
        icon: ClipboardCheck,
    },
];

function StepsSection() {
    return (
        <section className="steps-section" id="booking-guide">
            <div className="container">
                <div className="steps-heading">
                    <span className="eyebrow">QUY TRÌNH ĐẶT LỊCH</span>

                    <h2>Đặt lịch khám đơn giản trong 4 bước</h2>

                    <p>Chủ động lựa chọn lịch khám phù hợp với thời gian của bạn.</p>
                </div>

                <div className="steps-grid">
                    {steps.map((step) => {
                        const Icon = step.icon;

                        return (
                            <article className="step-item" key={step.id}>
                                <div className="step-icon-wrapper">
                                    <div className="step-icon">
                                        <Icon size={25} strokeWidth={1.8} />
                                    </div>

                                    <span className="step-number">{String(step.id).padStart(2, '0')}</span>
                                </div>

                                <h3>{step.title}</h3>

                                <p>{step.description}</p>
                            </article>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

export default StepsSection;
