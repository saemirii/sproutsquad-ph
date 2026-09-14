import React from 'react';
import { Icon } from './Icon';

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
    icon: string;
    role: string;
    bgColor: string;
    borderColor: string;
    textColor: string;
    tagline: string;
  }
> = {
  bunny: {
    name: 'Bella the Bunny',
    icon: 'mascot-bunny',
    role: 'Campus Marketplace Guide',
    bgColor: 'bg-[#FFD3BA]', // Peachy pink
    borderColor: 'border-[#F8BA9E]',
    textColor: 'text-[#7A341A]',
    tagline: 'Connecting student makers with hungry campus buyers!',
  },
  owl: {
    name: 'Peanut the Owl',
    icon: 'mascot-owl',
    role: 'Financial Literacy & AI Coach',
    bgColor: 'bg-[#B8E6D5]', // Soft mint green
    borderColor: 'border-[#9FD9C3]',
    textColor: 'text-[#194E3B]',
    tagline: 'Mastering unit economics, pricing formulas & profit margins!',
  },
  fox: {
    name: 'Felix the Fox',
    icon: 'mascot-fox',
    role: 'Smart Sourcing & Expense Tracker',
    bgColor: 'bg-[#FFD3BA]', // Peachy pink
    borderColor: 'border-[#F8BA9E]',
    textColor: 'text-[#7A341A]',
    tagline: 'Finding packaging deals in Divisoria & lowering overhead costs.',
  },
  bear: {
    name: 'Bruno the Bear',
    icon: 'tab-shop-os',
    role: 'Storefront & Inventory Keeper',
    bgColor: 'bg-[#A8D8EA]', // Sky blue
    borderColor: 'border-[#8EC7DC]',
    textColor: 'text-[#1B4E6B]',
    tagline: 'Managing batches, campus stock & pre-order drops.',
  },
  chick: {
    name: 'Pip the Chick',
    icon: 'mascot-chick',
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
    sm: 'w-7 h-7',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-18 h-18',
  };
  const iconSizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-7 h-7',
    lg: 'w-10 h-10',
    xl: 'w-14 h-14',
  };

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <div
        className={`${sizeClasses[size]} ${mascot.bgColor} ${mascot.borderColor} border rounded-2xl flex items-center justify-center shadow-xs animate-float-gentle shrink-0`}
      >
        <Icon name={mascot.icon} alt={mascot.name} className={iconSizeClasses[size]} />
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
