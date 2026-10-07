import { GET, POST } from '@/app/api/delivery/route';
import { NextRequest } from 'next/server';

describe('/api/delivery API endpoint', () => {
  it('GET /api/delivery returns all lockers by default', async () => {
    const req = new NextRequest('http://localhost/api/delivery');
    const res = await GET(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.lockers).toBeDefined();
    expect(json.total).toBeGreaterThan(0);
    expect(json.rates).toBeDefined();
  });

  it('GET /api/delivery filters by provider', async () => {
    const req = new NextRequest('http://localhost/api/delivery?provider=omniva');
    const res = await GET(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.lockers.every((l: { provider: string }) => l.provider === 'omniva')).toBe(true);
  });

  it('GET /api/delivery filters by search query', async () => {
    const req = new NextRequest('http://localhost/api/delivery?q=Spice');
    const res = await GET(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.lockers.length).toBeGreaterThan(0);
    expect(json.lockers[0].name).toContain('Spice');
  });

  it('POST /api/delivery calculate_cost action returns rate', async () => {
    const req = new NextRequest('http://localhost/api/delivery', {
      method: 'POST',
      body: JSON.stringify({ action: 'calculate_cost', provider: 'omniva', weightKg: 2 }),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.provider).toBe('omniva');
    expect(json.estimatedCost).toBe(2.99);
    expect(json.currency).toBe('EUR');
  });

  it('POST /api/delivery select_locker action returns selected locker details', async () => {
    const req = new NextRequest('http://localhost/api/delivery', {
      method: 'POST',
      body: JSON.stringify({ action: 'select_locker', lockerId: 'omniva-1' }),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.selectedLocker.id).toBe('omniva-1');
    expect(json.deliveryFee).toBe(2.99);
  });
});
