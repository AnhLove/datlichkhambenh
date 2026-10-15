import { Outlet } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

function PublicLayout() {
    return (
        <div
            className="site-layout"
            style={{ width: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}
        >
            <Header />
            <main style={{ flex: 1, width: '100%' }}>
                <Outlet />
            </main>
            <Footer />
        </div>
    );
}

export default PublicLayout;
