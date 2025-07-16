'use client';

export default function Avatar({ src, alt, size = 40 }) {
  return (
    <img
      src={src || '/default-avatar.png'}
      alt={alt || 'Avatar'}
      width={size}
      height={size}
      className="rounded-full object-cover"
      loading="lazy"
    />
  );
}
