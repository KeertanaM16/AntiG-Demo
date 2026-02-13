import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI, tokenManager, isAuthenticated } from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is already logged in
        const initAuth = async () => {
            try {
                if (isAuthenticated()) {
                    const storedUser = tokenManager.getUser();
                    if (storedUser) {
                        setUser(storedUser);
                    } else {
                        // Try to fetch profile
                        const result = await authAPI.getProfile();
                        if (result.user) {
                            setUser(result.user);
                            tokenManager.setUser(result.user);
                        }
                    }
                }
            } catch (error) {
                console.error('Auth initialization error:', error);
                tokenManager.clearTokens();
            } finally {
                setLoading(false);
            }
        };

        initAuth();
    }, []);

    const login = async (email, password) => {
        try {
            const result = await authAPI.login(email, password);
            if (result.user) {
                setUser(result.user);
                return { success: true, user: result.user };
            }
            return { success: false, error: result.error };
        } catch (error) {
            return { success: false, error: 'Login failed' };
        }
    };

    const register = async (email, password, fullName) => {
        try {
            const result = await authAPI.register(email, password, fullName);
            if (result.user) {
                return { success: true, user: result.user };
            }
            return { success: false, error: result.error };
        } catch (error) {
            return { success: false, error: 'Registration failed' };
        }
    };

    const logout = async () => {
        try {
            await authAPI.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setUser(null);
            tokenManager.clearTokens();
        }
    };

    const value = {
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
