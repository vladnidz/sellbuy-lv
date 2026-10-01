import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export const dynamic = 'force-dynamic';

export interface AIAssistRequest {
  title?: string;
  description?: string;
  images?: string[];
  categoryId?: string;
  condition?: 'new' | 'used' | 'refurbished' | 'for_parts' | string;
  attributes?: Record<string, unknown>;
  locale?: 'lv' | 'ru' | 'en' | string;
}

export interface CategorySuggestion {
  id: string;
  name: string;
  nameLv?: string | null;
  nameRu?: string | null;
  nameEn?: string | null;
  path: string;
  confidence: number;
}

export interface TitleSuggestion {
  formatted: string;
  original: string;
  locale: string;
  templates: {
    lv: string;
    ru: string;
    en: string;
  };
}

export interface PriceBenchmark {
  suggestedMin: number | null;
  suggestedMax: number | null;
  suggestedAvg: number | null;
  sampleSize: number;
  lowSampleSize: boolean;
  currency: string;
}

export interface RiskCheck {
  riskScore: number;
  warnings: string[];
  isSuspicious: boolean;
}

export interface AIAssistResponse {
  suggestedCategories: CategorySuggestion[];
  lowConfidenceCategory: boolean;
  suggestedTitle: TitleSuggestion;
  priceBenchmark: PriceBenchmark;
  riskCheck: RiskCheck;
}

/**
 * Format string to proper title case if all-uppercase
 */
function normalizeTitleCasing(str: string): string {
  if (!str) return '';
  const trimmed = str.trim();
  // Check if string is predominantly ALL CAPS
  const letters = trimmed.replace(/[^a-zA-ZāčēģīķļņšūžĀČĒĢĪĶĻŅŠŪŽ]/g, '');
  if (letters.length > 3 && letters === letters.toUpperCase()) {
    return trimmed.toLowerCase().replace(/(^\w|\s\w)/g, (m) => m.toUpperCase());
  }
  return trimmed;
}

/**
 * Strip spam keywords, phone numbers, and fluff from titles
 */
function cleanTitleText(rawTitle: string): string {
  let cleaned = rawTitle;

  // Remove contact info patterns (phones, WhatsApp, emails)
  cleaned = cleaned.replace(/\b(\+?371\s?)?[28]\d{7}\b/g, '');
  cleaned = cleaned.replace(/\b(call|zvanīt|звонить|tel|tālr|phone|whatsapp)\s*:?\s*[\d\s+-]+\b/gi, '');
  cleaned = cleaned.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, '');

  // Remove fluff adjectives and excessive punctuation
  cleaned = cleaned.replace(/!{2,}/g, '!');
  cleaned = cleaned.replace(/\?{2,}/g, '?');
  cleaned = cleaned.replace(/\b(super|laba cena|urgent|steidzami|срочно|pārdodu|sell)\b/gi, '');

  // Clean extra spaces
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  return normalizeTitleCasing(cleaned);
}

/**
 * Perform scam/risk pattern check on user input
 */
function evaluateRisk(title: string, description: string): RiskCheck {
  const text = `${title} ${description}`.toLowerCase();
  const warnings: string[] = [];
  let riskScore = 0;

  // Pattern checks
  if (/(wire transfer|western union|crypto|usdt|bitcoin|bank transfer before|priekšapmaksa ar pārskaitījumu bez apskates)/i.test(text)) {
    riskScore += 45;
    warnings.push('Suspicious payment method or off-platform payment requested.');
  }

  if (/(whatsapp|telegram|t\.me|wa\.me|contact me on whatsapp|rakstiet whatsapp|пишите в ватсап)/i.test(text)) {
    riskScore += 25;
    warnings.push('Redirects to off-platform messaging (WhatsApp / Telegram).');
  }

  if (/(http:\/\/|https:\/\/|bit\.ly|tinyurl)/i.test(text)) {
    riskScore += 20;
    warnings.push('Contains external links or link shorteners.');
  }

  if (/(courier will bring money|kurjers atvedīs naudu|курьер привезет деньги)/i.test(text)) {
    riskScore += 40;
    warnings.push('Known courier scam phrase detected.');
  }

  return {
    riskScore: Math.min(riskScore, 100),
    warnings,
    isSuspicious: riskScore >= 40,
  };
}

