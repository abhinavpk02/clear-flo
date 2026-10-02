import { createClient } from '@libsql/client';

const tursoUrl = process.env.TURSO_DATABASE_URL || 'libsql://clear-flo-abhinav02.aws-ap-south-1.turso.io';
const tursoToken = process.env.TURSO_AUTH_TOKEN || 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3OTA5MDk5NzYsImlkIjoiMDFhMGZhOGQtMTkwMS03MzI2LTgxMTEtZDMyMjZlNDdlMjZiIiwia2lkIjoiY2RHN3VHbE5YbU1QOUlLc0wxWkItRUhqM0k3Q3hkd04xNDVxRHJiT0NwSSIsInJpZCI6Ijk4ZTA0OThmLWU4Y2MtNGJmNy05YTJlLTQzYmY3Y2U2N2JkNSJ9.gI4Gnq8Ih5rQtX9lf-lOVPbsEBTqhurResNGQtEqXhBcrFtLkqs7Kd8Lc5Aj8u0h1VLIXDlZbJrLPYkw32KDDw';

async function resetLedger() {
  console.log('Resetting ledger transactions across databases...');

  try {
    const client = createClient({ url: tursoUrl, authToken: tursoToken });
    await client.execute('DELETE FROM LedgerEntry');
    await client.execute('DELETE FROM InvoiceItem');
    await client.execute('DELETE FROM Invoice');
    await client.execute('DELETE FROM SalaryTransaction');
    await client.execute('DELETE FROM Attendance');
    console.log('Successfully cleared all ledger entries and invoices from Turso Cloud Database!');
  } catch (err) {
    console.error('Turso clear error:', err);
  }
}

resetLedger();
