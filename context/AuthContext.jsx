'use client';

import { createContext, useState, useContext, useEffect, useCallback } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);
    const [eventPreference, setEventPreference] = useState(null);

    const persistSession = (data) => {
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
    };

    const validateSession = useCallback(async () => {
        try {
            const res = await fetch('/api/auth/me', { credentials: 'include' });
            if (res.ok) {
                const data = await res.json();
                if (data.authenticated) {
                    setUser(data.user);
                    const savedToken = localStorage.getItem('token');
                    setToken(savedToken);
                    return;
                }
            }
        } catch {
            // Session invalid
        }

        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }, []);

    useEffect(() => {
        const savedEvent = localStorage.getItem('eventPreference');
        if (savedEvent) setEventPreference(savedEvent);

        validateSession().finally(() => setLoading(false));
    }, [validateSession]);

    const login = async (username, password) => {
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
                username: username || '',
                password,
            }),
        });
        const data = await res.json();

        if (!data.success) throw new Error(data.message);

        persistSession(data);
        return data;
    };

    /** Master unlock with site password only. */
    const unlockAdmin = async (password) => login('', password);

    const register = async (name, username, password) => {
        const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ name, username, password }),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.message);

        if (data.token && data.user) {
            persistSession(data);
        }
        return data;
    };

    const logout = async () => {
        await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    };

    const updateEventPreference = (pref) => {
        setEventPreference(pref);
        localStorage.setItem('eventPreference', pref);
    };

    return (
        <AuthContext.Provider value={{
            user, token, loading, login, unlockAdmin, register, logout,
            isAdmin: user?.isAdmin,
            eventPreference,
            setEventPreference: updateEventPreference,
            refreshSession: validateSession
        }}>
            {children}
        </AuthContext.Provider>
    );
};
