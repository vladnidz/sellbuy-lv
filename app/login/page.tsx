'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
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

      if (!res.ok) {
        setError(data.error || 'Nepareizs e-pasts vai parole');
        return;
      }

      await login(data.email, data.name || undefined);
      router.push('/');
    } catch {
      setError('Tīkla kļūda. Lūdzu, mēģiniet vēlreiz.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 bg-[#0a0a0f]">
      <div className="w-full max-w-md bg-[#12121a] border border-[#1f1f2e] rounded-2xl p-8">
        <h1 className="text-2xl font-semibold text-[#f0f0f5] mb-2">Ieiet</h1>
        <p className="text-[15px] text-[#8888a0] mb-8">Ievadiet savu e-pastu un paroli</p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-sm text-red-400 mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[15px] text-[#8888a0] mb-1.5">E-pasts</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jusu@epasts.lv"
              required
              className="w-full bg-[#12121a] border border-[#1f1f2e] rounded-xl px-4 py-3 text-[#f0f0f5] focus:border-[#7c3aed] outline-none transition"
            />
          </div>
          <div>
            <label className="block text-[15px] text-[#8888a0] mb-1.5">Parole</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full bg-[#12121a] border border-[#1f1f2e] rounded-xl px-4 py-3 text-[#f0f0f5] focus:border-[#7c3aed] outline-none transition"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#7c3aed] hover:bg-[#6d28d9] text-white rounded-xl py-3 font-semibold transition"
          >
            {loading ? 'Notiek ielāde...' : 'Ieiet'}
          </button>
        </form>

        <p className="text-[15px] text-[#8888a0] mt-6 text-center">
          Nav konts?{' '}
          <Link href="/register" className="text-[#a78bfa] hover:underline">
            Reģistrēties
          </Link>
        </p>
      </div>
    </div>
  );
}
