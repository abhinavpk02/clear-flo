import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const employees = await prisma.employee.findMany({
      include: {
        attendances: {
          orderBy: { date: 'desc' },
          take: 31,
        },
        salaryTransactions: {
          orderBy: { date: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(employees);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === 'CREATE_EMPLOYEE') {
      const { name, role, phone, monthlySalaryInPaise } = body;
      const emp = await prisma.employee.create({
        data: {
          name,
          role: role || 'Staff',
          phone,
          monthlySalaryInPaise: Number(monthlySalaryInPaise),
        },
      });
      return NextResponse.json(emp, { status: 201 });
    }

    if (action === 'RECORD_ATTENDANCE') {
      const { employeeId, date, status } = body;
      const targetDate = new Date(date || Date.now());
      targetDate.setHours(0, 0, 0, 0);

      // Upsert attendance for date
      const existing = await prisma.attendance.findFirst({
        where: { employeeId, date: targetDate },
      });

      let attendance;
      if (existing) {
        attendance = await prisma.attendance.update({
          where: { id: existing.id },
          data: { status },
        });
      } else {
        attendance = await prisma.attendance.create({
          data: {
            employeeId,
            date: targetDate,
            status,
          },
        });
      }
      return NextResponse.json(attendance);
    }

    if (action === 'SALARY_TRANSACTION') {
      const { employeeId, type, amountInPaise, note } = body;
      const trans = await prisma.salaryTransaction.create({
        data: {
          employeeId,
          type, // PAYMENT, ADVANCE, DEDUCTION
          amountInPaise: Number(amountInPaise),
          note,
        },
      });

      // Automatically add expense to accounting ledger if it's a salary payment or advance
      if (type === 'PAYMENT' || type === 'ADVANCE') {
        const emp = await prisma.employee.findUnique({ where: { id: employeeId } });
        await prisma.ledgerEntry.create({
          data: {
            date: new Date(),
            type: 'EXPENSE',
            category: 'SALARY',
            amountInPaise: Number(amountInPaise),
            description: `Salary ${type} - ${emp?.name || 'Staff'}`,
          },
        });
      }

      return NextResponse.json(trans, { status: 201 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
