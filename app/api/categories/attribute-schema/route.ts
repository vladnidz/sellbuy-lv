import { NextRequest, NextResponse } from 'next/server';
import { getTaxonomy } from '@/app/lib/taxonomy';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const categoryParam = searchParams.get('category');
  
  const taxonomy = getTaxonomy();
  
  if (categoryParam) {
    const category = Object.keys(taxonomy).find(c => c.toLowerCase() === categoryParam.toLowerCase());
    if (category) {
      return NextResponse.json(taxonomy[category]);
    }
    return NextResponse.json({ error: 'Category not found' }, { status: 404 });
  }

  return NextResponse.json(taxonomy);
}
