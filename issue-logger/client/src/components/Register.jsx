import React, { useState } from 'react';
import { authAPI } from '../utils/api';

const Register = ({ onRegisterSuccess }) => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        fullName: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        if (message?.type === 'error') setMessage(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.email || !formData.password) {
            setMessage({ type: 'error', text: 'Email and password are required.' });
            return;
        }

        if (formData.password.length < 6) {
            setMessage({ type: 'error', text: 'Password must be at least 6 characters.' });
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setMessage({ type: 'error', text: 'Passwords do not match.' });
            return;
        }

        setLoading(true);
        setMessage(null);

        try {
            const result = await authAPI.register(
                formData.email,
                formData.password,
                formData.fullName
            );

            if (result.error) {
                setMessage({ type: 'error', text: result.error });
            } else {
                setMessage({ type: 'success', text: 'Registration successful! Please login.' });
                setFormData({
                    email: '',
                    password: '',
                    confirmPassword: '',
                    fullName: ''
                });

                // Call success callback
                if (onRegisterSuccess) {
                    setTimeout(() => onRegisterSuccess(result.user), 2000);
                }
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Registration failed. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Register</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                        placeholder="your.email@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name
                    </label>
                    <input
                        type="text"
                        id="fullName"
                        name="fullName"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                        placeholder="John Doe"
                        value={formData.fullName}
                        onChange={handleChange}
                    />
                </div>

                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                        Password <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                    <p className="text-xs text-gray-500 mt-1">At least 6 characters</p>
                </div>

                <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                        Confirm Password <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                    />
                </div>

                {message && (
                    <div className={`text-sm p-3 rounded-md ${message.type === 'success'
                            ? 'bg-green-50 text-green-700 border border-green-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                        }`}>
                        {message.text}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={!formData.email || !formData.password || loading}
                    className={`w-full py-2 px-4 rounded-md text-white font-medium transition-colors ${!formData.email || !formData.password || loading
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700 shadow-sm'
                        }`}
                >
                    {loading ? 'Registering...' : 'Register'}
                </button>
            </form>
        </div>
    );
};

export default Register;
