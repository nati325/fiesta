'use client';

import { useState, useMemo, Suspense } from 'react';
import { useVendors } from '@/context/VendorContext';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import VendorCardImage from '@/components/VendorCardImage';
import { resolveVendorImage } from '@/lib/vendorImage';
import { parsePrice, parsePriceRange, hasValidPrice, getPackages } from '@/lib/vendorPrice';

/** Must match real vendor.type slugs in DB / site */
const CATEGORIES = [
    { id: 'venue', name: 'אולם / גן אירועים', icon: 'fa-landmark' },
    { id: 'catering', name: 'קייטרינג', icon: 'fa-utensils' },
    { id: 'dj', name: 'DJ ומוזיקה', icon: 'fa-compact-disc' },
    { id: 'photographer', name: 'צלמים', icon: 'fa-camera' },
    { id: 'design', name: 'עיצוב אירועים', icon: 'fa-paint-brush' },
    { id: 'alcohol', name: 'אלכוהול ובר', icon: 'fa-glass-cheers' },
    { id: 'makeup', name: 'איפור', icon: 'fa-eye' },
    { id: 'suits', name: 'חליפות חתן', icon: 'fa-user-tie' },
    { id: 'dresses', name: 'שמלות כלה', icon: 'fa-female' },
];

const WA_PHONE = '972535378985';

/** Numeric price for planner math — ranges use midpoint; per-guest when marked. */
function plannerUnitPrice(raw, guestCount) {
    if (raw == null || raw === '') return null;
    const str = String(raw);
    const range = parsePriceRange(str);
    if (range) return Math.round((range.min + range.max) / 2);

    const single = parsePrice(str);
    if (single == null) return null;

    if (/מנה|איש|אורח|לאורח|לאורחים/.test(str)) {
        return Math.round(single * Math.max(1, guestCount || 1));
    }
    return Math.round(single);
}

function buildVendorOptions(vendor, guests) {
    const options = [];
    const seen = new Set();

    const push = (title, priceRaw, image) => {
        const price = plannerUnitPrice(priceRaw, guests);
        if (price == null || price <= 0) return;
        const label = (title || '').trim() || (vendor.name || '').trim();
        if (!label) return;
        const key = `${vendor.id}|${label}|${price}`;
        if (seen.has(key)) return;
        seen.add(key);
        options.push({
            vendorId: String(vendor.id),
            vendorName: vendor.name,
            vendorImage: vendor.image,
            title: label,
            price,
            image: image || vendor.image || '',
        });
    };

    // Real packages only — add-ons are priced as extras, not as a budget line.
    const packages = getPackages(vendor);
    if (packages.length > 0) {
        [...packages]
            .sort((a, b) => (parsePrice(a.price) ?? Infinity) - (parsePrice(b.price) ?? Infinity))
            .forEach((p) => push(p.name || p.title || '', p.price, p.image));
    }

    // Fallback: vendor-level price with vendor name (no invented package title)
    if (options.length === 0 && hasValidPrice(vendor.price)) {
        push(vendor.name || '', vendor.price, vendor.image);
    }

    // Only portfolio rows that actually have a real price (rare legacy)
    if (Array.isArray(vendor.portfolio)) {
        vendor.portfolio.forEach((item) => {
            if (!item || typeof item === 'string') return;
            if (!hasValidPrice(item.price)) return;
            push(item.title || item.name || '', item.price, item.image);
        });
    }

    return options;
}

