'use client';

import { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Phone,
  MapPin,
  FileText,
  CreditCard,
  Building2,
  CheckCircle2,
} from 'lucide-react';
import { formatRupees, toPaise } from '@/lib/money';

interface Customer {
  id: string;
  name: string;
  phone: string;
  location: string;
  gstin?: string;
  balanceInPaise: number;
  createdAt: string;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Add Customer Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [gstin, setGstin] = useState('');
  const [balanceRupees, setBalanceRupees] = useState('0');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/customers');
      const data = await res.json();
      if (Array.isArray(data)) {
        setCustomers(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    try {
      setSubmitting(true);
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone,
          location,
          gstin,
          balanceInPaise: toPaise(balanceRupees || '0'),
        }),
      });

      if (res.ok) {
        setIsAddModalOpen(false);
        setName('');
        setPhone('');
        setLocation('');
        setGstin('');
        setBalanceRupees('0');
        fetchCustomers();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      c.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.gstin && c.gstin.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const totalBalancePaise = customers.reduce((acc, c) => acc + c.balanceInPaise, 0);

  return (
    <div className="space-y-8 text-black bg-zinc-50 min-h-screen p-2 sm:p-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-2 border-black bg-white p-8 rounded-3xl shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-black text-white flex items-center justify-center shadow-md">
            <Users className="w-8 h-8 stroke-[1.5]" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-black tracking-tight">Customer Directory</h1>
            <p className="text-sm text-zinc-500 font-semibold mt-0.5">
              Manage commercial buyers, car wash accounts, hotel laundries, and customer ledgers
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-6 py-4 rounded-2xl bg-black hover:bg-zinc-800 text-white font-black text-sm uppercase tracking-wider flex items-center space-x-2 shadow-lg transition-all"
        >
          <UserPlus className="w-5 h-5 stroke-[2]" />
          <span>Add Customer</span>
        </button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border-2 border-black p-6 rounded-3xl space-y-1 shadow-sm">
          <span className="text-xs uppercase font-black text-zinc-500 block">Total Registered Customers</span>
          <span className="text-3xl font-black text-black font-mono">{customers.length}</span>
        </div>

        <div className="bg-white border-2 border-black p-6 rounded-3xl space-y-1 shadow-sm">
          <span className="text-xs uppercase font-black text-zinc-500 block">GST Registered Accounts</span>
          <span className="text-3xl font-black text-black font-mono">
            {customers.filter((c) => c.gstin).length}
          </span>
        </div>

        <div className="bg-white border-2 border-black p-6 rounded-3xl space-y-1 shadow-sm">
          <span className="text-xs uppercase font-black text-zinc-500 block">Total Outstanding Balance</span>
          <span className="text-3xl font-black text-black font-mono">{formatRupees(totalBalancePaise)}</span>
        </div>
      </div>

      {/* Search & Directory Table */}
      <div className="bg-white border-2 border-black rounded-3xl p-6 shadow-sm space-y-6">
        <div className="relative w-full max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 stroke-[1.5]" />
          <input
            type="text"
            placeholder="Search customer by name, phone, location, GSTIN..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-50 text-black placeholder-zinc-400 text-sm font-bold pl-12 pr-4 py-3.5 rounded-2xl border-2 border-zinc-300 outline-none focus:border-black transition-all"
          />
        </div>

        {loading ? (
          <div className="py-20 text-center text-zinc-500 font-bold text-sm">Loading customer directory...</div>
        ) : filteredCustomers.length === 0 ? (
          <div className="p-12 text-center rounded-2xl border-2 border-zinc-300 bg-zinc-50 font-bold text-zinc-500 text-sm">
            No customers found matching &quot;{searchQuery}&quot;.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-100 text-black font-black uppercase tracking-wider border-b-2 border-black">
                <tr>
                  <th className="p-4">Customer Name</th>
                  <th className="p-4">Phone Number</th>
                  <th className="p-4">Location / Address</th>
                  <th className="p-4">GSTIN</th>
                  <th className="p-4 text-right">Account Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-zinc-200 font-semibold text-black">
                {filteredCustomers.map((cust) => (
                  <tr key={cust.id} className="hover:bg-zinc-50 transition-colors">
                    <td className="p-4 font-black text-black text-base">{cust.name}</td>
                    <td className="p-4 text-zinc-700 font-mono font-bold">{cust.phone || '—'}</td>
                    <td className="p-4 text-zinc-700">{cust.location || '—'}</td>
                    <td className="p-4 font-mono text-zinc-700">{cust.gstin || 'Unregistered'}</td>
                    <td className="p-4 text-right font-mono font-black text-base">
                      {formatRupees(cust.balanceInPaise)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Customer Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg p-8 rounded-3xl shadow-2xl border-2 border-black bg-white text-black space-y-6">
            <div className="flex items-center space-x-3 pb-3 border-b-2 border-zinc-200">
              <div className="w-10 h-10 rounded-2xl bg-black text-white flex items-center justify-center">
                <UserPlus className="w-6 h-6 stroke-[1.5]" />
              </div>
              <h3 className="text-xl font-black">Add New Customer</h3>
            </div>

            <form onSubmit={handleCreateCustomer} className="space-y-4">
              <div>
                <label className="text-xs font-black uppercase text-zinc-700 block mb-1">
                  Customer / Business Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Kochi Auto Spares & Car Wash"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-3.5 rounded-2xl border-2 border-zinc-300 bg-zinc-50 text-black text-sm font-bold outline-none focus:border-black"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-black uppercase text-zinc-700 block mb-1">
                  Mobile Number
                </label>
                <input
                  type="text"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-3.5 rounded-2xl border-2 border-zinc-300 bg-zinc-50 text-black text-sm font-bold outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="text-xs font-black uppercase text-zinc-700 block mb-1">
                  Delivery Location / Address
                </label>
                <input
                  type="text"
                  placeholder="e.g. Edapally, Kochi, Kerala"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full p-3.5 rounded-2xl border-2 border-zinc-300 bg-zinc-50 text-black text-sm font-bold outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="text-xs font-black uppercase text-zinc-700 block mb-1">
                  GSTIN (Optional)
                </label>
                <input
                  type="text"
                  placeholder="32ABCDE1234F1Z5"
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value)}
                  className="w-full p-3.5 rounded-2xl border-2 border-zinc-300 bg-zinc-50 text-black font-mono text-sm font-bold outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="text-xs font-black uppercase text-zinc-700 block mb-1">
                  Opening Balance (₹)
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={balanceRupees}
                  onChange={(e) => setBalanceRupees(e.target.value)}
                  className="w-full p-3.5 rounded-2xl border-2 border-zinc-300 bg-zinc-50 text-black font-mono text-sm font-black outline-none focus:border-black"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-5 py-3 rounded-xl text-sm font-bold bg-zinc-100 text-black border-2 border-zinc-300 hover:bg-zinc-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-3 rounded-xl bg-black text-white text-sm font-black shadow-lg hover:bg-zinc-800"
                >
                  {submitting ? 'Saving...' : 'Save Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
