'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface FilterSelectProps {
  /** Label rendered above the select. */
  label: string;
  /** Accessible label for screen readers when the visual label is omitted. */
  ariaLabel?: string;
  /** Query param name this control writes to (e.g. "category", "sort"). */
  param: string;
  value: string;
  placeholder?: string;
  options: { value: string; label: string }[];
  className?: string;
}

/**
 * A select bound to a single URL query param on /listings. Changing the value
 * performs a soft navigation via router.push so filtered views stay shareable
 * and back/forward work, without a full page reload.
 */
export function FilterSelect({
  label,
  ariaLabel,
  param,
  value,
  placeholder,
  options,
  className,
}: FilterSelectProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleChange = (next: string) => {
    const params = new URLSearchParams(window.location.search);
    if (next) params.set(param, next);
    else params.delete(param);
    params.delete('page'); // reset pagination on any filter change
    startTransition(() => {
      router.push(`/listings?${params.toString()}`, { scroll: false });
    });
  };

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-slate-300 mb-2">
          {label}
        </label>
      )}
      <Select value={value} onValueChange={handleChange} disabled={isPending}>
        <SelectTrigger
          aria-label={ariaLabel ?? label}
          className="bg-slate-900 border-slate-700 data-[state=open]:border-blue-500/60"
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="bg-slate-900 border-slate-700">
          {placeholder && <SelectItem value="">{placeholder}</SelectItem>}
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
