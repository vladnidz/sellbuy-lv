import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export const dynamic = 'force-dynamic';

const VALID_VERIFICATION_TYPES = ['smart_id', 'eparaksts', 'phone', 'email'] as const;
type VerificationType = (typeof VALID_VERIFICATION_TYPES)[number];

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const { verificationType, personalCode } = body;

    if (!verificationType || !VALID_VERIFICATION_TYPES.includes(verificationType as VerificationType)) {
      return NextResponse.json(
        {
          error: `Invalid verificationType. Must be one of: ${VALID_VERIFICATION_TYPES.join(', ')}`,
        },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const currentTypes = user.verifiedTypes || [];
    const updatedTypes = Array.from(
      new Set([...currentTypes, verificationType as string])
    );

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        isVerified: true,
        verifiedTypes: updatedTypes,
        verifiedAt: new Date(),
        ...(personalCode ? { personalCode } : {}),
      },
      select: {
        id: true,
        email: true,
        name: true,
        isVerified: true,
        verifiedTypes: true,
        verifiedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error verifying user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
