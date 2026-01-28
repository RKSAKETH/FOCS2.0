import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { toast } from 'react-toastify';
import { FaFileAlt, FaCheckCircle, FaTrash, FaExclamationTriangle } from 'react-icons/fa';

export default function Reports() {
    const { user } = useAuth();
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [reportToDelete, setReportToDelete] = useState(null);

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

    const handleDeleteClick = (e, report) => {
        e.preventDefault(); // Prevent Link navigation
        e.stopPropagation(); // Stop event bubbling

        setReportToDelete(report);
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = async () => {
        if (!reportToDelete) return;

        try {
            await api.delete(`/reports/${reportToDelete._id}`);
            toast.success(`Report ${reportToDelete.caseId} deleted successfully`);
            setShowDeleteModal(false);
            setReportToDelete(null);
            // Refresh the reports list
            fetchReports();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete report');
        }
    };

    const handleDeleteCancel = () => {
        setShowDeleteModal(false);
        setReportToDelete(null);
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
                            <Link
                                key={report._id}
                                to={`/reports/${report._id}`}
                                className="card hover:scale-105 transform transition-all relative group"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <span className="font-mono text-sm text-purple-400">{report.caseId}</span>
                                    <div className="flex items-center gap-2">
                                        <span className={`badge ${report.status === 'finalized' ? 'badge-success' : 'badge-warning'}`}>
                                            {report.status.toUpperCase()}
                                        </span>
                                        {/* Delete Button - Director Only */}
                                        {user.role === 'director' && (
                                            <button
                                                onClick={(e) => handleDeleteClick(e, report)}
                                                className="p-2 bg-red-600 hover:bg-red-700 rounded-lg text-white transition-all opacity-0 group-hover:opacity-100"
                                                title="Delete Report"
                                            >
                                                <FaTrash className="text-sm" />
                                            </button>
                                        )}
                                    </div>
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

            {/* Delete Confirmation Modal */}
            {showDeleteModal && reportToDelete && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-red-500/30 rounded-2xl shadow-2xl max-w-md w-full p-8 transform animate-scale-in">
                        {/* Warning Icon */}
                        <div className="flex justify-center mb-6">
                            <div className="bg-red-600/20 p-4 rounded-full">
                                <FaExclamationTriangle className="text-5xl text-red-500" />
                            </div>
                        </div>

                        {/* Title */}
                        <h2 className="text-2xl font-bold text-center mb-4">Delete Report?</h2>

                        {/* Message */}
                        <div className="text-center mb-6">
                            <p className="text-gray-300 mb-2">
                                Are you sure you want to delete this report?
                            </p>
                            <div className="bg-red-900/30 border border-red-500/30 rounded-lg p-4 my-4">
                                <p className="font-mono text-lg text-red-400 font-bold">
                                    {reportToDelete.caseId}
                                </p>
                                <p className="text-sm text-gray-400 mt-1">
                                    {reportToDelete.suspectName}
                                </p>
                                <span className={`badge mt-2 ${reportToDelete.status === 'finalized' ? 'badge-success' : 'badge-warning'}`}>
                                    {reportToDelete.status.toUpperCase()}
                                </span>
                            </div>
                            <p className="text-red-400 font-semibold">
                                ⚠️ This action cannot be undone
                            </p>
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-4">
                            <button
                                onClick={handleDeleteCancel}
                                className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteConfirm}
                                className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-all"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

