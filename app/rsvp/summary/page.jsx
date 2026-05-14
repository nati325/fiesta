'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'next/navigation';

export default function HallSummaryPage() {
    const [rsvps, setRsvps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalComing: 0,
        totalGuests: 0,
        totalVegan: 0,
        totalVeg: 0,
        totalRegular: 0,
        tables: {}
    });

    useEffect(() => {
        fetchRSVPs();
    }, []);

    const fetchRSVPs = async () => {
        try {
            const res = await fetch('/api/rsvp?eventId=test-event-123');
            const data = await res.json();
            if (Array.isArray(data)) {
                const coming = data.filter(r => r.hasResponded && r.isComing);
                setRsvps(coming);
                calculateSummary(coming);
            }
        } catch (err) {
            console.error('Fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const calculateSummary = (data) => {
        const summary = data.reduce((acc, curr) => {
            acc.totalComing += 1;
            acc.totalGuests += (curr.guests || 1);
            acc.totalVegan += (curr.veganCount || 0);
            acc.totalVeg += (curr.vegCount || 0);
            
            const tableNum = curr.tableNumber || 'טרם שובץ';
            if (!acc.tables[tableNum]) {
                acc.tables[tableNum] = {
                    count: 0,
                    guests: [],
                    vegan: 0,
                    veg: 0
                };
            }
            acc.tables[tableNum].count += (curr.guests || 1);
            acc.tables[tableNum].vegan += (curr.veganCount || 0);
            acc.tables[tableNum].veg += (curr.vegCount || 0);
            acc.tables[tableNum].guests.push(curr);

            return acc;
        }, { totalComing: 0, totalGuests: 0, totalVegan: 0, totalVeg: 0, tables: {} });

        summary.totalRegular = summary.totalGuests - summary.totalVegan - summary.totalVeg;
        setStats(summary);
    };

    if (loading) return <div className="loading">טוען סיכום עבור האולם...</div>;

    return (
        <div className="hall-view-root" dir="rtl">
            <header className="hall-header">
                <div className="container">
                    <div className="badge">סיכום לאולם - View Only</div>
                    <h1>נועה & דניאל | 14.09.2026</h1>
                    <p>דוח ריכוז מנות וסידור שולחנות סופי</p>
                </div>
            </header>

            <main className="container">
                <section className="summary-grid">
                    <div className="sum-card total">
                        <div className="val">{stats.totalGuests}</div>
                        <div className="lab">סה"כ אורחים</div>
                    </div>
                    <div className="sum-card">
                        <div className="val">{stats.totalRegular}</div>
                        <div className="lab">מנות רגילות</div>
                    </div>
                    <div className="sum-card vegan">
                        <div className="val">{stats.totalVegan}</div>
                        <div className="lab">מנות טבעוניות 🌱</div>
                    </div>
                    <div className="sum-card veg">
                        <div className="val">{stats.totalVeg}</div>
                        <div className="lab">מנות צמחוניות 🧀</div>
                    </div>
                </section>

                <section className="tables-section">
                    <h2>פירוט לפי שולחנות</h2>
                    <div className="tables-grid">
                        {Object.entries(stats.tables).sort((a, b) => a[0] - b[0]).map(([num, data]) => (
                            <div key={num} className="table-card">
                                <div className="table-id">שולחן {num}</div>
                                <div className="table-stats">
                                    <span><strong>{data.count}</strong> אורחים</span>
                                    <div className="dietary-mini">
                                        {data.vegan > 0 && <span className="v-tag">🌱 {data.vegan}</span>}
                                        {data.veg > 0 && <span className="vg-tag">🧀 {data.veg}</span>}
                                    </div>
                                </div>
                                <div className="table-guests-list">
                                    {data.guests.map((g, i) => (
                                        <div key={i} className="guest-item">
                                            {g.name} ({g.guests})
                                            {g.dietary && <span className="diet-note" title={g.dietary}>⚠️</span>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </main>

            <style jsx>{`
                .hall-view-root { min-height: 100vh; background: #f1f5f9; font-family: 'Assistant', sans-serif; padding-bottom: 60px; }
                .container { max-width: 1000px; margin: 0 auto; padding: 0 20px; }
                
                .hall-header { background: #1e293b; color: white; padding: 40px 0; text-align: center; margin-bottom: 40px; border-bottom: 4px solid #fbbf24; }
                .badge { display: inline-block; background: #fbbf24; color: #1e293b; padding: 4px 12px; border-radius: 50px; font-weight: 900; font-size: 0.7rem; margin-bottom: 15px; text-transform: uppercase; }
                .hall-header h1 { font-size: 2rem; font-weight: 900; margin-bottom: 5px; }
                .hall-header p { opacity: 0.7; font-size: 1.1rem; }

                .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 50px; }
                .sum-card { background: white; padding: 25px; border-radius: 20px; text-align: center; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
                .sum-card.total { border: 2px solid #fbbf24; }
                .sum-card .val { font-size: 2.5rem; font-weight: 900; color: #1e293b; line-height: 1; margin-bottom: 10px; }
                .sum-card .lab { font-size: 0.9rem; font-weight: 700; color: #64748b; }
                .sum-card.vegan .val { color: #166534; }
                .sum-card.veg .val { color: #854d0e; }

                .tables-section h2 { font-size: 1.5rem; font-weight: 900; color: #1e293b; margin-bottom: 25px; border-right: 5px solid #fbbf24; padding-right: 15px; }
                .tables-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
                .table-card { background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
                .table-id { background: #f8fafc; padding: 15px; font-weight: 900; font-size: 1.1rem; border-bottom: 1px solid #f1f5f9; color: #1e293b; }
                .table-stats { padding: 15px; display: flex; justify-content: space-between; align-items: center; background: #fffbeb; }
                .table-stats span { font-size: 0.9rem; color: #92400e; }
                .dietary-mini { display: flex; gap: 8px; }
                .v-tag, .vg-tag { font-size: 0.75rem; font-weight: 800; }

                .table-guests-list { padding: 15px; display: flex; flex-direction: column; gap: 8px; }
                .guest-item { font-size: 0.9rem; font-weight: 600; color: #475569; display: flex; justify-content: space-between; }
                .diet-note { color: #ef4444; font-size: 0.8rem; cursor: help; }

                .loading { height: 100vh; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; font-weight: 800; color: #64748b; }

                @media (max-width: 768px) {
                    .summary-grid { grid-template-columns: 1fr 1fr; }
                    .hall-header h1 { font-size: 1.5rem; }
                }
            `}</style>
        </div>
    );
}
