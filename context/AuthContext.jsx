'use client';

import { createContext, useState, useContext, useEffect, useCallback } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);
    const [eventPreference, setEventPreference] = useState(null);

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

    const login = async (email, password) => {
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();

        if (!data.success) throw new Error(data.message);

        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        return data;
    };

    const register = async (name, email, password) => {
        const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.message);
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
            user, token, loading, login, register, logout,
            isAdmin: user?.isAdmin,
            eventPreference,
            setEventPreference: updateEventPreference,
            refreshSession: validateSession
        }}>
            {children}
        </AuthContext.Provider>
    );
};
