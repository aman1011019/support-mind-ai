import React from 'react';

interface ProductLogoProps {
  className?: string;
  markClassName?: string;
  wordmarkClassName?: string;
  showWordmark?: boolean;
  variant?: 'light' | 'dark';
}

export default function ProductLogo({
  className = '',
  markClassName = 'w-9 h-9',
  wordmarkClassName = 'text-xl',
  showWordmark = true,
  variant = 'light',
}: ProductLogoProps) {
  const textColor = variant === 'dark' ? 'text-white' : 'text-[#111827] dark:text-slate-100';

  return (
    <div className={`flex items-center gap-2.5 ${className}`} aria-label="SupportMind">
      <svg
        className={markClassName}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-hidden="true"
      >
        <rect width="64" height="64" rx="16" fill="#111827" />
        <path
          d="M19 24C19 18.4772 23.4772 14 29 14H46C48.2091 14 50 15.7909 50 18C50 20.2091 48.2091 22 46 22H29C27.8954 22 27 22.8954 27 24C27 25.1046 27.8954 26 29 26H37C42.5228 26 47 30.4772 47 36C47 41.5228 42.5228 46 37 46H22L14 53V36C14 30.4772 18.4772 26 24 26H29C23.4772 26 19 29.5228 19 24Z"
          fill="white"
        />
        <path
          d="M26 38H37C39.2091 38 41 36.2091 41 34C41 31.7909 39.2091 30 37 30H30"
          stroke="#4F46E5"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <circle cx="24" cy="24" r="3" fill="#14B8A6" />
        <circle cx="45" cy="19" r="3" fill="#8B5CF6" />
        <circle cx="43" cy="42" r="3" fill="#F59E0B" />
      </svg>
      {showWordmark && (
        <span className={`font-bold tracking-normal ${wordmarkClassName} ${textColor}`}>
          SupportMind
        </span>
      )}
    </div>
  );
}
