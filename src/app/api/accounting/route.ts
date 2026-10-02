import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const entries = await prisma.ledgerEntry.findMany({
      orderBy: { date: 'desc' },
    });

    // Calculate total income, total expense, and net profit
    let totalIncomePaise = 0;
    let totalExpensePaise = 0;

    const categoryBreakdown: Record<string, number> = {};

    entries.forEach((e) => {
      if (e.type === 'INCOME') {
        totalIncomePaise += e.amountInPaise;
      } else {
        totalExpensePaise += e.amountInPaise;
      }

      categoryBreakdown[e.category] = (categoryBreakdown[e.category] || 0) + e.amountInPaise;
    });

    const netProfitPaise = totalIncomePaise - totalExpensePaise;

    return NextResponse.json({
      entries,
      summary: {
        totalIncomePaise,
        totalExpensePaise,
        netProfitPaise,
        categoryBreakdown,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, category, amountInPaise, description, date } = body;

    const entry = await prisma.ledgerEntry.create({
      data: {
        type: type || 'EXPENSE',
        category: category || 'OTHER',
        amountInPaise: Number(amountInPaise),
        description,
        date: date ? new Date(date) : new Date(),
      },
    });

    return NextResponse.json(entry, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
