import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { toast } from 'react-toastify';
import { FaFileAlt, FaCheckCircle, FaEdit } from 'react-icons/fa';

export default function Reports() {
    const { user } = useAuth();
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchReports();
    }, [filter]);

    const fetchReports = async () => {
        try {
            const query = filter !== 'all' ? `?status=${filter}` : '';
            const response = await api.get(`/reports${query}`);
            setReports(response.data.reports);
        } catch (error) {
            toast.error('Failed to load reports');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen">
            <div className="container mx-auto px-4 py-12">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl font-bold">Toxicology Reports</h1>
                    {user.role !== 'police' && (
                        <Link to="/reports/create" className="btn-primary">
                            Create New Report
                        </Link>
                    )}
                </div>

                {/* Filter Tabs */}
                <div className="flex space-x-4 mb-8">
                    <button
                        className={`px-4 py-2 rounded-lg ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setFilter('all')}
                    >
                        All Reports
                    </button>
                    <button
                        className={`px-4 py-2 rounded-lg ${filter === 'draft' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setFilter('draft')}
                    >
                        Draft
                    </button>
                    <button
                        className={`px-4 py-2 rounded-lg ${filter === 'finalized' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setFilter('finalized')}
                    >
                        Finalized
                    </button>
                </div>

                {/* Reports Grid */}
                {loading ? (
                    <div className="text-center py-12">Loading...</div>
                ) : reports.length === 0 ? (
                    <div className="card text-center py-12">
                        <FaFileAlt className="text-6xl text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-400">No reports found</p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {reports.map(report => (
                            <Link key={report._id} to={`/reports/${report._id}`} className="card hover:scale-105 transform transition-all">
                                <div className="flex justify-between items-start mb-4">
                                    <span className="font-mono text-sm text-purple-400">{report.caseId}</span>
                                    <span className={`badge ${report.status === 'finalized' ? 'badge-success' : 'badge-warning'}`}>
                                        {report.status.toUpperCase()}
                                    </span>
                                </div>
                                <h3 className="text-xl font-bold mb-2">{report.suspectName}</h3>
                                <p className="text-sm text-gray-400 mb-4">ID: {report.suspectId}</p>
                                <div className="flex items-center justify-between text-xs text-gray-500">
                                    <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                                    {report.status === 'finalized' && (
                                        <FaCheckCircle className="text-green-400" />
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
