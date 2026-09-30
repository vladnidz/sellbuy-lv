'use client';

import { ShieldCheck, CheckCircle2, Award, Smartphone } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export type VerificationType = 'smart_id' | 'eparaksts' | 'phone' | 'email';

export interface VerificationBadgeProps {
  type: VerificationType;
  verifiedAt?: string | Date;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const VERIFICATION_CONFIG: Record<
  VerificationType,
  {
    label: Record<'lv' | 'ru' | 'en', string>;
    icon: React.ElementType;
    badgeStyle: string;
  }
> = {
  smart_id: {
    label: {
      lv: 'Smart-ID Verificēts',
      ru: 'Smart-ID Верифицирован',
      en: 'Smart-ID Verified',
    },
    icon: ShieldCheck,
    badgeStyle:
      'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20',
  },
  eparaksts: {
    label: {
      lv: 'eParaksts Verificēts',
      ru: 'eParaksts Верифицирован',
      en: 'eParaksts Verified',
    },
    icon: Award,
    badgeStyle:
      'bg-purple-500/10 text-purple-400 border-purple-500/30 hover:bg-purple-500/20',
  },
  phone: {
    label: {
      lv: 'Tālrunis Apstiprināts',
      ru: 'Телефон Подтвержден',
      en: 'Phone Verified',
    },
    icon: Smartphone,
    badgeStyle:
      'bg-blue-500/10 text-blue-400 border-blue-500/30 hover:bg-blue-500/20',
  },
  email: {
    label: {
      lv: 'E-pasts Apstiprināts',
      ru: 'E-mail Подтвержден',
      en: 'Email Verified',
    },
    icon: CheckCircle2,
    badgeStyle:
      'bg-zinc-500/10 text-zinc-400 border-zinc-500/30 hover:bg-zinc-500/20',
  },
};

export function VerificationBadge({
  type,
  size = 'md',
  showLabel = true,
}: VerificationBadgeProps) {
  const config = VERIFICATION_CONFIG[type] || VERIFICATION_CONFIG.email;
  const Icon = config.icon;

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const badgeSizes = {
    sm: 'px-1.5 py-0.5 text-[10px] gap-1',
    md: 'px-2 py-1 text-xs gap-1.5',
    lg: 'px-2.5 py-1.5 text-sm gap-2',
  };

  return (
    <Badge
      variant="outline"
      className={`inline-flex items-center font-medium transition-colors border ${config.badgeStyle} ${badgeSizes[size]}`}
      title={config.label.lv}
    >
      <Icon className={iconSizes[size]} />
      {showLabel && <span>{config.label.lv}</span>}
    </Badge>
  );
}
