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

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, stock, stockDelta, priceInPaise, name, category, unit, hsnCode } = body;

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const updateData: any = {};

    if (stock !== undefined && stock !== null) {
      updateData.stock = Number(stock);
    } else if (stockDelta !== undefined && stockDelta !== null) {
      updateData.stock = { increment: Number(stockDelta) };
    }

    if (priceInPaise !== undefined) updateData.priceInPaise = Number(priceInPaise);
    if (name !== undefined) updateData.name = name;
    if (category !== undefined) updateData.category = category;
    if (unit !== undefined) updateData.unit = unit;
    if (hsnCode !== undefined) updateData.hsnCode = hsnCode;

    const product = await prisma.product.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(product);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

