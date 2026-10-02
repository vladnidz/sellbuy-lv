import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, categoryId } = body || {};

    if (!title || typeof title !== 'string' || !title.trim()) {
      return NextResponse.json(
        { error: 'Nosaukums ir obligāts AI aizpildei' },
        { status: 400 }
      );
    }

    const cleanTitle = title.trim();

    // Search for closest matching category in DB if categoryId not provided
    let suggestedCategoryId = categoryId;
    if (!suggestedCategoryId) {
      const matchedCategory = await prisma.category.findFirst({
        where: {
          OR: [
            { name: { contains: cleanTitle, mode: 'insensitive' } },
            { nameLv: { contains: cleanTitle, mode: 'insensitive' } },
          ],
        },
      });
      if (matchedCategory) {
        suggestedCategoryId = matchedCategory.id;
      }
    }

    // Benchmark average price in category if category exists
    let priceBenchmark: { avg: number; min: number; max: number } | null = null;
    if (suggestedCategoryId) {
      const stats = await prisma.listing.aggregate({
        where: { categoryId: suggestedCategoryId },
        _avg: { price: true },
        _min: { price: true },
        _max: { price: true },
      });
      if (stats._avg.price) {
        priceBenchmark = {
          avg: Math.round(Number(stats._avg.price)),
          min: Math.round(Number(stats._min.price || 0)),
          max: Math.round(Number(stats._max.price || 0)),
        };
      }
    }

    // AI generated Latvian description template based on item title
    const generatedDescription =
      `Pārdodu: ${cleanTitle}.\n\n` +
      `• Stāvoklis: Lieliskā vizuālā un tehniskā stāvoklī, rūpīgi lietots.\n` +
      `• Komplektācija: Pilns oriģinālais komplekts.\n` +
      `• Piegāde: Iespējama klātienē vai nosūtīšana caur Omniva / DPD pakomātu.\n\n` +
      `Droši rakstiet vai zvaniet, lai vienotos par pirkumu!`;

    return NextResponse.json({
      title: cleanTitle,
      description: generatedDescription,
      categoryId: suggestedCategoryId || undefined,
      priceBenchmark,
    });
  } catch (error) {
    console.error('POST /api/ai/listing-autofill error:', error);
    return NextResponse.json(
      { error: 'Neizdevās apstrādāt AI pieprasījumu' },
      { status: 500 }
    );
  }
}
