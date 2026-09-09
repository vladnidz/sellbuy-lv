'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/lib/auth';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Parolei jābūt vismaz 6 simbolus garai');
      return;
    }
    if (password !== confirmPassword) {
      setError('Paroles nesakrīt');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Neizdevās reģistrēties');
        return;
      }

      await login(data.user.email, data.user.name);
      router.push('/');
    } catch {
      setError('Radās kļūda. Mēģiniet vēlreiz.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Link href="/" className="text-lg font-semibold text-[#e8e8ed] tracking-tight">
            Sell<span className="text-[#7c5aed]">Buy</span>.lv
          </Link>
          <h1 className="mt-4 text-xl font-semibold text-[#e8e8ed]">Reģistrēties</h1>
          <p className="mt-1 text-sm text-[#6a6a7a]">Izveidojiet savu kontu</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-[#2a1a1a] border border-[#3a2020] rounded-lg p-3 text-sm text-[#e0a0a0]">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="name" className="block text-xs text-[#6a6a7a] mb-1.5">Vārds</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jūsu vārds"
              className="w-full bg-[#12121a] border border-[#1e1e2a] rounded-lg px-3.5 py-2.5 text-sm text-[#e8e8ed] placeholder:text-[#4a4a5a] outline-none focus:border-[#7c5aed] transition-colors"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-xs text-[#6a6a7a] mb-1.5">E-pasts</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jusu@epasts.lv"
              required
              className="w-full bg-[#12121a] border border-[#1e1e2a] rounded-lg px-3.5 py-2.5 text-sm text-[#e8e8ed] placeholder:text-[#4a4a5a] outline-none focus:border-[#7c5aed] transition-colors"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-xs text-[#6a6a7a] mb-1.5">Parole</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Vismaz 6 simboli"
              required
              className="w-full bg-[#12121a] border border-[#1e1e2a] rounded-lg px-3.5 py-2.5 text-sm text-[#e8e8ed] placeholder:text-[#4a4a5a] outline-none focus:border-[#7c5aed] transition-colors"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-xs text-[#6a6a7a] mb-1.5">Apstiprināt paroli</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Atkārtojiet paroli"
              required
              className="w-full bg-[#12121a] border border-[#1e1e2a] rounded-lg px-3.5 py-2.5 text-sm text-[#e8e8ed] placeholder:text-[#4a4a5a] outline-none focus:border-[#7c5aed] transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#7c5aed] hover:bg-[#6a4bd4] disabled:opacity-50 text-white text-sm font-medium rounded-lg py-2.5 transition-colors"
          >
            {loading ? 'Reģistrējas...' : 'Reģistrēties'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[#6a6a7a]">
          Jau ir konts?{' '}
          <Link href="/login" className="text-[#a78bfa] hover:text-[#7c5aed] transition-colors">Ieiet</Link>
        </p>
      </div>
    </div>
  );
}
