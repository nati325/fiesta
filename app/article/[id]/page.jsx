import { notFound } from 'next/navigation';
import Link from 'next/link';
import articlesData from '@/data/articles.json';

export function generateStaticParams() {
  return articlesData.map((article) => ({
    id: article.id.toString(),
  }));
}

export default function ArticlePage({ params }) {
  const article = articlesData.find(a => a.id.toString() === params.id);

  if (!article) {
    notFound();
  }

  // Generate realistic boutique content since it's not present in the JSON yet
  const content = article.content || `
    <p>ברוכים הבאים למאמר המלא על <strong>${article.title}</strong>.</p>
    <p>בחירת ספקים, אולמות וניהול תקציב הם החלקים המורכבים ביותר בהפקת אירוע. במדריך זה אנחנו נצלול עמוק לתוך כל מה שאתם צריכים לדעת כדי לקבל את ההחלטות הנכונות בלי לחרוג מהתקציב.</p>
    
    <h2>למה התכנון המוקדם הוא כל כך קריטי?</h2>
    <p>מחקר מקדים וארגון נכון לא רק יחסכו לכם אלפי שקלים, אלא יבטיחו לכם אירוע רגוע ונטול הפתעות ביום עצמו. רוב הזוגות מתחילים להתפזר כשהם נתקלים בים של אפשרויות. סגירת חבילה מרוכזת דרך פלטפורמות כמו פייסטה פותרת בדיוק את הכאב הזה.</p>
    
    <blockquote>"חתונה מושלמת היא חתונה מתוכננת היטב - מהאולם ועד לאחרון הספקים."</blockquote>
    
    <h2>איך מתקדמים מכאן?</h2>
    <p>אל תשאירו את הדברים לרגע האחרון. מומלץ לקבוע פגישת ייעוץ איתנו כדי להבין בדיוק מה הצרכים שלכם, לבנות חבילה מותאמת אישית שכוללת את כל השירותים, ולקבל את כל הערבויות לאירוע בלתי נשכח.</p>
    
    <p>נשמח לעמוד לשירותכם בכל שאלה, צוות Fiesta.</p>
  `;

  return (
    <div style={{ background: '#fdfdfd', minHeight: '100vh', paddingBottom: '80px' }}>
      {/* Header Spacer - Allows navbar to clear */}
      <div style={{ height: '90px', background: 'white', borderBottom: '1px solid #f0f0f0' }}></div>
      
      <main className="container" style={{ maxWidth: '850px', margin: '40px auto', padding: '0 20px' }}>
        <Link href="/#articles" className="back-link" style={{ display: 'inline-block', marginBottom: '25px', color: '#666', textDecoration: 'none', fontWeight: 600, transition: 'color 0.2s' }}>
          <i className="fas fa-arrow-right" style={{ marginLeft: '8px' }}></i>
          חזרה למאמרים
        </Link>
        
        <article style={{ background: 'white', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.04)', border: '1px solid #f5f5f5' }}>
          <div style={{ position: 'relative', width: '100%', height: '400px' }}>
            <img 
              src={article.image} 
              alt={article.title} 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            />
          </div>
          
          <div style={{ padding: '50px 8%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', borderBottom: '1px solid #eaeaea', paddingBottom: '20px' }}>
              <span style={{ color: '#D4AF37', fontWeight: 700, fontSize: '1.1rem' }}>
                <i className="far fa-calendar-alt" style={{ marginLeft: '8px' }}></i>
                {(() => {
                    const d = new Date(article.date);
                    return `${d.getDate().toString().padStart(2, '0')}.${(d.getMonth() + 1).toString().padStart(2, '0')}.${d.getFullYear()}`;
                })()}
              </span>
              <span style={{ color: '#666', fontSize: '1rem', fontWeight: 500 }}>
                <i className="far fa-user-circle" style={{ marginLeft: '8px' }}></i>
                מאת: {article.author || 'צוות Fiesta'}
              </span>
            </div>
            
            <h1 style={{ fontSize: '2.8rem', color: '#1a1a1a', fontWeight: 900, marginBottom: '25px', lineHeight: 1.2, fontFamily: 'var(--font-main)' }}>
              {article.title}
            </h1>
            
            <div 
              style={{ fontSize: '1.15rem', color: '#444', lineHeight: 1.9 }}
              className="article-body"
              dangerouslySetInnerHTML={{ __html: content }} 
            />
            
            {/* Call to Action Box */}
            <div style={{ marginTop: '60px', padding: '40px 30px', background: '#fafafa', border: '1px solid #eaeaea', borderRadius: '16px', textAlign: 'center' }}>
              <h3 style={{ fontSize: '1.6rem', marginBottom: '15px', color: '#1a1a1a', fontWeight: 800 }}>מוכנים להרים אירוע בלתי נשכח?</h3>
              <p style={{ marginBottom: '25px', color: '#666', fontSize: '1.1rem' }}>צרו איתנו קשר עכשיו וקבלו הצעות פרימיום לכל הספקים שלכם במקום אחד.</p>
              <a 
                href="https://wa.me/972535378985" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ background: '#25D366', color: 'white', padding: '14px 35px', borderRadius: '50px', textDecoration: 'none', fontWeight: 700, fontSize: '1.15rem', display: 'inline-flex', alignItems: 'center', gap: '10px', boxShadow: '0 10px 20px rgba(37,211,102,0.3)', transition: 'transform 0.2s' }}
              >
                <i className="fab fa-whatsapp" style={{ fontSize: '1.3rem' }}></i> שלחו הודעה לייעוץ
              </a>
            </div>
          </div>
        </article>
      </main>
      
      <style dangerouslySetInnerHTML={{__html: `
        .back-link:hover {
          color: #1a1a1a !important;
        }
        .article-body h2 {
          font-size: 1.8rem;
          margin: 40px 0 20px;
          color: #1a1a1a;
          font-weight: 800;
        }
        .article-body p {
          margin-bottom: 20px;
        }
        .article-body blockquote {
          border-right: 5px solid #D4AF37;
          padding-right: 25px;
          margin: 40px 0;
          font-size: 1.4rem;
          font-style: italic;
          color: #1a1a1a;
          background: #fcfcfc;
          padding: 25px;
          border-radius: 12px 0 0 12px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.02);
        }
        @media (max-width: 768px) {
          .article-body h2 { font-size: 1.5rem; }
          .article-body blockquote { font-size: 1.2rem; }
        }
      `}} />
    </div>
  );
}
