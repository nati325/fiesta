const SRC = '/brand/fiesta-wordmark.png';

/**
 * Official fiesta gold-foil wordmark. Use only as a brand lockup
 * (hero, nav, footer, auth) — not inside running copy.
 */
export default function BrandMark({
  as: Tag = 'span',
  variant = 'nav',
  className = '',
  priority = false,
  ...rest
}) {
  const classes = ['brand-mark', `brand-mark--${variant}`];
  if (className) classes.push(className);

  return (
    <Tag className={classes.join(' ')} {...rest}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={SRC}
        alt="fiesta"
        width={1454}
        height={492}
        decoding="async"
        fetchPriority={priority ? 'high' : 'low'}
        draggable={false}
      />
    </Tag>
  );
}
