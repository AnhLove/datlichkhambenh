import HeroSection from '../components/home/HeroSection';
import BookingSection from '../components/home/BookingSection';
import SpecialtySection from '../components/home/SpecialtySection';
import StepsSection from '../components/home/StepsSection';

function HomePage() {
    return (
        <main>
            <HeroSection />
            <BookingSection />
            <SpecialtySection />
            <StepsSection />
        </main>
    );
}

export default HomePage;
