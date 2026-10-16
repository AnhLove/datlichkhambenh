import { BrowserRouter, Routes, Route } from 'react-router-dom';
import DepartmentsPage from './pages/DepartmentsPage';
import PublicLayout from './layouts/PublicLayout';
import HomePage from './pages/HomePage';
import './App.css';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route element={<PublicLayout />}>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/departments" element={<DepartmentsPage />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
