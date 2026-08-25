import { Skeleton } from '@/components/ui/skeleton';

/**
 * Route-level loading UI for /listings. Shown during server rendering while
 * filters/results are being fetched.
 */
export default function ListingsLoading() {
  return (
    <main className="min-h-screen bg-slate-950">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <Skeleton className="h-10 w-72 mb-4" />
        <Skeleton className="h-5 w-96 mb-8" />

        {/* Search bar */}
        <div className="flex gap-4 mb-8">
          <Skeleton className="h-12 flex-1" />
          <Skeleton className="h-12 w-36" />
        </div>

        {/* Filter row */}
        <div className="flex flex-col md:flex-row gap-4 mb-8 p-4 bg-slate-900/30 border border-slate-800 rounded-xl">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex-1 space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>

        {/* Results count */}
        <Skeleton className="h-5 w-48 mb-6" />

        {/* Listing grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-slate-800 overflow-hidden">
              <Skeleton className="aspect-square rounded-none" />
              <div className="p-4 space-y-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-6 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
