import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(products);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, category, unit, priceInPaise, stock, hsnCode, iconName, description } = body;

    const product = await prisma.product.create({
      data: {
        name,
        category: category || 'Liquid Detergent',
        unit: unit || '5L',
        priceInPaise: Number(priceInPaise),
        stock: Number(stock || 100),
        hsnCode: hsnCode || '3402',
        iconName: iconName || 'Sparkles',
        description,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
