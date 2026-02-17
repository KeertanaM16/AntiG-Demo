import React, { useState } from 'react';
import { authAPI } from '../utils/api';

const Register = ({ onRegisterSuccess }) => {
    const [formData, setFormData] = useState({
        // Basic Info
        email: '',
        password: '',
        confirmPassword: '',
        full_name: '',

        // Profile Data
        phone: '',
        date_of_birth: '',
        bio: '',

        // Preferences
        theme: 'light',
        language: 'en',
        notifications_enabled: true,

        // Address
        street: '',
        city: '',
        state: '',
        postal_code: '',
        country: '',
        address_type: 'home'
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);

    const handleChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setFormData({
            ...formData,
            [e.target.name]: value
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
            // Prepare data for API
            // Note: We send date_of_birth as is to allow testing invalid formats
            const registrationData = {
                ...formData
            };
            delete registrationData.confirmPassword; // Don't send confirm password

            console.log('Submitting registration:', registrationData);

            const result = await authAPI.register(registrationData);

            if (result.error) {
                setMessage({ type: 'error', text: result.error });
            } else {
                setMessage({ type: 'success', text: 'Registration successful! Please login.' });
                // Reset form
                setFormData({
                    email: '',
                    password: '',
                    confirmPassword: '',
                    full_name: '',
                    phone: '',
                    date_of_birth: '',
                    bio: '',
                    theme: 'light',
                    language: 'en',
                    notifications_enabled: true,
                    street: '',
                    city: '',
                    state: '',
                    postal_code: '',
                    country: '',
                    address_type: 'home'
                });

                // Call success callback
                if (onRegisterSuccess) {
                    setTimeout(() => onRegisterSuccess(result.user), 2000);
                }
            }
        } catch (error) {
            console.error('Registration error:', error);
            setMessage({ type: 'error', text: 'Registration failed. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md my-8">
            <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Complete Registration</h2>

            <form onSubmit={handleSubmit} className="space-y-6">

                {/* Section 1: Account Info */}
                <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                    <h3 className="text-lg font-semibold mb-4 text-blue-600">Account Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                            <input
                                type="email"
                                name="email"
                                className="w-full px-3 py-2 border rounded-md"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                            <input
                                type="text"
                                name="full_name"
                                className="w-full px-3 py-2 border rounded-md"
                                value={formData.full_name}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                            <input
                                type="password"
                                name="password"
                                className="w-full px-3 py-2 border rounded-md"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password *</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                className="w-full px-3 py-2 border rounded-md"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* Section 2: Profile Data */}
                <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                    <h3 className="text-lg font-semibold mb-4 text-gray-600">Profile Data</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                            <input
                                type="text"
                                name="phone"
                                className="w-full px-3 py-2 border rounded-md"
                                value={formData.phone}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Date of Birth
                            </label>
                            <input
                                type="text"
                                name="date_of_birth"
                                placeholder="YYYY-MM-DD"
                                className="w-full px-3 py-2 border rounded-md"
                                value={formData.date_of_birth}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                            <textarea
                                name="bio"
                                className="w-full px-3 py-2 border rounded-md"
                                value={formData.bio}
                                onChange={handleChange}
                                rows="2"
                            />
                        </div>
                    </div>
                </div>

                {/* Section 3: Preferences */}
                <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                    <h3 className="text-lg font-semibold mb-4 text-gray-600">Preferences</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Theme</label>
                            <select
                                name="theme"
                                className="w-full px-3 py-2 border rounded-md"
                                value={formData.theme}
                                onChange={handleChange}
                            >
                                <option value="light">Light</option>
                                <option value="dark">Dark</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                            <select
                                name="language"
                                className="w-full px-3 py-2 border rounded-md"
                                value={formData.language}
                                onChange={handleChange}
                            >
                                <option value="en">English</option>
                                <option value="es">Spanish</option>
                                <option value="fr">French</option>
                            </select>
                        </div>
                        <div className="flex items-center mt-6">
                            <input
                                type="checkbox"
                                name="notifications_enabled"
                                className="h-4 w-4 text-blue-600"
                                checked={formData.notifications_enabled}
                                onChange={handleChange}
                            />
                            <label className="ml-2 block text-sm text-gray-900">Enable Notifications</label>
                        </div>
                    </div>
                </div>

                {/* Section 4: Address */}
                <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                    <h3 className="text-lg font-semibold mb-4 text-gray-600">Address</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Address Type</label>
                            <select
                                name="address_type"
                                className="w-full px-3 py-2 border rounded-md"
                                value={formData.address_type}
                                onChange={handleChange}
                            >
                                <option value="home">Home</option>
                                <option value="work">Work</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Street</label>
                            <input
                                type="text"
                                name="street"
                                className="w-full px-3 py-2 border rounded-md"
                                value={formData.street}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                            <input
                                type="text"
                                name="city"
                                className="w-full px-3 py-2 border rounded-md"
                                value={formData.city}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                            <input
                                type="text"
                                name="country"
                                className="w-full px-3 py-2 border rounded-md"
                                value={formData.country}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                </div>

                {message && (
                    <div className={`text-sm p-4 rounded-md ${message.type === 'success'
                        ? 'bg-green-100 text-green-800 border border-green-300'
                        : 'bg-red-100 text-red-800 border border-red-300'
                        }`}>
                        {message.text}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={!formData.email || !formData.password || loading}
                    className={`w-full py-3 px-4 rounded-md text-white font-bold text-lg shadow-md transition-colors ${!formData.email || !formData.password || loading
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                >
                    {loading ? 'Registering...' : 'Complete Registration'}
                </button>
            </form>
        </div>
    );
};

export default Register;
