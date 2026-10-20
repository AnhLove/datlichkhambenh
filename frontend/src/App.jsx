import { BrowserRouter, Routes, Route } from 'react-router-dom';
import DepartmentsPage from './pages/DepartmentsPage';
import PublicLayout from './layouts/PublicLayout';
import HomePage from './pages/HomePage';
import DoctorsPage from './pages/DoctorsPage';
import AppointmentsPage from './pages/AppointmentsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MedicalServicesPage from './pages/MedicalServicesPage';
import './App.css';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route element={<PublicLayout />}>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/departments" element={<DepartmentsPage />} />
                    <Route path="/doctors" element={<DoctorsPage />} />
                    <Route path="/appointments" element={<AppointmentsPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/medical-services" element={<MedicalServicesPage />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
