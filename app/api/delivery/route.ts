import { NextRequest, NextResponse } from 'next/server';
import { LATVIAN_LOCKERS, LockerProvider } from '@/components/locker-picker';

export const dynamic = 'force-dynamic';

const DELIVERY_RATES: Record<LockerProvider, { baseRate: number; name: string }> = {
  omniva: { baseRate: 2.99, name: 'Omniva Pakomāts' },
  dpd: { baseRate: 2.49, name: 'DPD Pickup Paku Skapis' },
  pasts: { baseRate: 1.99, name: 'Latvijas Pasts Pakomāts' },
};

/**
 * GET /api/delivery
 * Query params:
 *   provider=omniva|dpd|pasts|all
 *   city=string
 *   q=search query
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const provider = searchParams.get('provider') || 'all';
    const city = searchParams.get('city');
    const q = searchParams.get('q');

    if (provider !== 'all' && !['omniva', 'dpd', 'pasts'].includes(provider)) {
      return NextResponse.json(
        { error: 'Invalid provider. Supported values: omniva, dpd, pasts, all' },
        { status: 400 }
      );
    }

    let results = LATVIAN_LOCKERS;

    if (provider !== 'all') {
      results = results.filter((locker) => locker.provider === provider);
    }

    if (city) {
      const cityLower = city.toLowerCase().trim();
      results = results.filter((locker) => locker.city.toLowerCase() === cityLower);
    }

    if (q) {
      const queryLower = q.toLowerCase().trim();
      results = results.filter(
        (locker) =>
          locker.name.toLowerCase().includes(queryLower) ||
          locker.city.toLowerCase().includes(queryLower) ||
          locker.address.toLowerCase().includes(queryLower)
      );
    }

    return NextResponse.json({
      lockers: results,
      total: results.length,
      rates: DELIVERY_RATES,
    });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error while fetching delivery lockers' },
      { status: 500 }
    );
  }
}

interface SelectLockerRequestBody {
  action?: 'calculate_cost' | 'select_locker';
  provider?: LockerProvider;
  lockerId?: string;
  weightKg?: number;
}

/**
 * POST /api/delivery
 * Body: { action: 'calculate_cost' | 'select_locker', provider?: string, lockerId?: string, weightKg?: number }
 */
export async function POST(request: NextRequest) {
  try {
    const body: SelectLockerRequestBody = await request.json();
    const { action = 'calculate_cost', provider, lockerId, weightKg = 1.0 } = body;

    if (action === 'calculate_cost') {
      if (!provider || !['omniva', 'dpd', 'pasts'].includes(provider)) {
        return NextResponse.json(
          { error: 'Valid provider (omniva, dpd, pasts) is required for cost calculation' },
          { status: 400 }
        );
      }

      const rateConfig = DELIVERY_RATES[provider];
      const estimatedCost = Number(
        (rateConfig.baseRate + (weightKg > 5 ? (weightKg - 5) * 0.5 : 0)).toFixed(2)
      );

      return NextResponse.json({
        provider,
        providerName: rateConfig.name,
        estimatedCost,
        currency: 'EUR',
        estimatedDays: provider === 'omniva' ? '1-2' : provider === 'dpd' ? '1-2' : '2-3',
      });
    }

    if (action === 'select_locker') {
      if (!lockerId) {
        return NextResponse.json(
          { error: 'lockerId is required to select a locker' },
          { status: 400 }
        );
      }

      const locker = LATVIAN_LOCKERS.find((l) => l.id === lockerId);
      if (!locker) {
        return NextResponse.json({ error: 'Locker not found' }, { status: 404 });
      }

      const rateConfig = DELIVERY_RATES[locker.provider];

      return NextResponse.json({
        success: true,
        selectedLocker: locker,
        deliveryFee: rateConfig.baseRate,
        currency: 'EUR',
      });
    }

    return NextResponse.json(
      { error: 'Invalid action. Supported actions: calculate_cost, select_locker' },
      { status: 400 }
    );
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}
