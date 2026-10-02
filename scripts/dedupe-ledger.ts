import { createClient } from '@libsql/client';

const tursoUrl = process.env.TURSO_DATABASE_URL || 'libsql://clear-flo-abhinav02.aws-ap-south-1.turso.io';
const tursoToken = process.env.TURSO_AUTH_TOKEN || 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3OTA5MDk5NzYsImlkIjoiMDFhMGZhOGQtMTkwMS03MzI2LTgxMTEtZDMyMjZlNDdlMjZiIiwia2lkIjoiY2RHN3VHbE5YbU1QOUlLc0wxWkItRUhqM0k3Q3hkd04xNDVxRHJiT0NwSSIsInJpZCI6Ijk4ZTA0OThmLWU4Y2MtNGJmNy05YTJlLTQzYmY3Y2U2N2JkNSJ9.gI4Gnq8Ih5rQtX9lf-lOVPbsEBTqhurResNGQtEqXhBcrFtLkqs7Kd8Lc5Aj8u0h1VLIXDlZbJrLPYkw32KDDw';

async function cleanupDuplicates() {
  console.log('Cleaning up duplicate salary transactions on Turso...');
  const client = createClient({ url: tursoUrl, authToken: tursoToken });

  // Delete all duplicate ledger entries & salary transactions
  await client.execute('DELETE FROM LedgerEntry');
  await client.execute('DELETE FROM SalaryTransaction');

  console.log('Duplicate transactions cleaned up successfully!');
}

cleanupDuplicates().catch(console.error);
