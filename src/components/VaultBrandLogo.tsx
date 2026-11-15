interface VaultBrandLogoProps {
  siteName?: string;
  subtitle?: string;
  className?: string;
  compact?: boolean;
}

export function VaultBrandLogo({
  siteName = 'DeKUT Past Papers Library',
  subtitle,
  className = '',
  compact = false,
}: VaultBrandLogoProps) {
  return (
    <span className={`inline-flex items-center gap-2.5 whitespace-nowrap shrink-0 ${className}`}>
      <span className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-1.5 py-1 dark:border-slate-700 shrink-0">
        <img
          src="/dekut-crest.png"
          alt="Dedan Kimathi University of Technology Official Crest"
          width={248}
          height={136}
          className="h-8 w-auto object-contain sm:h-9"
        />
      </span>
      {!compact && (
        <span className="flex flex-col leading-tight">
          <span className="font-display text-sm font-bold tracking-tight text-[#14213D] dark:text-white sm:text-base">
            {siteName}
          </span>
          {subtitle && (
            <span className="text-[10px] font-medium tracking-wide text-slate-500 dark:text-slate-400">
              {subtitle}
            </span>
          )}
        </span>
      )}
    </span>
  );
}
