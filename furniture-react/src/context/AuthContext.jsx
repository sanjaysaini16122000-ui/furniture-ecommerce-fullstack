import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { authAPI, getTokens, setTokens, clearTokens, getStoredUser, setStoredUser } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    const checkAuth = useCallback(async () => {
        const { access } = getTokens();
        if (access) {
            try {
                // Validate token by fetching profile
                const profile = await authAPI.getProfile();
                setUser(profile);
                setStoredUser(profile);
                setIsAuthenticated(true);
            } catch (error) {
                console.error('[Auth] Token invalid, clearing:', error);
                clearTokens();
                setUser(null);
                setIsAuthenticated(false);
            }
        } else {
            // No tokens, check for stored user data (offline fallback)
            const stored = getStoredUser();
            if (stored) {
                // Stored user but no token — clean up
                clearTokens();
            }
        }
        setLoading(false);
    }, []);

    // Check for existing tokens on mount
    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    const login = useCallback(async (email, password) => {
        try {
            const data = await authAPI.login(email, password);
            setTokens(data.access, data.refresh);

            // Fetch user profile after login
            const profile = await authAPI.getProfile();
            setUser(profile);
            setStoredUser(profile);
            setIsAuthenticated(true);

            return { success: true };
        } catch (error) {
            console.error('[Auth] Login error:', error);
            let errorMessage = 'Invalid email or password';

            if (error.response?.data) {
                const errData = error.response.data;
                if (errData.non_field_errors) {
                    errorMessage = errData.non_field_errors[0];
                } else if (errData.detail) {
                    errorMessage = errData.detail;
                } else if (errData.email) {
                    errorMessage = errData.email[0];
                } else if (errData.password) {
                    errorMessage = errData.password[0];
                }
            }

            return { success: false, error: errorMessage };
        }
    }, []);

    const register = useCallback(async (email, password, displayName) => {
        try {
            // Split displayName into first_name and last_name
            const nameParts = (displayName || '').trim().split(' ');
            const firstName = nameParts[0] || '';
            const lastName = nameParts.slice(1).join(' ') || '';

            await authAPI.register(email, firstName, lastName, password);

            // After registration, auto-login
            const loginData = await authAPI.login(email, password);
            setTokens(loginData.access, loginData.refresh);

            const profile = await authAPI.getProfile();
            setUser(profile);
            setStoredUser(profile);
            setIsAuthenticated(true);

            return { success: true };
        } catch (error) {
            console.error('[Auth] Register error:', error);
            let errorMessage = 'Registration failed';

            if (error.response?.data) {
                const errData = error.response.data;
                if (errData.email) {
                    errorMessage = Array.isArray(errData.email) ? errData.email[0] : errData.email;
                } else if (errData.password) {
                    errorMessage = Array.isArray(errData.password) ? errData.password[0] : errData.password;
                } else if (errData.non_field_errors) {
                    errorMessage = errData.non_field_errors[0];
                } else if (errData.detail) {
                    errorMessage = errData.detail;
                }
            }

            return { success: false, error: errorMessage };
        }
    }, []);

    const resetPassword = useCallback(async (email) => {
        try {
            await authAPI.resetPassword(email);
            return { success: true };
        } catch (error) {
            console.error('[Auth] Reset error:', error);
            let errorMessage = 'Failed to send reset email';

            if (error.response?.data?.detail) {
                errorMessage = error.response.data.detail;
            }

            return { success: false, error: errorMessage };
        }
    }, []);

    const logout = useCallback(async () => {
        try {
            const { refresh } = getTokens();
            if (refresh) {
                await authAPI.logout(refresh);
            }
        } catch (error) {
            console.error('[Auth] Logout error:', error);
        } finally {
            clearTokens();
            setUser(null);
            setIsAuthenticated(false);
        }
    }, []);

    const updateProfile = useCallback(async (data, isFormData = false) => {
        try {
            const updatedProfile = await authAPI.updateProfile(data, isFormData);
            // Re-fetch or merge profile to stay in sync
            const newProfile = await authAPI.getProfile();
            setUser(newProfile);
            setStoredUser(newProfile);
            return { success: true, user: newProfile };
        } catch (error) {
            console.error('[Auth] Update profile error:', error);
            let errorMessage = 'Failed to update profile';
            if (error.response?.data) {
                const errData = error.response.data;
                if (errData.detail) errorMessage = errData.detail;
                else if (typeof errData === 'object') {
                    // Just take the first error message
                    const firstKey = Object.keys(errData)[0];
                    if (firstKey) {
                        errorMessage = Array.isArray(errData[firstKey]) ? errData[firstKey][0] : errData[firstKey];
                    }
                }
            }
            return { success: false, error: errorMessage };
        }
    }, []);

    const changePassword = useCallback(async (oldPassword, newPassword) => {
        try {
            await authAPI.changePassword(oldPassword, newPassword);
            return { success: true };
        } catch (error) {
            console.error('[Auth] Change password error:', error);
            let errorMessage = 'Failed to change password';

            if (error.response?.data) {
                const errData = error.response.data;
                if (errData.detail) {
                    errorMessage = errData.detail;
                } else if (errData.non_field_errors) {
                    errorMessage = errData.non_field_errors[0];
                } else if (errData.old_password) {
                    errorMessage = `Old Password: ${errData.old_password[0]}`;
                } else if (errData.new_password) {
                    errorMessage = `New Password: ${errData.new_password[0]}`;
                }
            }

            return { success: false, error: errorMessage };
        }
    }, []);

    const value = useMemo(() => ({
        user,
        isAuthenticated,
        login,
        register,
        resetPassword,
        logout,
        changePassword,
        updateProfile,
        loading
    }), [user, isAuthenticated, login, register, resetPassword, logout, changePassword, updateProfile, loading]);

    // Show loading while checking auth state
    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                background: '#1a1a2e',
                color: '#fff'
            }}>
                Loading...
            </div>
        );
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
}
