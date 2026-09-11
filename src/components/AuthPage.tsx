import React, { FormEvent, useState } from 'react';
import { ArrowRight, LockKeyhole, Mail, Store, UserRound } from 'lucide-react';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { safeSetItem } from '../utils/safeStorage';

interface AuthPageProps {
  onLocalAuth?: (user: { id: string; email: string; user_metadata: { full_name: string } }) => void;
}

export interface LocalAccount {
  id: string;
  name: string;
  email: string;
  password: string;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onLocalAuth }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setMessage('');

    if (!supabase) {
      const accounts: LocalAccount[] = JSON.parse(localStorage.getItem('sproutsquad_local_accounts') || '[]');
      const normalizedEmail = email.trim().toLowerCase();
      const existingAccount = accounts.find((account) => account.email === normalizedEmail);

      if (mode === 'signup') {
        if (existingAccount) {
          setMessage('An account with that email already exists. Sign in instead.');
          setIsSubmitting(false);
          return;
        }

        const account = { id: `local-user-${Date.now()}`, name: name.trim(), email: normalizedEmail, password };
        safeSetItem('sproutsquad_local_accounts', JSON.stringify([...accounts, account]));
        onLocalAuth?.({ id: account.id, email: account.email, user_metadata: { full_name: account.name } });
      } else if (!existingAccount || existingAccount.password !== password) {
        setMessage('Email or password is incorrect.');
        setIsSubmitting(false);
      } else {
        onLocalAuth?.({ id: existingAccount.id, email: existingAccount.email, user_metadata: { full_name: existingAccount.name } });
      }
      return;
    }

    setIsSubmitting(true);
    const result = mode === 'login'
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: name } },
        });

    if (result.error) {
      setMessage(result.error.message);
    } else if (mode === 'signup' && !result.data.session) {
      setMessage('Account created. Check your email to confirm your account, then sign in.');
      setMode('login');
    }

    setIsSubmitting(false);
  };

  return (
    <main className="min-h-screen bg-[#143D35] px-5 py-8 text-[#FFF9E6] flex items-center justify-center overflow-hidden">
      <div className="w-full max-w-5xl grid lg:grid-cols-[1.05fr_0.95fr] gap-8 items-center">
        <section className="hidden lg:block px-8">
          <div className="inline-flex items-center gap-2 text-[#B8E6D5] text-sm font-black uppercase tracking-[0.18em]">
            <Store className="w-4 h-4" /> SproutSquad
          </div>
          <h1 className="mt-7 max-w-xl text-6xl font-black leading-[0.98] font-['Nunito',sans-serif]">
            Your campus shop, ready to grow.
          </h1>
          <p className="mt-6 max-w-md text-base leading-7 text-[#D8EFE3]">
            Create your own student storefront, discover small businesses around you, and keep every order in one gentle little operating system.
          </p>
          <div className="mt-10 flex items-center gap-3 text-sm text-[#B8E6D5]">
            <span className="w-10 h-10 rounded-2xl bg-[#B8E6D5] text-[#143D35] flex items-center justify-center text-lg">🌱</span>
            Made for student entrepreneurs
          </div>
        </section>

        <section className="bg-[#FFF9E6] text-[#3B2F27] rounded-[2rem] p-6 sm:p-8 shadow-2xl border border-[#E8DFC8]">
          <div className="lg:hidden flex items-center gap-2 text-[#207559] text-sm font-black uppercase tracking-[0.16em]">
            <Store className="w-4 h-4" /> SproutSquad
          </div>
          <div className="mt-5 lg:mt-0">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#207559]">
              {mode === 'login' ? 'Welcome back' : 'Start your storefront'}
            </p>
            <h2 className="mt-2 text-3xl font-black font-['Nunito',sans-serif]">
              {mode === 'login' ? 'Sign in to your squad' : 'Make room to grow'}
            </h2>
            <p className="mt-2 text-sm text-[#7A6B5F]">
              {mode === 'login' ? 'Pick up where your campus business left off.' : 'One account for buying, selling, and building your shop.'}
            </p>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-1 rounded-2xl bg-[#F2EAE0] p-1">
            {(['login', 'signup'] as const).map((authMode) => (
              <button
                key={authMode}
                type="button"
                onClick={() => { setMode(authMode); setMessage(''); }}
                className={`rounded-xl py-2.5 text-xs font-black transition-colors ${mode === authMode ? 'bg-white text-[#194E3B] shadow-sm' : 'text-[#8C7A6D]'}`}
              >
                {authMode === 'login' ? 'Sign in' : 'Create account'}
              </button>
            ))}
          </div>

          {!isSupabaseConfigured && (
            <div className="mt-5 rounded-2xl border border-[#F8BA9E] bg-[#FFF0E8] px-3 py-2.5 text-xs leading-5 text-[#7A341A]">
              Supabase is unavailable, so offline accounts are enabled temporarily on this device.
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {mode === 'signup' && (
              <label className="block">
                <span className="mb-1.5 block text-xs font-bold text-[#6B5B4F]">Your name</span>
                <span className="flex items-center gap-2 rounded-xl border border-[#E5DACD] bg-white px-3 focus-within:ring-2 focus-within:ring-[#B8E6D5]">
                  <UserRound className="w-4 h-4 text-[#8C7A6D]" />
                  <input required value={name} onChange={(event) => setName(event.target.value)} className="w-full bg-transparent py-3 text-sm outline-none" placeholder="e.g. Alex Santos" />
                </span>
              </label>
            )}
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold text-[#6B5B4F]">Email address</span>
              <span className="flex items-center gap-2 rounded-xl border border-[#E5DACD] bg-white px-3 focus-within:ring-2 focus-within:ring-[#B8E6D5]">
                <Mail className="w-4 h-4 text-[#8C7A6D]" />
                <input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="w-full bg-transparent py-3 text-sm outline-none" placeholder="you@campus.edu" />
              </span>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold text-[#6B5B4F]">Password</span>
              <span className="flex items-center gap-2 rounded-xl border border-[#E5DACD] bg-white px-3 focus-within:ring-2 focus-within:ring-[#B8E6D5]">
                <LockKeyhole className="w-4 h-4 text-[#8C7A6D]" />
                <input required minLength={6} type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="w-full bg-transparent py-3 text-sm outline-none" placeholder="At least 6 characters" />
              </span>
            </label>

            {message && <p className="rounded-xl bg-[#FFF0E8] px-3 py-2.5 text-xs leading-5 text-[#7A341A]">{message}</p>}

            <button disabled={isSubmitting} className="w-full rounded-xl bg-[#207559] py-3.5 text-sm font-black text-white transition-colors hover:bg-[#194E3B] disabled:cursor-wait disabled:opacity-60 flex items-center justify-center gap-2">
              {isSubmitting ? 'Connecting...' : mode === 'login' ? 'Enter SproutSquad' : 'Create my account'}
              {!isSubmitting && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
};
