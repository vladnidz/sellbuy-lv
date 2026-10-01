/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { POST, GET } from '@/app/api/listings/ai-assist/route';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('AI Listing Assist API (/api/listings/ai-assist)', () => {
  it('returns 405 Method Not Allowed on GET requests', async () => {
    const res = await GET();
    expect(res.status).toBe(405);
    const json = await res.json();
    expect(json).toHaveProperty('error');
  });

  it('returns 400 Bad Request on invalid JSON body', async () => {
    const req = new NextRequest('http://localhost/api/listings/ai-assist', {
      method: 'POST',
      body: 'invalid-json-{',
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toContain('Invalid JSON');
  });

  it('returns structured category, title, risk, and price suggestions for valid payload', async () => {
    (prisma.category.findMany as jest.Mock).mockResolvedValue([
      { id: 'c1', name: 'Smartphones', nameLv: 'Viedtālruņi', nameRu: 'Смартфоны', nameEn: 'Smartphones', path: 'electronics.phones' },
      { id: 'c2', name: 'Vehicles', nameLv: 'Transportlīdzekļi', nameRu: 'Транспорт', nameEn: 'Vehicles', path: 'auto.cars' },
    ]);

    (prisma.listing.findMany as jest.Mock).mockResolvedValue([
      { price: 500 },
      { price: 550 },
      { price: 600 },
      { price: 580 },
    ]);

    const req = new NextRequest('http://localhost/api/listings/ai-assist', {
      method: 'POST',
      body: JSON.stringify({
        title: 'IPHONE 13 PRO MAX 128GB VERY GOOD CONDITION!!',
        description: 'Selling my phone in Riga',
        attributes: { brand: 'Apple', model: 'iPhone 13 Pro Max' },
        condition: 'used',
        locale: 'lv',
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const json = await res.json();

    // Verify title optimization
    expect(json.suggestedTitle).toHaveProperty('formatted');
    expect(json.suggestedTitle.templates.lv).toContain('Apple iPhone 13 Pro Max');

    // Verify category suggestion
    expect(json.suggestedCategories.length).toBeGreaterThan(0);
    expect(json.suggestedCategories[0].id).toBe('c1');
    expect(json.lowConfidenceCategory).toBe(false);

    // Verify price benchmark calculation
    expect(json.priceBenchmark.sampleSize).toBe(4);
    expect(json.priceBenchmark.lowSampleSize).toBe(false);
    expect(json.priceBenchmark.suggestedMin).toBe(500);
    expect(json.priceBenchmark.suggestedMax).toBe(600);
    expect(json.priceBenchmark.suggestedAvg).toBe(558);

    // Verify risk check
    expect(json.riskCheck.isSuspicious).toBe(false);
  });

  it('detects scam patterns and flags suspicious text', async () => {
    (prisma.category.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.listing.findMany as jest.Mock).mockResolvedValue([]);

    const req = new NextRequest('http://localhost/api/listings/ai-assist', {
      method: 'POST',
      body: JSON.stringify({
        title: 'URGENT SALE IPHONE 14',
        description: 'Contact me on whatsapp +37129123456. Kurjers atvedīs naudu priekšapmaksa ar pārskaitījumu bez apskates.',
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.riskCheck.isSuspicious).toBe(true);
    expect(json.riskCheck.riskScore).toBeGreaterThanOrEqual(40);
    expect(json.riskCheck.warnings.length).toBeGreaterThan(0);
  });

  it('handles low sample size gracefully when few listings exist', async () => {
    (prisma.category.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.listing.findMany as jest.Mock).mockResolvedValue([{ price: 100 }]);

    const req = new NextRequest('http://localhost/api/listings/ai-assist', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Rare Vintage Watch',
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.priceBenchmark.lowSampleSize).toBe(true);
    expect(json.priceBenchmark.suggestedMin).toBeNull();
  });
});
