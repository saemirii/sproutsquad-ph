import React, { useState } from 'react';
import { X, ShieldCheck, Search, Loader2 } from 'lucide-react';
import { useShop } from '../context/AppContext';
import { AdminLookedUpUser } from '../types';

interface UserRolesAdminScreenProps {
  onClose: () => void;
}

/** Lets an admin grant/revoke is_admin or is_ambassador on any account by
 * email — admin_set_sproutup_role() (migration_23) already existed but had
 * no UI anywhere in the app; this is the missing lookup + toggle step. */
export const UserRolesAdminScreen: React.FC<UserRolesAdminScreenProps> = ({ onClose }) => {
  const { lookupUserByEmailAdmin, setUserAdminRole } = useShop();

  const [email, setEmail] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [user, setUser] = useState<AdminLookedUpUser | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || isSearching) return;
    setIsSearching(true);
    setSearchError('');
    setSaveMessage('');
    setUser(null);
    const result = await lookupUserByEmailAdmin(email.trim());
    setIsSearching(false);
    if (!result.success || !result.user) {
      setSearchError(result.message || 'No account found for that email.');
      return;
    }
    setUser(result.user);
  };

  const handleToggle = async (field: 'isAdmin' | 'isAmbassador') => {
    if (!user || isSaving) return;
    const nextIsAdmin = field === 'isAdmin' ? !user.isAdmin : user.isAdmin;
    const nextIsAmbassador = field === 'isAmbassador' ? !user.isAmbassador : user.isAmbassador;
    setIsSaving(true);
    setSaveMessage('');
    const result = await setUserAdminRole(user.id, nextIsAdmin, nextIsAmbassador);
    setIsSaving(false);
    if (!result.success) {
      setSaveMessage(result.message || 'Could not update this user\'s role.');
      return;
    }
    setUser({ ...user, isAdmin: nextIsAdmin, isAmbassador: nextIsAmbassador });
    setSaveMessage('Saved.');
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#FFF9E6] overflow-y-auto">
      <div className="sticky top-0 z-10 bg-[#FFF9E6]/95 backdrop-blur-md border-b border-[#EDE4D8] px-4 pt-4 pb-3 flex items-center justify-between">
        <h2 className="font-extrabold text-base text-[#194E3B] font-['Nunito',sans-serif] flex items-center gap-1.5">
          <ShieldCheck className="w-5 h-5" /> User Roles
        </h2>
        <button onClick={onClose} className="w-8 h-8 rounded-full bg-white border border-[#EDE4D8] flex items-center justify-center cursor-pointer">
          <X className="w-4 h-4 text-[#6B5B4F]" />
        </button>
      </div>

      <div className="p-4 space-y-3">
        <form onSubmit={handleSearch} className="bg-white rounded-2xl border border-[#EDE4D8] p-4 space-y-2.5">
          <p className="text-[11px] font-bold text-[#54453C]">Find a user by their account email</p>
          <div className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@campus.edu"
              className="flex-1 min-w-0 rounded-xl border border-[#E5DACD] bg-white px-3 py-2.5 text-xs outline-none focus:ring-2 focus:ring-[#B8E6D5]"
            />
            <button
              type="submit"
              disabled={isSearching || !email.trim()}
              className="shrink-0 rounded-xl bg-[#207559] hover:bg-[#194E3B] disabled:opacity-50 text-white px-4 flex items-center justify-center gap-1.5 text-xs font-black cursor-pointer"
            >
              {isSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
              Look up
            </button>
          </div>
          {searchError && <p className="text-[11px] font-bold text-[#991B1B]">{searchError}</p>}
        </form>

        {user && (
          <div className="bg-white rounded-2xl border border-[#EDE4D8] p-4 space-y-3">
            <div>
              <p className="text-xs font-black text-[#3B2F27]">{user.fullName || 'Unnamed user'}</p>
              <p className="text-[11px] text-[#8C7A6D]">{user.email}</p>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-[#FAF7F2] px-3 py-2.5">
              <div>
                <p className="text-xs font-bold text-[#3B2F27]">Admin</p>
                <p className="text-[10px] text-[#8C7A6D]">Full access to every admin screen</p>
              </div>
              <button
                disabled={isSaving}
                onClick={() => void handleToggle('isAdmin')}
                className={`btn-bouncy shrink-0 px-3 py-1.5 rounded-xl text-[10px] font-black cursor-pointer disabled:opacity-50 ${
                  user.isAdmin ? 'bg-[#B8E6D5] text-[#194E3B]' : 'bg-white border border-[#E5DACD] text-[#8C7A6D]'
                }`}
              >
                {user.isAdmin ? 'On' : 'Off'}
              </button>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-[#FAF7F2] px-3 py-2.5">
              <div>
                <p className="text-xs font-bold text-[#3B2F27]">Ambassador</p>
                <p className="text-[10px] text-[#8C7A6D]">Can submit SproutUp! ambassador picks</p>
              </div>
              <button
                disabled={isSaving}
                onClick={() => void handleToggle('isAmbassador')}
                className={`btn-bouncy shrink-0 px-3 py-1.5 rounded-xl text-[10px] font-black cursor-pointer disabled:opacity-50 ${
                  user.isAmbassador ? 'bg-[#B8E6D5] text-[#194E3B]' : 'bg-white border border-[#E5DACD] text-[#8C7A6D]'
                }`}
              >
                {user.isAmbassador ? 'On' : 'Off'}
              </button>
            </div>

            {saveMessage && <p className="text-[11px] font-bold text-[#194E3B]">{saveMessage}</p>}
          </div>
        )}
      </div>
    </div>
  );
};
