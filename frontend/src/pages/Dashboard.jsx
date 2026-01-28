import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { FaFlask, FaFileAlt, FaUserShield, FaSignOutAlt, FaPlus } from 'react-icons/fa';
import api from '../utils/api';
import { toast } from 'react-toastify';

export default function Dashboard() {
    const { user, logout } = useAuth();
    const [stats, setStats] = useState({ draft: 0, finalized: 0, total: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await api.get('/reports');
            const reports = response.data.reports;
            setStats({
                draft: reports.filter(r => r.status === 'draft').length,
                finalized: reports.filter(r => r.status === 'finalized').length,
                total: reports.length
            });
        } catch (error) {
            toast.error('Failed to load statistics');
        } finally {
            setLoading(false);
        }
    };

    const getRoleColor = (role) => {
        const colors = {
            technician: 'badge-info',
            director: 'badge-warning',
            police: 'badge-success'
        };
        return colors[role] || 'badge-info';
    };

    const getRolePermissions = () => {
        const permissions = {
            technician: ['Create draft reports', 'View finalized reports'],
            director: ['All technician permissions', 'Approve & sign reports', 'View audit logs'],
            police: ['View finalized reports only (Read-Only)']
        };
        return permissions[user.role] || [];
    };

    return (
        <div className="min-h-screen">
            {/* Navigation */}
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

            {/* Main Content */}
            <div className="container mx-auto px-4 py-12">
                {/* Welcome Section */}
                <div className="mb-12 animate-fade-in">
                    <h1 className="text-4xl font-bold mb-4">
                        Welcome, {user.fullName}
                    </h1>
                    <div className="flex items-center space-x-4">
                        <span className={`badge ${getRoleColor(user.role)}`}>
                            {user.role.toUpperCase()}
                        </span>
                        <span className="text-gray-400">{user.email}</span>
                    </div>
                </div>

                {/* Statistics Cards */}
                {!loading && (
                    <div className="grid md:grid-cols-3 gap-6 mb-12">
                        <StatCard
                            title="Total Reports"
                            value={stats.total}
                            icon={<FaFileAlt />}
                            color="blue"
                        />
                        <StatCard
                            title="Draft Reports"
                            value={stats.draft}
                            icon={<FaFileAlt />}
                            color="yellow"
                        />
                        <StatCard
                            title="Finalized Reports"
                            value={stats.finalized}
                            icon={<FaUserShield />}
                            color="green"
                        />
                    </div>
                )}

                {/* Access Control Matrix */}
                <div className="card mb-8">
                    <h2 className="text-2xl font-bold mb-6 flex items-center">
                        <FaUserShield className="mr-3 text-purple-400" />
                        {user.role === 'director' ? 'Access Control Matrix (Component 2)' : 'Your Access Permissions'}
                    </h2>

                    {/* Your Permissions */}
                    <div className={user.role === 'director' ? 'mb-8' : ''}>
                        <h3 className="text-xl font-semibold mb-4">Your Permissions ({user.role.toUpperCase()})</h3>
                        <div className="space-y-3">
                            {getRolePermissions().map((permission, index) => (
                                <div key={index} className="flex items-center space-x-3 p-3 glass-light rounded-lg">
                                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                    <span>{permission}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Full Access Control Matrix Table - DIRECTOR ONLY */}
                    {user.role === 'director' && (
                        <>
                            <div className="overflow-x-auto">
                                <h3 className="text-xl font-semibold mb-4">Complete Access Control Matrix</h3>
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-white/20">
                                            <th className="text-left p-3 font-semibold text-purple-400">Role / Resource</th>
                                            <th className="text-center p-3 font-semibold text-blue-400">Draft Results</th>
                                            <th className="text-center p-3 font-semibold text-green-400">Final Reports</th>
                                            <th className="text-center p-3 font-semibold text-yellow-400">Audit Logs</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {/* Technician Row */}
                                        <tr className="border-b border-white/10 hover:bg-white/5">
                                            <td className="p-3 font-semibold">
                                                <span className="badge bg-gray-700 text-gray-300">
                                                    👨‍🔬 Technician
                                                </span>
                                            </td>
                                            <td className="text-center p-3">
                                                <div className="text-green-400 font-semibold">✓ Create, Read, Update</div>
                                                <div className="text-xs text-gray-500">Full access to drafts</div>
                                            </td>
                                            <td className="text-center p-3">
                                                <div className="text-blue-400 font-semibold">✓ Read Only</div>
                                                <div className="text-xs text-gray-500">View finalized reports</div>
                                            </td>
                                            <td className="text-center p-3">
                                                <div className="text-red-400 font-semibold">✗ No Access</div>
                                                <div className="text-xs text-gray-500">Cannot view logs</div>
                                            </td>
                                        </tr>

                                        {/* Director Row */}
                                        <tr className="border-b border-white/10 hover:bg-white/5">
                                            <td className="p-3 font-semibold">
                                                <span className="badge badge-warning">
                                                    👨‍💼 Director
                                                </span>
                                            </td>
                                            <td className="text-center p-3">
                                                <div className="text-green-400 font-semibold">✓ Full Access</div>
                                                <div className="text-xs text-gray-500">Create, Read, Update, Delete</div>
                                            </td>
                                            <td className="text-center p-3">
                                                <div className="text-green-400 font-semibold">✓ Approve & Sign</div>
                                                <div className="text-xs text-gray-500">Finalize with digital signature</div>
                                            </td>
                                            <td className="text-center p-3">
                                                <div className="text-green-400 font-semibold">✓ Read Only</div>
                                                <div className="text-xs text-gray-500">View all audit logs</div>
                                            </td>
                                        </tr>

                                        {/* Police Row */}
                                        <tr className="hover:bg-white/5">
                                            <td className="p-3 font-semibold">
                                                <span className="badge bg-gray-700 text-gray-300">
                                                    👮 Police/DA
                                                </span>
                                            </td>
                                            <td className="text-center p-3">
                                                <div className="text-red-400 font-semibold">✗ No Access</div>
                                                <div className="text-xs text-gray-500">Cannot view drafts</div>
                                            </td>
                                            <td className="text-center p-3">
                                                <div className="text-blue-400 font-semibold">✓ Read Only</div>
                                                <div className="text-xs text-gray-500">View finalized reports</div>
                                            </td>
                                            <td className="text-center p-3">
                                                <div className="text-red-400 font-semibold">✗ No Access</div>
                                                <div className="text-xs text-gray-500">Cannot view logs</div>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            {/* Policy Justification */}
                            <div className="mt-6 p-4 bg-purple-900/20 border border-purple-500/30 rounded-lg">
                                <h4 className="font-semibold text-purple-400 mb-2">🔒 Policy Justification</h4>
                                <ul className="text-sm text-gray-300 space-y-1">
                                    <li>• <strong>Technicians</strong>: Create/modify drafts, no access to finalization (separation of duties)</li>
                                    <li>• <strong>Directors</strong>: Full oversight, approve reports with digital signatures (accountability)</li>
                                    <li>• <strong>Police/DA</strong>: Read-only access to finalized reports (chain of custody, no tampering)</li>
                                    <li>• <strong>Audit Logs</strong>: Director-only for security oversight and compliance</li>
                                </ul>
                            </div>
                        </>
                    )}
                </div>

                {/* Security Components Summary */}
                <div className="card">
                    <h2 className="text-2xl font-bold mb-6">Security Features Active</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                        <SecurityFeature
                            title="Authentication"
                            description="Single-Factor + Multi-Factor (OTP)"
                            active
                        />
                        <SecurityFeature
                            title="Authorization"
                            description="Role-Based Access Control"
                            active
                        />
                        <SecurityFeature
                            title="Encryption"
                            description="AES-256 for sensitive data"
                            active
                        />
                        <SecurityFeature
                            title="Digital Signature"
                            description="RSA-2048 for report integrity"
                            active
                        />
                        <SecurityFeature
                            title="Hashing"
                            description="Bcrypt with unique salt"
                            active
                        />
                        <SecurityFeature
                            title="Audit Logging"
                            description="Complete activity tracking"
                            active
                        />
                    </div>
                </div>

                {/* Quick Actions */}
                {(user.role !== 'police') && (
                    <div className="mt-8">
                        <Link to="/reports/create" className="btn-primary inline-flex items-center">
                            <FaPlus className="mr-2" />
                            Create New Report
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}

function StatCard({ title, value, icon, color }) {
    const colors = {
        blue: 'from-blue-600 to-blue-800',
        yellow: 'from-yellow-600 to-yellow-800',
        green: 'from-green-600 to-green-800'
    };

    return (
        <div className={`card bg-gradient-to-br ${colors[color]} transform hover:scale-105 transition-all`}>
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-gray-300 text-sm mb-2">{title}</p>
                    <p className="text-4xl font-bold">{value}</p>
                </div>
                <div className="text-3xl opacity-50">{icon}</div>
            </div>
        </div>
    );
}

function SecurityFeature({ title, description, active }) {
    return (
        <div className="flex items-center space-x-3 p-3 glass-light rounded-lg">
            <div className={`w-3 h-3 rounded-full ${active ? 'bg-green-400' : 'bg-red-400'} animate-pulse`}></div>
            <div>
                <p className="font-semibold">{title}</p>
                <p className="text-sm text-gray-400">{description}</p>
            </div>
        </div>
    );
}
