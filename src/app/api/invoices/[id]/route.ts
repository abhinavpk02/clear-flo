import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { calculateKeralaGST } from '@/lib/money';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    return NextResponse.json(invoice);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const {
      customerName,
      customerPhone,
      customerLocation,
      customerGstin,
      orderType,
      paymentMethod,
      notes,
      items, // updated items list
    } = body;

    // Calculate updated subtotal
    let subtotalInPaise = 0;
    const processedItems = items ? items.map((item: any) => {
      const itemTotal = Number(item.unitPriceInPaise) * Number(item.quantity);
      subtotalInPaise += itemTotal;
      return {
        productName: item.productName,
        unit: item.unit || '5L',
        unitPriceInPaise: Number(item.unitPriceInPaise),
        quantity: Number(item.quantity),
        totalInPaise: itemTotal,
      };
    }) : [];

    const { cgstInPaise, sgstInPaise, totalInPaise } = calculateKeralaGST(subtotalInPaise);

    // Delete existing items & recreate updated items
    if (items) {
      await prisma.invoiceItem.deleteMany({
        where: { invoiceId: id },
      });
    }

    const updatedInvoice = await prisma.invoice.update({
      where: { id },
      data: {
        customerName,
        customerPhone,
        customerLocation,
        customerGstin,
        orderType,
        paymentMethod,
        notes,
        subtotalInPaise,
        cgstInPaise,
        sgstInPaise,
        totalInPaise,
        ...(items && {
          items: {
            create: processedItems,
          },
        }),
      },
      include: { items: true },
    });

    // Sync updated amount in Ledger
    await prisma.ledgerEntry.updateMany({
      where: { invoiceId: id },
      data: {
        amountInPaise: totalInPaise,
        description: `Sale Invoice ${updatedInvoice.invoiceNumber} - ${customerName}`,
      },
    });

    return NextResponse.json(updatedInvoice);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
