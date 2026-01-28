import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FaUser, FaLock, FaEnvelope, FaIdCard, FaUserTag, FaShieldAlt } from 'react-icons/fa';
import api from '../utils/api';

export default function Register() {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        fullName: '',
        role: 'technician'
    });
    const [loading, setLoading] = useState(false);
    const [showOTPModal, setShowOTPModal] = useState(false);
    const [otp, setOtp] = useState('');
    const [tempToken, setTempToken] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            // Step 1: Register user (without logging in)
            const response = await api.post('/auth/register', formData);
            setTempToken(response.data.token);

            // Step 2: Request OTP
            await api.post('/auth/request-otp?purpose=register', {}, {
                headers: { Authorization: `Bearer ${response.data.token}` }
            });

            toast.success('OTP sent to your email!');
            setShowOTPModal(true);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Registration failed');
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

            toast.success('✅ Registration successful! OTP verified.');
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
        <div className="min-h-screen flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-lg">
                <div className="card animate-slide-up">
                    <h1 className="text-3xl font-bold text-center mb-2">Create Account</h1>
                    <p className="text-gray-400 text-center mb-8">Join the secure toxicology portal with MFA</p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Full Name</label>
                            <div className="relative">
                                <FaIdCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    className="input-field pl-10"
                                    placeholder="John Doe"
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Username</label>
                            <div className="relative">
                                <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    className="input-field pl-10"
                                    placeholder="johndoe"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Email *</label>
                            <div className="relative">
                                <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="email"
                                    className="input-field pl-10"
                                    placeholder="john@example.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                />
                            </div>
                            <p className="text-xs text-purple-400 mt-1 flex items-center">
                                <FaShieldAlt className="mr-1" />
                                OTP will be sent to this email for verification
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Role</label>
                            <div className="relative">
                                <FaUserTag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" />
                                <select
                                    className="input-field pl-10 appearance-none cursor-pointer"
                                    style={{
                                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%239CA3AF' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                                        backgroundPosition: 'right 0.5rem center',
                                        backgroundRepeat: 'no-repeat',
                                        backgroundSize: '1.5em 1.5em',
                                        paddingRight: '2.5rem'
                                    }}
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                >
                                    <option value="technician" className="bg-slate-800 text-white py-2">Lab Technician</option>
                                    <option value="director" className="bg-slate-800 text-white py-2">Lab Director</option>
                                    <option value="police" className="bg-slate-800 text-white py-2">Police / District Attorney</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Password</label>
                            <div className="relative">
                                <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="password"
                                    className="input-field pl-10"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Confirm Password</label>
                            <div className="relative">
                                <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="password"
                                    className="input-field pl-10"
                                    placeholder="••••••••"
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <button type="submit" className="w-full btn-primary" disabled={loading}>
                            {loading ? 'Creating Account...' : 'Register with MFA'}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm">
                        <p className="text-gray-400">
                            Already have an account?{' '}
                            <Link to="/login" className="text-purple-400 hover:text-purple-300 font-semibold">
                                Login here
                            </Link>
                        </p>
                    </div>
                </div>
            </div>

            {/* OTP Verification Modal */}
            {showOTPModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
                    <div className="card max-w-md w-full mx-4 animate-slide-up">
                        <div className="text-center mb-6">
                            <div className="inline-block p-4 bg-purple-600/20 rounded-full mb-4">
                                <FaShieldAlt className="text-4xl text-purple-400" />
                            </div>
                            <h2 className="text-2xl font-bold mb-2">Multi-Factor Authentication</h2>
                            <p className="text-gray-400">
                                Enter the 6-digit OTP sent to<br />
                                <span className="text-purple-400 font-semibold">{formData.email}</span>
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
                                {loading ? 'Verifying...' : 'Verify & Complete Registration'}
                            </button>
                            <button
                                onClick={() => setShowOTPModal(false)}
                                className="btn-secondary"
                                disabled={loading}
                            >
                                Cancel
                            </button>
                        </div>

                        <div className="mt-4 p-3 bg-purple-900/20 border border-purple-500/30 rounded-lg text-sm">
                            <p className="text-gray-400">
                                <strong className="text-purple-400">Security Note:</strong> This OTP ensures that only you can complete the registration using your verified email address.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
