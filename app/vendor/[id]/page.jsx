'use client';

import { useParams, useRouter } from 'next/navigation';
import { useVendors } from '@/context/VendorContext';
import { motion } from 'framer-motion';

export default function VendorDetailPage() {
    const params = useParams();
    const id = params.id;
    const router = useRouter();
    const { vendors } = useVendors();

    const vendor = vendors.find(v => v.id.toString() === id);

    if (!vendor) {
        return (
            <div style={{ paddingTop: '100px', textAlign: 'center', minHeight: '80vh' }}>
                <h2>ספק לא נמצא</h2>
                <button onClick={() => router.push('/')} className="btn btn-primary" style={{ marginTop: '20px' }}>חזרה לדף הבית</button>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: '#f8f9fa', paddingTop: '80px', paddingBottom: '60px', position: 'relative' }}>
            <button
                onClick={() => router.back()}
                style={{
                    position: 'absolute',
                    top: '20px',
                    right: '20px',
                    zIndex: 10,
                    color: '#666',
                    background: 'rgba(255,255,255,0.8)',
                    width: '35px',
                    height: '35px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid #eee',
                    cursor: 'pointer',
                    transition: 'all 0.3s'
                }}
            >
                <i className="fas fa-arrow-right"></i>
            </button>

            <div className="container" style={{ maxWidth: '800px' }}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ background: 'white', borderRadius: '25px', padding: '30px', boxShadow: '0 15px 40px rgba(0,0,0,0.05)', textAlign: 'center' }}
                >
                    <div style={{ color: '#D4AF37', fontSize: '1rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>
                        {vendor.type}
                    </div>

                    <h1 style={{ fontSize: '2.5rem', fontFamily: 'Playfair Display, serif', color: '#1a1a1a', marginBottom: '15px', lineHeight: '1.2' }}>
                        {vendor.name}
                    </h1>

                    {(vendor.price || vendor.discount) && (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '25px' }}>
                            {vendor.price && (
                                <span style={{ textDecoration: 'line-through', textDecorationColor: '#e74c3c', color: '#999', fontSize: '1.4rem' }}>₪{vendor.price}</span>
                            )}
                            {vendor.discount && (
                                <span style={{ color: '#e74c3c', fontSize: '1.2rem', fontWeight: '800' }}>
                                    {vendor.discount}% הנחה לחברי Fiesta
                                </span>
                            )}
                        </div>
                    )}

                    <div style={{ background: '#fdfaf0', padding: '20px', borderRadius: '15px', marginBottom: '30px', textAlign: 'right' }}>
                        <h4 style={{ color: '#D4AF37', marginBottom: '10px', fontSize: '1.1rem' }}>קצת עלינו</h4>
                        <p style={{ fontSize: '1rem', color: '#555', lineHeight: '1.6', margin: 0 }}>
                            {vendor.description || 'ספק מובחר מבית Fiesta. הצטרפו אלינו לחוויית אירוע בלתי נשכחת.'}
                        </p>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', maxWidth: '400px', margin: '0 auto' }}>
                        <a
                            href={`https://wa.me/972535378985?text=${encodeURIComponent(`היי, אני מעוניין בפרטים על הספק: ${vendor.name}`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-primary"
                            style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px 15px', background: '#25D366', borderColor: '#25D366', borderRadius: '12px', fontSize: '0.9rem', fontWeight: '600' }}
                        >
                            <i className="fab fa-whatsapp" style={{ fontSize: '1.1rem' }}></i>
                            נציג לפרטים וסגירת ספק
                        </a>
                        <button
                            onClick={() => router.back()}
                            className="btn btn-secondary"
                            style={{ flex: 1, padding: '10px', borderRadius: '12px', fontSize: '0.9rem' }}
                        >
                            חזרה
                        </button>
                    </div>

                    <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'center', gap: '30px' }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ color: '#999', fontSize: '0.75rem' }}>זמינות</div>
                            <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>24/7</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ color: '#999', fontSize: '0.75rem' }}>ייעוץ</div>
                            <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>חינם לגמרי</div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