function BudgetPlannerContent() {
    const { vendors, loading } = useVendors();
    const [budget, setBudget] = useState(50000);
    const [guests, setGuests] = useState(100);
    const [selectedCategories, setSelectedCategories] = useState(['venue', 'dj']);
    const [isCalculating, setIsCalculating] = useState(false);
    const [results, setResults] = useState([]);
    const [activeTab, setActiveTab] = useState('input');
    const [emptyReason, setEmptyReason] = useState('');

    const realVendors = useMemo(
        () => (vendors || []).filter((v) => v && v.name && v.type),
        [vendors]
    );

    const handleCategoryToggle = (id) => {
        setSelectedCategories((prev) =>
            prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
        );
    };

    const calculateCombinations = () => {
        if (loading) return;
        setIsCalculating(true);
        setEmptyReason('');

        const optionsByCategory = {};
        selectedCategories.forEach((catId) => {
            const packages = [];
            realVendors
                .filter((v) => v.type === catId)
                .forEach((vendor) => {
                    packages.push(...buildVendorOptions(vendor, guests));
                });
            // keep cheapest few per category to avoid explosion, but only real prices
            optionsByCategory[catId] = packages
                .sort((a, b) => a.price - b.price)
                .slice(0, 12);
        });

        const categoriesToProcess = selectedCategories.filter(
            (catId) => optionsByCategory[catId]?.length > 0
        );

        let reason = '';
        if (categoriesToProcess.length === 0) {
            setResults([]);
            setEmptyReason('לא מצאנו ספקים עם מחיר אמיתי בקטגוריות שבחרתם.');
            setIsCalculating(false);
            setActiveTab('results');
            return;
        }

        if (categoriesToProcess.length < selectedCategories.length) {
            const missing = selectedCategories.filter((c) => !categoriesToProcess.includes(c));
            const labels = missing
                .map((id) => CATEGORIES.find((c) => c.id === id)?.name || id)
                .join(', ');
            reason = `אין ספקים מתומחרים עבור: ${labels}. מציגים שילובים מהקטגוריות הזמינות.`;
        }

        const finalResults = [];
        const usedVendorSets = new Set();

        const find = (index, currentCombo, currentTotal, usedVendors) => {
            if (finalResults.length >= 20) return;

            if (index === categoriesToProcess.length) {
                if (currentTotal > 0 && currentTotal <= budget) {
                    const sig = currentCombo.map((i) => i.vendorId).sort().join('|');
                    if (usedVendorSets.has(sig)) return;
                    usedVendorSets.add(sig);
                    finalResults.push({
                        items: [...currentCombo],
                        total: currentTotal,
                        saving: Math.round(budget - currentTotal),
                    });
                }
                return;
            }

            const catId = categoriesToProcess[index];
            const options = optionsByCategory[catId];

            for (const opt of options) {
                if (usedVendors.has(opt.vendorId)) continue;
                if (currentTotal + opt.price > budget) break;

                currentCombo.push(opt);
                usedVendors.add(opt.vendorId);
                find(index + 1, currentCombo, currentTotal + opt.price, usedVendors);
                usedVendors.delete(opt.vendorId);
                currentCombo.pop();

                if (finalResults.length >= 20) return;
            }
        };

        find(0, [], 0, new Set());
        setResults(finalResults.sort((a, b) => b.total - a.total));

        if (finalResults.length === 0) {
            setEmptyReason(reason || 'לא נמצאו שילובים בתקציב הזה. נסו להעלות תקציב או להוריד קטגוריות.');
        } else {
            setEmptyReason(reason);
        }

        setTimeout(() => {
            setIsCalculating(false);
            setActiveTab('results');
        }, 400);
    };

    const buildWaCombo = (combo) => {
        const lines = combo.items.map(
            (i) => `• ${i.vendorName} (${i.title}) — ₪${i.price.toLocaleString('he-IL')}`
        );
        const text = `היי, הגעתי מ־Fiesta ממתכנן התקציב.\nתקציב: ₪${budget.toLocaleString('he-IL')}\nסה״כ שילוב: ₪${combo.total.toLocaleString('he-IL')}\n\n${lines.join('\n')}\n\nאשמח לדבר עם נציג`;
        return `https://wa.me/${WA_PHONE}?text=${encodeURIComponent(text)}`;
    };

    return (
        <div className="planner-page" dir="rtl">
            <section className="planner-hero">
                <div className="container">
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                        className="planner-hero-content"
                    >
                        <Link href="/" className="planner-back">
                            <i className="fas fa-arrow-right" aria-hidden="true"></i>
                            חזרה לדף הבית
                        </Link>
                        <p className="planner-kicker">כלי תכנון של Fiesta</p>
                        <h1>
                            מתכנן התקציב
                        </h1>
                        <p className="planner-lead">
                            שילובים מספקים אמיתיים עם מחירים אמיתיים — בתוך המסגרת שלכם.
                        </p>
                    </motion.div>
                </div>
            </section>

            <div className="container main-content">
                <div className="planner-grid">
                    <div className="planner-sidebar">
                        <div className={`glass-card ${activeTab === 'results' ? 'mobile-hide-on-results' : ''}`}>
                            <h3 className="section-title">
                                <i className="fas fa-sliders-h"></i> הגדרות האירוע
                            </h3>

                            <div className="input-group">
                                <label>תקציב כולל (₪)</label>
                                <div className="budget-slider-container">
                                    <input
                                        type="range"
                                        min="5000"
                                        max="500000"
                                        step="5000"
                                        value={budget}
                                        onChange={(e) => setBudget(parseInt(e.target.value, 10))}
                                        className="budget-slider"
                                    />
                                    <div className="budget-display">
                                        <span className="amount">₪{budget.toLocaleString('he-IL')}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="input-group">
                                <label>מספר אורחים משוער</label>
                                <div className="guests-input">
                                    <button type="button" onClick={() => setGuests(Math.max(10, guests - 10))}>
                                        -
                                    </button>
                                    <input
                                        type="number"
                                        value={guests}
                                        onChange={(e) => setGuests(parseInt(e.target.value, 10) || 0)}
                                    />
                                    <button type="button" onClick={() => setGuests(guests + 10)}>
                                        +
                                    </button>
                                </div>
                            </div>

                            <div className="input-group">
                                <label>מה אתם מחפשים? ({selectedCategories.length})</label>
                                <div className="category-chips">
                                    {CATEGORIES.map((cat) => (
                                        <button
                                            key={cat.id}
                                            type="button"
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
                                type="button"
                                className="generate-btn"
                                onClick={calculateCombinations}
                                disabled={isCalculating || selectedCategories.length === 0 || loading}
                            >
                                {loading ? (
                                    <>
                                        <i className="fas fa-spinner fa-spin"></i> טוען ספקים...
                                    </>
                                ) : isCalculating ? (
                                    <>
                                        <i className="fas fa-spinner fa-spin"></i> מחשב שילובים...
                                    </>
                                ) : (
                                    <>
                                        <i className="fas fa-magic"></i> מצא שילובים מנצחים
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

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
                                    <p>נבנה שילובים רק מספקים עם מחיר אמיתי במערכת.</p>
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
                                        <button
                                            type="button"
                                            onClick={() => setActiveTab('input')}
                                            className="back-link desktop-hide"
                                        >
                                            שינוי הגדרות
                                        </button>
                                    </div>
                                    {emptyReason && (
                                        <p style={{ color: '#856404', marginBottom: 12, fontSize: '0.9rem' }}>
                                            {emptyReason}
                                        </p>
                                    )}

                                    <div className="results-list">
                                        {results.map((combo, idx) => (
                                            <motion.div
                                                key={idx}
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: Math.min(idx * 0.05, 0.4) }}
                                                className="combo-card"
                                            >
                                                <div className="combo-badge">אופציה #{idx + 1}</div>
                                                <div className="combo-main">
                                                    <div className="combo-total">
                                                        <span className="label">סה&quot;כ לעסקה:</span>
                                                        <span className="value">
                                                            ₪{combo.total.toLocaleString('he-IL')}
                                                        </span>
                                                    </div>
                                                    <div className="combo-saving">
                                                        נשאר עוד:{' '}
                                                        <span style={{ fontWeight: 900 }}>
                                                            ₪{combo.saving.toLocaleString('he-IL')}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="combo-items">
                                                    {combo.items.map((item, i) => (
                                                        <Link
                                                            key={i}
                                                            href={`/vendor/${item.vendorId}`}
                                                            className="combo-item"
                                                            style={{ textDecoration: 'none', color: 'inherit' }}
                                                        >
                                                            <div className="item-img">
                                                                <VendorCardImage
                                                                    src={resolveVendorImage(item.image, '')}
                                                                    alt={item.vendorName}
                                                                />
                                                            </div>
                                                            <div className="item-info">
                                                                <h4>{item.vendorName}</h4>
                                                                <p>{item.title}</p>
                                                            </div>
                                                            <div className="item-price">
                                                                ₪{item.price.toLocaleString('he-IL')}
                                                            </div>
                                                        </Link>
                                                    ))}
                                                </div>

                                                <div className="combo-actions">
                                                    <a
                                                        href={buildWaCombo(combo)}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="details-btn"
                                                    >
                                                        קבלת הצעה משולבת
                                                    </a>
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
                                    <div className="illustration">
                                        <i className="fas fa-search-dollar"></i>
                                    </div>
                                    <h3>לא מצאנו שילובים</h3>
                                    <p>{emptyReason || 'נסו לשנות תקציב או קטגוריות.'}</p>
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('input')}
                                        className="generate-btn"
                                        style={{ maxWidth: 260, margin: '16px auto 0' }}
                                    >
                                        חזרה להגדרות
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .planner-page {
                    min-height: 100vh;
                    background: #faf9f7;
                    padding-bottom: 80px;
                }
                .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }

                .planner-hero {
                    background:
                        radial-gradient(ellipse 70% 80% at 50% 0%, rgba(143, 115, 68, 0.08) 0%, transparent 65%),
                        #faf9f7;
                    padding: 36px 0 28px;
                    color: var(--charcoal);
                    text-align: center;
                    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
                }
                .planner-hero-content {
                    max-width: 560px;
                    margin: 0 auto;
                }
                .planner-back {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    margin-bottom: 18px;
                    color: var(--text-light);
                    text-decoration: none;
                    font-size: 0.86rem;
                    font-weight: 500;
                    transition: color 0.2s;
                }
                .planner-back:hover { color: var(--charcoal); }
                .planner-kicker {
                    margin: 0 0 10px;
                    font-size: 0.72rem;
                    font-weight: 500;
                    letter-spacing: 0.18em;
                    color: var(--primary-color);
                }
                .planner-hero-content h1 {
                    font-family: var(--font-display);
                    font-size: clamp(2rem, 4.5vw, 3rem);
                    margin: 0 0 12px;
                    font-weight: 700;
                    color: var(--charcoal);
                    line-height: 1.15;
                }
                .planner-lead {
                    margin: 0 auto;
                    max-width: 420px;
                    color: var(--text-light);
                    font-size: 1rem;
                    line-height: 1.6;
                }

                .main-content {
                    margin-top: 28px;
                    position: relative;
                    z-index: 2;
                }
                .planner-grid { display: grid; grid-template-columns: 380px 1fr; gap: 24px; }
                .glass-card {
                    background: white;
                    border-radius: 12px;
                    padding: 28px;
                    border: 1px solid var(--border-color);
                    position: sticky;
                    top: 88px;
                    box-shadow: 0 8px 28px rgba(0, 0, 0, 0.04);
                }
                .section-title {
                    font-weight: 600;
                    margin-bottom: 22px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    color: var(--text-dark);
                    font-family: var(--font-main);
                    font-size: 1.05rem;
                }
                .input-group { margin-bottom: 22px; }
                .input-group label {
                    display: block;
                    font-weight: 600;
                    margin-bottom: 10px;
                    color: var(--text-light);
                    font-size: 0.9rem;
                }
                .budget-slider { width: 100%; accent-color: var(--primary-color); cursor: pointer; }
                .budget-display {
                    text-align: center;
                    margin-top: 10px;
                    background: var(--off-white);
                    padding: 12px;
                    border-radius: 10px;
                    border: 1px solid var(--border-color);
                }
                .budget-display .amount {
                    font-size: 1.5rem;
                    font-weight: 600;
                    color: var(--text-dark);
                    font-family: var(--font-display);
                }
                .guests-input {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    background: var(--off-white);
                    padding: 5px;
                    border-radius: 10px;
                }
                .guests-input button {
                    width: 36px;
                    height: 36px;
                    border: 1px solid var(--border-color);
                    background: white;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                }
                .guests-input input {
                    flex: 1;
                    background: none;
                    border: none;
                    text-align: center;
                    font-weight: 600;
                    font-size: 1.05rem;
                }
                .category-chips { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
                .chip {
                    padding: 8px;
                    border: 1px solid #e5e2dc;
                    background: white;
                    border-radius: 8px;
                    font-size: 0.8rem;
                    font-weight: 500;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    transition: border-color 0.2s, background 0.2s, color 0.2s;
                    font-family: inherit;
                }
                .chip.active {
                    background: var(--charcoal);
                    color: white;
                    border-color: var(--charcoal);
                }
                .generate-btn {
                    width: 100%;
                    padding: 14px;
                    background: var(--charcoal);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-weight: 600;
                    font-size: 1rem;
                    cursor: pointer;
                    transition: background 0.2s;
                    margin-top: 10px;
                    font-family: inherit;
                }
                .generate-btn:hover:not(:disabled) { background: var(--primary-color); }
                .generate-btn:disabled { opacity: 0.55; cursor: not-allowed; }
                .empty-results {
                    background: white;
                    border-radius: 12px;
                    padding: 64px 28px;
                    text-align: center;
                    border: 1px solid var(--border-color);
                }
                .illustration { font-size: 2.6rem; color: #d8d2c8; margin-bottom: 20px; }
                .empty-results h3 {
                    font-family: var(--font-display);
                    font-weight: 500;
                    margin: 0 0 8px;
                    color: var(--charcoal);
                }
                .empty-results p { color: var(--text-light); margin: 0; }
                .results-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                }
                .results-header h3 {
                    font-size: 1.25rem;
                    font-weight: 500;
                    margin: 0;
                    font-family: var(--font-display);
                }
                .combo-card {
                    background: white;
                    border-radius: 12px;
                    padding: 22px;
                    margin-bottom: 16px;
                    border: 1px solid var(--border-color);
                    position: relative;
                }
                .combo-badge {
                    position: absolute;
                    top: -10px;
                    right: 16px;
                    background: var(--charcoal);
                    color: white;
                    padding: 4px 10px;
                    border-radius: 6px;
                    font-size: 0.72rem;
                    font-weight: 600;
                }
                .combo-main {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 1px dashed #e5e2dc;
                    padding-bottom: 14px;
                    margin-bottom: 14px;
                }
                .combo-total .label { display: block; font-size: 0.8rem; color: var(--text-light); margin-bottom: 2px; }
                .combo-total .value {
                    font-size: 1.6rem;
                    font-weight: 600;
                    color: var(--text-dark);
                    font-family: var(--font-display);
                }
                .combo-saving {
                    background: var(--off-white);
                    color: var(--text-dark);
                    padding: 6px 12px;
                    border-radius: 8px;
                    font-weight: 600;
                    font-size: 0.85rem;
                    border: 1px solid var(--border-color);
                }
                .combo-items { display: flex; flex-direction: column; gap: 10px; }
                .combo-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 8px;
                    border-radius: 10px;
                    background: var(--off-white);
                }
                .item-img { width: 44px; height: 44px; border-radius: 8px; overflow: hidden; }
                .item-img img { width: 100%; height: 100%; object-fit: cover; }
                .item-info { flex: 1; text-align: right; }
                .item-info h4 { font-size: 0.9rem; font-weight: 600; margin: 0; font-family: var(--font-main); }
                .item-info p { font-size: 0.75rem; color: var(--text-light); margin: 1px 0 0; }
                .item-price { font-weight: 600; color: var(--text-dark); font-size: 0.95rem; }
                .combo-actions { margin-top: 16px; }
                .details-btn {
                    display: block;
                    text-align: center;
                    text-decoration: none;
                    width: 100%;
                    padding: 12px;
                    background: var(--off-white);
                    border: 1px solid var(--border-color);
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: background 0.2s, color 0.2s, border-color 0.2s;
                    font-family: inherit;
                    color: inherit;
                    box-sizing: border-box;
                }
                .details-btn:hover {
                    background: var(--charcoal);
                    color: white;
                    border-color: var(--charcoal);
                }
                .back-link {
                    background: none;
                    border: none;
                    color: var(--text-dark);
                    font-weight: 600;
                    cursor: pointer;
                    text-decoration: underline;
                    font-family: inherit;
                }
                .desktop-hide { display: none; }

                @media (max-width: 900px) {
                    .planner-page { padding-bottom: calc(var(--mobile-chrome-clearance, 88px) + 16px); }
                    .planner-hero { padding: 24px 0 20px; }
                    .planner-hero-content h1 { font-size: 1.75rem; }
                    .planner-grid { grid-template-columns: 1fr; }
                    .glass-card { position: relative; top: 0; border-radius: 12px; padding: 20px 16px; }
                    .glass-card.mobile-hide-on-results { display: none; }
                    .desktop-hide { display: block; }
                    .results-header h3 { font-size: 1.1rem; }
                    .combo-main { flex-direction: column; align-items: flex-start; gap: 10px; }
                    .combo-saving { width: 100%; text-align: center; }
                    .main-content { margin-top: 18px; }
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
        <Suspense fallback={<div style={{ padding: 80, textAlign: 'center' }}>טוען מתכנן...</div>}>
            <BudgetPlannerContent />
        </Suspense>
    );
}
