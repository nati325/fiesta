'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import BrandMark from '@/components/BrandMark';
import { JOURNEY_CATEGORIES } from '@/lib/eventJourney';

const EVENT_TYPES = [
  { id: 'חתונה', icon: 'fa-ring' },
  { id: 'בר מצווה', num: '13' },
  { id: 'בת מצווה', num: '12' },
  { id: 'ברית', icon: 'fa-baby' },
  { id: 'אירוע עסקי', icon: 'fa-briefcase' },
  { id: 'יום הולדת', icon: 'fa-cake-candles' },
];

export default function EventSetupPage() {
  const router = useRouter();
  const {
    eventPreference,
    setEventPreference,
    eventProfile,
    completeOnboarding,
    hasOnboarded,
  } = useAuth();

  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState({
    date: eventProfile.date || '',
    region: eventProfile.region || '',
    guests: eventProfile.guests || '',
    budget: eventProfile.budget || '',
    completedCategories: Array.isArray(eventProfile.completedCategories)
      ? eventProfile.completedCategories
      : [],
  });

  const toggleCompleted = (id) => {
    const current = Array.isArray(draft.completedCategories) ? draft.completedCategories : [];
    setDraft({
      ...draft,
      completedCategories: current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    });
  };

  const finish = () => {
    completeOnboarding(draft);
    router.push('/my-event');
  };

  return (
    <main className="setup-page">
      <div className="setup-shell">
        {hasOnboarded && step < 4 ? (
          <p className="setup-edit-note">
            כבר יש לכם אירוע מוגדר — כאן אפשר לעדכן פרטים בלי להתחיל מאפס.
          </p>
        ) : null}

        <div className="setup-progress" aria-label={`שלב ${Math.min(step, 3)} מתוך 3`}>
          {[1, 2, 3].map((item) => (
            <span key={item} className={item <= Math.min(step, 3) ? 'is-active' : ''} />
          ))}
        </div>

        {step === 1 && (
          <section>
            <div className="setup-brand">
              <BrandMark variant="auth" />
            </div>
            <p className="setup-kicker">ברוכים הבאים</p>
            <h1>בואו נכיר את האירוע שלכם</h1>
            <p className="setup-lead">
              Onboarding קצר וחד־פעמי — כדי שנמצא לכם בדיוק את הספקים המתאימים.
            </p>
            <h2 className="setup-q">איזה אירוע אתם מתכננים?</h2>
            <div className="option-grid event-options">
              {EVENT_TYPES.map((event) => (
                <button
                  type="button"
                  key={event.id}
                  className={eventPreference === event.id ? 'selected' : ''}
                  onClick={() => setEventPreference(event.id)}
                >
                  {event.num ? (
                    <span className="setup-event-num">{event.num}</span>
                  ) : (
                    <i className={`fas ${event.icon}`} />
                  )}
                  {event.id}
                </button>
              ))}
            </div>
            <button
              type="button"
              className="primary"
              disabled={!eventPreference}
              onClick={() => setStep(2)}
            >
              המשך
            </button>
          </section>
        )}

        {step === 2 && (
          <section>
            <p className="setup-kicker">שלב 2 מתוך 3</p>
            <h1>פרטי האירוע</h1>
            <p className="setup-lead">תאריך, מקום, מוזמנים ותקציב — רק מה שמשנה את ההמלצות.</p>
            <div className="field-grid">
              <label>
                מתי האירוע?
                <input
                  type="date"
                  value={draft.date || ''}
                  onChange={(e) => setDraft({ ...draft, date: e.target.value })}
                />
              </label>
              <label>
                איפה האירוע?
                <select
                  value={draft.region || ''}
                  onChange={(e) => setDraft({ ...draft, region: e.target.value })}
                >
                  <option value="">בחרו אזור</option>
                  <option>מרכז</option>
                  <option>תל אביב</option>
                  <option>ירושלים</option>
                  <option>צפון</option>
                  <option>דרום</option>
                  <option>שרון</option>
                </select>
              </label>
              <label>
                כמה מוזמנים?
                <input
                  type="number"
                  min="1"
                  inputMode="numeric"
                  placeholder="לדוגמה 250"
                  value={draft.guests || ''}
                  onChange={(e) => setDraft({ ...draft, guests: e.target.value })}
                />
              </label>
              <label>
                מה התקציב?
                <input
                  type="number"
                  min="1"
                  inputMode="numeric"
                  placeholder="לדוגמה 100000"
                  value={draft.budget || ''}
                  onChange={(e) => setDraft({ ...draft, budget: e.target.value })}
                />
              </label>
            </div>
            <div className="setup-actions">
              <button type="button" className="secondary" onClick={() => setStep(1)}>חזרה</button>
              <button type="button" className="primary" onClick={() => setStep(3)}>המשך</button>
            </div>
          </section>
        )}

        {step === 3 && (
          <section>
            <p className="setup-kicker">שלב 3 מתוך 3</p>
            <h1>מה כבר סגרתם?</h1>
            <p className="setup-lead">נסמן מה כבר מאחוריכם — ונציע רק את מה שעוד חסר.</p>
            <div className="option-grid category-options">
              {JOURNEY_CATEGORIES.map((category) => {
                const selected = (draft.completedCategories || []).includes(category.id);
                return (
                  <button
                    type="button"
                    key={category.id}
                    className={selected ? 'selected' : ''}
                    onClick={() => toggleCompleted(category.id)}
                  >
                    <i className={`fas ${selected ? 'fa-check' : category.icon}`} />
                    {category.label}
                  </button>
                );
              })}
            </div>
            <div className="setup-actions">
              <button type="button" className="secondary" onClick={() => setStep(2)}>חזרה</button>
              <button type="button" className="primary" onClick={() => setStep(4)}>סיום</button>
            </div>
          </section>
        )}

        {step === 4 && (
          <section className="setup-done">
            <p className="setup-kicker">מוכנים</p>
            <h1>מעולה! עכשיו אנחנו יודעים בדיוק מה אתם צריכים.</h1>
            <p className="setup-lead">
              בנינו לכם מסלול אישי. בפעם הבאה שנכנסים — ממשיכים מאיפה שעצרתם, בלי לחזור על השאלות.
            </p>
            <button type="button" className="primary" onClick={finish}>
              פתחו את האירוע שלי
            </button>
          </section>
        )}
      </div>

      <style jsx>{`
        .setup-page { min-height: 100vh; background: var(--off-white); padding: 100px 20px 60px; }
        .setup-shell { max-width: 680px; margin: 0 auto; background: #fff; border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: clamp(24px, 5vw, 48px); text-align: right; }
        .setup-edit-note { margin: 0 0 18px; padding: 10px 12px; border-radius: 8px; background: var(--off-white); color: var(--text-light); font-size: .88rem; }
        .setup-progress { display: flex; gap: 8px; margin-bottom: 32px; }
        .setup-progress span { height: 4px; flex: 1; background: #e5e2dc; border-radius: 99px; }
        .setup-progress .is-active { background: var(--primary-color); }
        .setup-brand { display: flex; justify-content: center; margin: 0 0 18px; }
        .setup-kicker { color: var(--primary-color); font-weight: 700; font-size: .82rem; margin: 0 0 8px; }
        h1 { margin: 0 0 10px; font-size: clamp(1.7rem, 4vw, 2.3rem); }
        .setup-q { margin: 0 0 14px; font-family: var(--font-main); font-size: 1.05rem; font-weight: 600; }
        .setup-lead { color: var(--text-light); margin: 0 0 26px; }
        .option-grid { display: grid; gap: 10px; }
        .event-options, .category-options { grid-template-columns: repeat(2, 1fr); }
        .option-grid button { min-height: 58px; padding: 12px; border: 1px solid #e5e2dc; background: #fff; border-radius: var(--radius-sm); font: inherit; color: var(--text-dark); text-align: right; cursor: pointer; display: flex; align-items: center; gap: 10px; font-weight: 600; }
        .option-grid button i { color: var(--primary-color); width: 18px; text-align: center; }
        .setup-event-num {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 18px;
          font-family: var(--font-display);
          font-size: 0.95rem;
          font-weight: 700;
          line-height: 1;
          color: var(--primary-color);
        }
        .option-grid button.selected { border-color: var(--primary-color); background: rgba(143,115,68,.08); }
        .field-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; }
        label { display: grid; gap: 7px; font-size: .88rem; font-weight: 600; color: var(--text-dark); }
        input, select { min-height: 46px; border: 1px solid #e5e2dc; border-radius: var(--radius-sm); padding: 10px 12px; background: #fff; font: inherit; text-align: right; }
        .primary, .secondary { min-height: 46px; padding: 12px 18px; font: inherit; font-weight: 700; border-radius: var(--radius-sm); cursor: pointer; }
        .primary { background: var(--charcoal); border: 1px solid var(--charcoal); color: #fff; margin-top: 26px; }
        .primary:disabled { opacity: .45; cursor: not-allowed; }
        .secondary { background: #fff; border: 1px solid #e5e2dc; color: var(--text-dark); }
        .setup-actions { display: flex; justify-content: space-between; align-items: end; gap: 12px; }
        .setup-actions .primary { margin-top: 26px; }
        .setup-done .primary { width: 100%; }
        @media (max-width: 600px) {
          .setup-page { padding: 82px 16px calc(var(--mobile-chrome-clearance, 40px) + 24px); }
          .event-options, .category-options, .field-grid { grid-template-columns: 1fr; }
          .setup-actions { align-items: center; }
        }
      `}</style>
    </main>
  );
}
