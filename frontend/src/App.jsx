import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Reports from './pages/Reports';
import CreateReport from './pages/CreateReport';
import ReportDetails from './pages/ReportDetails';
import AuditLogs from './pages/AuditLogs';
import LandingPage from './pages/LandingPage';

const PrivateRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-purple-500"></div>
            </div>
        );
    }

    return user ? children : <Navigate to="/login" />;
};

function App() {
    const { user } = useAuth();

    return (
        <Routes>
            <Route path="/" element={user ? <Navigate to="/dashboard" /> : <LandingPage />} />
            <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
            <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />

            <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/reports" element={<PrivateRoute><Reports /></PrivateRoute>} />
            <Route path="/reports/create" element={<PrivateRoute><CreateReport /></PrivateRoute>} />
            <Route path="/reports/:id" element={<PrivateRoute><ReportDetails /></PrivateRoute>} />
            <Route path="/audit" element={<PrivateRoute><AuditLogs /></PrivateRoute>} />

            <Route path="*" element={<Navigate to="/" />} />
        </Routes>
    );
}

export default App;
