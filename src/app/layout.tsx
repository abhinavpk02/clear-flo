import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import ClearFloLayout from '@/components/ClearFloLayout';

export const metadata: Metadata = {
  title: 'ClearFlo - POS & Accounting Suite for Liquid Detergents',
  description: 'Point-of-sale, A4 Kerala GST Billing, Accounting & Inventory management for ClearFlo',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-screen antialiased font-sans bg-white text-black">
        <ThemeProvider>
          <ClearFloLayout>{children}</ClearFloLayout>
        </ThemeProvider>
      </body>
    </html>
  );
}
