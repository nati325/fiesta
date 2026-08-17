import { Heebo, Frank_Ruhl_Libre } from 'next/font/google';
import './globals.css';
import Providers from './providers';
import Navbar from '@/components/Navbar';
import MobileNav from '@/components/MobileNav';
import WhatsAppButton from '@/components/WhatsAppButton';
import TrafficTracker from '@/components/TrafficTracker';
import SiteEditBar from '@/components/SiteEditBar';
import Link from 'next/link';
import BrandMark from '@/components/BrandMark';

const heebo = Heebo({
    subsets: ['hebrew', 'latin'],
    weight: ['400', '500', '600', '700'],
    variable: '--font-heebo',
    display: 'swap',
});

const frank = Frank_Ruhl_Libre({
    subsets: ['hebrew', 'latin'],
    weight: ['400', '500', '700'],
    variable: '--font-frank',
    display: 'swap',
});

export const metadata = {
    title: 'Fiesta - הפקת אירועים בסטייל',
    description: 'Fiesta - הפלטפורמה המובילה למציאת ספקים לאירועים בישראל. DJ, צלמים, אולמות, קייטרינג ועוד.',
    keywords: 'אירועים, חתונות, ספקים, DJ, צלמים, אולמות, קייטרינג',
};

export default function RootLayout({ children }) {
    return (
        <html lang="he" dir="rtl">
            <head>
                <link
                    rel="stylesheet"
                    href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
                />
            </head>
            <body className={`${heebo.variable} ${frank.variable} ${heebo.className}`} suppressHydrationWarning>
                <Providers>
                    <TrafficTracker />
                    <SiteEditBar />
                    <div className="app">
                        <Navbar />
                        <main>
                            {children}
                        </main>
                        <footer className="footer">
                            <div className="container">
                                <div className="footer-bottom">
                                    <BrandMark as="p" variant="footer" className="footer-brand" />
                                    <p className="footer-free-msg">השירות ב־Fiesta ניתן בחינם לטובת הקהילה</p>
                                    <p>&copy; {new Date().getFullYear()} Fiesta Events. כל הזכויות שמורות.</p>
                                    <p className="footer-admin-link">
                                        <Link href="/login?next=/profile" title="התחברות">
                                            התחברות
                                        </Link>
                                    </p>
                                </div>
                            </div>
                        </footer>
                        <WhatsAppButton />
                        <MobileNav />
                    </div>
                </Providers>
            </body>
        </html>
    );
}
