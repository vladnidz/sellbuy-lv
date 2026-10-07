import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export const dynamic = 'force-dynamic';

const VALID_TYPES = ['smart_id', 'eparaksts', 'phone', 'email'] as const;
type VerificationType = (typeof VALID_TYPES)[number];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'Trūkst userId parametra' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        isVerified: true,
        verifiedTypes: true,
        verifiedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Lietotājs nav atrasts' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      userId: user.id,
      isVerified: user.isVerified,
      verifiedTypes: user.verifiedTypes,
      verifiedAt: user.verifiedAt,
      availableMethods: VALID_TYPES.filter(
        (type) => !user.verifiedTypes.includes(type)
      ),
    });
  } catch (error) {
    console.error('Kļūda iegūstot verifikācijas statusu:', error);
    return NextResponse.json(
      { error: 'Servera kļūda' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, type, personalCode } = body;

    if (!userId || !type) {
      return NextResponse.json(
        { error: 'Obligāti lauki: userId un type' },
        { status: 400 }
      );
    }

    if (!VALID_TYPES.includes(type as VerificationType)) {
      return NextResponse.json(
        { error: 'Nederīgs verifikācijas veids' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Lietotājs nav atrasts' },
        { status: 404 }
      );
    }

    const currentTypes = user.verifiedTypes || [];
    const updatedTypes = currentTypes.includes(type)
      ? currentTypes
      : [...currentTypes, type];

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        isVerified: true,
        verifiedTypes: updatedTypes,
        verifiedAt: new Date(),
        ...(personalCode ? { personalCode } : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
        isVerified: true,
        verifiedTypes: true,
        verifiedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: `Veiksmīgi apstiprināts ar ${type}`,
    });
  } catch (error) {
    console.error('Kļūda veicot verifikāciju:', error);
    return NextResponse.json(
      { error: 'Servera kļūda veicot verifikāciju' },
      { status: 500 }
    );
  }
}
