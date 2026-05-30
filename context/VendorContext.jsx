'use client';

import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getAdminHeaders } from '@/lib/getAdminHeaders';

const VendorContext = createContext();

export const useVendors = () => useContext(VendorContext);

export const VendorProvider = ({ children }) => {
    const { token, user } = useAuth();
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [favorites, setFavorites] = useState([]);

    useEffect(() => {
        const saved = localStorage.getItem('fiesta_favorites');
        if (saved) setFavorites(JSON.parse(saved));
    }, []);

    useEffect(() => {
        localStorage.setItem('fiesta_favorites', JSON.stringify(favorites));
    }, [favorites]);

    const fetchVendors = useCallback(() => {
        setLoading(true);
        const headers = user?.isAdmin && token ? getAdminHeaders(false) : {};

        fetch('/api/vendors', { headers })
            .then(res => {
                if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
                return res.json();
            })
            .then(data => setVendors(data))
            .catch(err => {
                console.error('Error fetching vendors:', err);
            })
            .finally(() => setLoading(false));
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
            .then(newVendor => setVendors(prev => [...prev, newVendor]))
            .catch(err => {
                console.error('Add vendor error:', err);
                alert(`שגיאה בהוספת ספק: ${err.message}`);
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
            .then(data => setVendors(prev => prev.map(v => v.id === id ? data : v)))
            .catch(err => alert('שגיאה בעדכון הספק'));
    };

    const getVendorsByType = (type) => vendors.filter(v => v.type === type);

    const toggleFavorite = (id) => {
        setFavorites(prev =>
            prev.includes(id)
                ? prev.filter(f => f !== id)
                : [...prev, id]
        );
    };

    const isFavorite = (id) => favorites.includes(id);

    return (
        <VendorContext.Provider value={{
            vendors, loading, addVendor, deleteVendor, updateVendor,
            getVendorsByType, favorites, toggleFavorite, isFavorite, refreshVendors: fetchVendors
        }}>
            {children}
        </VendorContext.Provider>
    );
};
