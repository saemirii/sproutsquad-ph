import React from 'react';

export type MascotType = 'bunny' | 'owl' | 'fox' | 'bear' | 'chick';

interface MascotProps {
  type: MascotType;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showName?: boolean;
  roleDescription?: string;
  className?: string;
}

export const MASCOT_PROFILES: Record<
  MascotType,
  {
    name: string;
    emoji: string;
    role: string;
    bgColor: string;
    borderColor: string;
    textColor: string;
    tagline: string;
  }
> = {
  bunny: {
    name: 'Bella the Bunny',
    emoji: '🐰',
    role: 'Campus Marketplace Guide',
    bgColor: 'bg-[#FFD3BA]', // Peachy pink
    borderColor: 'border-[#F8BA9E]',
    textColor: 'text-[#7A341A]',
    tagline: 'Connecting student makers with hungry campus buyers!',
  },
  owl: {
    name: 'Peanut the Owl',
    emoji: '🦉',
    role: 'Financial Literacy & AI Coach',
    bgColor: 'bg-[#B8E6D5]', // Soft mint green
    borderColor: 'border-[#9FD9C3]',
    textColor: 'text-[#194E3B]',
    tagline: 'Mastering unit economics, pricing formulas & profit margins!',
  },
  fox: {
    name: 'Felix the Fox',
    emoji: '🦊',
    role: 'Smart Sourcing & Expense Tracker',
    bgColor: 'bg-[#FFD3BA]', // Peachy pink
    borderColor: 'border-[#F8BA9E]',
    textColor: 'text-[#7A341A]',
    tagline: 'Finding packaging deals in Divisoria & lowering overhead costs.',
  },
  bear: {
    name: 'Bruno the Bear',
    emoji: '🐻',
    role: 'Storefront & Inventory Keeper',
    bgColor: 'bg-[#A8D8EA]', // Sky blue
    borderColor: 'border-[#8EC7DC]',
    textColor: 'text-[#1B4E6B]',
    tagline: 'Managing batches, campus stock & pre-order drops.',
  },
  chick: {
    name: 'Pip the Chick',
    emoji: '🐥',
    role: 'Campus Meetup Specialist',
    bgColor: 'bg-[#FFF9E6]',
    borderColor: 'border-[#EADBCE]',
    textColor: 'text-[#6B5B4F]',
    tagline: 'Coordinating handoffs at Gonzaga, Sunken Garden & Archs!',
  },
};

export const MascotBadge: React.FC<MascotProps> = ({
  type,
  size = 'md',
  showName = true,
  roleDescription,
  className = '',
}) => {
  const mascot = MASCOT_PROFILES[type] || MASCOT_PROFILES.bunny;

  const sizeClasses = {
    sm: 'w-7 h-7 text-sm',
    md: 'w-10 h-10 text-xl',
    lg: 'w-14 h-14 text-2xl',
    xl: 'w-18 h-18 text-4xl',
  };

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <div
        className={`${sizeClasses[size]} ${mascot.bgColor} ${mascot.borderColor} border rounded-2xl flex items-center justify-center shadow-xs animate-float-gentle shrink-0`}
      >
        <span>{mascot.emoji}</span>
      </div>

      {showName && (
        <div className="text-left">
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-xs text-[#3B2F27] font-['Nunito',sans-serif]">
              {mascot.name}
            </span>
            <span
              className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${mascot.bgColor} ${mascot.textColor}`}
            >
              {mascot.role}
            </span>
          </div>
          <p className="text-[11px] text-[#6B5B4F]">
            {roleDescription || mascot.tagline}
          </p>
        </div>
      )}
    </div>
  );
};
