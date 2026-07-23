'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useVendors } from '@/context/VendorContext';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

const CATEGORIES = [
    { id: 'venue', name: 'אולם / גן אירועים', icon: 'fa-landmark' },
    { id: 'catering', name: 'קייטרינג', icon: 'fa-utensils' },
    { id: 'music', name: 'DJ ומוזיקה', icon: 'fa-compact-disc' },
    { id: 'photography', name: 'צלמים', icon: 'fa-camera' },
    { id: 'design', name: 'עיצוב אירועים', icon: 'fa-paint-brush' },
    { id: 'alcohol', name: 'בר אלכוהול', icon: 'fa-glass-cheers' },
    { id: 'bar', name: 'שירותי בר', icon: 'fa-cocktail' },
    { id: 'makeup', name: 'איפור', icon: 'fa-eye' },
    { id: 'suits', name: 'חליפות חתן', icon: 'fa-user-tie' },
    { id: 'dresses', name: 'שמלות כלה', icon: 'fa-female' }
];

function BudgetPlannerContent() {
    const { vendors } = useVendors();
    const [budget, setBudget] = useState(50000);
    const [guests, setGuests] = useState(100);
    const [selectedCategories, setSelectedCategories] = useState(['venue', 'music', 'photography']);
    const [isCalculating, setIsCalculating] = useState(false);
    const [results, setResults] = useState([]);
    const [activeTab, setActiveTab] = useState('input'); // 'input' or 'results'

    // Helper to parse price string to number
    const parsePrice = (priceStr, guestCount = 1) => {
        if (typeof priceStr === 'number') return priceStr;
        if (!priceStr) return 0;
        
        // Remove commas and non-numeric chars (except dot)
        const cleanStr = priceStr.toString().replace(/,/g, '').replace(/[^0-9.]/g, '');
        const num = parseFloat(cleanStr);
        
        if (isNaN(num)) return 0;
        
        // Handle "per guest" prices
        if (priceStr.includes('מנה') || priceStr.includes('איש') || priceStr.includes('אורח')) {
            return num * guestCount;
        }
        
        return num;
    };

    const handleCategoryToggle = (id) => {
        setSelectedCategories(prev => 
            prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
        );
    };

    const calculateCombinations = () => {
        setIsCalculating(true);
        
        // 1. Group relevant packages by category
        const optionsByCategory = {};
        selectedCategories.forEach(catId => {
            const catVendors = vendors.filter(v => v.type === catId);
            const packages = [];
            
            catVendors.forEach(vendor => {
                if (vendor.portfolio && vendor.portfolio.length > 0) {
                    vendor.portfolio.forEach(pkg => {
                        packages.push({
                            vendorId: vendor.id,
                            vendorName: vendor.name,
                            vendorImage: vendor.image,
                            title: pkg.title,
                            price: parsePrice(pkg.price, guests),
                            originalPrice: pkg.price,
                            image: pkg.image || vendor.image
                        });
                    });
                } else if (vendor.price) {
                     packages.push({
                        vendorId: vendor.id,
                        vendorName: vendor.name,
                        vendorImage: vendor.image,
                        title: 'חבילה בסיסית',
                        price: parsePrice(vendor.price, guests),
                        originalPrice: vendor.price,
                        image: vendor.image
                    });
                }
            });
            
            // Sort by price to help search
            optionsByCategory[catId] = packages.sort((a, b) => a.price - b.price);
        });

        // 2. Recursive search for combinations
        const finalResults = [];
        const categoriesToProcess = selectedCategories.filter(catId => optionsByCategory[catId]?.length > 0);
        
        if (categoriesToProcess.length === 0) {
            setResults([]);
            setIsCalculating(false);
            setActiveTab('results');
            return;
        }

        const find = (index, currentCombo, currentTotal) => {
            if (finalResults.length >= 15) return; // Limit results
            
            if (index === categoriesToProcess.length) {
                if (currentTotal <= budget) {
                    finalResults.push({
                        items: [...currentCombo],
                        total: currentTotal,
                        saving: Math.round(budget - currentTotal)
                    });
                }
                return;
            }

            const catId = categoriesToProcess[index];
            const options = optionsByCategory[catId];

            for (const opt of options) {
                if (currentTotal + opt.price > budget) break; // Optimization: prices are sorted
                
                currentCombo.push(opt);
                find(index + 1, currentCombo, currentTotal + opt.price);
                currentCombo.pop();
                
                if (finalResults.length >= 15) return;
            }
        };

        find(0, [], 0);
        
        // Sort results by "Best Value" (closest to budget but under it, or most items)
        setResults(finalResults.sort((a, b) => b.total - a.total));
        
        setTimeout(() => {
            setIsCalculating(false);
            setActiveTab('results');
        }, 800);
    };

    return (
        <div className="planner-page" dir="rtl">
            {/* Hero Section */}
            <section className="planner-hero">
                <div className="container">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="hero-content"
                    >
                        <span className="badge">חכם, פשוט, חסכוני</span>
                        <h1>מתכנן התקציב של <span className="gold-text">Fiesta</span></h1>
                        <p>אנחנו נרכיב לכם את השילוב המושלם של ספקים שנכנס בדיוק בתקציב שלכם.</p>
                    </motion.div>
                </div>
            </section>

            <div className="container main-content">
                <div className="planner-grid">
                    {/* Sidebar / Inputs */}
                    <div className="planner-sidebar">
                        <div className="glass-card">
                            <h3 className="section-title"><i className="fas fa-sliders-h"></i> הגדרות האירוע</h3>
                            
                            <div className="input-group">
                                <label>תקציב כולל (₪)</label>
                                <div className="budget-slider-container">
                                    <input 
                                        type="range" 
                                        min="5000" 
                                        max="500000" 
                                        step="5000" 
                                        value={budget} 
                                        onChange={(e) => setBudget(parseInt(e.target.value))}
                                        className="budget-slider"
                                    />
                                    <div className="budget-display">
                                        <span className="amount">₪{budget.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="input-group">
                                <label>מספר אורחים משוער</label>
                                <div className="guests-input">
                                    <button onClick={() => setGuests(Math.max(10, guests - 10))}>-</button>
                                    <input 
                                        type="number" 
                                        value={guests} 
                                        onChange={(e) => setGuests(parseInt(e.target.value) || 0)}
                                    />
                                    <button onClick={() => setGuests(guests + 10)}>+</button>
                                </div>
                            </div>

                            <div className="input-group">
                                <label>מה אתם מחפשים? ({selectedCategories.length})</label>
                                <div className="category-chips">
                                    {CATEGORIES.map(cat => (
                                        <button 
                                            key={cat.id}
                                            onClick={() => handleCategoryToggle(cat.id)}
                                            className={`chip ${selectedCategories.includes(cat.id) ? 'active' : ''}`}
                                        >
                                            <i className={`fas ${cat.icon}`}></i>
                                            {cat.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button 
                                className="generate-btn" 
                                onClick={calculateCombinations}
                                disabled={isCalculating || selectedCategories.length === 0}
                            >
                                {isCalculating ? (
                                    <><i className="fas fa-spinner fa-spin"></i> מחשב שילובים...</>
                                ) : (
                                    <><i className="fas fa-magic"></i> מצא שילובים מנצחים</>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Results Area */}
                    <div className="planner-results">
                        <AnimatePresence mode="wait">
                            {activeTab === 'input' ? (
                                <motion.div 
                                    key="empty"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="empty-results"
                                >
                                    <div className="illustration">
                                        <i className="fas fa-calculator"></i>
                                    </div>
                                    <h3>הזינו תקציב ובחרו קטגוריות</h3>
                                    <p>המערכת החכמה שלנו תנתח מאות ספקים ותמצא לכם את השילובים המשתלמים ביותר.</p>
                                </motion.div>
                            ) : results.length > 0 ? (
                                <motion.div 
                                    key="results"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="results-container"
                                >
                                    <div className="results-header">
                                        <h3>מצאנו {results.length} שילובים אפשריים</h3>
                                        <button onClick={() => setActiveTab('input')} className="back-link desktop-hide">שינוי הגדרות</button>
                                    </div>
                                    
                                    <div className="results-list">
                                        {results.map((combo, idx) => (
                                            <motion.div 
                                                key={idx}
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.1 }}
                                                className="combo-card"
                                            >
                                                <div className="combo-badge">אופציה #{idx + 1}</div>
                                                <div className="combo-main">
                                                    <div className="combo-total">
                                                        <span className="label">סה"כ לעסקה:</span>
                                                        <span className="value">₪{combo.total.toLocaleString()}</span>
                                                    </div>
                                                    <div className="combo-saving">
                                                        נשאר עוד: <span style={{fontWeight: 900}}>₪{combo.saving.toLocaleString()}</span>
                                                    </div>
                                                </div>
                                                
                                                <div className="combo-items">
                                                    {combo.items.map((item, i) => (
                                                        <div key={i} className="combo-item">
                                                            <div className="item-img">
                                                                <img src={item.image || '/images/photographer.jpeg'} alt={item.vendorName} />
                                                            </div>
                                                            <div className="item-info">
                                                                <h4>{item.vendorName}</h4>
                                                                <p>{item.title}</p>
                                                            </div>
                                                            <div className="item-price">
                                                                ₪{item.price.toLocaleString()}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>

                                                <div className="combo-actions">
                                                    <button className="details-btn">קבלת הצעה משולבת</button>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div 
                                    key="no-results"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="empty-results"
                                >
                                    <div className="illustration no-res">
                                        <i className="fas fa-exclamation-circle"></i>
                                    </div>
                                    <h3>לא נמצאו שילובים בתקציב הזה</h3>
                                    <p>נסו להעלות את התקציב או לבחור פחות קטגוריות.</p>
                                    <button onClick={() => setActiveTab('input')} className="back-btn">חזרה להגדרות</button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .planner-page { min-height: 100vh; background: var(--off-white); padding-bottom: 80px; }
                .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
                .planner-hero { background: var(--charcoal); padding: 72px 0 100px; color: white; text-align: center; position: relative; }
                .hero-content h1 { font-family: var(--font-display); font-size: clamp(1.8rem, 4vw, 2.6rem); margin: 12px 0; font-weight: 500; }
                .gold-text { color: #fff; }
                .badge { background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.85); padding: 6px 12px; border-radius: 6px; font-weight: 500; font-size: 0.8rem; border: 1px solid rgba(255,255,255,0.15); }
                .main-content { margin-top: -60px; position: relative; z-index: 10; }
                .planner-grid { display: grid; grid-template-columns: 380px 1fr; gap: 24px; }
                .glass-card { background: white; border-radius: 16px; padding: 28px; border: 1px solid var(--border-color); position: sticky; top: 100px; }
                .section-title { font-weight: 600; margin-bottom: 22px; display: flex; align-items: center; gap: 10px; color: var(--text-dark); font-family: var(--font-main); font-size: 1.05rem; }
                .input-group { margin-bottom: 22px; }
                .input-group label { display: block; font-weight: 600; margin-bottom: 10px; color: var(--text-light); font-size: 0.9rem; }
                .budget-slider { width: 100%; accent-color: var(--primary-color); cursor: pointer; }
                .budget-display { text-align: center; margin-top: 10px; background: var(--off-white); padding: 12px; border-radius: 10px; border: 1px solid var(--border-color); }
                .budget-display .amount { font-size: 1.5rem; font-weight: 600; color: var(--text-dark); font-family: var(--font-display); }
                .guests-input { display: flex; align-items: center; gap: 10px; background: var(--off-white); padding: 5px; border-radius: 10px; }
                .guests-input button { width: 36px; height: 36px; border: 1px solid var(--border-color); background: white; border-radius: 8px; font-weight: 600; cursor: pointer; }
                .guests-input input { flex: 1; background: none; border: none; text-align: center; font-weight: 600; font-size: 1.05rem; }
                .category-chips { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
                .chip { padding: 8px; border: 1px solid #e5e2dc; background: white; border-radius: 8px; font-size: 0.8rem; font-weight: 500; cursor: pointer; display: flex; align-items: center; gap: 6px; transition: border-color 0.2s, background 0.2s, color 0.2s; }
                .chip.active { background: var(--charcoal); color: white; border-color: var(--charcoal); }
                .generate-btn { width: 100%; padding: 14px; background: var(--charcoal); color: white; border: none; border-radius: 8px; font-weight: 600; font-size: 1rem; cursor: pointer; transition: background 0.2s; margin-top: 10px; font-family: inherit; }
                .generate-btn:hover:not(:disabled) { background: #000; }
                .generate-btn:disabled { opacity: 0.55; cursor: not-allowed; }
                .empty-results { background: white; border-radius: 16px; padding: 64px 28px; text-align: center; border: 1px solid var(--border-color); }
                .illustration { font-size: 3rem; color: #e5e2dc; margin-bottom: 20px; }
                .results-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
                .results-header h3 { font-size: 1.25rem; font-weight: 500; margin: 0; font-family: var(--font-display); }
                .combo-card { background: white; border-radius: 14px; padding: 22px; margin-bottom: 16px; border: 1px solid var(--border-color); position: relative; }
                .combo-badge { position: absolute; top: -10px; right: 16px; background: var(--charcoal); color: white; padding: 4px 10px; border-radius: 6px; font-size: 0.72rem; font-weight: 600; }
                .combo-main { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px dashed #e5e2dc; padding-bottom: 14px; margin-bottom: 14px; }
                .combo-total .label { display: block; font-size: 0.8rem; color: var(--text-light); margin-bottom: 2px; }
                .combo-total .value { font-size: 1.6rem; font-weight: 600; color: var(--text-dark); font-family: var(--font-display); }
                .combo-saving { background: var(--off-white); color: var(--text-dark); padding: 6px 12px; border-radius: 8px; font-weight: 600; font-size: 0.85rem; border: 1px solid var(--border-color); }
                .combo-items { display: flex; flex-direction: column; gap: 10px; }
                .combo-item { display: flex; align-items: center; gap: 12px; padding: 8px; border-radius: 10px; background: var(--off-white); }
                .item-img { width: 44px; height: 44px; border-radius: 8px; overflow: hidden; }
                .item-img img { width: 100%; height: 100%; object-fit: cover; }
                .item-info { flex: 1; text-align: right; }
                .item-info h4 { font-size: 0.9rem; font-weight: 600; margin: 0; font-family: var(--font-main); }
                .item-info p { font-size: 0.75rem; color: var(--text-light); margin: 1px 0 0; }
                .item-price { font-weight: 600; color: var(--text-dark); font-size: 0.95rem; }
                .combo-actions { margin-top: 16px; }
                .details-btn { width: 100%; padding: 12px; background: var(--off-white); border: 1px solid var(--border-color); border-radius: 8px; font-weight: 600; cursor: pointer; transition: background 0.2s, color 0.2s; font-family: inherit; }
                .details-btn:hover { background: var(--charcoal); color: white; border-color: var(--charcoal); }
                .back-link { background: none; border: none; color: var(--text-dark); font-weight: 600; cursor: pointer; text-decoration: underline; }
                .desktop-hide { display: none; }

                @media (max-width: 900px) {
                    .planner-page { padding-bottom: 24px; }
                    .planner-hero { padding: 72px 0 80px; }
                    .hero-content h1 { font-size: 1.7rem; padding: 0 12px; }
                    .planner-grid { grid-template-columns: 1fr; }
                    .glass-card { position: relative; top: 0; border-radius: 14px; padding: 20px 16px; }
                    .desktop-hide { display: block; }
                    .results-header h3 { font-size: 1.1rem; }
                    .combo-main { flex-direction: column; align-items: flex-start; gap: 10px; }
                    .combo-saving { width: 100%; text-align: center; }
                    .main-content { margin-top: -40px; }
                    .container { padding: 0 14px; }
                    .chip { min-height: 44px; justify-content: center; padding: 10px 8px; }
                    .generate-btn { min-height: 52px; }
                    .guests-input button { width: 44px; height: 44px; }
                    .combo-card { padding: 18px 14px; }
                    .details-btn { min-height: 48px; }
                    .empty-results { padding: 48px 20px; }
                }
            `}</style>
        </div>
    );
}

export default function BudgetPlannerPage() {
    return (
        <Suspense fallback={<div>טוען...</div>}>
            <BudgetPlannerContent />
        </Suspense>
    );
}
