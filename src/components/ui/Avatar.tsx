'use client';

interface AvatarProps {
  src?: string | null;
  alt?: string;
  size?: number;
}

export default function Avatar({ src, alt, size = 40 }: AvatarProps) {
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
