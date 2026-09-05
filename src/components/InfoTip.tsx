import React, { useEffect, useRef, useState } from 'react';
import { HelpCircle } from 'lucide-react';

interface InfoTipProps {
  text: string;
  className?: string;
  align?: 'left' | 'right';
}

// A small "?" icon that reveals a plain-English explanation on hover (desktop)
// or tap (mobile) — used next to finance/business jargon across the app so
// students don't need to already know the term to use the feature.
export const InfoTip: React.FC<InfoTipProps> = ({ text, className = '', align = 'left' }) => {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [open]);

  return (
    <span ref={wrapperRef} className={`relative inline-flex ${className}`}>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setOpen(true); }}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        className="text-[#A39284] hover:text-[#207559] transition-colors cursor-help"
        title={text}
      >
        <HelpCircle className="w-3 h-3" />
      </button>

      {open && (
        <div
          onMouseLeave={() => setOpen(false)}
          className={`absolute z-[70] top-full mt-1.5 w-56 max-w-[75vw] rounded-xl bg-[#194E3B] text-[#EAF6F0] text-[11px] leading-4 font-medium p-2.5 shadow-lg ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
        >
          {text}
        </div>
      )}
    </span>
  );
};
