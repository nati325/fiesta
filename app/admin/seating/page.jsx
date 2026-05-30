'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { getAdminHeaders } from '@/lib/getAdminHeaders';
import EventSelector from '@/components/EventSelector';
import { useActiveEvent } from '@/hooks/useActiveEvent';

function SeatingContent() {
    const { eventId } = useActiveEvent();
    const [guests, setGuests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedGuest, setSelectedGuest] = useState(null);
    const [tableCount, setTableCount] = useState(30);
    const [viewMode, setViewMode] = useState('grid');
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchGuests();
    }, [eventId]);

    const fetchGuests = async () => {
        if (!eventId) {
            setGuests([]);
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const res = await fetch(`/api/rsvp?eventId=${encodeURIComponent(eventId)}`, { headers: getAdminHeaders(false) });
            const data = await res.json();
            if (Array.isArray(data)) {
                setGuests(data.filter(g => g.isComing));
            }
        } catch (err) {
            console.error('Fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const assignTable = async (guestId, tableNum) => {
        try {
            const res = await fetch('/api/rsvp', {
                method: 'POST',
                headers: getAdminHeaders(),
                body: JSON.stringify({
                    updateId: guestId,
                    updateData: { tableNumber: tableNum }
                })
            });
            if (res.ok) {
                setGuests(guests.map(g => g._id === guestId ? { ...g, tableNumber: tableNum } : g));
                setSelectedGuest(null);
            }
        } catch (err) {
            alert('שגיאה בעדכון השולחן');
        }
    };

    const getTableGuests = (tableNum) => guests.filter(g => g.tableNumber === tableNum);

    const unseatedGuests = useMemo(() => {
        const q = search.trim().toLowerCase();
        return guests
            .filter(g => !g.tableNumber || g.tableNumber === 0)
            .filter(g => !q || g.name.toLowerCase().includes(q));
    }, [guests, search]);

    if (loading) {
        return (
            <div style={{ padding: '120px', textAlign: 'center', fontFamily: 'Assistant, sans-serif' }}>
                טוען אורחים...
            </div>
        );
    }

    return (
        <div className="seating-root" dir="rtl">
            <header className="seating-header">
                <div className="container">
                    <div className="header-flex">
                        <div>
                            <Link href="/admin/rsvp" className="back-link">
                                <i className="fas fa-arrow-right"></i> חזרה לניהול אורחים
                            </Link>
                            <h1>סידור שולחנות חכם</h1>
                            <p>נהלו את הושבת האורחים בצורה פשוטה ונוחה</p>
                        </div>
                        <div className="header-stats">
                            <div className="stat">
                                <span className="label">סה״כ מגיעים</span>
                                <span className="value">{guests.reduce((acc, g) => acc + g.guests, 0)}</span>
                            </div>
                            <div className="stat highlight">
                                <span className="label">טרם שובצו</span>
                                <span className="value">{guests.filter(g => !g.tableNumber || g.tableNumber === 0).reduce((acc, g) => acc + g.guests, 0)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="container">
                <Suspense fallback={null}>
                    <EventSelector showLinks={false} />
                </Suspense>
            </div>

            <div className="container seating-layout">
                <aside className="guest-sidebar">
                    <div className="sidebar-header">
                        <h3>אורחים הממתינים לשיבוץ ({unseatedGuests.length})</h3>
                        <div className="search-box">
                            <i className="fas fa-search"></i>
                            <input type="text" placeholder="חיפוש אורח..." value={search} onChange={e => setSearch(e.target.value)} />
                        </div>
                    </div>
                    <div className="guest-list">
                        {unseatedGuests.map(g => (
                            <motion.div
                                key={g._id}
                                className={`guest-card ${selectedGuest?._id === g._id ? 'selected' : ''}`}
                                onClick={() => setSelectedGuest(g)}
                                layout
                            >
                                <div className="guest-info">
                                    <span className="name">{g.name}</span>
                                    <span className="count">{g.guests} אורחים</span>
                                </div>
                                <i className="fas fa-chevron-left"></i>
                            </motion.div>
                        ))}
                    </div>
                </aside>

                <main className="tables-area">
                    <div className="area-controls">
                        <div className="tabs">
                            <button className={viewMode === 'grid' ? 'active' : ''} onClick={() => setViewMode('grid')}>תצוגת שולחנות</button>
                            <button className={viewMode === 'list' ? 'active' : ''} onClick={() => setViewMode('list')}>רשימה מרוכזת</button>
                        </div>
                        <div className="table-settings">
                            <span>מספר שולחנות:</span>
                            <input type="number" value={tableCount} onChange={(e) => setTableCount(Number(e.target.value))} />
                        </div>
                    </div>

                    {viewMode === 'grid' ? (
                        <div className="tables-grid">
                            {Array.from({ length: tableCount }, (_, i) => i + 1).map(num => {
                                const tableGuests = getTableGuests(num);
                                const totalSeats = tableGuests.reduce((acc, g) => acc + g.guests, 0);

                                return (
                                    <div
                                        key={num}
                                        className={`table-node ${selectedGuest ? 'assignable' : ''}`}
                                        onClick={() => selectedGuest && assignTable(selectedGuest._id, num)}
                                    >
                                        <div className="table-circle">
                                            <span className="number">{num}</span>
                                            <span className="seats-count">{totalSeats} / 12</span>
                                        </div>
                                        <div className="table-details">
                                            {tableGuests.map(tg => (
                                                <div key={tg._id} className="table-guest-item">
                                                    <span>{tg.name}</span>
                                                    <button onClick={(e) => {
                                                        e.stopPropagation();
                                                        assignTable(tg._id, 0);
                                                    }} title="הסר מהשולחן">×</button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="tables-list-view">
                            {Array.from({ length: tableCount }, (_, i) => i + 1).map(num => {
                                const tableGuests = getTableGuests(num);
                                if (tableGuests.length === 0) return null;
                                return (
                                    <div key={num} className="list-table-row">
                                        <strong>שולחן {num}</strong>
                                        <span>{tableGuests.map(g => g.name).join(', ')}</span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </main>
            </div>

            <style jsx>{`
                .seating-root { min-height: 100vh; background: #f1f5f9; font-family: 'Assistant', sans-serif; }
                .container { max-width: 1400px; margin: 0 auto; padding: 0 20px; }
                .seating-header { background: white; padding: 30px 0; border-bottom: 1px solid #e2e8f0; }
                .header-flex { display: flex; justify-content: space-between; align-items: center; }
                .back-link { display: inline-flex; align-items: center; gap: 8px; color: #64748b; text-decoration: none; font-weight: 700; margin-bottom: 10px; font-size: 0.9rem; }
                .header-flex h1 { font-size: 1.8rem; font-weight: 900; color: #1e293b; margin: 0; }
                .header-flex p { color: #64748b; margin: 5px 0 0 0; }
                .header-stats { display: flex; gap: 30px; }
                .stat { text-align: center; }
                .stat .label { display: block; font-size: 0.8rem; color: #64748b; font-weight: 700; }
                .stat .value { font-size: 1.5rem; font-weight: 900; color: #1e293b; }
                .stat.highlight .value { color: #2563eb; }
                .seating-layout { display: grid; grid-template-columns: 350px 1fr; gap: 30px; margin-top: 30px; padding-bottom: 50px; height: calc(100vh - 200px); }
                .guest-sidebar { background: white; border-radius: 20px; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
                .sidebar-header { padding: 20px; border-bottom: 1px solid #f1f5f9; }
                .sidebar-header h3 { font-size: 1rem; font-weight: 800; margin-bottom: 15px; }
                .search-box { position: relative; }
                .search-box i { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); color: #94a3b8; }
                .search-box input { width: 100%; padding: 10px 35px 10px 12px; border: 1px solid #e2e8f0; border-radius: 10px; font-size: 0.9rem; }
                .guest-list { flex: 1; overflow-y: auto; padding: 15px; }
                .guest-card { display: flex; justify-content: space-between; align-items: center; padding: 15px; background: #f8fafc; border-radius: 12px; margin-bottom: 10px; cursor: pointer; transition: 0.2s; border: 2px solid transparent; }
                .guest-card:hover { background: #f1f5f9; }
                .guest-card.selected { border-color: #2563eb; background: #eff6ff; }
                .guest-card .name { display: block; font-weight: 800; color: #1e293b; }
                .guest-card .count { font-size: 0.8rem; color: #64748b; }
                .tables-area { display: flex; flex-direction: column; }
                .area-controls { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
                .tabs { display: flex; gap: 10px; }
                .tabs button { padding: 8px 20px; border-radius: 10px; border: none; background: white; font-weight: 700; cursor: pointer; color: #64748b; }
                .tabs button.active { background: #1e293b; color: white; }
                .table-settings { display: flex; align-items: center; gap: 10px; font-weight: 700; color: #475569; }
                .table-settings input { width: 60px; padding: 5px; border-radius: 8px; border: 1px solid #cbd5e1; text-align: center; }
                .tables-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 20px; overflow-y: auto; }
                .tables-list-view { display: flex; flex-direction: column; gap: 10px; overflow-y: auto; }
                .list-table-row { background: white; padding: 15px 20px; border-radius: 12px; display: flex; gap: 15px; align-items: center; }
                .table-node { background: white; border-radius: 20px; padding: 20px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); transition: 0.2s; border: 2px solid transparent; }
                .table-node.assignable { border-color: #93c5fd; background: #f0f9ff; cursor: pointer; }
                .table-circle { width: 80px; height: 80px; border-radius: 50%; background: #1e293b; color: white; margin: 0 auto 15px; display: flex; flex-direction: column; align-items: center; justify-content: center; }
                .table-circle .number { font-size: 1.5rem; font-weight: 900; line-height: 1; }
                .table-circle .seats-count { font-size: 0.65rem; font-weight: 700; opacity: 0.7; }
                .table-details { display: flex; flex-direction: column; gap: 5px; }
                .table-guest-item { background: #f8fafc; padding: 5px 10px; border-radius: 6px; font-size: 0.75rem; font-weight: 700; display: flex; justify-content: space-between; align-items: center; }
                .table-guest-item button { background: none; border: none; color: #ef4444; cursor: pointer; }
                @media (max-width: 900px) {
                    .seating-layout { grid-template-columns: 1fr; height: auto; }
                    .guest-sidebar { max-height: 400px; }
                }
            `}</style>
        </div>
    );
}

export default function SeatingPage() {
    return (
        <Suspense fallback={<div style={{ padding: '120px', textAlign: 'center' }}>טוען...</div>}>
            <SeatingContent />
        </Suspense>
    );
}
