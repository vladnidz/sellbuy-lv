import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
}

/**
 * Reusable empty-state for lists with no results. Glassmorphic card,
 * minimal Pro Max styling consistent with /listings.
 */
export function EmptyState({
  icon = '🔍',
  title,
  description,
  actionLabel,
  actionHref,
}: EmptyStateProps) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm px-8 py-20 text-center">
      <div className="text-6xl mb-4 opacity-80" aria-hidden>
        {icon}
      </div>
      <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
      {description && <p className="text-slate-400 mb-6 max-w-md mx-auto">{description}</p>}
      {actionLabel && actionHref && (
        <Link href={actionHref}>
          <Button className="bg-blue-600 hover:bg-blue-700">{actionLabel}</Button>
        </Link>
      )}
    </div>
  );
}
