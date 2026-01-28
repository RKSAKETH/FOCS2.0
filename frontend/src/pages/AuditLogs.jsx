import { useState, useEffect } from 'react';
import api from '../utils/api';
import { toast } from 'react-toastify';
import { FaHistory, FaUser, FaClock } from 'react-icons/fa';

export default function AuditLogs() {
    const [logs, setLogs] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLogs();
        fetchStats();
    }, []);

    const fetchLogs = async () => {
        try {
            const response = await api.get('/audit');
            setLogs(response.data.logs);
        } catch (error) {
            toast.error('Failed to load audit logs');
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await api.get('/audit/stats');
            setStats(response.data.stats);
        } catch (error) {
            console.error('Failed to load stats');
        }
    };

    const getActionColor = (action) => {
        const colors = {
            create: 'badge-success',
            read: 'badge-info',
            update: 'badge-warning',
            delete: 'badge-danger',
            approve: 'badge-success',
            login: 'badge-info',
            logout: 'badge-info'
        };
        return colors[action] || 'badge-info';
    };

    return (
        <div className="min-h-screen">
            <div className="container mx-auto px-4 py-12">
                <h1 className="text-4xl font-bold mb-8 flex items-center">
                    <FaHistory className="mr-4 text-purple-400" />
                    Audit Logs (Component 2: Directors Only)
                </h1>

                {/* Statistics */}
                {stats && (
                    <div className="grid md:grid-cols-4 gap-6 mb-8">
                        <div className="card">
                            <p className="text-gray-400 text-sm">Total Logs</p>
                            <p className="text-3xl font-bold">{stats.total}</p>
                        </div>
                        <div className="card">
                            <p className="text-gray-400 text-sm">Actions</p>
                            <p className="text-3xl font-bold">{stats.byAction?.length || 0}</p>
                        </div>
                        <div className="card">
                            <p className="text-gray-400 text-sm">Resources</p>
                            <p className="text-3xl font-bold">{stats.byResource?.length || 0}</p>
                        </div>
                        <div className="card">
                            <p className="text-gray-400 text-sm">Active Users</p>
                            <p className="text-3xl font-bold">{stats.topUsers?.length || 0}</p>
                        </div>
                    </div>
                )}

                {/* Logs Table */}
                <div className="card">
                    <h2 className="text-2xl font-bold mb-6">Recent Activity</h2>
                    {loading ? (
                        <p className="text-center text-gray-400 py-8">Loading logs...</p>
                    ) : logs.length === 0 ? (
                        <p className="text-center text-gray-400 py-8">No logs found</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-white/10">
                                        <th className="text-left py-3 px-4">Time</th>
                                        <th className="text-left py-3 px-4">User</th>
                                        <th className="text-left py-3 px-4">Action</th>
                                        <th className="text-left py-3 px-4">Resource</th>
                                        <th className="text-left py-3 px-4">Details</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {logs.map((log) => (
                                        <tr key={log._id} className="border-b border-white/5 hover:bg-white/5">
                                            <td className="py-3 px-4">
                                                <div className="flex items-center space-x-2">
                                                    <FaClock className="text-gray-500" />
                                                    <span className="text-sm">{new Date(log.timestamp).toLocaleString()}</span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center space-x-2">
                                                    <FaUser className="text-gray-500" />
                                                    <div>
                                                        <p className="text-sm font-semibold">{log.userId?.fullName || 'Unknown'}</p>
                                                        <p className="text-xs text-gray-500">{log.userRole}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className={`badge ${getActionColor(log.action)}`}>
                                                    {log.action}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <code className="text-sm text-purple-400">{log.resource}</code>
                                            </td>
                                            <td className="py-3 px-4">
                                                <p className="text-sm text-gray-400">{log.details}</p>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Access Control Note */}
                <div className="card mt-6 bg-purple-900/20 border-purple-500/30">
                    <h3 className="font-semibold mb-2">🔒 Access Control Matrix</h3>
                    <p className="text-sm text-gray-400">
                        Only Lab Directors can view audit logs (Component 2: Authorization).
                        This ensures accountability while preventing unauthorized log tampering.
                    </p>
                </div>
            </div>
        </div>
    );
}
