import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST() {
  try {
    // Delete all ledger entries & salary transactions for clean ledger state
    const d1 = await prisma.ledgerEntry.deleteMany();
    const d2 = await prisma.salaryTransaction.deleteMany();

    return NextResponse.json({
      message: 'Ledger transactions cleared successfully!',
      ledgerClearedCount: d1.count,
      salaryTransactionsClearedCount: d2.count,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
