'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/lib/auth';
import { useLocale } from '@/app/lib/locale-context';

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
      await login(data.user.email, data.user.name);
      router.push('/');
    } catch {
      setError(t('common.error'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Link href="/" className="text-lg font-bold bg-gradient-to-r from-[#7c5aed] to-[#a78bfa] bg-clip-text text-transparent">SellBuy.lv</Link>
          <h1 className="mt-4 text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>{t('auth.register_title')}</h1>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg p-3 text-sm border" style={{ backgroundColor: 'var(--error-bg)', borderColor: 'var(--error-border)', color: 'var(--error-text)' }}>{error}</div>
          )}
          <div>
            <label htmlFor="name" className="block text-xs mb-1.5" style={{ color: 'var(--text-tertiary)' }}>{t('auth.name')}</label>
            <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder={t('auth.name')}
              className="w-full border rounded-lg px-3.5 py-2.5 text-sm outline-none transition-colors"
              style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)', color: 'var(--text-primary)' }} />
          </div>
          <div>
            <label htmlFor="email" className="block text-xs mb-1.5" style={{ color: 'var(--text-tertiary)' }}>{t('auth.email')}</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jusu@epasts.lv" required
              className="w-full border rounded-lg px-3.5 py-2.5 text-sm outline-none transition-colors"
              style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)', color: 'var(--text-primary)' }} />
          </div>
          <div>
            <label htmlFor="password" className="block text-xs mb-1.5" style={{ color: 'var(--text-tertiary)' }}>{t('auth.password')}</label>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required
              className="w-full border rounded-lg px-3.5 py-2.5 text-sm outline-none transition-colors"
              style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)', color: 'var(--text-primary)' }} />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-xs mb-1.5" style={{ color: 'var(--text-tertiary)' }}>{t('auth.confirm_password')}</label>
            <input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" required
              className="w-full border rounded-lg px-3.5 py-2.5 text-sm outline-none transition-colors"
              style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)', color: 'var(--text-primary)' }} />
          </div>
          <button type="submit" disabled={loading}
            className="w-full text-white text-sm font-medium rounded-lg py-2.5 transition-colors disabled:opacity-50"
            style={{ backgroundColor: 'var(--accent)' }}>
            {loading ? t('auth.registering') : t('auth.register_btn')}
          </button>
        </form>
        <p className="mt-6 text-center text-sm" style={{ color: 'var(--text-tertiary)' }}>
          {t('auth.has_account')}{' '}
          <Link href="/login" className="transition-colors" style={{ color: 'var(--accent-text)' }}>{t('auth.login_btn')}</Link>
        </p>
      </div>
    </div>
  );
}
