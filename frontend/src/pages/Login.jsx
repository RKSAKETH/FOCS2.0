import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FaUser, FaLock, FaShieldAlt } from 'react-icons/fa';
import api from '../utils/api';

export default function Login() {
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [showOTPModal, setShowOTPModal] = useState(false);
    const [otp, setOtp] = useState('');
    const [tempToken, setTempToken] = useState('');
    const [userEmail, setUserEmail] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Step 1: Login with username/password
            const response = await api.post('/auth/login', formData);
            setTempToken(response.data.token);
            setUserEmail(response.data.user.email);

            // Step 2: Request OTP
            await api.post('/auth/request-otp?purpose=login', {}, {
                headers: { Authorization: `Bearer ${response.data.token}` }
            });

            toast.success('OTP sent to your email!');
            setShowOTPModal(true);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    const handleOTPVerify = async () => {
        if (!otp || otp.length !== 6) {
            toast.error('Please enter a valid 6-digit OTP');
            return;
        }

        setLoading(true);
        try {
            // Verify OTP
            await api.post('/auth/verify-otp', { otp }, {
                headers: { Authorization: `Bearer ${tempToken}` }
            });

            // Store token and redirect
            localStorage.setItem('token', tempToken);
            const userResponse = await api.get('/auth/profile', {
                headers: { Authorization: `Bearer ${tempToken}` }
            });
            localStorage.setItem('user', JSON.stringify(userResponse.data.user));

            toast.success('✅ Login successful! OTP verified.');
            navigate('/dashboard');
            window.location.reload(); // Refresh to update auth state
        } catch (error) {
            // Show error but keep modal open for retry
            toast.error(error.response?.data?.message || 'Invalid OTP. Please try again.');
            setOtp(''); // Clear OTP input for retry
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                <div className="card animate-slide-up">
                    <div className="text-center mb-8">
                        <div className="inline-block p-4 bg-purple-600/20 rounded-full mb-4">
                            <FaShieldAlt className="text-4xl text-purple-400" />
                        </div>
                        <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
                        <p className="text-gray-400">Secure login with Multi-Factor Authentication</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium mb-2">Username</label>
                            <div className="relative">
                                <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    className="input-field pl-10"
                                    placeholder="Enter your username"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Password</label>
                            <div className="relative">
                                <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="password"
                                    className="input-field pl-10"
                                    placeholder="Enter your password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <button type="submit" className="w-full btn-primary" disabled={loading}>
                            {loading ? 'Logging in...' : 'Login with MFA'}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm">
                        <p className="text-gray-400">
                            Don't have an account?{' '}
                            <Link to="/register" className="text-purple-400 hover:text-purple-300 font-semibold">
                                Register here
                            </Link>
                        </p>
                    </div>

                    <div className="mt-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg text-sm">
                        <p className="text-gray-400 text-xs">
                            <strong className="text-blue-400">🔐 Multi-Factor Authentication:</strong> After entering your credentials, an OTP will be sent to your registered email for additional security.
                        </p>
                    </div>
                </div>
            </div>

            {/* OTP Verification Modal */}
            {showOTPModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
                    <div className="card max-w-md w-full mx-4 animate-slide-up">
                        <div className="text-center mb-6">
                            <div className="inline-block p-4 bg-green-600/20 rounded-full mb-4">
                                <FaShieldAlt className="text-4xl text-green-400" />
                            </div>
                            <h2 className="text-2xl font-bold mb-2">Multi-Factor Authentication</h2>
                            <p className="text-gray-400">
                                Enter the 6-digit OTP sent to<br />
                                <span className="text-green-400 font-semibold">{userEmail}</span>
                            </p>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium mb-2 text-center">Enter OTP Code</label>
                            <input
                                type="text"
                                className="input-field text-center text-2xl tracking-widest font-bold"
                                placeholder="000000"
                                maxLength="6"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                autoFocus
                            />
                            <p className="text-xs text-gray-500 text-center mt-2">
                                Valid for 5 minutes
                            </p>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={handleOTPVerify}
                                className="btn-primary flex-1"
                                disabled={loading || otp.length !== 6}
                            >
                                {loading ? 'Verifying...' : 'Verify & Login'}
                            </button>
                            <button
                                onClick={() => {
                                    setShowOTPModal(false);
                                    setOtp('');
                                }}
                                className="btn-secondary"
                                disabled={loading}
                            >
                                Cancel
                            </button>
                        </div>

                        <div className="mt-4 p-3 bg-green-900/20 border border-green-500/30 rounded-lg text-sm">
                            <p className="text-gray-400">
                                <strong className="text-green-400">Security Note:</strong> This additional layer of security ensures that only you can access your account, even if someone knows your password.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
