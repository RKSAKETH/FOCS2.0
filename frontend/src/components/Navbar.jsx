import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaFlask, FaSignOutAlt } from 'react-icons/fa';

export default function Navbar() {
    const { user, logout } = useAuth();

    return (
        <nav className="glass-light border-b border-white/10">
            <div className="container mx-auto px-4 py-4">
                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                        <FaFlask className="text-2xl text-purple-400" />
                        <span className="text-xl font-bold">Toxicology Portal</span>
                    </div>

                    <div className="flex items-center space-x-4">
                        <Link to="/dashboard" className="hover:text-purple-400 transition">Dashboard</Link>
                        <Link to="/reports" className="hover:text-purple-400 transition">Reports</Link>
                        {(user.role !== 'police') && (
                            <Link to="/reports/create" className="hover:text-purple-400 transition">Create Report</Link>
                        )}
                        {user.role === 'director' && (
                            <Link to="/audit" className="hover:text-purple-400 transition">Audit Logs</Link>
                        )}
                        <button onClick={logout} className="flex items-center space-x-2 text-red-400 hover:text-red-300">
                            <FaSignOutAlt />
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}
