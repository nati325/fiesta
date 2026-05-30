'use client';

import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getAdminHeaders } from '@/lib/getAdminHeaders';

const CustomerContext = createContext();

export const useCustomers = () => useContext(CustomerContext);

const STATUS_OPTIONS = [
  'ממתין לפגישה',
  'אחרי פגישה',
  'סגר עסקה עם אולם',
  'סגר עסקה עם ספק',
  'סגר עם אולם ושני ספקים',
  'סגר ספק בלי אולם',
  'סגר אולם בלי ספק',
  'סגר עם אולם',
  'סגר עם ספק',
  'סגר עם אולם וספק',
];

export const CustomerProvider = ({ children }) => {
  const { token, user } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCustomers = useCallback(() => {
    if (!token || !user?.isAdmin) {
      setCustomers([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    fetch('/api/customers', { headers: getAdminHeaders(false) })
      .then(res => {
        if (!res.ok) throw new Error('Access Denied');
        return res.json();
      })
      .then(data => setCustomers(data))
      .catch(err => {
        setError(err.message);
        setCustomers([]);
      })
      .finally(() => setLoading(false));
  }, [token, user?.isAdmin]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const addCustomer = (customer) => {
    return fetch('/api/customers', {
      method: 'POST',
      headers: getAdminHeaders(),
      body: JSON.stringify(customer)
    })
      .then(res => {
        if (!res.ok) throw new Error('שגיאה בהוספת לקוח');
        return res.json();
      })
      .then(newCustomer => setCustomers(prev => [...prev, newCustomer]));
  };

  const updateCustomer = (id, updatedCustomer) => {
    return fetch(`/api/customers/${id}`, {
      method: 'PUT',
      headers: getAdminHeaders(),
      body: JSON.stringify(updatedCustomer)
    })
      .then(res => {
        if (!res.ok) throw new Error('שגיאה בעדכון');
        return res.json();
      })
      .then(data => setCustomers(prev => prev.map(c => c.id === id ? data : c)));
  };

  const deleteCustomer = (id) => {
    return fetch(`/api/customers/${id}`, {
      method: 'DELETE',
      headers: getAdminHeaders(false)
    })
      .then(res => {
        if (!res.ok) throw new Error('שגיאה במחיקה');
        setCustomers(prev => prev.filter(c => c.id !== id));
      });
  };

  return (
    <CustomerContext.Provider value={{ customers, addCustomer, updateCustomer, deleteCustomer, STATUS_OPTIONS, loading, error, refreshCustomers: fetchCustomers }}>
      {children}
    </CustomerContext.Provider>
  );
};
