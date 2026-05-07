import { Assistant, Playfair_Display } from 'next/font/google';
import './globals.css';
import Providers from './providers';
import Navbar from '@/components/Navbar';
import WhatsAppButton from '@/components/WhatsAppButton';

const assistant = Assistant({
    subsets: ['latin'],
    weight: ['400', '500', '600', '700'],
    variable: '--font-assistant',
});

const playfair = Playfair_Display({
    subsets: ['latin'],
    weight: ['400', '700'],
    variable: '--font-playfair',
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
                <link
                    href="https://fonts.googleapis.com/css2?family=Assistant:wght@400;500;600;700&family=Playfair+Display:wght@400;700&display=swap"
                    rel="stylesheet"
                />
            </head>
            <body className={`${assistant.variable} ${playfair.variable}`} suppressHydrationWarning>
                <Providers>
                    <div className="app">
                        <Navbar />
                        <main>
                            {children}
                        </main>
                        <footer className="footer">
                            <div className="container">
                                <div className="footer-bottom">
                                    <p style={{ marginBottom: '10px', fontSize: '1.1rem', fontWeight: 'bold', color: '#D4AF37' }}>השירות ב-Fiesta ניתן בחינם לגמרי לטובת הקהילה! ❤️</p>
                                    <p>&copy; 2025 Fiesta Events. כל הזכויות שמורות.</p>
                                </div>
                            </div>
                        </footer>
                        <WhatsAppButton />
                    </div>
                </Providers>
            </body>
        </html>
    );
}
