import React, { useState, useEffect } from 'react';
import { ShoppingBag, Sparkles, CheckCircle2, ChevronUp, ChevronDown, Store } from 'lucide-react';
import { useCart, useShop } from '../../context/AppContext';
import { playIosTap } from '../../utils/haptics';
import { isNativeApp } from '../../utils/platform';

export interface DynamicIslandAlert {
  id: string;
  icon: string;
  title: string;
  subtitle?: string;
  duration?: number;
}

interface DynamicIslandProps {
  activeAlert?: DynamicIslandAlert | null;
  onClearAlert?: () => void;
  onOpenBag?: () => void;
}

export const DynamicIsland: React.FC<DynamicIslandProps> = ({
  activeAlert,
  onClearAlert,
  onOpenBag,
}) => {
  const { cartCount } = useCart();
  const { activeBusiness, activeBusinessMetrics } = useShop();
  const [isExpanded, setIsExpanded] = useState(false);

  // Auto-collapse alert after duration
  useEffect(() => {
    if (activeAlert) {
      const timer = setTimeout(() => {
        if (onClearAlert) onClearAlert();
      }, activeAlert.duration || 3200);
      return () => clearTimeout(timer);
    }
  }, [activeAlert, onClearAlert]);

  const handleToggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    playIosTap();
    setIsExpanded((prev) => !prev);
  };

  // The real device already has its own Dynamic Island / notch, so the fake
  // pill-shaped chrome only makes sense for the web "simulated iPhone"
  // preview. Native just needs the underlying cart + alert functionality,
  // surfaced as plain inline controls in the status bar row.
  if (isNativeApp) {
    return (
      <div className="flex items-center text-[#3B2F27]">
        {activeAlert ? (
          <div className="flex items-center gap-1.5 max-w-[220px] px-2.5 py-1 rounded-full bg-[#FAF3DE] border border-[#EDE4D8]">
            <span className="text-sm shrink-0">{activeAlert.icon}</span>
            <div className="truncate text-left">
              <p className="text-[11px] font-bold leading-tight truncate">{activeAlert.title}</p>
              {activeAlert.subtitle && (
                <p className="text-[9px] text-[#8C7A6D] leading-none truncate">{activeAlert.subtitle}</p>
              )}
            </div>
          </div>
        ) : onOpenBag && (
          <button
            onClick={() => { playIosTap(); onOpenBag(); }}
            className="flex items-center gap-1 pl-2 pr-2.5 py-1 rounded-full bg-[#F2EAE0] active:scale-95 transition-transform"
            title="Open bag"
          >
            <ShoppingBag className="w-3.5 h-3.5" strokeWidth={2.25} />
            {cartCount > 0 && (
              <span className="text-[10px] font-black leading-none">
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            )}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex justify-center w-full z-50 pointer-events-auto">
      <div
        onClick={handleToggleExpand}
        className={`bg-[#1C1A17] text-white rounded-full transition-all duration-300 ease-out cursor-pointer select-none shadow-md border border-white/10 relative overflow-hidden flex items-center justify-between ${
          isExpanded
            ? 'w-[90%] sm:w-[320px] rounded-[28px] p-3.5 h-auto'
            : activeAlert
            ? 'min-w-[200px] max-w-[270px] h-[34px] px-3.5 py-1 rounded-full'
            : 'w-[124px] h-[30px] px-3 py-1'
        }`}
      >
        {/* Expanded Widget View */}
        {isExpanded ? (
          <div className="w-full space-y-2.5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#B8E6D5] text-[#194E3B] flex items-center justify-center font-bold text-sm">
                  🌱
                </div>
                <div>
                  <p className="text-[11px] font-bold text-white/90 truncate max-w-[150px]">
                    {activeBusiness.name}
                  </p>
                  <p className="text-[10px] text-white/60 truncate">
                    📍 {activeBusiness.university}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#B8E6D5] text-[#194E3B]">
                  {activeBusinessMetrics.healthScore} HP
                </span>
                <ChevronUp className="w-4 h-4 text-white/50" />
              </div>
            </div>

            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-white/80">
                <ShoppingBag className="w-3.5 h-3.5 text-[#FFD3BA]" />
                <span className="text-[11px] font-medium">
                  Bag: <strong className="text-white">{cartCount} items</strong>
                </span>
              </div>

              {cartCount > 0 && onOpenBag && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsExpanded(false);
                    onOpenBag();
                  }}
                  className="px-2.5 py-1 rounded-xl bg-[#FFD3BA] text-[#7A341A] font-black text-[10px] hover:bg-[#F8BA9E] transition-colors"
                >
                  View Bag →
                </button>
              )}
            </div>
          </div>
        ) : activeAlert ? (
          /* Live Alert Banner in Island */
          <div className="flex items-center justify-between w-full gap-2 text-xs">
            <div className="flex items-center gap-2 truncate">
              <span className="text-sm">{activeAlert.icon}</span>
              <div className="truncate text-left">
                <p className="text-[11px] font-bold text-white truncate leading-tight">
                  {activeAlert.title}
                </p>
                {activeAlert.subtitle && (
                  <p className="text-[9px] text-white/70 truncate leading-none">
                    {activeAlert.subtitle}
                  </p>
                )}
              </div>
            </div>
            <div className="w-2.5 h-2.5 rounded-full bg-[#B8E6D5] animate-pulse shrink-0" />
          </div>
        ) : (
          /* Default Compact Island */
          <div className="flex items-center justify-between w-full">
            {/* Front camera lens reflection */}
            <div className="w-2.5 h-2.5 rounded-full bg-[#2A2825] border border-white/10 flex items-center justify-center">
              <div className="w-1 h-1 rounded-full bg-[#1A1F2C]" />
            </div>

            {/* Subtle sprout or bag counter indicator */}
            <div className="flex items-center gap-1">
              <span className="text-[10px]">🌱</span>
              {cartCount > 0 && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#FFD3BA]" />
              )}
            </div>

            {/* Sensor dot */}
            <div className="w-2 h-2 rounded-full bg-[#23211E]" />
          </div>
        )}
      </div>
    </div>
  );
};
