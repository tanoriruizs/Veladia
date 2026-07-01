import type { ReactNode } from 'react';
import type { SignalCategory } from '../engine/types';

const ICONS: Record<SignalCategory, ReactNode> = {
  url: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3c2.5 2.5 2.5 15 0 18M12 3c-2.5 2.5-2.5 15 0 18" />
    </>
  ),
  content: (
    <>
      <rect x="5" y="4" width="14" height="16" rx="2" />
      <path d="M9 9h6M9 13h6M9 17h4" />
    </>
  ),
  reputation: <path d="M12 3.5 5.5 6v4.2c0 3.7 2.6 6.6 6.5 7.8 3.9-1.2 6.5-4.1 6.5-7.8V6L12 3.5Z" />,
};

export function SignalIcon({ category }: { category: SignalCategory }) {
  return (
    <svg className="sig-icon" viewBox="0 0 24 24" width="15" height="15" fill="none"
      stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {ICONS[category]}
    </svg>
  );
}
