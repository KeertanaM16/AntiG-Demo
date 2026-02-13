import React, { useState, useEffect } from 'react';
import { authAPI } from '../utils/api';

const UserProfile = () => {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await authAPI.getProfile();
                if (data.error) throw new Error(data.error);
                setUserData(data.user);
            } catch (err) {
                console.error('Failed to load profile:', err);
                setError('Failed to load user profile.');
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    if (loading) return (
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );

    if (error) return (
        <div className="text-center text-red-600 p-8 font-semibold text-lg border border-red-200 bg-red-50 rounded-lg m-4">
            {error}
        </div>
    );

    if (!userData) return null;

    // Helper to format date
    const formatDate = (dateString) => {
        if (!dateString) return <span className="text-gray-400 italic">Not set</span>;
        return new Date(dateString).toLocaleDateString();
    };

    // Helper to render section status
    const renderStatus = (data, name) => {
        if (!data) return (
            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                ❌ Missing / Failed
            </span>
        );
        return (
            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                ✅ Present
            </span>
        );
    };

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            <h2 className="text-3xl font-bold text-gray-800 mb-8 border-b pb-4">User Profile Inspection</h2>

            {/* 1. Account Info (Always Present) */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-blue-50 px-6 py-4 border-b border-blue-100 flex items-center">
                    <h3 className="text-lg font-semibold text-blue-800">1. Account Information</h3>
                    {renderStatus(userData, 'Account')}
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-500">Full Name</label>
                        <p className="mt-1 text-gray-900 font-medium">{userData.full_name || 'N/A'}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-500">Email</label>
                        <p className="mt-1 text-gray-900 font-medium">{userData.email}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-500">Role</label>
                        <span className="mt-1 px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-600 uppercase">
                            {userData.role}
                        </span>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-500">Joined</label>
                        <p className="mt-1 text-gray-900">{formatDate(userData.created_at)}</p>
                    </div>
                </div>
            </div>

            {/* 2. Profile Data (Target for Partial Insertion Bug) */}
            <div className={`rounded-lg shadow-sm border overflow-hidden ${!userData.profile ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'}`}>
                <div className={`px-6 py-4 border-b flex items-center ${!userData.profile ? 'bg-red-100 border-red-200' : 'bg-gray-50 border-gray-100'}`}>
                    <h3 className={`text-lg font-semibold ${!userData.profile ? 'text-red-800' : 'text-gray-800'}`}>
                        2. Profile Details
                    </h3>
                    {renderStatus(userData.profile, 'Profile')}
                </div>

                {!userData.profile ? (
                    <div className="p-6 text-center">
                        <p className="text-red-600 font-medium mb-2">⚠️ Data Missing!</p>
                    </div>
                ) : (
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-500">Phone</label>
                            <p className="mt-1 text-gray-900">{userData.profile.phone || <span className="text-gray-400 italic">Not set</span>}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500">Date of Birth</label>
                            <p className="mt-1 text-gray-900">{formatDate(userData.profile.date_of_birth)}</p>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-500">Bio</label>
                            <p className="mt-1 text-gray-900 bg-gray-50 p-3 rounded border border-gray-100">
                                {userData.profile.bio || <span className="text-gray-400 italic">No bio provided</span>}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* 3. Preferences (Should persist even if profile fails) */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-green-50 px-6 py-4 border-b border-green-100 flex items-center">
                    <h3 className="text-lg font-semibold text-green-800">3. User Preferences</h3>
                    {renderStatus(userData.preferences, 'Preferences')}
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-500">Theme</label>
                        <p className="mt-1 capitalize px-2 py-1 bg-gray-100 inline-block rounded text-sm">
                            {userData.preferences?.theme || 'Default'}
                        </p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-500">Language</label>
                        <p className="mt-1 uppercase px-2 py-1 bg-gray-100 inline-block rounded text-sm font-mono">
                            {userData.preferences?.language || 'EN'}
                        </p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-500">Notifications</label>
                        <p className="mt-1">
                            {userData.preferences?.notifications_enabled ? '🔔 Enabled' : '🔕 Disabled'}
                        </p>
                    </div>
                </div>
            </div>

            {/* 4. Address (Should persist even if profile fails) */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-yellow-50 px-6 py-4 border-b border-yellow-100 flex items-center">
                    <h3 className="text-lg font-semibold text-yellow-800">4. Address Information</h3>
                    {renderStatus(userData.address, 'Address')}
                </div>
                <div className="p-6">
                    {!userData.address ? (
                        <p className="text-gray-400 italic">No address on file</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-500">Street</label>
                                <p className="mt-1 text-gray-900">{userData.address.street}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500">City/State</label>
                                <p className="mt-1 text-gray-900">
                                    {userData.address.city}, {userData.address.state} {userData.address.postal_code}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500">Country</label>
                                <p className="mt-1 text-gray-900">{userData.address.country}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
