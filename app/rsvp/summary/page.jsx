'use client';

import { Suspense } from 'react';
import HallSummaryContent from './HallSummaryContent';

export default function HallSummaryPage() {
    return (
        <Suspense fallback={<div style={{ padding: '120px', textAlign: 'center' }}>טוען סיכום...</div>}>
            <HallSummaryContent />
        </Suspense>
    );
}
