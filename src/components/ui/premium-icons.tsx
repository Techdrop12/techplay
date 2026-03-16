type IconProps = {
  className?: string;
  size?: number;
};

type BaseIconProps = IconProps & {
  children: React.ReactNode;
  viewBox?: string;
};

function BaseIcon({ className, size = 20, children, viewBox = '0 0 24 24' }: BaseIconProps) {
  return (
    <svg
      viewBox={viewBox}
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

function DuoPath({ d }: { d: string }) {
  return (
    <>
      <path d={d} fill="currentColor" className="opacity-95" />
      <path d={d} fill="currentColor" className="opacity-20" transform="translate(.35 .35)" />
    </>
  );
}

export function SearchIcon({ className, size = 18 }: IconProps) {
  return (
    <BaseIcon className={className} size={size}>
      <DuoPath d="M15.5 14h-.8l-.3-.3a6.5 6.5 0 1 0-.7.7l.3.3v.8l5 5 1.5-1.5-5-5ZM10 15a5 5 0 1 1 0-10 5 5 0 0 1 0 10Z" />
    </BaseIcon>
  );
}

export function FlameIcon({ className, size = 18 }: IconProps) {
  return (
    <BaseIcon className={className} size={size}>
      <DuoPath d="M12 2s5 4 5 9a5 5 0 1 1-10 0c0-2 1-4 3-6-1 3 2 4 2 6 0 1.7-1 3-2.5 3.5A4.5 4.5 0 0 0 16.5 9C16.5 5.5 12 2 12 2Z" />
    </BaseIcon>
  );
}

export function HeartIcon({ className, size = 22 }: IconProps) {
  return (
    <BaseIcon className={className} size={size}>
      <DuoPath d="M12 21s-7-4.6-9.3-8.3C1.3 9.9 3 6 6.9 6c2.2 0 3.4 1.2 4.1 2 0.7-0.8 1.9-2 4.1-2C19 6 20.7 9.9 21.3 12.7 19 16.4 12 21 12 21z" />
    </BaseIcon>
  );
}

export function CartIcon({ className, size = 22 }: IconProps) {
  return (
    <BaseIcon className={className} size={size}>
      <DuoPath d="M7 18a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm10 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4ZM6 5h14l-1.5 8.5a2 2 0 0 1-2 1.6H9a2 2 0 0 1-2-1.6L5.3 3H2V1h4a2 2 0 0 1 2 1.7L8.3 5Z" />
    </BaseIcon>
  );
}

export function UserIcon({ className, size = 20 }: IconProps) {
  return (
    <BaseIcon className={className} size={size}>
      <DuoPath d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-4.4 0-8 2.2-8 5v2h16v-2c0-2.8-3.6-5-8-5Z" />
    </BaseIcon>
  );
}
