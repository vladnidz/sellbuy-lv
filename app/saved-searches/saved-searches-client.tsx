'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bookmark, Bell, BellOff, Trash2, ArrowLeft, ExternalLink, Loader2, Search } from 'lucide-react';
import { useAuth } from '@/app/lib/auth';

interface SavedSearchItem {
  id: string;
  name: string;
  query: Record<string, string | number | boolean>;
  notifyEnabled: boolean;
  createdAt: string;
}

export default function SavedSearchesPageClient() {
  const { user } = useAuth();
  const [items, setItems] = useState<SavedSearchItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadSavedSearches() {
      setLoading(true);
      try {
        const res = await fetch('/api/saved-searches');
        if (res.ok && isMounted) {
          const data = await res.json();
          setItems(data);
        }
      } catch (err) {
        console.error('Failed to load saved searches', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    if (user) {
      loadSavedSearches();
    }
    return () => {
      isMounted = false;
    };
  }, [user]);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/saved-searches?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setItems((prev) => prev.filter((item) => item.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete saved search', err);
    } finally {
      setDeletingId(null);
    }
  };

  const constructSearchUrl = (query: Record<string, string | number | boolean>) => {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        params.set(k, String(v));
      }
    });
    return `/listings?${params.toString()}`;
  };

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8 pb-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4" style={{ borderColor: 'var(--border)' }}>
        <div>
          <Link
            href="/listings"
            className="inline-flex items-center gap-1.5 text-xs font-semibold mb-2 transition-colors hover:text-purple-400"
            style={{ color: 'var(--text-tertiary)' }}
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Atpakaļ uz sludinājumiem
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-2.5" style={{ color: 'var(--text-primary)' }}>
            <Bookmark className="w-7 h-7 text-purple-400" />
            Saglabātie meklējumi & Brīdinājumi
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            Pārvaldiet savus meklēšanas filtrus un saņemiet tūlītējus e-pasta un paziņojumu brīdinājumus par jaunumiem
          </p>
        </div>
      </div>

      {!user ? (
        <div className="rounded-2xl border p-12 text-center space-y-4" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
          <Bookmark className="w-12 h-12 mx-auto text-purple-400/50" />
          <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
            Ielogojieties, lai apskatītu saglabātos meklējumus
          </h2>
          <p className="text-xs max-w-md mx-auto" style={{ color: 'var(--text-secondary)' }}>
            Saglabājiet savus iecienītos meklēšanas parametrus un esiet pirmais, kas uzzina par jaunām izdevīgām precēm.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center px-4 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 transition-colors"
          >
            Ienākt profilā
          </Link>
        </div>
      ) : loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border p-12 text-center space-y-4" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
          <Search className="w-12 h-12 mx-auto text-gray-500" />
          <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
            Nav neviena saglabāta meklējuma
          </h2>
          <p className="text-xs max-w-md mx-auto" style={{ color: 'var(--text-secondary)' }}>
            Meklējot preces sludinājumu sadaļā, nospiediet pogu &ldquo;Saglabāt meklēšanu&rdquo;, lai pievienotu filtru šeit.
          </p>
          <Link
            href="/listings"
            className="inline-flex items-center px-4 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 transition-colors"
          >
            Pārlūkot sludinājumus
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-purple-500/40"
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderColor: 'var(--border)',
              }}
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2.5">
                  <span className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>
                    {item.name}
                  </span>
                  {item.notifyEnabled ? (
                    <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <Bell className="w-3 h-3" /> Brīdinājumi ieslēgti
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-medium bg-gray-500/10 text-gray-400 border border-gray-500/20">
                      <BellOff className="w-3 h-3" /> Bez brīdinājumiem
                    </span>
                  )}
                </div>

                {/* Filter tags preview */}
                <div className="flex flex-wrap gap-1.5 text-xs">
                  {Object.entries(item.query || {}).map(([key, val]) => (
                    <span
                      key={key}
                      className="px-2 py-0.5 rounded-md text-[11px] font-mono border"
                      style={{
                        backgroundColor: 'var(--bg-elevated)',
                        borderColor: 'var(--border)',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      {key}: <span className="font-semibold text-purple-300">{String(val)}</span>
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <Link
                  href={constructSearchUrl(item.query)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 transition-colors shadow-sm"
                >
                  <Search className="w-3.5 h-3.5" /> Skatīt rezultātus <ExternalLink className="w-3 h-3 ml-0.5" />
                </Link>
                <button
                  type="button"
                  onClick={() => handleDelete(item.id)}
                  disabled={deletingId === item.id}
                  className="p-2 rounded-xl border hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 transition-all text-gray-400 disabled:opacity-50"
                  style={{ borderColor: 'var(--border)' }}
                  title="Dzēst saglabāto meklēšanu"
                >
                  {deletingId === item.id ? (
                    <Loader2 className="w-4 h-4 animate-spin text-red-400" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
