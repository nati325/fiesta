'use client';
import { useState, useEffect } from 'react';

export default function TestDB() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/vendors')
            .then(res => res.json())
            .then(json => {
                setData(json);
                setLoading(false);
            });
    }, []);

    if (loading) return <div>Loading...</div>;

    return (
        <div style={{ padding: 20 }}>
            <h1>Vendors in DB: {Array.isArray(data) ? data.length : 'Error'}</h1>
            <pre>{JSON.stringify(data?.slice(0, 2), null, 2)}</pre>
        </div>
    );
}
