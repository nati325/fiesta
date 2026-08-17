'use client';

import { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getAdminHeaders } from '@/lib/getAdminHeaders';
import { vendorHasCategory } from '@/lib/vendorCategories';

const VendorContext = createContext();
const FAV_KEY = 'fiesta_favorites';
const CART_KEY = 'fiesta_event_cart';

export const useVendors = () => useContext(VendorContext);

function readLocalFavorites() {
    try {
        const saved = localStorage.getItem(FAV_KEY);
        if (!saved) return [];
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed.map(String) : [];
    } catch {
        return [];
    }
}

function readLocalCart() {
    try {
        const saved = localStorage.getItem(CART_KEY);
        if (!saved) return [];
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed.map(String) : [];
    } catch {
        return [];
    }
}

function uniq(list) {
    return [...new Set((list || []).map(String).filter(Boolean))];
}

export const VendorProvider = ({ children }) => {
    const { token, user, journeyHydrated } = useAuth();
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [favorites, setFavorites] = useState([]);
    const [cart, setCart] = useState([]);
    const syncedUserRef = useRef(null);
    const syncedCartUserRef = useRef(null);
    const skipNextPersist = useRef(false);

    useEffect(() => {
        setFavorites(readLocalFavorites());
        setCart(readLocalCart());
    }, []);

    useEffect(() => {
        if (skipNextPersist.current) {
            skipNextPersist.current = false;
            return;
        }
        localStorage.setItem(FAV_KEY, JSON.stringify(favorites));
    }, [favorites]);

    useEffect(() => {
        localStorage.setItem(CART_KEY, JSON.stringify(cart));
    }, [cart]);

    // Cart is anonymous until sign-in; then merge it into the account so it
    // can be restored on another device.
    useEffect(() => {
        const userId = user?.id ? String(user.id) : null;
        if (!userId || !token || String(userId).startsWith('master-admin')) {
            syncedCartUserRef.current = null;
            return;
        }
        if (!journeyHydrated) return;
        if (syncedCartUserRef.current === userId) return;
        syncedCartUserRef.current = userId;

        const remote = Array.isArray(user?.eventJourney?.cart)
            ? user.eventJourney.cart.map(String)
            : [];
        const local = readLocalCart();
        const merged = uniq([...remote, ...local]);
        setCart(merged);

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);
        fetch('/api/auth/event-journey?mode=patch', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            credentials: 'include',
            body: JSON.stringify({ cart: merged }),
            signal: controller.signal,
        })
            .catch(() => {})
            .finally(() => clearTimeout(timeout));
    }, [user?.id, user?.eventJourney?.cart, token, journeyHydrated]);

    // Merge local + server favorites when user logs in / session restores
    useEffect(() => {
        const userId = user?.id ? String(user.id) : null;
        if (!userId || !token || String(userId).startsWith('master-admin')) {
            syncedUserRef.current = null;
            return;
        }
        if (syncedUserRef.current === userId) return;
        syncedUserRef.current = userId;

        const local = readLocalFavorites();
        const fromUser = Array.isArray(user.favorites) ? user.favorites.map(String) : [];
        const merged = uniq([...local, ...fromUser]);

        skipNextPersist.current = true;
        setFavorites(merged);
        localStorage.setItem(FAV_KEY, JSON.stringify(merged));

        fetch('/api/auth/favorites', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            credentials: 'include',
            body: JSON.stringify({ favorites: merged, mode: 'replace' }),
        }).catch(() => {});
    }, [user?.id, user?.favorites, user?.isAdmin, token]);

    const fetchVendors = useCallback(() => {
        setLoading(true);
        const headers = user?.isAdmin && token ? getAdminHeaders(false) : {};
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 12000);

        fetch('/api/vendors', { headers, signal: controller.signal })
            .then(res => {
                if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
                return res.json();
            })
            .then(data => setVendors(Array.isArray(data) ? data : []))
            .catch(err => {
                if (err?.name !== 'AbortError') {
                    console.error('Error fetching vendors:', err);
                }
                setVendors([]);
            })
            .finally(() => {
                clearTimeout(timeout);
                setLoading(false);
            });
    }, [token, user?.isAdmin]);

    useEffect(() => {
        fetchVendors();
    }, [fetchVendors]);

    const addVendor = (vendor) => {
        return fetch('/api/vendors', {
            method: 'POST',
            headers: getAdminHeaders(),
            body: JSON.stringify(vendor)
        })
            .then(res => {
                if (!res.ok) throw new Error('Auth failed');
                return res.json();
            })
            .then(newVendor => {
                setVendors(prev => [...prev, newVendor]);
                return newVendor;
            })
            .catch(err => {
                console.error('Add vendor error:', err);
                alert(`שגיאה בהוספת ספק: ${err.message}`);
                throw err;
            });
    };

    const deleteVendor = (id) => {
        return fetch(`/api/vendors/${id}`, {
            method: 'DELETE',
            headers: getAdminHeaders(false)
        })
            .then(res => {
                if (!res.ok) throw new Error('Auth failed');
                return res.json();
            })
            .then(() => {
                setVendors(prev => prev.filter(v => v.id !== id));
            })
            .catch(err => {
                console.error('Delete vendor error:', err);
                alert(`שגיאה במחיקה: ${err.message}`);
            });
    };

    const updateVendor = (id, updatedVendor) => {
        return fetch(`/api/vendors/${id}`, {
            method: 'PUT',
            headers: getAdminHeaders(),
            body: JSON.stringify(updatedVendor)
        })
            .then(res => {
                if (!res.ok) throw new Error('Update failed');
                return res.json();
            })
            .then(data => {
                setVendors(prev => prev.map(v => v.id === id ? data : v));
                return data;
            })
            .catch(err => {
                alert('שגיאה בעדכון הספק');
                throw err;
            });
    };

    const getVendorsByType = (type) =>
        Array.isArray(vendors) ? vendors.filter((v) => vendorHasCategory(v, type)) : [];

    const persistFavorites = useCallback((next) => {
        const list = uniq(next);
        setFavorites(list);
        if (!token || !user?.id || String(user.id).startsWith('master-admin')) return;
        fetch('/api/auth/favorites', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            credentials: 'include',
            body: JSON.stringify({ favorites: list, mode: 'replace' }),
        }).catch(() => {});
    }, [token, user?.id]);

    const toggleFavorite = (id) => {
        const sid = String(id);
        setFavorites((prev) => {
            const next = prev.includes(sid)
                ? prev.filter((f) => f !== sid)
                : [...prev, sid];
            if (token && user?.id && !String(user.id).startsWith('master-admin')) {
                fetch('/api/auth/favorites', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    credentials: 'include',
                    body: JSON.stringify({ favorites: next, mode: 'replace' }),
                }).catch(() => {});
            }
            return next;
        });
    };

    const isFavorite = (id) => favorites.includes(String(id));
    const isInCart = (id) => cart.includes(String(id));
    const toggleCart = (id) => {
        const sid = String(id);
        setCart((prev) => {
            const next = prev.includes(sid) ? prev.filter((item) => item !== sid) : [...prev, sid];
            if (token && user?.id && !String(user.id).startsWith('master-admin')) {
                fetch('/api/auth/event-journey?mode=patch', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    credentials: 'include',
                    body: JSON.stringify({ cart: next }),
                }).catch(() => {});
            }
            return next;
        });
    };
    const removeFromCart = (id) => {
        const sid = String(id);
        setCart((prev) => {
            if (!prev.includes(sid)) return prev;
            const next = prev.filter((item) => item !== sid);
            if (token && user?.id && !String(user.id).startsWith('master-admin')) {
                const controller = new AbortController();
                const timeout = setTimeout(() => controller.abort(), 8000);
                fetch('/api/auth/event-journey?mode=patch', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    credentials: 'include',
                    body: JSON.stringify({ cart: next }),
                    signal: controller.signal,
                })
                    .catch(() => {})
                    .finally(() => clearTimeout(timeout));
            }
            return next;
        });
    };
    const clearCart = () => {
        setCart([]);
        if (token && user?.id && !String(user.id).startsWith('master-admin')) {
            fetch('/api/auth/event-journey?mode=patch', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                credentials: 'include',
                body: JSON.stringify({ cart: [] }),
            }).catch(() => {});
        }
    };

    return (
        <VendorContext.Provider value={{
            vendors, loading, addVendor, deleteVendor, updateVendor,
            getVendorsByType, favorites, toggleFavorite, isFavorite,
            setFavorites: persistFavorites,
            cart, toggleCart, isInCart, removeFromCart, clearCart,
            refreshVendors: fetchVendors
        }}>
            {children}
        </VendorContext.Provider>
    );
};
