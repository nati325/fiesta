'use client';

import { useVendors } from '@/context/VendorContext';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { resolveVendorImage } from '@/lib/vendorImage';

export default function FavoritesPage() {
    const { vendors, favorites, toggleFavorite } = useVendors();
    const router = useRouter();

    const favoriteVendors = vendors.filter(v => favorites.includes(v.id));

    return (
        <div className="favorites-page">
            <div className="container favorites-container">
                <div className="favorites-header">
                    <h1>המועדפים שלי</h1>
                    <p>כל הספקים שאהבתם במקום אחד</p>
                </div>

                <AnimatePresence>
                    {favoriteVendors.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="favorites-empty"
                        >
                            <div className="favorites-empty-icon">❤️</div>
                            <h2>עדיין לא בחרתם מועדפים...</h2>
                            <p>זה הזמן לעבור על הספקים ולסמן את אלו שאהבתם</p>
                            <button
                                onClick={() => router.push('/')}
                                className="btn btn-primary favorites-cta"
                            >
                                התחילו לחפש
                            </button>
                        </motion.div>
                    ) : (
                        <div className="favorites-grid">
                            {favoriteVendors.map((v) => (
                                <motion.div
                                    key={v.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="favorites-card"
                                    onClick={() => router.push(`/vendor/${v.id}`)}
                                >
                                    <div className="favorites-card-image">
                                        <img
                                            src={resolveVendorImage(v.image)}
                                            alt={v.name}
                                        />
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleFavorite(v.id);
                                            }}
                                            className="favorites-heart-btn"
                                            aria-label="הסר ממועדפים"
                                        >
                                            <i className="fas fa-heart"></i>
                                        </button>
                                    </div>
                                    <div className="favorites-card-info">
                                        <h3>{v.name}</h3>
                                        <div className="favorites-card-meta">
                                            <span className="price">₪{v.price}</span>
                                            <span className="loc"><i className="fas fa-map-marker-alt"></i> {v.location || 'כל הארץ'}</span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </AnimatePresence>
            </div>

            <style jsx>{`
                .favorites-page {
                    min-height: 100vh;
                    background: #fdfcf9;
                    padding-top: 100px;
                    padding-bottom: 24px;
                }
                .favorites-container { max-width: 1000px; }
                .favorites-header {
                    text-align: center;
                    margin-bottom: 40px;
                }
                .favorites-header h1 {
                    font-size: 2.5rem;
                    font-weight: 900;
                    font-family: var(--font-display);
                    margin-bottom: 8px;
                }
                .favorites-header p { color: #666; }
                .favorites-empty {
                    text-align: center;
                    padding: 60px 20px;
                    background: white;
                    border-radius: 30px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.05);
                }
                .favorites-empty-icon { font-size: 4rem; margin-bottom: 20px; }
                .favorites-empty h2 {
                    font-size: 1.5rem;
                    font-weight: 800;
                    margin-bottom: 15px;
                }
                .favorites-empty p {
                    color: #888;
                    margin-bottom: 30px;
                }
                .favorites-cta {
                    padding: 15px 40px;
                    border-radius: 50px;
                    min-height: 48px;
                }
                .favorites-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                    gap: 20px;
                }
                .favorites-card {
                    background: white;
                    border-radius: 20px;
                    overflow: hidden;
                    box-shadow: 0 8px 25px rgba(0,0,0,0.05);
                    cursor: pointer;
                }
                .favorites-card-image {
                    height: 200px;
                    position: relative;
                }
                .favorites-card-image img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    display: block;
                }
                .favorites-heart-btn {
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    background: white;
                    border: none;
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #e74c3c;
                    cursor: pointer;
                    box-shadow: 0 4px 10px rgba(0,0,0,0.1);
                }
                .favorites-card-info { padding: 20px; }
                .favorites-card-info h3 {
                    font-size: 1.2rem;
                    font-weight: 800;
                    margin-bottom: 8px;
                }
                .favorites-card-meta {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 8px;
                }
                .favorites-card-meta .price {
                    color: var(--primary-color);
                    font-weight: 800;
                }
                .favorites-card-meta .loc {
                    color: #888;
                    font-size: 0.85rem;
                }

                @media (max-width: 768px) {
                    .favorites-page {
                        padding-top: 88px;
                    }
                    .favorites-header {
                        margin-bottom: 24px;
                    }
                    .favorites-header h1 {
                        font-size: 1.75rem !important;
                    }
                    .favorites-grid {
                        grid-template-columns: 1fr;
                        gap: 14px;
                    }
                    .favorites-card-image { height: 180px; }
                    .favorites-empty {
                        padding: 40px 16px;
                        border-radius: 20px;
                    }
                    .favorites-empty-icon { font-size: 3rem; }
                    .favorites-empty h2 { font-size: 1.25rem !important; }
                    .favorites-cta { width: 100%; max-width: 280px; }
                }
            `}</style>
        </div>
    );
}
