import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FaUser, FaLock, FaFlask } from 'react-icons/fa';

export default function Login() {
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await login(formData.username, formData.password);
            toast.success('Login successful!');
            navigate('/dashboard');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                <div className="card animate-slide-up">
                    <div className="text-center mb-8">
                        <div className="inline-block p-4 glass-light rounded-full mb-4">
                            <FaFlask className="text-5xl text-purple-400" />
                        </div>
                        <h1 className="text-3xl font-bold">Welcome Back</h1>
                        <p className="text-gray-400 mt-2">Component 1A: Single-Factor Authentication</p>
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
                            <p className="text-xs text-gray-500 mt-1">
                                🔒 Passwords are hashed with bcrypt + unique salt (Component 4A)
                            </p>
                        </div>

                        <button
                            type="submit"
                            className="w-full btn-primary"
                            disabled={loading}
                        >
                            {loading ? (
                                <span className="flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white mr-2"></div>
                                    Logging in...
                                </span>
                            ) : (
                                'Login'
                            )}
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

                    <div className="mt-6 p-4 glass-light rounded-lg">
                        <p className="text-xs text-gray-400">
                            <strong>Security Note:</strong> This login implements Single-Factor Authentication.
                            Multi-Factor Authentication (OTP) is required when Directors finalize reports.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
