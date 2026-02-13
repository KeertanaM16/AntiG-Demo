import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email || !password) {
            setMessage({ type: 'error', text: 'Please fill in all fields.' });
            return;
        }

        setLoading(true);
        setMessage(null);

        try {
            const result = await login(email, password);

            if (result.success) {
                setMessage({ type: 'success', text: 'Login successful! Redirecting...' });
                // AuthContext will automatically update isAuthenticated state
                // No need for manual redirect - the app will re-render automatically
            } else {
                setMessage({ type: 'error', text: result.error || 'Login failed' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Login failed. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Login</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="email"
                        id="email"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                        placeholder="your.email@example.com"
                        value={email}
                        onChange={(e) => {
                            setEmail(e.target.value);
                            if (message?.type === 'error') setMessage(null);
                        }}
                        required
                    />
                </div>

                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                        Password <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="password"
                        id="password"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => {
                            setPassword(e.target.value);
                            if (message?.type === 'error') setMessage(null);
                        }}
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
                    disabled={!email || !password || loading}
                    className={`w-full py-2 px-4 rounded-md text-white font-medium transition-colors ${!email || !password || loading
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 shadow-sm'
                        }`}
                >
                    {loading ? 'Logging in...' : 'Login'}
                </button>
            </form>
        </div>
    );
};

export default Login;
