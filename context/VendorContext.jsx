'use client';

import { createContext, useState, useContext, useEffect } from 'react';

const VendorContext = createContext();

export const useVendors = () => useContext(VendorContext);

export const VendorProvider = ({ children }) => {
    const [vendors, setVendors] = useState([]);

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
        const vendorData = {
            name: vendor.name,
            type: vendor.type,
            contact: vendor.contact,
            description: vendor.description,
            image: vendor.image,
            region: vendor.region || 'מרכז',
            price: vendor.price || '',
            discount: vendor.discount || '',
            agreementSigned: !!vendor.agreementSigned
        };
        fetch('/api/vendors', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-admin-token': 'fiesta-secret-admin-key-2025'
            },
            body: JSON.stringify(vendorData)
        })
            .then(res => {
                if (!res.ok) throw new Error('Auth failed');
                return res.json();
            })
            .then(newVendor => {
                setVendors(prev => [...prev, newVendor]);
            })
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
        const vendorData = {
            name: updatedVendor.name,
            type: updatedVendor.type,
            contact: updatedVendor.contact,
            description: updatedVendor.description,
            image: updatedVendor.image,
            region: updatedVendor.region || 'מרכז',
            price: updatedVendor.price || '',
            discount: updatedVendor.discount || '',
            agreementSigned: !!updatedVendor.agreementSigned
        };
        fetch(`/api/vendors/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'x-admin-token': 'fiesta-secret-admin-key-2025'
            },
            body: JSON.stringify(vendorData)
        })
            .then(res => {
                if (!res.ok) throw new Error('Update failed');
                return res.json();
            })
            .then(data => {
                setVendors(prev => prev.map(v => v.id === id ? data : v));
            })
            .catch(err => alert('שגיאה בעדכון הספק'));
    };

    const getVendorsByType = (type) => {
        return vendors.filter(v => v.type === type);
    };

    return (
        <VendorContext.Provider value={{ vendors, addVendor, deleteVendor, updateVendor, getVendorsByType }}>
            {children}
        </VendorContext.Provider>
    );
};
