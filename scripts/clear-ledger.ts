import { createClient } from '@libsql/client';
import { prisma } from '../src/lib/db';

const tursoUrl = process.env.TURSO_DATABASE_URL;
const tursoToken = process.env.TURSO_AUTH_TOKEN;

async function clearLedger() {
  console.log('Clearing all transaction ledger and invoice data for a fresh start...');

  // 1. Clear local SQLite via Prisma
  try {
    const d1 = await prisma.ledgerEntry.deleteMany();
    const d2 = await prisma.invoiceItem.deleteMany();
    const d3 = await prisma.invoice.deleteMany();
    const d4 = await prisma.salaryTransaction.deleteMany();
    const d5 = await prisma.attendance.deleteMany();

    console.log(`Local DB cleared: ${d1.count} ledger entries, ${d3.count} invoices removed.`);
  } catch (err) {
    console.error('Local DB clear note:', err);
  }

  // 2. Clear Turso Cloud DB if URL provided
  if (tursoUrl && tursoToken) {
    try {
      console.log('Clearing Turso Cloud Database ledger...');
      const client = createClient({ url: tursoUrl, authToken: tursoToken });
      await client.execute('DELETE FROM LedgerEntry');
      await client.execute('DELETE FROM InvoiceItem');
      await client.execute('DELETE FROM Invoice');
      await client.execute('DELETE FROM SalaryTransaction');
      await client.execute('DELETE FROM Attendance');
      console.log('Turso Cloud DB ledger cleared successfully!');
    } catch (err) {
      console.error('Turso clear error:', err);
    }
  }

  console.log('Fresh start ready!');
}

clearLedger()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
