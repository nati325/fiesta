'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';

function SearchResultsContent() {
    const searchParams = useSearchParams();
    const query = searchParams.get('q') || '';
    const area = searchParams.get('area') || 'כל הארץ';
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/vendors')
            .then(res => res.json())
            .then(data => {
                const filtered = data.filter(v => {
                    const matchesQuery = v.name.toLowerCase().includes(query.toLowerCase()) || 
                                       v.type.toLowerCase().includes(query.toLowerCase());
                    const matchesArea = area === 'כל הארץ' || v.region === area;
                    return matchesQuery && matchesArea;
                });
                setVendors(filtered);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [query, area]);

    return (
        <div className="search-results-page">
            <div className="results-header">
                <div className="container">
                    <h1>תוצאות חיפוש עבור: <span className="highlight">"{query}"</span></h1>
                    <p>מצאנו {vendors.length} ספקים רלוונטיים {area !== 'כל הארץ' ? `באזור ${area}` : ''}</p>
                </div>
            </div>

            <div className="container">
                {loading ? (
                    <div className="loading-state">טוען ספקים...</div>
                ) : vendors.length > 0 ? (
                    <div className="vendors-grid">
                        {vendors.map((v, i) => (
                            <motion.div 
                                key={v.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="vendor-card-premium"
                            >
                                <Link href={`/vendor/${v.id}`}>
                                    <div className="card-image">
                                        <img src={v.image || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80'} alt={v.name} />
                                        <div className="category-tag">{v.type}</div>
                                    </div>
                                    <div className="card-info">
                                        <h3>{v.name}</h3>
                                        <div className="location"><i className="fas fa-map-marker-alt"></i> {v.region}</div>
                                        <div className="price-row">
                                            <span className="price">₪{v.price}</span>
                                            {v.originalPrice && <span className="old-price">₪{v.originalPrice}</span>}
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="no-results">
                        <i className="fas fa-search"></i>
                        <h2>מצטערים, לא מצאנו תוצאות</h2>
                        <p>נסו לחפש משהו אחר או לבדוק את הקטגוריות הפופולריות שלנו</p>
                        <Link href="/" className="back-home">חזרה לדף הבית</Link>
                    </div>
                )}
            </div>

            <style jsx>{`
                .search-results-page {
                    padding-top: 100px;
                    min-height: 100vh;
                    background: #fdfcf9;
                }
                .results-header {
                    background: white;
                    padding: 60px 0;
                    margin-bottom: 40px;
                    border-bottom: 1px solid #eee;
                    text-align: right;
                }
                .container {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 0 20px;
                }
                h1 {
                    font-size: 2.5rem;
                    font-weight: 900;
                    margin-bottom: 10px;
                }
                .highlight {
                    color: var(--primary-color);
                }
                p {
                    font-size: 1.1rem;
                    color: #666;
                }
                .vendors-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                    gap: 30px;
                    padding-bottom: 100px;
                }
                .vendor-card-premium {
                    background: white;
                    border-radius: 24px;
                    overflow: hidden;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.05);
                    transition: all 0.3s;
                    border: 1px solid #eee;
                }
                .vendor-card-premium:hover {
                    transform: translateY(-10px);
                    box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                }
                .card-image {
                    height: 200px;
                    position: relative;
                }
                .card-image img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                .category-tag {
                    position: absolute;
                    top: 15px;
                    right: 15px;
                    background: rgba(255,255,255,0.9);
                    padding: 5px 15px;
                    border-radius: 50px;
                    font-size: 0.8rem;
                    font-weight: 800;
                    color: var(--primary-color);
                }
                .card-info {
                    padding: 20px;
                    text-align: right;
                }
                h3 {
                    margin: 0 0 10px;
                    font-size: 1.3rem;
                    font-weight: 900;
                }
                .location {
                    color: #888;
                    font-size: 0.9rem;
                    margin-bottom: 15px;
                }
                .price-row {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                .price {
                    font-size: 1.4rem;
                    font-weight: 900;
                    color: var(--primary-color);
                }
                .old-price {
                    text-decoration: line-through;
                    color: #bbb;
                    font-size: 0.9rem;
                }
                .no-results {
                    text-align: center;
                    padding: 100px 20px;
                }
                .no-results i {
                    font-size: 4rem;
                    color: #eee;
                    margin-bottom: 20px;
                }
                .back-home {
                    display: inline-block;
                    margin-top: 30px;
                    background: var(--primary-color);
                    color: white;
                    padding: 12px 30px;
                    border-radius: 50px;
                    font-weight: 800;
                    text-decoration: none;
                }
            `}</style>
        </div>
    );
}

export default function SearchResultsPage() {
    return (
        <Suspense fallback={<div>טוען...</div>}>
            <SearchResultsContent />
        </Suspense>
    );
}
