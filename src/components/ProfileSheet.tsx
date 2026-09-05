import React, { useState } from 'react';
import { Check, KeyRound, LogOut, Save, Sparkles, Upload, UserRound, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CampusUniversity } from '../types';

interface ProfileSheetProps {
  onClose: () => void;
  onOpenSubscription: () => void;
}

const campuses: CampusUniversity[] = [
  'MGC New Life Christian Academy',
];

export const ProfileSheet: React.FC<ProfileSheetProps> = ({ onClose, onOpenSubscription }) => {
  const {
    currentUser, updateCurrentUser, businesses, activeBusiness,
    setActiveBusiness, accessibleBusinessIds, unlockBusiness, signOut,
  } = useApp();
  const [name, setName] = useState(currentUser.name);
  const [school, setSchool] = useState<CampusUniversity>(currentUser.university);
  const [avatar, setAvatar] = useState(currentUser.avatar);
  const [keyByBusiness, setKeyByBusiness] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const saveProfile = () => {
    updateCurrentUser({ name: name.trim() || currentUser.name, university: school, avatar: avatar || currentUser.avatar });
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please choose an image file.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert('Please choose an image smaller than 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setAvatar(String(reader.result));
    reader.readAsDataURL(file);
  };

  return (
    <div className="absolute inset-0 z-[60] bg-black/35 backdrop-blur-sm flex items-start justify-center pt-12 px-4">
      <section className="w-full max-w-sm max-h-[calc(100%-3rem)] overflow-y-auto rounded-[2rem] bg-[#FFF9E6] border border-[#EDE4D8] shadow-2xl p-5 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#207559]">Your account</p>
            <h2 className="text-xl font-black text-[#3B2F27] font-['Nunito',sans-serif]">Profile & ventures</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-[#8C7A6D] hover:bg-[#F2EAE0]" title="Close profile"><X className="w-4 h-4" /></button>
        </div>

        <div className="flex items-center gap-3 rounded-2xl bg-white border border-[#EDE4D8] p-3">
          <img src={avatar || currentUser.avatar} alt="Profile" className="w-14 h-14 rounded-2xl object-cover border border-[#B8E6D5]" />
          <div className="min-w-0 flex-1">
            <p className="font-black text-sm text-[#3B2F27] truncate">{name || 'Your name'}</p>
            <p className="text-[11px] text-[#7A6B5F] truncate">{currentUser.email}</p>
            <label className="mt-1.5 inline-flex items-center gap-1.5 rounded-xl bg-[#B8E6D5] px-2.5 py-1.5 text-[10px] font-black text-[#194E3B] cursor-pointer hover:bg-[#A3DEC9]">
              <Upload className="w-3 h-3" />
              <span>Upload photo</span>
              <input type="file" accept="image/*" onChange={handleAvatarUpload} className="sr-only" />
            </label>
          </div>
        </div>

        <button
          onClick={onOpenSubscription}
          className="btn-bouncy w-full rounded-2xl bg-gradient-to-r from-[#194E3B] to-[#0E2B25] p-3.5 text-left flex items-center gap-3 hover:brightness-110 transition-all"
        >
          <span className="shrink-0 w-9 h-9 rounded-xl bg-white/10 text-[#B8E6D5] flex items-center justify-center">
            <Sparkles className="w-4.5 h-4.5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-xs font-black text-white">Upgrade to Sprout+ or Bloom+</span>
            <span className="block text-[10px] text-[#B8E6D5]">Unlock coupons, scheduling, mentoring & more</span>
          </span>
          <span className="shrink-0 text-[10px] font-black text-[#194E3B] bg-[#B8E6D5] rounded-full px-2.5 py-1">View</span>
        </button>

        <div className="space-y-3">
          <label className="block text-[11px] font-bold text-[#54453C]">Name<input value={name} onChange={(event) => setName(event.target.value)} className="mt-1 w-full rounded-xl border border-[#E5DACD] bg-white px-3 py-2.5 text-xs outline-none focus:ring-2 focus:ring-[#B8E6D5]" /></label>
          <label className="block text-[11px] font-bold text-[#54453C]">School<select value={school} onChange={(event) => setSchool(event.target.value as CampusUniversity)} className="mt-1 w-full rounded-xl border border-[#E5DACD] bg-white px-3 py-2.5 text-xs outline-none focus:ring-2 focus:ring-[#B8E6D5]">{campuses.map((campus) => <option key={campus}>{campus}</option>)}</select></label>
          <button onClick={saveProfile} className="w-full rounded-xl bg-[#207559] py-2.5 text-xs font-black text-white flex items-center justify-center gap-2 hover:bg-[#194E3B]"><Save className="w-3.5 h-3.5" />{saved ? 'Profile saved' : 'Save profile'}</button>
        </div>

        <div className="border-t border-[#EDE4D8] pt-4 space-y-3">
          <div><p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#207559]">Business access</p><p className="mt-1 text-[11px] leading-5 text-[#7A6B5F]">Your own shops are open automatically. Use a BES key to join another shop as a manager.</p></div>
          <div className="space-y-2">
            {businesses.map((business) => {
              const hasAccess = accessibleBusinessIds.includes(business.id);
              const isCurrent = activeBusiness.id === business.id;
              return <div key={business.id} className={`rounded-2xl border p-3 ${isCurrent ? 'border-[#9FD9C3] bg-[#F2FBF7]' : 'border-[#EDE4D8] bg-white'}`}>
                <div className="flex items-center gap-2"><img src={business.logo} alt={business.name} className="w-8 h-8 rounded-xl object-cover" /><div className="min-w-0 flex-1"><p className="text-xs font-black text-[#3B2F27] truncate">{business.name}</p><p className="text-[10px] text-[#7A6B5F]">{hasAccess ? 'Management access' : 'BES key required'}</p></div>{hasAccess && <Check className="w-4 h-4 text-[#207559]" />}</div>
                {!hasAccess && <div className="mt-2 flex gap-2"><input value={keyByBusiness[business.id] || ''} onChange={(event) => setKeyByBusiness((previous) => ({ ...previous, [business.id]: event.target.value }))} placeholder="Enter BES key" className="min-w-0 flex-1 rounded-xl border border-[#E5DACD] px-2.5 py-2 text-[11px] outline-none focus:ring-2 focus:ring-[#B8E6D5]" /><button onClick={() => { const unlocked = unlockBusiness(business.id, keyByBusiness[business.id] || ''); if (unlocked) { setActiveBusiness(business); setError(''); } else setError('That BES key is not valid.'); }} className="rounded-xl bg-[#FFD3BA] px-3 py-2 text-[11px] font-black text-[#7A341A]" title="Unlock business"><KeyRound className="w-3.5 h-3.5" /></button></div>}
                {hasAccess && <div className="mt-2 flex items-center justify-between gap-2"><button onClick={() => setActiveBusiness(business)} className="text-[11px] font-black text-[#207559]">{isCurrent ? 'Currently selected' : 'Manage this business'}</button><span className="text-[10px] font-bold text-[#8C7A6D]">Key: {business.besKey || 'Not set'}</span></div>}
              </div>;
            })}
          </div>
          {error && <p className="text-[11px] text-[#991B1B]">{error}</p>}
        </div>

        <div className="flex items-center gap-2 rounded-xl bg-[#FFF0E8] border border-[#F8BA9E] px-3 py-2 text-[10px] leading-4 text-[#7A341A]"><UserRound className="w-4 h-4 shrink-0" />BES access is shared by the business, so teammates can use the same key from their own accounts.</div>

        <button
          onClick={() => { onClose(); signOut(); }}
          className="w-full rounded-xl border border-[#F8BA9E] bg-white py-2.5 text-xs font-black text-[#991B1B] flex items-center justify-center gap-2 hover:bg-[#FFF0E8]"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign out
        </button>
      </section>
    </div>
  );
};
