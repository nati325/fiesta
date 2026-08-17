'use client';

import { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

const EMPTY_PROFILE = {
    completedCategories: [],
    date: '',
    region: '',
    guests: '',
    budget: '',
    onboardingComplete: false,
    lastCategory: '',
    lastVisitedAt: null,
};

function readLocalProfile() {
    try {
        const savedEvent = localStorage.getItem('eventPreference');
        const savedProfile = localStorage.getItem('fiesta_event_profile');
        let profile = { ...EMPTY_PROFILE };
        if (savedProfile) {
            const parsed = JSON.parse(savedProfile);
            if (parsed && typeof parsed === 'object') {
                profile = {
                    ...profile,
                    ...parsed,
                    onboardingComplete: Boolean(
                        parsed.onboardingComplete
                        || savedEvent
                        || parsed.date
                        || parsed.region
                        || parsed.guests
                        || parsed.budget
                        || (Array.isArray(parsed.completedCategories) && parsed.completedCategories.length > 0)
                    ),
                };
            }
        } else if (savedEvent) {
            profile = { ...profile, onboardingComplete: true };
        }
        return { eventPreference: savedEvent || null, eventProfile: profile };
    } catch {
        return { eventPreference: null, eventProfile: { ...EMPTY_PROFILE } };
    }
}

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);
    const [eventPreference, setEventPreference] = useState(null);
    const [eventProfile, setEventProfile] = useState({ ...EMPTY_PROFILE });
    const [eventReady, setEventReady] = useState(false);
    const [journeyHydrated, setJourneyHydrated] = useState(false);
    const journeySyncRef = useRef(null);

    const persistSession = (data) => {
        setToken(data.token);
        setUser({ ...data.user, eventJourney: data.user?.eventJourney ?? null });
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
    };

    const validateSession = useCallback(async () => {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);
        try {
            const res = await fetch('/api/auth/me', {
                credentials: 'include',
                signal: controller.signal,
            });
            if (res.ok) {
                const data = await res.json();
                if (data.authenticated) {
                    setUser({ ...data.user, eventJourney: data.user?.eventJourney ?? null });
                    const savedToken = localStorage.getItem('token');
                    setToken(savedToken);
                    return;
                }
            }
        } catch {
            // Session invalid or timed out — stay logged out / local.
        } finally {
            clearTimeout(timeout);
        }

        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }, []);

    useEffect(() => {
        const local = readLocalProfile();
        setEventPreference(local.eventPreference);
        setEventProfile(local.eventProfile);
        setEventReady(true);
        // Guests are hydrated immediately from local storage.
        if (!localStorage.getItem('token')) setJourneyHydrated(true);

        validateSession().finally(() => setLoading(false));
    }, [validateSession]);

    // Sync account journey once per logged-in user.
    useEffect(() => {
        if (!eventReady || !token || !user?.id || String(user.id).startsWith('master-admin')) {
            if (!token) setJourneyHydrated(true);
            return undefined;
        }

        const userId = String(user.id);
        if (journeySyncRef.current === userId) {
            setJourneyHydrated(true);
            return undefined;
        }
        journeySyncRef.current = userId;

        let cancelled = false;
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);

        fetch('/api/auth/event-journey', {
            headers: { Authorization: `Bearer ${token}` },
            credentials: 'include',
            signal: controller.signal,
        })
            .then((response) => (response.ok ? response.json() : null))
            .then((data) => {
                if (cancelled) return;
                const remote = data?.journey || null;
                setUser((prev) => (prev ? { ...prev, eventJourney: remote || {} } : prev));

                if (remote?.onboardingComplete) {
                    const next = {
                        ...EMPTY_PROFILE,
                        ...remote,
                        completedCategories: [
                            ...new Set([
                                ...(remote.completedCategories || []),
                            ]),
                        ],
                        onboardingComplete: true,
                    };
                    if (remote.eventType) {
                        setEventPreference(remote.eventType);
                        localStorage.setItem('eventPreference', remote.eventType);
                    }
                    setEventProfile(next);
                    localStorage.setItem('fiesta_event_profile', JSON.stringify(next));
                } else {
                    const local = readLocalProfile();
                    if (local.eventProfile.onboardingComplete) {
                        fetch('/api/auth/event-journey?mode=merge', {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json',
                                Authorization: `Bearer ${token}`,
                            },
                            credentials: 'include',
                            body: JSON.stringify({
                                ...local.eventProfile,
                                eventType: local.eventPreference || '',
                            }),
                        }).catch(() => {});
                    }
                }
            })
            .catch(() => {
                // Keep local journey if account sync fails/times out.
                setUser((prev) => (prev ? { ...prev, eventJourney: prev.eventJourney ?? {} } : prev));
            })
            .finally(() => {
                clearTimeout(timeout);
                if (!cancelled) setJourneyHydrated(true);
            });

        return () => {
            cancelled = true;
            clearTimeout(timeout);
            controller.abort();
        };
    }, [eventReady, token, user?.id]);

    const login = async (username, password) => {
        let favorites = [];
        try {
            const saved = localStorage.getItem('fiesta_favorites');
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed)) favorites = parsed.map(String);
            }
        } catch {
            /* ignore */
        }

        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
                username: username || '',
                password,
                favorites,
            }),
        });
        const data = await res.json();

        if (!data.success) throw new Error(data.message);

        journeySyncRef.current = null;
        setJourneyHydrated(false);
        persistSession(data);
        return data;
    };

    /** Master unlock with site password only. */
    const unlockAdmin = async (password) => login('', password);

    const register = async (name, username, password) => {
        let favorites = [];
        try {
            const saved = localStorage.getItem('fiesta_favorites');
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed)) favorites = parsed.map(String);
            }
        } catch {
            /* ignore */
        }

        const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ name, username, password, favorites }),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.message);

        if (data.token && data.user) {
            journeySyncRef.current = null;
            setJourneyHydrated(false);
            persistSession(data);
        }
        return data;
    };

    const logout = async () => {
        await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
        setToken(null);
        setUser(null);
        journeySyncRef.current = null;
        setJourneyHydrated(true);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    };

    const patchJourney = useCallback((updates) => {
        if (!token || !user?.id || String(user.id).startsWith('master-admin')) return;
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);
        fetch('/api/auth/event-journey?mode=patch', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            credentials: 'include',
            body: JSON.stringify(updates),
            signal: controller.signal,
        })
            .catch(() => {})
            .finally(() => clearTimeout(timeout));
    }, [token, user?.id]);

    const updateEventPreference = useCallback((pref) => {
        setEventPreference(pref);
        localStorage.setItem('eventPreference', pref);
        patchJourney({ eventType: pref });
    }, [patchJourney]);

    const updateEventProfile = useCallback((updates) => {
        setEventProfile((prev) => {
            const next = { ...prev, ...updates };
            localStorage.setItem('fiesta_event_profile', JSON.stringify(next));
            return next;
        });
        patchJourney(updates);
    }, [patchJourney]);

    const completeOnboarding = useCallback((updates = {}) => {
        updateEventProfile({
            ...updates,
            onboardingComplete: true,
            lastVisitedAt: new Date().toISOString(),
        });
    }, [updateEventProfile]);

    const rememberCategoryVisit = useCallback((categoryId) => {
        if (!categoryId) return;
        setEventProfile((prev) => {
            if (prev.lastCategory === String(categoryId)) return prev;
            const next = {
                ...prev,
                lastCategory: String(categoryId),
                lastVisitedAt: new Date().toISOString(),
            };
            localStorage.setItem('fiesta_event_profile', JSON.stringify(next));
            return next;
        });
        // Fire-and-forget; never block browsing on sync.
        patchJourney({
            lastCategory: String(categoryId),
            lastVisitedAt: new Date().toISOString(),
        });
    }, [patchJourney]);

    const hasOnboarded = Boolean(eventProfile?.onboardingComplete && eventPreference);

    return (
        <AuthContext.Provider value={{
            user, token, loading, login, unlockAdmin, register, logout,
            isAdmin: user?.isAdmin,
            eventPreference,
            setEventPreference: updateEventPreference,
            eventProfile,
            setEventProfile: updateEventProfile,
            completeOnboarding,
            rememberCategoryVisit,
            hasOnboarded,
            eventReady,
            journeyHydrated,
            refreshSession: validateSession
        }}>
            {children}
        </AuthContext.Provider>
    );
};
