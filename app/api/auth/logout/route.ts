import { NextResponse } from 'next/server';
import { clearAuthCookie } from '@/app/lib/auth-server';

export const dynamic = 'force-dynamic';

export async function POST() {
  const response = NextResponse.json({ message: 'Logged out successfully' });
  clearAuthCookie(response);
  return response;
}
