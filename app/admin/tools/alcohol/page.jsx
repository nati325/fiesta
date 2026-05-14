'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function AlcoholCalculatorPage() {
    const [guestCount, setGuestCount] = useState(300);
    const [crowdType, setCrowdType] = useState('standard'); // 'standard', 'heavy', 'light'
    const [results, setResults] = useState({});

    useEffect(() => {
        calculateAlcohol();
    }, [guestCount, crowdType]);

    const calculateAlcohol = () => {
        const multipliers = {
            standard: { whiskey: 40, vodka: 30, wine: 10, arak: 50, cava: 15, beer: 2 },
            heavy: { whiskey: 25, vodka: 15, wine: 8, arak: 30, cava: 10, beer: 3.5 },
            light: { whiskey: 60, vodka: 50, wine: 15, arak: 80, cava: 20, beer: 1 }
        };

        const m = multipliers[crowdType];
        
        setResults({
            whiskey: Math.ceil(guestCount / m.whiskey),
            vodka: Math.ceil(guestCount / m.vodka),
            wine: Math.ceil(guestCount / m.wine),
            arak: Math.ceil(guestCount / m.arak),
            cava: Math.ceil(guestCount / m.cava),
            beer: Math.ceil(guestCount * m.beer)
        });
    };

    return (
        <div className="alcohol-root" dir="rtl">
            <header className="tool-header">
                <div className="container">
                    <h1>🥂 מחשבון אלכוהול חכם</h1>
                    <p>כמה בקבוקים באמת צריך לקנות? בואו נבדוק.</p>
                </div>
            </header>

            <main className="container">
                <div className="config-card">
                    <div className="input-group">
                        <label>כמות אורחים סופית</label>
                        <input 
                            type="number" 
                            value={guestCount} 
                            onChange={(e) => setGuestCount(Number(e.target.value))} 
                        />
                    </div>
                    
                    <div className="input-group">
                        <label>אופי האירוע / קהל</label>
                        <div className="type-selector">
                            <button className={crowdType === 'light' ? 'active' : ''} onClick={() => setCrowdType('light')}>רגוע (משפחות)</button>
                            <button className={crowdType === 'standard' ? 'active' : ''} onClick={() => setCrowdType('standard')}>סטנדרטי</button>
                            <button className={crowdType === 'heavy' ? 'active' : ''} onClick={() => setCrowdType('heavy')}>מסיבה כבדה! 🕺</button>
                        </div>
                    </div>
                </div>

                <div className="results-grid">
                    <AlcoholCard icon="🥃" name="וויסקי" count={results.whiskey} desc="בקבוקי 700 מ״ל" color="#92400e" />
                    <AlcoholCard icon="🍸" name="וודקה" count={results.vodka} desc="בקבוקי 1 ליטר" color="#1e293b" />
                    <AlcoholCard icon="🍷" name="יין (אדום+לבן)" count={results.wine} desc="בקבוקי 750 מ״ל" color="#991b1b" />
                    <AlcoholCard icon="🥛" name="ערק" count={results.arak} desc="בקבוקי 700 מ״ל" color="#475569" />
                    <AlcoholCard icon="🥂" name="קאווה / למברוסקו" count={results.cava} desc="בקבוקי 750 מ״ל" color="#d4af37" />
                    <AlcoholCard icon="🍺" name="בירות" count={results.beer} desc="בקבוקים / פחיות" color="#b45309" />
                </div>

                <div className="tips-card">
                    <h3>💡 טיפ ממומחי פייסטה:</h3>
                    <p>תמיד כדאי לקנות במקום שמאפשר החזרת בקבוקים סגורים. כך תוכלו לקנות קצת יותר לביטחון ולהחזיר את מה שלא נפתח ולקבל זיכוי כספי מלא!</p>
                </div>
            </main>

            <style jsx>{`
                .alcohol-root { min-height: 100vh; background: #f8fafc; font-family: 'Assistant', sans-serif; padding-bottom: 60px; }
                .container { max-width: 900px; margin: 0 auto; padding: 0 20px; }
                
                .tool-header { background: #1e293b; color: white; padding: 60px 0; text-align: center; margin-bottom: 40px; }
                .tool-header h1 { font-size: 2.5rem; font-weight: 900; margin-bottom: 10px; }
                .tool-header p { opacity: 0.8; font-size: 1.2rem; }

                .config-card { background: white; padding: 30px; border-radius: 24px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 40px; }
                .input-group label { display: block; font-weight: 800; margin-bottom: 10px; color: #475569; }
                .input-group input { width: 100%; padding: 12px; border: 2px solid #e2e8f0; border-radius: 12px; font-size: 1.1rem; font-weight: 700; }
                
                .type-selector { display: flex; gap: 10px; }
                .type-selector button { flex: 1; padding: 10px; border: 2px solid #e2e8f0; border-radius: 10px; background: white; font-weight: 700; cursor: pointer; transition: 0.2s; font-size: 0.85rem; }
                .type-selector button.active { background: #1e293b; color: white; border-color: #1e293b; }

                .results-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 40px; }
                
                .tips-card { background: #fffbeb; border: 1px solid #fde68a; padding: 25px; border-radius: 20px; color: #92400e; }
                .tips-card h3 { margin-bottom: 10px; font-weight: 900; }

                @media (max-width: 768px) {
                    .config-card { grid-template-columns: 1fr; }
                    .results-grid { grid-template-columns: 1fr 1fr; }
                }
            `}</style>
        </div>
    );
}

function AlcoholCard({ icon, name, count, desc, color }) {
    return (
        <motion.div 
            whileHover={{ y: -5 }}
            style={{ 
                background: 'white', padding: '25px', borderRadius: '24px', 
                textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.03)',
                borderTop: `6px solid ${color}`
            }}
        >
            <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>{icon}</div>
            <h4 style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 700, marginBottom: '5px' }}>{name}</h4>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: '#1e293b' }}>{count}</div>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>{desc}</p>
        </motion.div>
    );
}
