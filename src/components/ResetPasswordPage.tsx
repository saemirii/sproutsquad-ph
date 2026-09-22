import React, { FormEvent, useState } from 'react';
import { ArrowRight, LockKeyhole, Store } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ResetPasswordPageProps {
  /** Called once the new password is saved — the caller then drops back
   * into the normal signed-in app, since Supabase's recovery link already
   * grants a real session. */
  onDone: () => void;
}

export const ResetPasswordPage: React.FC<ResetPasswordPageProps> = ({ onDone }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setMessage('');

    if (password.length < 6) {
      setMessage('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setMessage('Passwords do not match.');
      return;
    }
    if (!supabase) return;

    setIsSubmitting(true);
    const { error } = await supabase.auth.updateUser({ password });
    setIsSubmitting(false);

    if (error) {
      setMessage(error.message);
      return;
    }
    setIsDone(true);
    setTimeout(onDone, 1800);
  };

  return (
    <main className="min-h-screen bg-[#143D35] px-5 py-8 text-[#FFF9E6] flex items-center justify-center">
      <section className="w-full max-w-md bg-[#FFF9E6] text-[#3B2F27] rounded-[2rem] p-6 sm:p-8 shadow-2xl border border-[#E8DFC8]">
        <div className="flex items-center gap-2 text-[#207559] text-sm font-black uppercase tracking-[0.16em]">
          <Store className="w-4 h-4" /> SproutSquad
        </div>

        {isDone ? (
          <div className="mt-6 text-center space-y-2 py-6">
            <h2 className="text-2xl font-black font-['Nunito',sans-serif]">Password updated!</h2>
            <p className="text-sm text-[#7A6B5F]">Taking you back into SproutSquad...</p>
          </div>
        ) : (
          <>
            <h2 className="mt-5 text-3xl font-black font-['Nunito',sans-serif]">Set a new password</h2>
            <p className="mt-2 text-sm text-[#7A6B5F]">Choose a new password for your SproutSquad account.</p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <label className="block">
                <span className="mb-1.5 block text-xs font-bold text-[#6B5B4F]">New password</span>
                <span className="flex items-center gap-2 rounded-xl border border-[#E5DACD] bg-white px-3 focus-within:ring-2 focus-within:ring-[#B8E6D5]">
                  <LockKeyhole className="w-4 h-4 text-[#8C7A6D]" />
                  <input
                    required
                    minLength={6}
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="w-full bg-transparent py-3 text-sm outline-none"
                    placeholder="At least 6 characters"
                  />
                </span>
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-bold text-[#6B5B4F]">Confirm new password</span>
                <span className="flex items-center gap-2 rounded-xl border border-[#E5DACD] bg-white px-3 focus-within:ring-2 focus-within:ring-[#B8E6D5]">
                  <LockKeyhole className="w-4 h-4 text-[#8C7A6D]" />
                  <input
                    required
                    minLength={6}
                    type="password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    className="w-full bg-transparent py-3 text-sm outline-none"
                    placeholder="Re-enter your new password"
                  />
                </span>
              </label>

              {message && <p className="rounded-xl bg-[#FFF0E8] px-3 py-2.5 text-xs leading-5 text-[#7A341A]">{message}</p>}

              <button
                disabled={isSubmitting}
                className="w-full rounded-xl bg-[#207559] py-3.5 text-sm font-black text-white transition-colors hover:bg-[#194E3B] disabled:cursor-wait disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {isSubmitting ? 'Saving...' : 'Save new password'}
                {!isSubmitting && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>
          </>
        )}
      </section>
    </main>
  );
};
