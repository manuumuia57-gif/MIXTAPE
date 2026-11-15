export function BrandLogo({ className = 'h-8 w-8' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="fcBrandGrad" x1="2" y1="2" x2="34" y2="34" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#3867F4" />
          <stop offset="100%" stopColor="#7856FF" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="32" height="32" rx="9" fill="url(#fcBrandGrad)" />
      {/* Focus reticle arc */}
      <circle cx="18" cy="19" r="9.5" stroke="white" strokeOpacity="0.32" strokeWidth="1.5" strokeDasharray="4 3" />
      {/* Graduation cap mortarboard */}
      <path
        d="M18 9.5L27.5 14L18 18.5L8.5 14L18 9.5Z"
        fill="white"
      />
      <path
        d="M12.5 16.5V21.2C12.5 22.9 14.95 24.5 18 24.5C21.05 24.5 23.5 22.9 23.5 21.2V16.5L18 19.2L12.5 16.5Z"
        fill="white"
        fillOpacity="0.9"
      />
      {/* Tassel */}
      <path
        d="M25.5 15V21.5"
        stroke="white"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <circle cx="25.5" cy="22.5" r="1.3" fill="#22C55E" />
    </svg>
  );
}
