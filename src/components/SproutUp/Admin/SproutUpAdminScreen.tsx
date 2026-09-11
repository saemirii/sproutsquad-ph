import React, { useEffect, useState } from 'react';
import { X, Loader2, Check, Ban, Trash2, EyeOff, Eye } from 'lucide-react';
import { useShop, useSproutUp } from '../../../context/AppContext';
import { playIosTap } from '../../../utils/haptics';

interface SproutUpAdminScreenProps {
  onClose: () => void;
}

type AdminTab = 'nominations' | 'ambassador' | 'featured';

export const SproutUpAdminScreen: React.FC<SproutUpAdminScreenProps> = ({ onClose }) => {
  const { businesses } = useShop();
  const {
    pendingNominations,
    pendingAmbassadorPicks,
    allFeaturedSprouts,
    isSproutUpAdminLoading,
    fetchAdminQueues,
    moderateNomination,
    publishNomination,
    moderateAmbassadorPick,
    publishAmbassadorPick,
    createFeaturedSprout,
    publishFeaturedSprout,
    unpublishFeaturedSprout,
    deleteFeaturedSprout,
  } = useSproutUp();

  const [tab, setTab] = useState<AdminTab>('nominations');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    void fetchAdminQueues();
  }, []);

  const businessName = (id: string) => businesses.find((b) => b.id === id)?.name || id;

  const approveAndFeatureNomination = async (id: string) => {
    setBusyId(id);
    setError('');
    const approve = await moderateNomination(id, 'approved');
    if (!approve.success) { setError(approve.message || 'Failed to approve.'); setBusyId(null); return; }
    const publish = await publishNomination(id);
    if (!publish.success) setError(publish.message || 'Approved, but failed to publish.');
    setBusyId(null);
  };

  const rejectNomination = async (id: string) => {
    setBusyId(id);
    setError('');
    const result = await moderateNomination(id, 'rejected');
    if (!result.success) setError(result.message || 'Failed to reject.');
    setBusyId(null);
  };

  const approveAndFeaturePick = async (id: string) => {
    setBusyId(id);
    setError('');
    const approve = await moderateAmbassadorPick(id, 'approved');
    if (!approve.success) { setError(approve.message || 'Failed to approve.'); setBusyId(null); return; }
    const publish = await publishAmbassadorPick(id);
    if (!publish.success) setError(publish.message || 'Approved, but failed to publish.');
    setBusyId(null);
  };

  const rejectPick = async (id: string) => {
    setBusyId(id);
    setError('');
    const result = await moderateAmbassadorPick(id, 'rejected');
    if (!result.success) setError(result.message || 'Failed to reject.');
    setBusyId(null);
  };

  // --- Featured Sprout create form ---
  const sortedBusinesses = [...businesses].sort((a, b) => a.name.localeCompare(b.name));
  const [newBusinessId, setNewBusinessId] = useState(sortedBusinesses[0]?.id || '');
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newStartsAt, setNewStartsAt] = useState(() => new Date().toISOString().slice(0, 10));
  const [newEndsAt, setNewEndsAt] = useState(() => new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10));
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateFeatured = async () => {
    if (!newBusinessId || !newTitle.trim() || isCreating) return;
    setIsCreating(true);
    setError('');
    const result = await createFeaturedSprout({
      businessId: newBusinessId,
      title: newTitle.trim(),
      description: newDescription.trim(),
      startsAt: new Date(newStartsAt).toISOString(),
      endsAt: new Date(newEndsAt).toISOString(),
    });
    setIsCreating(false);
    if (!result.success) setError(result.message || 'Failed to create Featured Sprout.');
    else { setNewTitle(''); setNewDescription(''); }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#FFF9E6] overflow-y-auto">
      <div className="sticky top-0 z-10 bg-[#FFF9E6]/95 backdrop-blur-md border-b border-[#EDE4D8] px-4 pt-4 pb-3 flex items-center justify-between">
        <h2 className="font-extrabold text-base text-[#194E3B] font-['Nunito',sans-serif]">🚀 SproutUp! Admin Tools</h2>
        <button onClick={onClose} className="w-8 h-8 rounded-full bg-white border border-[#EDE4D8] flex items-center justify-center cursor-pointer">
          <X className="w-4 h-4 text-[#6B5B4F]" />
        </button>
      </div>

      <div className="px-4 pt-3 flex gap-2">
        {([
          { id: 'nominations', label: `Nominations (${pendingNominations.length})` },
          { id: 'ambassador', label: `Ambassador (${pendingAmbassadorPicks.length})` },
          { id: 'featured', label: 'Featured Sprouts' },
        ] as { id: AdminTab; label: string }[]).map((t) => (
          <button
            key={t.id}
            onClick={() => { playIosTap(); setTab(t.id); }}
            className={`px-3 py-1.5 rounded-2xl text-[11px] font-bold cursor-pointer ${
              tab === t.id ? 'bg-[#B8E6D5] text-[#194E3B]' : 'bg-white border border-[#EDE4D8] text-[#6B5B4F]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="p-4 space-y-3">
        {error && <p className="text-[11px] font-bold text-[#991B1B]">{error}</p>}

        {isSproutUpAdminLoading ? (
          <div className="bg-white rounded-2xl border border-[#EDE4D8] p-8 flex justify-center">
            <Loader2 className="w-5 h-5 text-[#207559] animate-spin" />
          </div>
        ) : tab === 'nominations' ? (
          pendingNominations.length === 0 ? (
            <p className="text-xs text-[#8C7A6D] text-center py-6">No pending nominations.</p>
          ) : pendingNominations.map((nom) => (
            <div key={nom.id} className="bg-white rounded-2xl border border-[#EDE4D8] p-4 space-y-2">
              <h3 className="font-extrabold text-xs text-[#3B2F27]">{businessName(nom.businessId)}</h3>
              <p className="text-[11px] text-[#6E5D52] italic">"{nom.reason}"</p>
              <div className="flex gap-2 pt-1">
                <button
                  disabled={busyId === nom.id}
                  onClick={() => void approveAndFeatureNomination(nom.id)}
                  className="flex-1 py-2 bg-[#B8E6D5] text-[#194E3B] rounded-xl text-[11px] font-black flex items-center justify-center gap-1 disabled:opacity-50 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" /> Approve & Feature
                </button>
                <button
                  disabled={busyId === nom.id}
                  onClick={() => void rejectNomination(nom.id)}
                  className="px-3 py-2 bg-[#FEE2E2] text-[#991B1B] rounded-xl text-[11px] font-black flex items-center justify-center gap-1 disabled:opacity-50 cursor-pointer"
                >
                  <Ban className="w-3.5 h-3.5" /> Reject
                </button>
              </div>
            </div>
          ))
        ) : tab === 'ambassador' ? (
          pendingAmbassadorPicks.length === 0 ? (
            <p className="text-xs text-[#8C7A6D] text-center py-6">No pending ambassador picks.</p>
          ) : pendingAmbassadorPicks.map((pick) => (
            <div key={pick.id} className="bg-white rounded-2xl border border-[#EDE4D8] p-4 space-y-2">
              <h3 className="font-extrabold text-xs text-[#3B2F27]">{businessName(pick.businessId)}</h3>
              <p className="text-xs font-bold text-[#7A2E1E]">{pick.headline}</p>
              <p className="text-[11px] text-[#6E5D52] italic">"{pick.description}"</p>
              <div className="flex gap-2 pt-1">
                <button
                  disabled={busyId === pick.id}
                  onClick={() => void approveAndFeaturePick(pick.id)}
                  className="flex-1 py-2 bg-[#B8E6D5] text-[#194E3B] rounded-xl text-[11px] font-black flex items-center justify-center gap-1 disabled:opacity-50 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" /> Approve & Feature
                </button>
                <button
                  disabled={busyId === pick.id}
                  onClick={() => void rejectPick(pick.id)}
                  className="px-3 py-2 bg-[#FEE2E2] text-[#991B1B] rounded-xl text-[11px] font-black flex items-center justify-center gap-1 disabled:opacity-50 cursor-pointer"
                >
                  <Ban className="w-3.5 h-3.5" /> Reject
                </button>
              </div>
            </div>
          ))
        ) : (
          <>
            <div className="bg-white rounded-2xl border border-[#EDE4D8] p-4 space-y-2.5">
              <h3 className="font-extrabold text-xs text-[#3B2F27]">+ New Featured Sprout</h3>
              <select
                value={newBusinessId}
                onChange={(e) => setNewBusinessId(e.target.value)}
                className="w-full rounded-xl border border-[#EDE4D8] bg-[#FAF3DE] px-3 py-2 text-xs outline-none"
              >
                {sortedBusinesses.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
              <input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Title"
                className="w-full rounded-xl border border-[#EDE4D8] bg-[#FAF3DE] px-3 py-2 text-xs outline-none"
              />
              <textarea
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Description"
                rows={2}
                className="w-full rounded-xl border border-[#EDE4D8] bg-[#FAF3DE] px-3 py-2 text-xs outline-none resize-none"
              />
              <div className="flex gap-2">
                <input type="date" value={newStartsAt} onChange={(e) => setNewStartsAt(e.target.value)} className="flex-1 rounded-xl border border-[#EDE4D8] bg-[#FAF3DE] px-3 py-2 text-xs outline-none" />
                <input type="date" value={newEndsAt} onChange={(e) => setNewEndsAt(e.target.value)} className="flex-1 rounded-xl border border-[#EDE4D8] bg-[#FAF3DE] px-3 py-2 text-xs outline-none" />
              </div>
              <button
                disabled={!newBusinessId || !newTitle.trim() || isCreating}
                onClick={() => void handleCreateFeatured()}
                className="w-full py-2.5 bg-[#194E3B] text-white rounded-xl text-xs font-black disabled:opacity-50 cursor-pointer"
              >
                {isCreating ? 'Creating...' : 'Create'}
              </button>
            </div>

            {allFeaturedSprouts.map((feat) => (
              <div key={feat.id} className="bg-white rounded-2xl border border-[#EDE4D8] p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-xs text-[#3B2F27]">{feat.title}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${feat.isPublished ? 'bg-[#B8E6D5] text-[#194E3B]' : 'bg-[#FAF3DE] text-[#8C7A6D]'}`}>
                    {feat.isPublished ? 'Published' : 'Draft'}
                  </span>
                </div>
                <p className="text-[11px] text-[#6E5D52]">{businessName(feat.businessId)}</p>
                <div className="flex gap-2 pt-1">
                  {feat.isPublished ? (
                    <button
                      onClick={() => void unpublishFeaturedSprout(feat.id)}
                      className="flex-1 py-2 bg-[#FAF3DE] text-[#6B5B4F] rounded-xl text-[11px] font-black flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <EyeOff className="w-3.5 h-3.5" /> Unpublish
                    </button>
                  ) : (
                    <button
                      onClick={() => void publishFeaturedSprout(feat.id)}
                      className="flex-1 py-2 bg-[#B8E6D5] text-[#194E3B] rounded-xl text-[11px] font-black flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" /> Publish
                    </button>
                  )}
                  <button
                    onClick={() => void deleteFeaturedSprout(feat.id)}
                    className="px-3 py-2 bg-[#FEE2E2] text-[#991B1B] rounded-xl text-[11px] font-black flex items-center justify-center cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};
