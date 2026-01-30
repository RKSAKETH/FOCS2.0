import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import api from '../utils/api';
import { FaCheckCircle, FaExclamationTriangle, FaLock, FaKey } from 'react-icons/fa';

export default function ReportDetails() {
    const { id } = useParams();
    const { user, requestOTP, verifyOTP } = useAuth();
    const navigate = useNavigate();
    const [report, setReport] = useState(null);
    const [verification, setVerification] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showOTPModal, setShowOTPModal] = useState(false);
    const [otp, setOtp] = useState('');

    const effectRan = useRef(false);

    useEffect(() => {
        if (!id || effectRan.current) return;

        effectRan.current = true;
        const loadData = async () => {
            await fetchReport();
            // Verify separately
            try {
                const response = await api.get(`/reports/${id}/verify`);
                setVerification(response.data.verification);
            } catch (error) {
                console.error('Verification failed:', error);
            }
        };

        loadData();
    }, [id]);

    const fetchReport = async () => {
        try {
            const response = await api.get(`/reports/${id}`);
            setReport(response.data.report);
        } catch (error) {
            toast.error('Failed to load report');
        } finally {
            setLoading(false);
        }
    };

    const verifyReport = async () => {
        try {
            const response = await api.get(`/reports/${id}/verify`);
            setVerification(response.data.verification);
        } catch (error) {
            console.error('Verification failed:', error);
        }
    };

    const handleFinalizeClick = async () => {
        try {
            await requestOTP();
            toast.success('OTP sent to your email');
            setShowOTPModal(true);
        } catch (error) {
            toast.error('Failed to send OTP');
        }
    };

    const handleOTPSubmit = async () => {
        try {
            await verifyOTP(otp);
            await api.post(`/reports/${id}/finalize`);
            toast.success('Report finalized and digitally signed!');
            setShowOTPModal(false);
            fetchReport();
            verifyReport();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to finalize report');
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    if (!report) return <div className="min-h-screen flex items-center justify-center">Report not found</div>;

    return (
        <div className="min-h-screen">
            <div className="container mx-auto px-4 py-12">
                <button onClick={() => navigate('/reports')} className="mb-6 text-purple-400 hover:text-purple-300">
                    ← Back to Reports
                </button>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Main Report Details */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="card">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h1 className="text-3xl font-bold mb-2">{report.caseId}</h1>
                                    <span className={`badge ${report.status === 'finalized' ? 'badge-success' : 'badge-warning'}`}>
                                        {report.status.toUpperCase()}
                                    </span>
                                </div>
                                {user.role === 'director' && report.status === 'draft' && (
                                    <button onClick={handleFinalizeClick} className="btn-primary">
                                        <FaLock className="inline mr-2" />
                                        Finalize & Sign
                                    </button>
                                )}
                            </div>

                            <div className="space-y-4">
                                <InfoField label="Suspect Name" value={report.suspectName} />
                                <InfoField label="Suspect ID" value={report.suspectId} />
                                <InfoField label="Blood Alcohol Content" value={report.bloodAlcoholContent} encrypted />
                                <InfoField label="Drug Type" value={report.drugType} encrypted />
                                <InfoField label="Sample Collection Date" value={new Date(report.sampleCollectionDate).toLocaleDateString()} />
                                <InfoField label="Test Date" value={new Date(report.testDate).toLocaleDateString()} />
                                <InfoField label="Test Method" value={report.testMethod} />
                                <InfoField label="Created By" value={report.createdBy?.fullName} />
                                {report.approvedBy && (
                                    <InfoField label="Approved By" value={report.approvedBy?.fullName} />
                                )}
                            </div>

                            {report.chromatogramImage && (
                                <div className="mt-6">
                                    <h3 className="text-lg font-semibold mb-3">Chromatogram (Base64 Encoded)</h3>
                                    <img src={report.chromatogramImage} alt="Chromatogram" className="rounded-lg max-h-96" />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Verification Status */}
                        {report.status === 'finalized' && report.digitalSignature && (
                            <div className={`card ${verification?.isValid ? 'border-2 border-green-500' : 'border-2 border-red-500'}`}>
                                <h3 className="text-lg font-semibold mb-4 flex items-center">
                                    {verification?.isValid ? (
                                        <FaCheckCircle className="text-green-400 mr-2" />
                                    ) : (
                                        <FaExclamationTriangle className="text-red-400 mr-2" />
                                    )}
                                    Verification Status
                                </h3>
                                <p className={`text-sm ${verification?.isValid ? 'text-green-300' : 'text-red-300'}`}>
                                    {verification?.message}
                                </p>
                                {report.digitalSignature && (
                                    <div className="mt-4 space-y-2 text-xs">
                                        <p className="text-gray-400">Signed: {new Date(report.digitalSignature.signedAt).toLocaleString()}</p>
                                        <p className="text-gray-400 break-all">Hash: {report.digitalSignature.hash.substring(0, 32)}...</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Security Info */}
                        <div className="card">
                            <h3 className="text-lg font-semibold mb-4">Security Features</h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex items-center space-x-2">
                                    <FaKey className="text-purple-400" />
                                    <span>AES-256 Encryption</span>
                                </div>
                                {report.status === 'finalized' && (
                                    <div className="flex items-center space-x-2">
                                        <FaCheckCircle className="text-green-400" />
                                        <span>RSA-2048 Digital Signature</span>
                                    </div>
                                )}
                                <div className="flex items-center space-x-2">
                                    <FaLock className="text-blue-400" />
                                    <span>PBKDF2 Key Derivation</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* OTP Modal */}
            {showOTPModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="card max-w-md w-full mx-4">
                        <h2 className="text-2xl font-bold mb-4">Multi-Factor Authentication</h2>
                        <p className="text-gray-400 mb-6">
                            Enter the 6-digit OTP sent to your email to finalize and sign this report.
                        </p>
                        <input
                            type="text"
                            className="input-field mb-4"
                            placeholder="000000"
                            maxLength="6"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                        />
                        <div className="flex gap-4">
                            <button onClick={handleOTPSubmit} className="btn-primary flex-1">
                                Verify & Sign
                            </button>
                            <button onClick={() => setShowOTPModal(false)} className="btn-secondary">
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function InfoField({ label, value, encrypted }) {
    return (
        <div className="flex justify-between items-center py-2 border-b border-white/10">
            <span className="text-gray-400 flex items-center">
                {label}
                {encrypted && <FaLock className="ml-2 text-purple-400" />}
            </span>
            <span className="font-semibold">{value}</span>
        </div>
    );
}
