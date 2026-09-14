import React from 'react';

// Bulk-imports every illustrated icon in one pass (Vite resolves each to a
// hashed, cacheable URL at build time) instead of hand-writing 91 import
// statements. Keyed by filename without extension, e.g. 'tab-market'.
const modules = import.meta.glob('../assets/icons/*.png', { eager: true, import: 'default' }) as Record<string, string>;
const ICONS: Record<string, string> = {};
for (const path in modules) {
  const name = path.split('/').pop()!.replace('.png', '');
  ICONS[name] = modules[path];
}

export type IconName = keyof typeof ICONS;

interface IconProps {
  name: string;
  className?: string;
  alt?: string;
}

/** Renders one of the app's illustrated icons in place of an emoji
 * character. `alt` defaults to empty (decorative) since these almost
 * always sit next to a text label already saying what they mean — pass
 * a real `alt` when the icon is the only label. */
export const Icon: React.FC<IconProps> = ({ name, className = 'w-5 h-5', alt = '' }) => {
  const src = ICONS[name];
  if (!src) {
    if (import.meta.env.DEV) console.warn(`Icon "${name}" not found in src/assets/icons/`);
    return null;
  }
  return <img src={src} alt={alt} className={`inline-block object-contain shrink-0 ${className}`} draggable={false} />;
};
