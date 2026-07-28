'use client';

import { useState } from 'react';
import VendorNoImage from '@/components/VendorNoImage';

/** Shows real vendor image, or "אין תמונה" placeholder — never stock defaults. */
export default function VendorCardImage({ src, alt, compact = true }) {
  const [failed, setFailed] = useState(false);
  const showImg = !!(src && src.trim()) && !failed;

  if (!showImg) {
    return <VendorNoImage compact={compact} />;
  }

  return (
    <img
      src={src}
      alt={alt || ''}
      onError={() => setFailed(true)}
      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
    />
  );
}
