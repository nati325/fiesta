'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/** Keep /favorites as alias — redirect to personal profile cart. */
export default function FavoritesRedirectPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/profile');
  }, [router]);

  return (
    <div style={{ padding: '120px 20px', textAlign: 'center', color: '#777' }}>
      מעבירים לאזור האישי...
    </div>
  );
}
