interface VaultBrandLogoProps {
  siteName?: string;
  className?: string;
  compact?: boolean;
}

export function VaultBrandLogo({
  siteName = 'Campus Past Papers Library',
  className = '',
  compact = false,
}: VaultBrandLogoProps) {
  return (
    <span className={`inline-flex items-center gap-2.5 whitespace-nowrap shrink-0 ${className}`}>
      <svg
        width="28"
        height="28"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="shrink-0"
      >
        <path
          d="M16 2.5L4.5 7.2V15.4C4.5 22.3 9.4 28.4 16 30C22.6 28.4 27.5 22.3 27.5 15.4V7.2L16 2.5Z"
          fill="#14213D"
          stroke="#2563EB"
          strokeWidth="1.6"
        />
        <path
          d="M10.5 11.2H21.5V20.8H10.5V11.2Z"
          stroke="#FFFFFF"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
        <path d="M16 11.2V20.8" stroke="#93C5FD" strokeWidth="1.4" />
        <path
          d="M12.5 14.2H14.5M17.5 14.2H19.5M12.5 17.2H14.5M17.5 17.2H19.5"
          stroke="#FFFFFF"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      </svg>
      {!compact && (
        <span className="font-display text-base font-bold tracking-tight text-[#14213D] dark:text-white sm:text-lg">
          {siteName}
        </span>
      )}
    </span>
  );
}
