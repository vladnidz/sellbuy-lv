'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/lib/auth';
import { useLocale } from '@/app/lib/locale-context';
import { colors, typography, components } from '@/app/lib/design-system';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();
  const { t } = useLocale();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (password.length < 6) { setError('Min 6 characters'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || t('common.error')); return; }
      await login(data.email, data.name);
      router.push('/');
    } catch {
      setError(t('common.error'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={`min-h-[80vh] flex flex-col items-center justify-center ${components.card} p-8 max-w-md mx-auto`}>
      <h1 className={typography.h1}>Sign Up</h1>
      <p className={typography.body + " text-text-secondary mt-2"}>Create your SellBuy account.</p>
      
      <form onSubmit={handleSubmit} className="w-full mt-8 space-y-4">
        <input type="text" placeholder="Name" value={name} onChange={e => setName(e.target.value)} className="w-full p-3 rounded-xl bg-surface border-border border" />
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-3 rounded-xl bg-surface border-border border" />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-3 rounded-xl bg-surface border-border border" />
        <input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full p-3 rounded-xl bg-surface border-border border" />
        
        {error && <p className="text-red-500 text-sm">{error}</p>}
        
        <button type="submit" disabled={loading} className={`${components.buttonPrimary} w-full`}>
          {loading ? 'Registering...' : 'Sign Up'}
        </button>
      </form>
    </div>
  );
}
