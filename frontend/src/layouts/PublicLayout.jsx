import { Outlet } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

function PublicLayout() {
    return (
        <div className="site-layout">
            <Header />
            <main className="site-main">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
}

export default PublicLayout;
