import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { calculateKeralaGST } from '@/lib/money';

export async function GET() {
  try {
    const invoices = await prisma.invoice.findMany({
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(invoices);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      customerName,
      customerPhone,
      customerLocation,
      customerGstin,
      orderType = 'DELIVERY',
      paymentMethod = 'UPI',
      notes,
      items, // array of { productId, productName, unit, unitPriceInPaise, quantity }
    } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Invoice must contain at least one item' }, { status: 400 });
    }

    // Compute subtotal in paise
    let subtotalInPaise = 0;
    const processedItems = items.map((item: any) => {
      const itemTotal = item.unitPriceInPaise * item.quantity;
      subtotalInPaise += itemTotal;
      return {
        productId: item.productId || null,
        productName: item.productName,
        unit: item.unit || '5L',
        unitPriceInPaise: item.unitPriceInPaise,
        quantity: item.quantity,
        totalInPaise: itemTotal,
      };
    });

    // Calculate Kerala 18% GST (9% CGST + 9% SGST)
    const { cgstInPaise, sgstInPaise, totalInPaise } = calculateKeralaGST(subtotalInPaise);

    // Generate Invoice Number (INV-YYYY-XXXX)
    const count = await prisma.invoice.count();
    const year = new Date().getFullYear();
    const invoiceNumber = `INV-${year}-${(count + 1).toString().padStart(4, '0')}`;

    // Create Invoice with nested items
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        customerName: customerName || 'Walk-in Customer',
        customerPhone,
        customerLocation: customerLocation || 'Local Store',
        customerGstin,
        orderType,
        paymentMethod,
        paymentStatus: 'PAID',
        subtotalInPaise,
        cgstInPaise,
        sgstInPaise,
        totalInPaise,
        notes,
        items: {
          create: processedItems,
        },
      },
      include: { items: true },
    });

    // Automatically record sales revenue in Ledger (Tally-lite)
    await prisma.ledgerEntry.create({
      data: {
        date: new Date(),
        type: 'INCOME',
        category: 'SALES',
        amountInPaise: totalInPaise,
        description: `Sale Invoice ${invoiceNumber} - ${customerName}`,
        invoiceId: invoice.id,
      },
    });

    // Update Product Stock
    for (const item of items) {
      if (item.productId) {
        await prisma.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        }).catch(() => {
          // ignore if product missing
        });
      }
    }

    return NextResponse.json(invoice, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
