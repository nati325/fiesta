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

  const content = article.content
    ? article.content
    : article.excerpt
      ? `<p>${article.excerpt}</p>`
      : '';

  return (
    <div style={{ background: '#fdfdfd', minHeight: '100vh', paddingBottom: '80px' }}>
      <div style={{ height: '90px', background: 'white', borderBottom: '1px solid #f0f0f0' }}></div>
      
      <main className="container" style={{ maxWidth: '850px', margin: '40px auto', padding: '0 20px' }}>
        <Link href="/#articles" className="back-link" style={{ display: 'inline-block', marginBottom: '25px', color: '#666', textDecoration: 'none', fontWeight: 600, transition: 'color 0.2s' }}>
          <i className="fas fa-arrow-right" style={{ marginLeft: '8px' }}></i>
          חזרה למאמרים
        </Link>
        
        <article style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', border: '1px solid #f0eee8' }}>
          <div style={{ position: 'relative', width: '100%', height: 'min(400px, 45vw)', minHeight: 180 }}>
            <img 
              src={article.image} 
              alt={article.title} 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            />
          </div>
          
          <div style={{ padding: 'clamp(24px, 5vw, 50px) clamp(16px, 6%, 8%)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', borderBottom: '1px solid #eaeaea', paddingBottom: '20px', flexWrap: 'wrap', gap: 12 }}>
              <span style={{ color: 'var(--primary-color, #8F7344)', fontWeight: 600, fontSize: '1rem' }}>
                <i className="far fa-calendar-alt" style={{ marginLeft: '8px' }}></i>
                {(() => {
                    const d = new Date(article.date);
                    if (Number.isNaN(d.getTime())) return '';
                    return `${d.getDate().toString().padStart(2, '0')}.${(d.getMonth() + 1).toString().padStart(2, '0')}.${d.getFullYear()}`;
                })()}
              </span>
              <span style={{ color: '#666', fontSize: '0.95rem', fontWeight: 500 }}>
                <i className="far fa-user-circle" style={{ marginLeft: '8px' }}></i>
                מאת: {article.author || 'צוות Fiesta'}
              </span>
            </div>
            
            <h1 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', color: '#1a1a1a', fontWeight: 600, marginBottom: '25px', lineHeight: 1.25, fontFamily: 'var(--font-display), var(--font-main)' }}>
              {article.title}
            </h1>
            
            {content ? (
              <div 
                style={{ fontSize: '1.1rem', color: '#444', lineHeight: 1.9 }}
                className="article-body"
                dangerouslySetInnerHTML={{ __html: content }} 
              />
            ) : (
              <p style={{ color: '#666', fontSize: '1.05rem', lineHeight: 1.7 }}>
                תוכן המאמר יועלה בקרוב.
              </p>
            )}
            
            <div style={{ marginTop: '48px', padding: '28px 22px', background: '#faf9f7', border: '1px solid #ebe7e0', borderRadius: '12px', textAlign: 'center' }}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '12px', color: '#1a1a1a', fontWeight: 600 }}>מוכנים לתכנן את האירוע?</h3>
              <p style={{ marginBottom: '20px', color: '#666', fontSize: '1rem' }}>דברו איתנו בוואטסאפ ונחבר אתכם לספקים הנכונים.</p>
              <a 
                href="https://wa.me/972535378985" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ background: '#25D366', color: 'white', padding: '12px 28px', borderRadius: '8px', textDecoration: 'none', fontWeight: 600, fontSize: '1rem', display: 'inline-flex', alignItems: 'center', gap: '10px' }}
              >
                <i className="fab fa-whatsapp" style={{ fontSize: '1.2rem' }}></i> שלחו הודעה לייעוץ
              </a>
            </div>
          </div>
        </article>
      </main>
      
      <style dangerouslySetInnerHTML={{__html: `
        .back-link:hover { color: #1a1a1a !important; }
        .article-body h2 { font-size: 1.4rem; margin: 32px 0 16px; color: #1a1a1a; font-weight: 600; }
        .article-body p { margin-bottom: 16px; }
        .article-body blockquote {
          border-right: 4px solid #8F7344;
          margin: 28px 0;
          font-size: 1.15rem;
          color: #1a1a1a;
          background: #fcfcfc;
          padding: 18px 20px;
          border-radius: 8px 0 0 8px;
        }
      `}} />
    </div>
  );
}
