import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaEnvelope, FaKey, FaShieldAlt, FaCheckCircle } from 'react-icons/fa';
import api from '../utils/api';

export default function ForgotPassword() {
    const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [resetToken, setResetToken] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Step 1: Request OTP
    const handleRequestOTP = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await api.post('/auth/forgot-password', { email });
            toast.success('OTP sent to your email! Check your inbox.');
            setStep(2);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Verify OTP
    const handleVerifyOTP = async (e) => {
        e.preventDefault();

        if (!otp || otp.length !== 6) {
            toast.error('Please enter a valid 6-digit OTP');
            return;
        }

        setLoading(true);

        try {
            const response = await api.post('/auth/verify-reset-otp', { email, otp });
            setResetToken(response.data.resetToken);
            toast.success('OTP verified! Now set your new password.');
            setStep(3);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Invalid or expired OTP');
        } finally {
            setLoading(false);
        }
    };

    // Step 3: Reset Password
    const handleResetPassword = async (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (newPassword.length < 8) {
            toast.error('Password must be at least 8 characters long');
            return;
        }

        setLoading(true);

        try {
            await api.post('/auth/reset-password', {
                email,
                resetToken,
                newPassword
            });

            toast.success('✅ Password reset successful! You can now login.');
            setTimeout(() => navigate('/login'), 2000);
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to reset password';
            const errors = error.response?.data?.errors;

            if (errors && errors.length > 0) {
                errors.forEach(err => toast.error(err));
            } else {
                toast.error(errorMessage);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                <div className="card animate-slide-up">
                    {/* Header with progress indicator */}
                    <div className="text-center mb-8">
                        <div className="inline-block p-4 bg-purple-600/20 rounded-full mb-4">
                            {step === 1 && <FaEnvelope className="text-4xl text-purple-400" />}
                            {step === 2 && <FaShieldAlt className="text-4xl text-purple-400" />}
                            {step === 3 && <FaKey className="text-4xl text-purple-400" />}
                        </div>
                        <h1 className="text-3xl font-bold mb-2">Reset Password</h1>
                        <p className="text-gray-400">
                            {step === 1 && 'Enter your email to receive OTP'}
                            {step === 2 && 'Verify the OTP sent to your email'}
                            {step === 3 && 'Create a new secure password'}
                        </p>

                        {/* Progress Steps */}
                        <div className="flex justify-center items-center gap-2 mt-4">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${step >= 1 ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-400'}`}>
                                1
                            </div>
                            <div className={`w-12 h-1 ${step >= 2 ? 'bg-purple-600' : 'bg-gray-700'}`}></div>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${step >= 2 ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-400'}`}>
                                2
                            </div>
                            <div className={`w-12 h-1 ${step >= 3 ? 'bg-purple-600' : 'bg-gray-700'}`}></div>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${step >= 3 ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-400'}`}>
                                3
                            </div>
                        </div>
                    </div>

                    {/* Step 1: Enter Email */}
                    {step === 1 && (
                        <form onSubmit={handleRequestOTP} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium mb-2">Email Address</label>
                                <div className="relative">
                                    <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="email"
                                        className="input-field pl-10"
                                        placeholder="Enter your registered email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <button type="submit" className="w-full btn-primary" disabled={loading}>
                                {loading ? 'Sending OTP...' : 'Send OTP'}
                            </button>
                        </form>
                    )}

                    {/* Step 2: Verify OTP */}
                    {step === 2 && (
                        <form onSubmit={handleVerifyOTP} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium mb-2 text-center">Enter 6-Digit OTP</label>
                                <input
                                    type="text"
                                    className="input-field text-center text-2xl tracking-widest font-bold"
                                    placeholder="000000"
                                    maxLength="6"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                    autoFocus
                                    required
                                />
                                <p className="text-xs text-gray-500 text-center mt-2">
                                    Valid for 10 minutes
                                </p>
                                <p className="text-xs text-gray-400 text-center mt-1">
                                    Sent to: <span className="text-purple-400 font-semibold">{email}</span>
                                </p>
                            </div>

                            <div className="flex gap-4">
                                <button type="submit" className="btn-primary flex-1" disabled={loading || otp.length !== 6}>
                                    {loading ? 'Verifying...' : 'Verify OTP'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="btn-secondary"
                                    disabled={loading}
                                >
                                    Back
                                </button>
                            </div>

                            <div className="text-center">
                                <button
                                    type="button"
                                    onClick={handleRequestOTP}
                                    className="text-sm text-purple-400 hover:text-purple-300"
                                    disabled={loading}
                                >
                                    Didn't receive OTP? Resend
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Step 3: New Password */}
                    {step === 3 && (
                        <form onSubmit={handleResetPassword} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium mb-2">New Password</label>
                                <div className="relative">
                                    <FaKey className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="password"
                                        className="input-field pl-10"
                                        placeholder="Enter new password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Confirm Password</label>
                                <div className="relative">
                                    <FaKey className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="password"
                                        className="input-field pl-10"
                                        placeholder="Confirm new password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Password Requirements */}
                            <div className="p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg text-xs">
                                <p className="text-blue-400 font-semibold mb-2">Password Requirements:</p>
                                <ul className="text-gray-400 space-y-1">
                                    <li>✓ At least 8 characters long</li>
                                    <li>✓ One uppercase letter (A-Z)</li>
                                    <li>✓ One lowercase letter (a-z)</li>
                                    <li>✓ One number (0-9)</li>
                                    <li>✓ One special character (!@#$%^&*)</li>
                                    <li>✓ Cannot be a previously used password</li>
                                </ul>
                            </div>

                            <button type="submit" className="w-full btn-primary" disabled={loading}>
                                {loading ? 'Resetting Password...' : 'Reset Password'}
                            </button>
                        </form>
                    )}

                    {/* Back to Login Link */}
                    <div className="mt-6 text-center text-sm">
                        <p className="text-gray-400">
                            Remember your password?{' '}
                            <Link to="/login" className="text-purple-400 hover:text-purple-300 font-semibold">
                                Back to Login
                            </Link>
                        </p>
                    </div>

                    {/* Security Notice */}
                    <div className="mt-4 p-3 bg-purple-900/20 border border-purple-500/30 rounded-lg text-sm">
                        <p className="text-gray-400 text-xs">
                            <strong className="text-purple-400">🔒 Security Notice:</strong> For your security, you'll receive a one-time password (OTP) via email to verify your identity before resetting your password.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
