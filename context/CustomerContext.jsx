'use client';

import { createContext, useState, useContext, useEffect } from 'react';

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
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    fetch('/api/customers')
      .then(res => res.json())
      .then(data => setCustomers(data))
      .catch(() => setCustomers([]));
  }, []);

  const addCustomer = (customer) => {
    fetch('/api/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-token': 'fiesta-secret-admin-key-2025' },
      body: JSON.stringify(customer)
    })
      .then(res => res.json())
      .then(newCustomer => setCustomers(prev => [...prev, newCustomer]));
  };

  const updateCustomer = (id, updatedCustomer) => {
    fetch(`/api/customers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'x-admin-token': 'fiesta-secret-admin-key-2025' },
      body: JSON.stringify(updatedCustomer)
    })
      .then(res => res.json())
      .then(data => setCustomers(prev => prev.map(c => c.id === id ? data : c)));
  };

  const deleteCustomer = (id) => {
    fetch(`/api/customers/${id}`, {
      method: 'DELETE',
      headers: { 'x-admin-token': 'fiesta-secret-admin-key-2025' }
    })
      .then(() => setCustomers(prev => prev.filter(c => c.id !== id)));
  };

  return (
    <CustomerContext.Provider value={{ customers, addCustomer, updateCustomer, deleteCustomer, STATUS_OPTIONS }}>
      {children}
    </CustomerContext.Provider>
  );
};
