'use client';

import { useState, useEffect } from 'react';
import {
  TrendingUp,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { formatRupees, toPaise } from '@/lib/money';

interface LedgerEntry {
  id: string;
  date: string;
  type: 'INCOME' | 'EXPENSE';
  category: string;
  amountInPaise: number;
  description: string;
  invoiceId?: string;
}

interface Summary {
  totalIncomePaise: number;
  totalExpensePaise: number;
  netProfitPaise: number;
  categoryBreakdown: Record<string, number>;
}

export default function AccountingPage() {
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [summary, setSummary] = useState<Summary>({
    totalIncomePaise: 0,
    totalExpensePaise: 0,
    netProfitPaise: 0,
    categoryBreakdown: {},
  });
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Ledger Entry Form State
  const [entryType, setEntryType] = useState<'EXPENSE' | 'INCOME'>('EXPENSE');
  const [category, setCategory] = useState('RAW_MATERIAL');
  const [amountRupees, setAmountRupees] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAccountingData();
  }, []);

  const fetchAccountingData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/accounting');
      const data = await res.json();
      if (data.entries) {
        setEntries(data.entries);
        setSummary(data.summary);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amountRupees || parseFloat(amountRupees) <= 0) return;

    try {
      setSubmitting(true);
      const amountInPaise = toPaise(amountRupees);
      const res = await fetch('/api/accounting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: entryType,
          category,
          amountInPaise,
          description: description || `${entryType} Entry`,
        }),
      });

      if (res.ok) {
        setIsAddModalOpen(false);
        setAmountRupees('');
        setDescription('');
        fetchAccountingData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 text-black">
      {/* Sub-Section Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-black p-6 rounded-3xl shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-black tracking-tight flex items-center space-x-3">
            <TrendingUp className="w-7 h-7 text-black stroke-[1.5]" />
            <span>General Ledger & Accounts</span>
          </h1>
          <p className="text-zinc-500 text-xs font-semibold mt-1">
            Real-time revenue, operational expenses, profit & loss summary, and double-entry general ledger.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-5 py-3 rounded-2xl bg-black hover:bg-zinc-800 text-white font-black text-xs uppercase tracking-wider flex items-center space-x-2 shadow transition-all"
        >
          <Plus className="w-4 h-4 stroke-[2]" />
          <span>Record Expense / Income</span>
        </button>
      </div>

      {/* Financial Summary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Total Sales Income Card */}
        <div className="bg-white border border-black p-6 rounded-3xl shadow-sm space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-black uppercase tracking-wider">
              Total Sales Revenue
            </span>
            <div className="w-9 h-9 rounded-2xl bg-black text-white flex items-center justify-center">
              <ArrowUpRight className="w-5 h-5 stroke-[1.5]" />
            </div>
          </div>
          <p className="text-3xl font-black font-mono text-black">
            {formatRupees(summary.totalIncomePaise)}
          </p>
          <p className="text-[11px] text-zinc-500 font-semibold">Total revenue generated from sales invoices</p>
        </div>

        {/* Total Expenses Card */}
        <div className="bg-white border border-black p-6 rounded-3xl shadow-sm space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-black uppercase tracking-wider">
              Operational Expenses
            </span>
            <div className="w-9 h-9 rounded-2xl bg-black text-white flex items-center justify-center">
              <ArrowDownRight className="w-5 h-5 stroke-[1.5]" />
            </div>
          </div>
          <p className="text-3xl font-black font-mono text-black">
            {formatRupees(summary.totalExpensePaise)}
          </p>
          <p className="text-[11px] text-zinc-500 font-semibold">Raw materials, salaries, freight & utilities</p>
        </div>

        {/* Net Profit / Loss Card */}
        <div className="bg-white border border-black p-6 rounded-3xl shadow-sm space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-black uppercase tracking-wider">
              Net Profit / Loss
            </span>
            <div className="w-9 h-9 rounded-2xl bg-black text-white flex items-center justify-center">
              <TrendingUp className="w-5 h-5 stroke-[1.5]" />
            </div>
          </div>
          <p className="text-3xl font-black font-mono text-black">
            {formatRupees(summary.netProfitPaise)}
          </p>
          <p className="text-[11px] text-zinc-500 font-semibold">Real-time bottom line margin</p>
        </div>
      </div>

      {/* Ledger Table Sub-Section */}
      <div className="bg-white border border-black rounded-3xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-black flex justify-between items-center">
          <h2 className="font-black text-base text-black">
            General Ledger Entries
          </h2>
          <span className="text-xs font-black text-zinc-500">{entries.length} Transactions</span>
        </div>

        {loading ? (
          <div className="py-20 text-center text-zinc-400 font-bold text-sm">Loading ledger...</div>
        ) : entries.length === 0 ? (
          <div className="p-12 text-center text-zinc-500 font-semibold">No ledger transactions recorded yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-100 text-black font-black uppercase tracking-wider border-b border-black">
                <tr>
                  <th className="p-4">Date</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Description</th>
                  <th className="p-4 text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 font-semibold text-black">
                {entries.map((e) => (
                  <tr key={e.id} className="hover:bg-zinc-50 transition-colors">
                    <td className="p-4 text-zinc-600">
                      {new Date(e.date).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          e.type === 'INCOME'
                            ? 'bg-black text-white'
                            : 'bg-zinc-200 text-black border border-black'
                        }`}
                      >
                        {e.type}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-lg font-black text-[10px] bg-zinc-100 text-black border border-zinc-300">
                        {e.category}
                      </span>
                    </td>
                    <td className="p-4 font-black text-black">{e.description}</td>
                    <td className="p-4 text-right font-black font-mono text-sm text-black">
                      {e.type === 'INCOME' ? '+' : '-'}{formatRupees(e.amountInPaise)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Record Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md p-6 rounded-3xl shadow-2xl border border-black bg-white text-black space-y-5">
            <h3 className="text-lg font-black">Record Ledger Transaction</h3>

            <form onSubmit={handleAddEntry} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-zinc-500 block mb-1">Entry Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setEntryType('EXPENSE')}
                    className={`py-2 rounded-xl text-xs font-black transition-all ${
                      entryType === 'EXPENSE'
                        ? 'bg-black text-white shadow'
                        : 'bg-zinc-100 text-black border border-zinc-300'
                    }`}
                  >
                    Expense
                  </button>
                  <button
                    type="button"
                    onClick={() => setEntryType('INCOME')}
                    className={`py-2 rounded-xl text-xs font-black transition-all ${
                      entryType === 'INCOME'
                        ? 'bg-black text-white shadow'
                        : 'bg-zinc-100 text-black border border-zinc-300'
                    }`}
                  >
                    Income
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-500 block mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-3 rounded-2xl border border-zinc-300 bg-zinc-50 text-black text-xs font-semibold outline-none focus:border-black"
                >
                  <option value="RAW_MATERIAL">Raw Chemical Material</option>
                  <option value="PACKAGING">Plastic Cans & Bottles</option>
                  <option value="SALARY">Salary & Advance</option>
                  <option value="DELIVERY">Delivery & Fuel</option>
                  <option value="UTILITIES">Electricity & Water</option>
                  <option value="SALES">Sales Income</option>
                  <option value="OTHER">Other Expense/Income</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-500 block mb-1">Amount (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="e.g. 2500"
                  value={amountRupees}
                  onChange={(e) => setAmountRupees(e.target.value)}
                  className="w-full p-3 rounded-2xl border border-zinc-300 bg-zinc-50 text-black text-xs font-black font-mono outline-none focus:border-black"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-500 block mb-1">Description</label>
                <input
                  type="text"
                  placeholder="Details (e.g. 50L LABSA raw chemical purchase)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-3 rounded-2xl border border-zinc-300 bg-zinc-50 text-black text-xs font-semibold outline-none focus:border-black"
                  required
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-zinc-100 text-black border border-zinc-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-black hover:bg-zinc-800 text-white text-xs font-black shadow"
                >
                  {submitting ? 'Saving...' : 'Record Transaction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
