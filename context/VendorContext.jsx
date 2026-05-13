'use client';

import { createContext, useState, useContext, useEffect } from 'react';

const VendorContext = createContext();

export const useVendors = () => useContext(VendorContext);

export const VendorProvider = ({ children }) => {
    const [vendors, setVendors] = useState([]);
    const [favorites, setFavorites] = useState([]);

    useEffect(() => {
        const saved = localStorage.getItem('fiesta_favorites');
        if (saved) setFavorites(JSON.parse(saved));
    }, []);

    useEffect(() => {
        localStorage.setItem('fiesta_favorites', JSON.stringify(favorites));
    }, [favorites]);

    useEffect(() => {
        fetch('/api/vendors')
            .then(res => {
                if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
                return res.json();
            })
            .then(data => setVendors(data))
            .catch(err => {
                console.error('Error fetching vendors:', err);
            });
    }, []);

    const addVendor = (vendor) => {
        fetch('/api/vendors', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-admin-token': 'fiesta-secret-admin-key-2025' },
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
        fetch(`/api/vendors/${id}`, {
            method: 'DELETE',
            headers: {
                'x-admin-token': 'fiesta-secret-admin-key-2025'
            }
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
        fetch(`/api/vendors/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'x-admin-token': 'fiesta-secret-admin-key-2025' },
            body: JSON.stringify(updatedVendor)
        })
            .then(res => {
                if (!res.ok) throw new Error('Update failed');
                return res.json();
            })
            .then(data => setVendors(prev => prev.map(v => v.id === id ? data : v)))
            .catch(err => alert('שגיאה בעדכון הספק'));
    };

    const getVendorsByType = (type) => {
        return vendors.filter(v => v.type === type);
    };

    const toggleFavorite = (id) => {
        setFavorites(prev => 
            prev.includes(id) 
                ? prev.filter(f => f !== id) 
                : [...prev, id]
        );
    };

    const isFavorite = (id) => favorites.includes(id);

    return (
        <VendorContext.Provider value={{ vendors, addVendor, deleteVendor, updateVendor, getVendorsByType, favorites, toggleFavorite, isFavorite }}>
            {children}
        </VendorContext.Provider>
    );
};
