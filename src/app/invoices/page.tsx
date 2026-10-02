'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Receipt,
  Search,
  Plus,
  Eye,
  Truck,
  ShoppingBag,
  Download,
} from 'lucide-react';
import { formatRupees } from '@/lib/money';

interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string;
  customerName: string;
  customerPhone?: string;
  customerLocation: string;
  orderType: string;
  paymentMethod: string;
  totalInPaise: number;
}

export default function InvoicesListPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('ALL');

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/invoices');
      const data = await res.json();
      if (Array.isArray(data)) {
        setInvoices(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredInvoices = invoices.filter((inv) => {
    const matchesType = filterType === 'ALL' || inv.orderType === filterType;
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.customerLocation.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="space-y-6 text-black">
      {/* Sub-Section Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-black p-6 rounded-3xl shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-black tracking-tight flex items-center space-x-3">
            <Receipt className="w-7 h-7 text-black stroke-[1.5]" />
            <span>Sales & Tax Invoices</span>
          </h1>
          <p className="text-zinc-500 text-xs font-semibold mt-1">
            Manage, search, edit, and print Kerala 18% GST invoices for liquid detergent sales.
          </p>
        </div>

        <Link
          href="/"
          className="px-5 py-3 rounded-2xl bg-black hover:bg-zinc-800 text-white font-black text-xs uppercase tracking-wider flex items-center space-x-2 shadow transition-all"
        >
          <Plus className="w-4 h-4 stroke-[2]" />
          <span>New POS Order</span>
        </Link>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white border border-black p-4 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-black stroke-[1.5]" />
          <input
            type="text"
            placeholder="Search by invoice # or customer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-50 text-black placeholder-zinc-400 text-xs font-semibold pl-11 pr-4 py-2.5 rounded-2xl border border-zinc-300 outline-none focus:border-black"
          />
        </div>

        <div className="flex space-x-2">
          {['ALL', 'DELIVERY', 'PICKUP'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-4 py-2 rounded-2xl text-xs font-black transition-all ${
                filterType === type
                  ? 'bg-black text-white'
                  : 'bg-zinc-100 text-black border border-zinc-300 hover:bg-zinc-200'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Invoices Data Table */}
      <div className="bg-white border border-black rounded-3xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-20 text-center text-zinc-400 font-bold text-sm">Loading invoices...</div>
        ) : filteredInvoices.length === 0 ? (
          <div className="p-12 text-center text-zinc-500 font-semibold">No invoices found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-100 text-black font-black uppercase tracking-wider border-b border-black">
                <tr>
                  <th className="p-4">Invoice #</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Order Mode</th>
                  <th className="p-4 text-right">Total (Incl. 18% GST)</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 font-semibold text-black">
                {filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-zinc-50 transition-colors">
                    <td className="p-4 font-mono font-black text-black">{inv.invoiceNumber}</td>
                    <td className="p-4 text-zinc-600">
                      {new Date(inv.date).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="p-4">
                      <p className="font-black text-black">{inv.customerName}</p>
                      <p className="text-[10px] text-zinc-500">{inv.customerLocation}</p>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[10px] font-black bg-black text-white">
                        {inv.orderType === 'DELIVERY' ? (
                          <Truck className="w-3.5 h-3.5 stroke-[1.5]" />
                        ) : (
                          <ShoppingBag className="w-3.5 h-3.5 stroke-[1.5]" />
                        )}
                        <span>{inv.orderType}</span>
                      </span>
                    </td>
                    <td className="p-4 text-right font-black font-mono text-sm text-black">
                      {formatRupees(inv.totalInPaise)}
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <Link
                          href={`/invoice/${inv.id}`}
                          className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl font-bold text-xs bg-zinc-100 hover:bg-zinc-200 text-black border border-zinc-300 transition-all"
                        >
                          <Eye className="w-3.5 h-3.5 stroke-[1.5]" />
                          <span>View</span>
                        </Link>
                        <Link
                          href={`/invoice/${inv.id}?download=true`}
                          className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl font-black text-xs bg-black text-white hover:bg-zinc-800 transition-all shadow-sm"
                        >
                          <Download className="w-3.5 h-3.5 stroke-[1.5]" />
                          <span>Download PDF</span>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

