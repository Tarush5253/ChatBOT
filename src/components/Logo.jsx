import React from "react";

export function Logo({ size = 32, className = "" }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="nova-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="1" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.85" />
        </linearGradient>
      </defs>
      <rect
        x="2"
        y="2"
        width="60"
        height="60"
        rx="16"
        fill="url(#nova-bg)"
      />
      {/* abstract "N" + spark */}
      <path
        d="M20 46 V18 L36 38 V18"
        stroke="var(--accent-contrast, #fff)"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <circle cx="46" cy="20" r="3.2" fill="var(--accent-contrast, #fff)" />
      <circle cx="46" cy="20" r="6.5" fill="none" stroke="var(--accent-contrast, #fff)" strokeWidth="1.4" opacity="0.6" />
    </svg>
  );
}

export function Wordmark({ className = "" }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <Logo size={28} className="text-ink" />
      <div className="leading-none">
        <div className="text-[15px] font-bold tracking-tight">Nova</div>
        <div className="text-[10px] uppercase tracking-[0.18em] text-ink-faint mt-0.5">
          AI Assistant
        </div>
      </div>
    </div>
  );
}
