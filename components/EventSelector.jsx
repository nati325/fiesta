'use client';

import { useActiveEvent } from '@/hooks/useActiveEvent';

export default function EventSelector({ showLinks = true }) {
    const { eventId, setEventId, activeCustomer, customersWithEvents, rsvpPublicUrl, summaryPublicUrl } = useActiveEvent();

    if (customersWithEvents.length === 0) {
        return (
            <div className="event-selector empty">
                <p>אין לקוחות עם קוד אירוע. הוסיפו לקוח ב-CRM כדי לנהל RSVP.</p>
            </div>
        );
    }

    return (
        <div className="event-selector">
            <div className="event-selector-row">
                <label htmlFor="event-select">אירוע פעיל:</label>
                <select
                    id="event-select"
                    value={eventId}
                    onChange={(e) => setEventId(e.target.value)}
                >
                    {customersWithEvents.map(c => (
                        <option key={c.eventId} value={c.eventId}>
                            {c.name}{c.eventDate ? ` — ${new Date(c.eventDate).toLocaleDateString('he-IL')}` : ''}
                        </option>
                    ))}
                </select>
            </div>
            {activeCustomer && (
                <div className="event-selector-meta">
                    <span><i className="fas fa-hashtag"></i> {activeCustomer.eventId}</span>
                    {showLinks && rsvpPublicUrl && (
                        <>
                            <a href={rsvpPublicUrl} target="_blank" rel="noopener noreferrer">
                                <i className="fas fa-external-link-alt"></i> קישור RSVP ללקוח
                            </a>
                            <a href={summaryPublicUrl} target="_blank" rel="noopener noreferrer">
                                <i className="fas fa-list"></i> סיכום לאולם
                            </a>
                        </>
                    )}
                </div>
            )}
            <style jsx>{`
                .event-selector {
                    background: #f0f7ff;
                    border: 1px solid #4a90e2;
                    border-radius: 14px;
                    padding: 16px 20px;
                    margin-bottom: 24px;
                }
                .event-selector.empty {
                    background: #fef9e7;
                    border-color: #D4AF37;
                }
                .event-selector.empty p {
                    margin: 0;
                    color: #856404;
                    font-weight: 600;
                }
                .event-selector-row {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    flex-wrap: wrap;
                }
                .event-selector-row label {
                    font-weight: 700;
                    color: #1e293b;
                    white-space: nowrap;
                }
                .event-selector-row select {
                    flex: 1;
                    min-width: 200px;
                    padding: 10px 14px;
                    border-radius: 10px;
                    border: 1.5px solid #cbd5e1;
                    font-family: inherit;
                    font-weight: 600;
                }
                .event-selector-meta {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 16px;
                    margin-top: 12px;
                    font-size: 0.85rem;
                }
                .event-selector-meta span {
                    color: #64748b;
                    font-weight: 600;
                }
                .event-selector-meta a {
                    color: #4a90e2;
                    font-weight: 700;
                    text-decoration: none;
                }
                .event-selector-meta a:hover {
                    text-decoration: underline;
                }
            `}</style>
        </div>
    );
}
