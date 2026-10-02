import { createClient } from '@libsql/client';

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  console.error('Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN');
  process.exit(1);
}

const client = createClient({ url, authToken });

const ddl = [
  `CREATE TABLE IF NOT EXISTS Product (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'Liquid Detergent',
    unit TEXT NOT NULL DEFAULT '5L',
    priceInPaise INTEGER NOT NULL,
    stock INTEGER NOT NULL DEFAULT 100,
    hsnCode TEXT NOT NULL DEFAULT '3402',
    iconName TEXT NOT NULL DEFAULT 'Sparkles',
    description TEXT,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS Customer (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    location TEXT NOT NULL,
    gstin TEXT,
    balanceInPaise INTEGER NOT NULL DEFAULT 0,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS Invoice (
    id TEXT PRIMARY KEY,
    invoiceNumber TEXT UNIQUE NOT NULL,
    date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    customerName TEXT NOT NULL,
    customerPhone TEXT,
    customerLocation TEXT NOT NULL,
    customerGstin TEXT,
    orderType TEXT NOT NULL DEFAULT 'DELIVERY',
    paymentMethod TEXT NOT NULL DEFAULT 'UPI',
    paymentStatus TEXT NOT NULL DEFAULT 'PAID',
    subtotalInPaise INTEGER NOT NULL,
    cgstInPaise INTEGER NOT NULL,
    sgstInPaise INTEGER NOT NULL,
    totalInPaise INTEGER NOT NULL,
    notes TEXT,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS InvoiceItem (
    id TEXT PRIMARY KEY,
    invoiceId TEXT NOT NULL,
    productId TEXT,
    productName TEXT NOT NULL,
    unit TEXT NOT NULL,
    unitPriceInPaise INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    totalInPaise INTEGER NOT NULL,
    FOREIGN KEY (invoiceId) REFERENCES Invoice(id) ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS LedgerEntry (
    id TEXT PRIMARY KEY,
    date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    type TEXT NOT NULL,
    category TEXT NOT NULL,
    amountInPaise INTEGER NOT NULL,
    description TEXT NOT NULL,
    invoiceId TEXT,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS Employee (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'Staff',
    phone TEXT NOT NULL,
    monthlySalaryInPaise INTEGER NOT NULL,
    dateJoined DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS Attendance (
    id TEXT PRIMARY KEY,
    employeeId TEXT NOT NULL,
    date DATETIME NOT NULL,
    status TEXT NOT NULL,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employeeId) REFERENCES Employee(id) ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS SalaryTransaction (
    id TEXT PRIMARY KEY,
    employeeId TEXT NOT NULL,
    date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    type TEXT NOT NULL,
    amountInPaise INTEGER NOT NULL,
    note TEXT,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employeeId) REFERENCES Employee(id) ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS Settings (
    id TEXT PRIMARY KEY DEFAULT 'default',
    businessName TEXT NOT NULL DEFAULT 'ClearFlo Liquid Detergents',
    businessAddress TEXT NOT NULL DEFAULT 'Industrial Estate, Kochi, Kerala - 682024',
    businessPhone TEXT NOT NULL DEFAULT '+91 98765 43210',
    businessGstin TEXT NOT NULL DEFAULT '32ABCDE1234F1Z5',
    bankName TEXT DEFAULT 'State Bank of India',
    accountNo TEXT DEFAULT '123456789012',
    ifscCode TEXT DEFAULT 'SBIN0001234',
    upiId TEXT DEFAULT 'clearflo@upi',
    qrCodeImage TEXT DEFAULT 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=clearflo@upi&pn=ClearFlo%20Detergents'
  )`
];

async function main() {
  console.log('Connecting and pushing schema DDL to Turso database...');
  for (const sql of ddl) {
    await client.execute(sql);
  }
  console.log('All 9 tables created on Turso cloud database successfully!');
}

main().catch(console.error);
