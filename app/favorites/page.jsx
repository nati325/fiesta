'use client';

import { useVendors } from '@/context/VendorContext';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { resolveVendorImage } from '@/lib/vendorImage';

export default function FavoritesPage() {
    const { vendors, favorites, toggleFavorite, isFavorite } = useVendors();
    const router = useRouter();

    const favoriteVendors = vendors.filter(v => favorites.includes(v.id));

    return (
        <div style={{ minHeight: '100vh', background: '#fdfcf9', paddingBottom: '100px', paddingTop: '100px' }}>
            <div className="container" style={{ maxWidth: '1000px' }}>
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 900, fontFamily: 'var(--font-display)' }}>המועדפים שלי</h1>
                    <p style={{ color: '#666' }}>כל הספקים שאהבתם במקום אחד</p>
                </div>

                <AnimatePresence>
                    {favoriteVendors.length === 0 ? (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            style={{ textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: '30px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}
                        >
                            <div style={{ fontSize: '4rem', marginBottom: '20px' }}>❤️</div>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '15px' }}>עדיין לא בחרתם מועדפים...</h2>
                            <p style={{ color: '#888', marginBottom: '30px' }}>זה הזמן לעבור על הספקים ולסמן את אלו שאהבתם</p>
                            <button 
                                onClick={() => router.push('/')}
                                className="btn btn-primary"
                                style={{ padding: '15px 40px', borderRadius: '50px' }}
                            >
                                התחילו לחפש
                            </button>
                        </motion.div>
                    ) : (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                            gap: '20px'
                        }}>
                            {favoriteVendors.map((v, i) => (
                                <motion.div
                                    key={v.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    style={{
                                        background: 'white',
                                        borderRadius: '20px',
                                        overflow: 'hidden',
                                        boxShadow: '0 8px 25px rgba(0,0,0,0.05)',
                                        cursor: 'pointer'
                                    }}
                                    onClick={() => router.push(`/vendor/${v.id}`)}
                                >
                                    <div style={{ height: '200px', position: 'relative' }}>
                                        <img 
                                            src={resolveVendorImage(v.image)} 
                                            alt={v.name} 
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                        />
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleFavorite(v.id);
                                            }}
                                            style={{
                                                position: 'absolute', top: '10px', right: '10px',
                                                background: 'white', border: 'none', width: '32px', height: '32px',
                                                borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                color: '#e74c3c', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                                            }}
                                        >
                                            <i className="fas fa-heart"></i>
                                        </button>
                                    </div>
                                    <div style={{ padding: '20px' }}>
                                        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '5px' }}>{v.name}</h3>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ color: 'var(--primary-color)', fontWeight: 800 }}>₪{v.price}</span>
                                            <span style={{ color: '#888', fontSize: '0.85rem' }}><i className="fas fa-map-marker-alt"></i> {v.location || 'כל הארץ'}</span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
