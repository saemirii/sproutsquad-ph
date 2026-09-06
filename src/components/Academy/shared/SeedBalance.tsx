import React from 'react';

interface SeedBalanceProps {
  seeds: number;
  size?: 'sm' | 'md';
}

export const SeedBalance: React.FC<SeedBalanceProps> = ({ seeds, size = 'md' }) => (
  <div
    className={`inline-flex items-center gap-1.5 rounded-2xl bg-[#FFF9E6] border border-[#EDE4D8] font-black text-[#7A341A] ${
      size === 'sm' ? 'px-2.5 py-1 text-[11px]' : 'px-3.5 py-2 text-xs'
    }`}
  >
    <span>🌰</span>
    <span>{seeds.toLocaleString()}</span>
  </div>
);
