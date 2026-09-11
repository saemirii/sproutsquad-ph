import React, { useEffect, useState } from 'react';
import { useAcademy } from '../../context/AppContext';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

interface LeaderboardCategory {
  key: string;
  view: string;
  icon: string;
  label: string;
  sublabel: string;
  valueLabel: (row: any) => string;
}

const CATEGORIES: LeaderboardCategory[] = [
  { key: 'active', view: 'lb_most_active', icon: '🌱', label: 'Most Active', sublabel: 'Most lessons completed', valueLabel: (r) => `${r.lessons_completed} lessons` },
  { key: 'knowledge', view: 'lb_knowledge_grower', icon: '🧠', label: 'Knowledge Grower', sublabel: 'Highest quiz performance', valueLabel: (r) => `${r.perfect_quizzes} perfect` },
  { key: 'consistent', view: 'lb_consistent_grower', icon: '🔥', label: 'Consistent Grower', sublabel: 'Longest learning streak', valueLabel: (r) => `${r.streak_count} day streak` },
  { key: 'business', view: 'lb_business_builder', icon: '💼', label: 'Business Builder', sublabel: 'Most simulations/challenges completed', valueLabel: (r) => `${r.challenges_completed} completed` },
  { key: 'community', view: 'lb_community_grower', icon: '🤝', label: 'Community Grower', sublabel: 'Most squad participation', valueLabel: (r) => `${r.squad_contributions} contributions` },
];

export const AcademyLeaderboards: React.FC = () => {
  const { academyProfile, setLeaderboardOptIn } = useAcademy();
  const [activeCategory, setActiveCategory] = useState<LeaderboardCategory>(CATEGORIES[0]);
  const [rows, setRows] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    let cancelled = false;
    setIsLoading(true);
    supabase
      .from(activeCategory.view)
      .select('*')
      .limit(10)
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) console.error('Failed to load leaderboard', error);
        setRows(data || []);
        setIsLoading(false);
      });
    return () => { cancelled = true; };
  }, [activeCategory]);

  if (!isSupabaseConfigured) {
    return (
      <div className="bg-white p-6 rounded-3xl border border-[#EDE4D8] shadow-xs text-center space-y-2">
        <span className="text-3xl block">🏅</span>
        <p className="text-xs font-bold text-[#3B2F27]">Leaderboards need an online account</p>
        <p className="text-[11px] text-[#8C7A6D]">Sign in to compare your growth with the rest of campus.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="bg-white p-5 rounded-3xl border border-[#EDE4D8] shadow-xs flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-[#3B2F27] font-['Nunito',sans-serif]">🏅 Leaderboards</h2>
          <p className="text-xs text-[#7A6B5F]">Optional and friendly — no one is punished for growing at their own pace.</p>
        </div>
        <button
          onClick={() => void setLeaderboardOptIn(!academyProfile.leaderboardOptIn)}
          className={`btn-bouncy shrink-0 px-3 py-2 rounded-xl text-[11px] font-black cursor-pointer whitespace-nowrap ${
            academyProfile.leaderboardOptIn ? 'bg-[#B8E6D5] text-[#194E3B]' : 'bg-[#FAF7F2] border border-[#E5DACD] text-[#8C7A6D]'
          }`}
        >
          {academyProfile.leaderboardOptIn ? 'Visible ✓' : 'Hidden'}
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setActiveCategory(cat)}
            className={`btn-bouncy shrink-0 px-3.5 py-2 rounded-2xl text-xs font-bold cursor-pointer border ${
              activeCategory.key === cat.key ? 'bg-[#B8E6D5] border-[#71C7A5] text-[#194E3B]' : 'bg-white border-[#EDE4D8] text-[#8C7A6D]'
            }`}
          >
            {cat.icon} {cat.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-3xl border border-[#EDE4D8] p-2">
        <p className="text-[11px] text-[#8C7A6D] px-3 pt-2 pb-1">{activeCategory.sublabel}</p>
        {isLoading ? (
          <p className="text-xs text-[#8C7A6D] text-center py-6">Loading...</p>
        ) : rows.length === 0 ? (
          <p className="text-xs text-[#8C7A6D] text-center py-6">No growers on this board yet — be the first!</p>
        ) : (
          <div className="divide-y divide-[#F5EFEB]">
            {rows.map((row, idx) => (
              <div key={row.user_id} className="flex items-center gap-3 px-3 py-2.5">
                <span className="w-6 text-xs font-black text-[#8C7A6D]">{idx + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-[#3B2F27] truncate">{row.full_name || 'A student founder'}</p>
                  <p className="text-[10px] text-[#A39284] truncate">{row.university}</p>
                </div>
                <span className="text-[11px] font-black text-[#207559] whitespace-nowrap">{activeCategory.valueLabel(row)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
