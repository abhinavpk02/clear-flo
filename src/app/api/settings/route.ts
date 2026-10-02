import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    let settings = await prisma.settings.findUnique({
      where: { id: 'default' },
    });

    if (!settings) {
      settings = await prisma.settings.create({
        data: { id: 'default' },
      });
    }

    return NextResponse.json(settings);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const {
      businessName,
      businessAddress,
      businessPhone,
      businessGstin,
      bankName,
      accountNo,
      ifscCode,
      upiId,
      qrCodeImage,
    } = body;

    const updated = await prisma.settings.upsert({
      where: { id: 'default' },
      update: {
        businessName,
        businessAddress,
        businessPhone,
        businessGstin,
        bankName,
        accountNo,
        ifscCode,
        upiId,
        qrCodeImage,
      },
      create: {
        id: 'default',
        businessName,
        businessAddress,
        businessPhone,
        businessGstin,
        bankName,
        accountNo,
        ifscCode,
        upiId,
        qrCodeImage,
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
