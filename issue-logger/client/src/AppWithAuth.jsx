import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import Register from './components/Register';
import IssueForm from './components/IssueForm';
import IssueListWithAuth from './components/IssueListWithAuth';
import UserProfile from './components/UserProfile';

const AppContent = () => {
    const { user, logout, isAuthenticated, isAdmin } = useAuth();
    const [view, setView] = useState('login'); // 'login', 'register'
    const [appView, setAppView] = useState('issues'); // 'issues', 'profile'
    const [refreshIssues, setRefreshIssues] = useState(0);

    const handleLogout = async () => {
        await logout();
    };

    const handleIssueAdded = () => {
        setRefreshIssues(prev => prev + 1);
    };

    // Not authenticated - show login/register
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
                <div className="max-w-6xl mx-auto">
                    <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
                        Issue Logging System
                    </h1>

                    <div className="flex justify-center gap-4 mb-8">
                        <button
                            onClick={() => setView('login')}
                            className={`px-6 py-2 rounded-md font-medium transition-colors ${view === 'login'
                                ? 'bg-blue-600 text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-50'
                                }`}
                        >
                            Login
                        </button>
                        <button
                            onClick={() => setView('register')}
                            className={`px-6 py-2 rounded-md font-medium transition-colors ${view === 'register'
                                ? 'bg-blue-600 text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-50'
                                }`}
                        >
                            Register
                        </button>
                    </div>

                    {view === 'login' && <Login />}
                    {view === 'register' && <Register onRegisterSuccess={() => setView('login')} />}

                    {view === 'register' && (
                        <p className="text-center mt-4 text-sm text-gray-600">
                            Already have an account?{' '}
                            <button
                                onClick={() => setView('login')}
                                className="text-blue-600 hover:underline font-medium"
                            >
                                Login here
                            </button>
                        </p>
                    )}

                    {view === 'login' && (
                        <p className="text-center mt-4 text-sm text-gray-600">
                            Don't have an account?{' '}
                            <button
                                onClick={() => setView('register')}
                                className="text-blue-600 hover:underline font-medium"
                            >
                                Register here
                            </button>
                        </p>
                    )}
                </div>
            </div>
        );
    }

    // Authenticated - show main app
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">
                                Issue Logging System
                            </h1>
                            <p className="text-sm text-gray-600 mt-1">
                                Welcome, <span className="font-medium">{user?.full_name || user?.email}</span>
                                {isAdmin && (
                                    <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">
                                        Admin
                                    </span>
                                )}
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setAppView('issues')}
                                className={`px-4 py-2 rounded-md font-medium transition-colors ${appView === 'issues'
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                Issue Log
                            </button>
                            <button
                                onClick={() => setAppView('profile')}
                                className={`px-4 py-2 rounded-md font-medium transition-colors ${appView === 'profile'
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                My Profile
                            </button>
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium transition-colors ml-4"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>

                {appView === 'issues' ? (
                    <>
                        {/* Issue Form */}
                        <div className="mb-8">
                            <IssueForm onIssueAdded={handleIssueAdded} />
                        </div>

                        {/* Issue List */}
                        <IssueListWithAuth refresh={refreshIssues} />
                    </>
                ) : (
                    /* Profile View */
                    <UserProfile />
                )}

                {/* Footer */}
                <div className="mt-12 text-center text-sm text-gray-600">
                    <p>
                        🔐 Secure JWT Authentication | 👥 Role-Based Access Control
                    </p>
                    <p className="mt-2">
                        {isAdmin ? (
                            <span className="text-purple-600 font-medium">
                                As an admin, you can edit and delete any issue
                            </span>
                        ) : (
                            <span className="text-blue-600">
                                You can edit and delete only your own issues
                            </span>
                        )}
                    </p>
                </div>
            </div>
        </div>
    );
};

function App() {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
}

export default App;
