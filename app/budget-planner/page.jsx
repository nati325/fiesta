'use client';

import { useState, useEffect, useMemo } from 'react';
import { useVendors } from '@/context/VendorContext';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

const CATEGORIES = [
    { id: 'venue', name: 'אולם / גן אירועים', icon: 'fa-landmark' },
    { id: 'catering', name: 'קייטרינג', icon: 'fa-utensils' },
    { id: 'dj', name: 'DJ ומוזיקה', icon: 'fa-compact-disc' },
    { id: 'photographer', name: 'צלמים', icon: 'fa-camera' },
    { id: 'design', name: 'עיצוב אירועים', icon: 'fa-paint-brush' },
    { id: 'alcohol', name: 'בר אלכוהול', icon: 'fa-glass-cheers' },
    { id: 'attractions', name: 'אטרקציות', icon: 'fa-magic' },
    { id: 'makeup', name: 'איפור', icon: 'fa-eye' },
    { id: 'hair', name: 'עיצוב שיער', icon: 'fa-cut' },
    { id: 'dresses', name: 'שמלות כלה', icon: 'fa-female' },
    { id: 'suits', name: 'חליפות חתן', icon: 'fa-user-tie' }
];

export default function BudgetPlannerPage() {
    const { vendors } = useVendors();
    const [budget, setBudget] = useState(50000);
    const [guests, setGuests] = useState(100);
    const [selectedCategories, setSelectedCategories] = useState(['venue', 'dj', 'photographer']);
    const [isCalculating, setIsCalculating] = useState(false);
    const [results, setResults] = useState([]);
    const [activeTab, setActiveTab] = useState('input'); // 'input' or 'results'

    // Helper to parse price string to number
    const parsePrice = (priceStr, guestCount = 1) => {
        if (typeof priceStr === 'number') return priceStr;
        if (!priceStr) return 0;
        
        const cleanStr = priceStr.replace(/[^0-9.]/g, '');
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
            if (finalResults.length >= 12) return; // Limit results
            
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
                
                if (finalResults.length >= 12) return;
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
                        <h1>מחשבון התקציב של <span className="gold-text">Fiesta</span></h1>
                        <p>אנחנו נרכיב לכם את השילוב המושלם של ספקים שנכנס בדיוק בתקציב שלכם. <br />
                        <span style={{ color: '#D4AF37', fontWeight: 'bold' }}>השירות בחינם לגמרי - ללא עמלות וללא אותיות קטנות.</span></p>
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
                                        <p>התוצאות מבוססות על מחירי חבילות ופורטפוליו של הספקים.</p>
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
                                                        נשאר לכם מהתקציב: ₪{combo.saving.toLocaleString()}
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
                                                    <div className="share-btn"><i className="fas fa-share-alt"></i></div>
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
                                    <p>נסו להעלות את התקציב או לבחור פחות קטגוריות כדי לראות אפשרויות.</p>
                                    <button onClick={() => setActiveTab('input')} className="back-btn">חזרה להגדרות</button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .planner-page {
                    min-height: 100vh;
                    background: #f8fafc;
                    padding-bottom: 80px;
                }

                .planner-hero {
                    background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
                    padding: 100px 0 160px;
                    color: white;
                    text-align: center;
                    position: relative;
                    overflow: hidden;
                }

                .planner-hero::before {
                    content: '';
                    position: absolute;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: url('https://www.transparenttextures.com/patterns/cubes.png');
                    opacity: 0.1;
                }

                .hero-content h1 {
                    font-family: var(--font-playfair);
                    font-size: 3.5rem;
                    margin: 20px 0;
                }

                .gold-text {
                    color: #D4AF37;
                    background: linear-gradient(135deg, #D4AF37 0%, #F5E6AD 50%, #D4AF37 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                .badge {
                    background: rgba(212, 175, 55, 0.2);
                    color: #D4AF37;
                    padding: 8px 16px;
                    border-radius: 20px;
                    font-weight: 800;
                    font-size: 0.9rem;
                    border: 1px solid rgba(212, 175, 55, 0.3);
                }

                .main-content {
                    margin-top: -80px;
                    position: relative;
                    z-index: 10;
                }

                .planner-grid {
                    display: grid;
                    grid-template-columns: 350px 1fr;
                    gap: 30px;
                }

                .glass-card {
                    background: white;
                    border-radius: 24px;
                    padding: 30px;
                    box-shadow: 0 20px 50px rgba(0,0,0,0.1);
                    border: 1px solid rgba(255,255,255,0.8);
                    position: sticky;
                    top: 100px;
                }

                .section-title {
                    font-weight: 900;
                    margin-bottom: 25px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    color: #1a1a1a;
                }

                .section-title i {
                    color: #D4AF37;
                }

                .input-group {
                    margin-bottom: 30px;
                }

                .input-group label {
                    display: block;
                    font-weight: 800;
                    margin-bottom: 12px;
                    color: #444;
                    font-size: 0.95rem;
                }

                .budget-slider {
                    width: 100%;
                    accent-color: #D4AF37;
                    cursor: pointer;
                }

                .budget-display {
                    text-align: center;
                    margin-top: 15px;
                    background: #fdfaf0;
                    padding: 15px;
                    border-radius: 15px;
                    border: 2px solid #f5e6ad;
                }

                .budget-display .amount {
                    font-size: 1.8rem;
                    font-weight: 900;
                    color: #D4AF37;
                }

                .guests-input {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    background: #f1f5f9;
                    padding: 5px;
                    border-radius: 12px;
                }

                .guests-input button {
                    width: 40px;
                    height: 40px;
                    border: none;
                    background: white;
                    border-radius: 10px;
                    font-weight: bold;
                    cursor: pointer;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.05);
                }

                .guests-input input {
                    flex: 1;
                    background: none;
                    border: none;
                    text-align: center;
                    font-weight: 900;
                    font-size: 1.2rem;
                }

                .category-chips {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 10px;
                }

                .chip {
                    padding: 10px;
                    border: 1.5px solid #e2e8f0;
                    background: white;
                    border-radius: 12px;
                    font-size: 0.85rem;
                    font-weight: 700;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    transition: all 0.2s;
                }

                .chip.active {
                    background: #1a1a1a;
                    color: white;
                    border-color: #1a1a1a;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
                }

                .generate-btn {
                    width: 100%;
                    padding: 18px;
                    background: linear-gradient(135deg, #D4AF37 0%, #B8962D 100%);
                    color: white;
                    border: none;
                    border-radius: 15px;
                    font-weight: 900;
                    font-size: 1.1rem;
                    cursor: pointer;
                    box-shadow: 0 10px 20px rgba(212, 175, 55, 0.3);
                    transition: all 0.3s;
                }

                .generate-btn:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 15px 30px rgba(212, 175, 55, 0.4);
                }

                .generate-btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                .empty-results {
                    background: white;
                    border-radius: 24px;
                    padding: 100px 40px;
                    text-align: center;
                    box-shadow: 0 20px 50px rgba(0,0,0,0.05);
                }

                .illustration {
                    font-size: 5rem;
                    color: #f1f5f9;
                    margin-bottom: 30px;
                }

                .empty-results h3 {
                    font-size: 1.8rem;
                    font-weight: 900;
                    margin-bottom: 15px;
                }

                .empty-results p {
                    color: #64748b;
                    max-width: 400px;
                    margin: 0 auto;
                }

                .results-header {
                    margin-bottom: 30px;
                }

                .results-header h3 {
                    font-size: 1.5rem;
                    font-weight: 900;
                }

                .combo-card {
                    background: white;
                    border-radius: 20px;
                    padding: 25px;
                    margin-bottom: 25px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.05);
                    border: 1px solid #f1f5f9;
                    position: relative;
                    transition: all 0.3s;
                }

                .combo-card:hover {
                    transform: translateX(-5px);
                    box-shadow: 0 15px 40px rgba(0,0,0,0.08);
                }

                .combo-badge {
                    position: absolute;
                    top: -12px;
                    right: 20px;
                    background: #1a1a1a;
                    color: white;
                    padding: 5px 15px;
                    border-radius: 10px;
                    font-size: 0.8rem;
                    font-weight: 900;
                }

                .combo-main {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 1px dashed #e2e8f0;
                    padding-bottom: 20px;
                    margin-bottom: 20px;
                }

                .combo-total .label {
                    display: block;
                    font-size: 0.9rem;
                    color: #64748b;
                    margin-bottom: 5px;
                }

                .combo-total .value {
                    font-size: 2rem;
                    font-weight: 900;
                    color: #1a1a1a;
                }

                .combo-saving {
                    background: #e6f4ea;
                    color: #1e7e34;
                    padding: 8px 16px;
                    border-radius: 10px;
                    font-weight: 800;
                    font-size: 0.9rem;
                }

                .combo-items {
                    display: flex;
                    flex-direction: column;
                    gap: 15px;
                }

                .combo-item {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    padding: 10px;
                    border-radius: 12px;
                    background: #f8fafc;
                }

                .item-img {
                    width: 50px;
                    height: 50px;
                    border-radius: 10px;
                    overflow: hidden;
                }

                .item-img img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .item-info {
                    flex: 1;
                }

                .item-info h4 {
                    font-size: 0.95rem;
                    font-weight: 800;
                    margin: 0;
                }

                .item-info p {
                    font-size: 0.8rem;
                    color: #64748b;
                    margin: 2px 0 0;
                }

                .item-price {
                    font-weight: 900;
                    color: #D4AF37;
                }

                .combo-actions {
                    margin-top: 25px;
                    display: flex;
                    gap: 15px;
                }

                .details-btn {
                    flex: 1;
                    padding: 14px;
                    background: #f8fafc;
                    border: 1.5px solid #e2e8f0;
                    border-radius: 12px;
                    font-weight: 800;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .details-btn:hover {
                    background: #1a1a1a;
                    color: white;
                    border-color: #1a1a1a;
                }

                .share-btn {
                    width: 50px;
                    height: 50px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #f8fafc;
                    border: 1.5px solid #e2e8f0;
                    border-radius: 12px;
                    color: #64748b;
                    cursor: pointer;
                }

                @media (max-width: 1000px) {
                    .planner-grid {
                        grid-template-columns: 1fr;
                    }
                    .planner-sidebar {
                        position: relative;
                        top: 0;
                    }
                    .hero-content h1 {
                        font-size: 2.5rem;
                    }
                }
            `}</style>
        </div>
    );
}
