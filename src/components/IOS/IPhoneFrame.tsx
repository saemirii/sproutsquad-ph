import React, { useState } from 'react';
import { Smartphone, Maximize2, Minimize2, Volume2, VolumeX, Sparkles } from 'lucide-react';
import { IosStatusBar } from './IosStatusBar';
import { IosTabBar, IosActiveTab } from './IosTabBar';
import { DynamicIslandAlert } from './DynamicIsland';
import { isSoundEnabled, setSoundEnabled, playIosTap } from '../../utils/haptics';
import { ProfileSheet } from '../ProfileSheet';

interface IPhoneFrameProps {
  children: React.ReactNode;
  activeTab: IosActiveTab;
  onTabChange: (tab: IosActiveTab) => void;
  activeAlert?: DynamicIslandAlert | null;
  onClearAlert?: () => void;
  onOpenBag?: () => void;
}

type DeviceFinish = 'gold' | 'mint' | 'pink' | 'black';

export const IPhoneFrame: React.FC<IPhoneFrameProps> = ({
  children,
  activeTab,
  onTabChange,
  activeAlert,
  onClearAlert,
  onOpenBag,
}) => {
  const [isFramed, setIsFramed] = useState(true);
  const [finish, setFinish] = useState<DeviceFinish>('gold');
  const [soundOn, setSoundOn] = useState(isSoundEnabled());
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
    if (next) playIosTap();
  };

  const finishStyles: Record<DeviceFinish, { border: string; shadow: string; label: string; accent: string }> = {
    gold: {
      border: 'border-[#2E2822]',
      shadow: 'shadow-[0_25px_60px_-15px_rgba(75,60,40,0.35)]',
      label: 'Desert Gold',
      accent: '#E5C9A6',
    },
    mint: {
      border: 'border-[#1C2E26]',
      shadow: 'shadow-[0_25px_60px_-15px_rgba(25,78,59,0.35)]',
      label: 'Mint Sprout',
      accent: '#B8E6D5',
    },
    pink: {
      border: 'border-[#332223]',
      shadow: 'shadow-[0_25px_60px_-15px_rgba(122,52,26,0.35)]',
      label: 'Sakura Peach',
      accent: '#FFD3BA',
    },
    black: {
      border: 'border-[#1E1E1E]',
      shadow: 'shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)]',
      label: 'Space Black',
      accent: '#8C8C8C',
    },
  };

  const currentStyle = finishStyles[finish];

  return (
    <div className="min-h-screen bg-[#F5EFE6] text-[#6B5B4F] flex flex-col items-center justify-start p-0 sm:py-6 selection:bg-[#B8E6D5] selection:text-[#194E3B]">
      
      {/* Top Floating iOS Simulator Controls (Visible on Tablet / Desktop) */}
      <div className="hidden sm:flex items-center justify-between gap-4 w-full max-w-lg mb-3 px-4 py-2 bg-white/80 backdrop-blur-md rounded-2xl border border-[#EDE4D8] shadow-xs text-xs">
        <div className="flex items-center gap-2">
          <span className="text-base">🌱</span>
          <span className="font-extrabold text-[#3B2F27] font-['Nunito',sans-serif]">
            SproutSquad iOS
          </span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#B8E6D5] text-[#194E3B]">
            iPhone 16 Pro
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Finish Switcher */}
          <div className="flex items-center gap-1 bg-[#FAF3DE] p-1 rounded-xl border border-[#EDE4D8]">
            {(['gold', 'mint', 'pink', 'black'] as DeviceFinish[]).map((f) => (
              <button
                key={f}
                title={finishStyles[f].label}
                onClick={() => {
                  playIosTap();
                  setFinish(f);
                }}
                className={`w-4 h-4 rounded-full transition-transform ${
                  finish === f ? 'scale-125 ring-2 ring-[#194E3B]' : 'hover:scale-110'
                }`}
                style={{ backgroundColor: finishStyles[f].accent }}
              />
            ))}
          </div>

          {/* Audio Tap Toggle */}
          <button
            onClick={toggleSound}
            title={soundOn ? 'Mute Haptic Sound' : 'Enable Haptic Sound'}
            className="p-1.5 rounded-xl text-[#6B5B4F] hover:bg-[#FAF3DE] transition-colors"
          >
            {soundOn ? <Volume2 className="w-3.5 h-3.5 text-[#194E3B]" /> : <VolumeX className="w-3.5 h-3.5 text-[#A39284]" />}
          </button>

          {/* Toggle Device Frame vs Full Screen */}
          <button
            onClick={() => {
              playIosTap();
              setIsFramed(!isFramed);
            }}
            className="flex items-center gap-1 px-2 py-1 rounded-xl bg-[#FAF3DE] hover:bg-[#EDE4D8] text-[10px] font-bold text-[#3B2F27] transition-colors"
          >
            {isFramed ? <Maximize2 className="w-3 h-3" /> : <Minimize2 className="w-3 h-3" />}
            <span>{isFramed ? 'Full Screen' : 'Frame View'}</span>
          </button>
        </div>
      </div>

      {/* Main App Canvas / iPhone 16 Pro Mockup */}
      <div
        className={`transition-all duration-300 w-full h-dvh flex justify-center ${
          isFramed
            ? 'sm:max-w-[412px] sm:h-[860px]'
            : 'max-w-none'
        }`}
      >
        <div
          className={`w-full h-full flex flex-col bg-[#FFF9E6] overflow-hidden relative ${
            isFramed
              ? `sm:rounded-[52px] sm:border-[10px] ${currentStyle.border} ${currentStyle.shadow} sm:ring-1 sm:ring-black/10`
              : 'rounded-none border-none shadow-none'
          }`}
        >
          {/* Speaker Ear-slit cutout on top bezel */}
          {isFramed && (
            <div className="hidden sm:block absolute top-2 left-1/2 -translate-x-1/2 w-14 h-1 bg-[#1A1815] rounded-full z-50 pointer-events-none" />
          )}

          {/* iOS Status Bar with Dynamic Island */}
          <IosStatusBar
            activeAlert={activeAlert}
            onClearAlert={onClearAlert}
            onOpenBag={onOpenBag}
            onOpenProfile={() => setIsProfileOpen(true)}
          />

          {/* Scrollable Main Screen Content */}
          <div className="flex-1 overflow-y-auto scrollbar-none flex flex-col relative">
            {children}
          </div>

          {isProfileOpen && <ProfileSheet onClose={() => setIsProfileOpen(false)} />}

          {/* iOS Bottom Tab Bar & Home Indicator */}
          <IosTabBar activeTab={activeTab} onTabChange={onTabChange} />
        </div>
      </div>

      {/* Bottom context notice */}
      <p className="hidden sm:block text-[11px] text-[#8C7A6D] mt-3 text-center">
        💡 SproutSquad iOS runs natively on mobile Safari & Chrome with offline support & campus notifications.
      </p>
    </div>
  );
};
