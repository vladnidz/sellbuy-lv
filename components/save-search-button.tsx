'use client';

import { useState } from 'react';
import { Bookmark, BookmarkCheck, Bell, BellOff, Loader2 } from 'lucide-react';
import { useAuth } from '@/app/lib/auth';
import { useLocale } from '@/app/lib/locale-context';

interface SaveSearchButtonProps {
  currentFilters: {
    q?: string;
    category?: string;
    city?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
  };
}

export function SaveSearchButton({ currentFilters }: SaveSearchButtonProps) {
  const { user } = useAuth();
  const { t } = useLocale();
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [notifyEnabled, setNotifyEnabled] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Derive default search label from filters
  const defaultName =
    currentFilters.q
      ? `${currentFilters.q}${currentFilters.city ? ` (${currentFilters.city})` : ''}`
      : currentFilters.category
      ? `Kategorija: ${currentFilters.category}`
      : 'Mani meklēšanas filtri';

  const handleOpen = () => {
    if (!name) setName(defaultName);
    setIsOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError(t('auth.login_required') || 'Lūdzu, ielogojieties, lai saglabātu meklēšanu');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const res = await fetch('/api/saved-searches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim() || defaultName,
          query: currentFilters,
          notifyEnabled,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Neizdevās saglabāt meklēšanu');
      }

      setSaved(true);
      setTimeout(() => {
        setIsOpen(false);
        setSaved(false);
      }, 1500);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Radās kļūda');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={handleOpen}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all hover:bg-purple-500/10 hover:border-purple-500/40"
        style={{
          borderColor: 'var(--border)',
          backgroundColor: 'var(--bg-surface)',
          color: 'var(--text-primary)',
        }}
        title="Saglabāt meklēšanu un saņemt paziņojumus"
      >
        <Bookmark className="w-3.5 h-3.5 text-purple-400" />
        <span>Saglabāt meklēšanu</span>
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl border p-5 shadow-2xl relative space-y-4"
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderColor: 'var(--border)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <Bookmark className="w-4 h-4 text-purple-400" />
                Saglabāt meklēšanas filtrus
              </h3>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-xs hover:text-red-400"
                style={{ color: 'var(--text-tertiary)' }}
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="p-2.5 rounded-lg text-xs bg-red-500/10 border border-red-500/20 text-red-400">
                {error}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Nosaukums
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={defaultName}
                  className="w-full px-3 py-2 rounded-xl text-xs border bg-transparent focus:outline-none focus:ring-1 focus:ring-purple-500"
                  style={{
                    borderColor: 'var(--border)',
                    color: 'var(--text-primary)',
                  }}
                  required
                />
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl border" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-elevated)' }}>
                <div className="flex items-center gap-2">
                  {notifyEnabled ? (
                    <Bell className="w-4 h-4 text-purple-400" />
                  ) : (
                    <BellOff className="w-4 h-4 text-gray-400" />
                  )}
                  <div>
                    <div className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                      Paziņojumi
                    </div>
                    <div className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
                      Saņemt ziņu par jauniem sludinājumiem
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={notifyEnabled}
                  onChange={(e) => setNotifyEnabled(e.target.checked)}
                  className="rounded border-gray-600 text-purple-600 focus:ring-purple-500 h-4 w-4"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold border hover:bg-[var(--surface)]"
                  style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
                >
                  Atcelt
                </button>
                <button
                  type="submit"
                  disabled={saving || saved}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 transition-colors shadow-sm disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saglabā...
                    </>
                  ) : saved ? (
                    <>
                      <BookmarkCheck className="w-3.5 h-3.5 text-emerald-300" /> Saglabāts!
                    </>
                  ) : (
                    'Saglabāt'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