export async function POST(request: NextRequest) {
  try {
    let body: AIAssistRequest;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }

    const rawTitle = body.title?.trim() || '';
    const rawDesc = body.description?.trim() || '';
    const images = Array.isArray(body.images) ? body.images : [];
    const condition = body.condition || 'used';
    const locale = body.locale || 'lv';
    const attributes = body.attributes || {};

    // 1. Risk / Fraud Check
    const riskCheck = evaluateRisk(rawTitle, rawDesc);

    // 2. Title Optimization & Per-locale templates
    const cleanedTitle = cleanTitleText(rawTitle) || 'Prece';
    const brand = typeof attributes.brand === 'string' ? attributes.brand : '';
    const model = typeof attributes.model === 'string' ? attributes.model : '';

    let templateBase = cleanedTitle;
    if (brand && model) {
      templateBase = `${brand} ${model}`;
    } else if (brand) {
      templateBase = `${brand} ${cleanedTitle}`;
    }

    const suggestedTitle: TitleSuggestion = {
      original: rawTitle,
      formatted: cleanedTitle,
      locale,
      templates: {
        lv: condition === 'new' ? `${templateBase} (Jauns)` : templateBase,
        ru: condition === 'new' ? `${templateBase} (Новый)` : templateBase,
        en: condition === 'new' ? `${templateBase} (New)` : `${templateBase} (${condition})`,
      },
    };

    // 3. Category Suggestions
    let allCategories: Array<{
      id: string;
      name: string;
      nameLv: string | null;
      nameRu: string | null;
      nameEn: string | null;
      path?: string;
    }> = [];

    try {
      const rawRes = await prisma.$queryRaw<
        Array<{
          id: string;
          name: string;
          nameLv: string | null;
          nameRu: string | null;
          nameEn: string | null;
          path: string;
        }>
      >`SELECT id, name, "nameLv", "nameRu", "nameEn", text(path) AS path FROM "Category"`;
      if (Array.isArray(rawRes) && rawRes.length > 0) {
        allCategories = rawRes;
      }
    } catch {
      // Fallback if $queryRaw is unsupported in environment or mocked in unit test
    }

    if (allCategories.length === 0) {
      const fallbackCats = await prisma.category.findMany({
        select: { id: true, name: true, nameLv: true, nameRu: true, nameEn: true },
      });
      allCategories = (fallbackCats || []).map((c) => ({
        ...c,
        path: '',
      }));
    }

    const searchTokens = `${rawTitle} ${rawDesc} ${images.join(' ')}`.toLowerCase().split(/\s+/).filter(Boolean);
    const scoredCategories: CategorySuggestion[] = [];

    for (const cat of allCategories) {
      let score = 0;
      const catNames = [cat.name, cat.nameLv, cat.nameRu, cat.nameEn, cat.path]
        .filter((n): n is string => Boolean(n))
        .map((n) => n.toLowerCase());

      for (const token of searchTokens) {
        if (token.length < 3) continue;
        for (const cName of catNames) {
          if (cName.includes(token)) score += 0.25;
          if (cName === token) score += 0.5;
        }
      }

      if (score > 0) {
        scoredCategories.push({
          id: cat.id,
          name: cat.name,
          nameLv: cat.nameLv,
          nameRu: cat.nameRu,
          nameEn: cat.nameEn,
          path: String(cat.path),
          confidence: Math.min(score, 1.0),
        });
      }
    }

    scoredCategories.sort((a, b) => b.confidence - a.confidence);
    const suggestedCategories = scoredCategories.slice(0, 3);
    const topConfidence = suggestedCategories[0]?.confidence || 0;
    const lowConfidenceCategory = topConfidence < 0.4;

    // 4. Price Estimation & Benchmarking
    const targetCategoryId = body.categoryId || suggestedCategories[0]?.id;
    let matchingListings: Array<{ price: unknown }> = [];

    if (targetCategoryId) {
      matchingListings = await prisma.listing.findMany({
        where: { categoryId: targetCategoryId },
        select: { price: true },
        take: 50,
      });
    }

    if (matchingListings.length === 0 && searchTokens.length > 0) {
      // Fallback: title search
      const keyword = searchTokens.find((t) => t.length >= 4);
      if (keyword) {
        matchingListings = await prisma.listing.findMany({
          where: { title: { contains: keyword, mode: 'insensitive' } },
          select: { price: true },
          take: 50,
        });
      }
    }

    const prices: number[] = matchingListings
      .map((l) => Number(l.price))
      .filter((p) => !isNaN(p) && p > 0)
      .sort((a, b) => a - b);

    let priceBenchmark: PriceBenchmark = {
      suggestedMin: null,
      suggestedMax: null,
      suggestedAvg: null,
      sampleSize: prices.length,
      lowSampleSize: prices.length < 3,
      currency: 'EUR',
    };

    if (prices.length >= 3) {
      const min = prices[0];
      const max = prices[prices.length - 1];
      const sum = prices.reduce((acc, curr) => acc + curr, 0);
      let avg = sum / prices.length;

      // Adjust for condition if applicable
      if (condition === 'for_parts') {
        avg *= 0.5;
      } else if (condition === 'new') {
        avg *= 1.15;
      }

      priceBenchmark = {
        suggestedMin: Math.round(min),
        suggestedMax: Math.round(max),
        suggestedAvg: Math.round(avg),
        sampleSize: prices.length,
        lowSampleSize: false,
        currency: 'EUR',
      };
    }

    const responsePayload: AIAssistResponse = {
      suggestedCategories,
      lowConfidenceCategory,
      suggestedTitle,
      priceBenchmark,
      riskCheck,
    };

    return NextResponse.json(responsePayload, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method Not Allowed. Use POST /api/listings/ai-assist with json body.' },
    { status: 405 }
  );
}
