import React, { useState } from 'react';
import { AcademyHome } from './AcademyHome';
import { AcademyCurriculum } from './AcademyCurriculum';
import { AcademyQuests } from './AcademyQuests';
import { AcademyGarden } from './AcademyGarden';
import { SeedShop } from './SeedShop';
import { AcademyAchievements } from './AcademyAchievements';
import { AcademyLeaderboards } from './AcademyLeaderboards';
import { AcademySquad } from './AcademySquad';
import { BusinessSimulation } from './BusinessSimulation';
import { RewardToast } from './shared/RewardToast';
import { LevelUpModal } from './shared/LevelUpModal';
import { Icon } from '../Icon';

// 'simulations' is reachable only via in-context CTAs (Learn / Home), not its
// own nav pill — keeps the 8-item nav matching the spec while still
// supporting the Learn -> Practice -> Apply loop.
export type AcademyTab = 'home' | 'learn' | 'quests' | 'garden' | 'shop' | 'achievements' | 'leaderboards' | 'squad' | 'simulations';

const NAV_ITEMS: { id: AcademyTab; label: string; icon: string }[] = [
  { id: 'home', label: 'Home', icon: 'tab-academy' },
  { id: 'learn', label: 'Learn', icon: 'lesson-continue-learning' },
  { id: 'quests', label: 'Quests', icon: 'quests-header' },
  { id: 'garden', label: 'My Garden', icon: 'level-grove' },
  { id: 'shop', label: 'Seed Shop', icon: 'shop-frame-mint' },
  { id: 'achievements', label: 'Achievements', icon: 'achievements-header' },
  { id: 'leaderboards', label: 'Leaderboards', icon: 'leaderboard-header' },
  { id: 'squad', label: 'Squad', icon: 'squad-tab' },
];

export const AcademyRoot: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AcademyTab>('home');
  const [pendingModuleId, setPendingModuleId] = useState<string | undefined>(undefined);

  const handleNavigate = (tab: AcademyTab, moduleId?: string) => {
    setPendingModuleId(moduleId);
    setActiveTab(tab);
  };

  return (
    <div className="space-y-4">
      <RewardToast />
      <LevelUpModal />

      <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => handleNavigate(item.id)}
            className={`btn-bouncy shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold cursor-pointer border ${
              activeTab === item.id ? 'bg-[#194E3B] border-[#194E3B] text-white' : 'bg-white border-[#EDE4D8] text-[#6B5B4F]'
            }`}
          >
            <Icon name={item.icon} className="w-4 h-4" />
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      {activeTab === 'home' && <AcademyHome onNavigate={handleNavigate} />}
      {activeTab === 'learn' && (
        <AcademyCurriculum
          key={pendingModuleId || 'root'}
          initialModuleId={pendingModuleId}
          onOpenSimulations={() => handleNavigate('simulations')}
        />
      )}
      {activeTab === 'quests' && <AcademyQuests />}
      {activeTab === 'garden' && <AcademyGarden onCustomize={() => handleNavigate('shop')} />}
      {activeTab === 'shop' && <SeedShop />}
      {activeTab === 'achievements' && <AcademyAchievements />}
      {activeTab === 'leaderboards' && <AcademyLeaderboards />}
      {activeTab === 'squad' && <AcademySquad />}
      {activeTab === 'simulations' && <BusinessSimulation />}
    </div>
  );
};
