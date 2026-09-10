'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/lib/auth';
import { useLocale } from '@/app/lib/locale-context';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();
  const { t } = useLocale();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
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
          <h1 className="mt-4 text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>{t('auth.login_title')}</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-tertiary)' }}>{t('auth.email')} + {t('auth.password').toLowerCase()}</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg p-3 text-sm border" style={{ backgroundColor: 'var(--error-bg)', borderColor: 'var(--error-border)', color: 'var(--error-text)' }}>{error}</div>
          )}
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
          <button type="submit" disabled={loading}
            className="w-full text-white text-sm font-medium rounded-lg py-2.5 transition-colors disabled:opacity-50"
            style={{ backgroundColor: 'var(--accent)' }}>
            {loading ? t('auth.logging_in') : t('auth.login_btn')}
          </button>
        </form>
        <p className="mt-6 text-center text-sm" style={{ color: 'var(--text-tertiary)' }}>
          {t('auth.no_account')}{' '}
          <Link href="/register" className="transition-colors" style={{ color: 'var(--accent-text)' }}>{t('auth.register_btn')}</Link>
        </p>
      </div>
    </div>
  );
}
