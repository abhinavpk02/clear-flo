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
  Loader2,
  Plus,
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

  // Add Customer State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [gstin, setGstin] = useState('');
  const [balanceRupees, setBalanceRupees] = useState('0');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

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
    if (!name.trim()) {
      setErrorMsg('Please enter a Customer or Business Name.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg('');
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          location: location.trim(),
          gstin: gstin.trim(),
          balanceInPaise: toPaise(balanceRupees || '0'),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setIsAddModalOpen(false);
        setName('');
        setPhone('');
        setLocation('');
        setGstin('');
        setBalanceRupees('0');
        fetchCustomers();
      } else {
        setErrorMsg(data.error || 'Failed to save customer');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Error saving customer');
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
    <div className="space-y-6 text-black pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border border-black bg-white p-6 rounded-3xl shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center shadow-md">
            <Users className="w-6 h-6 stroke-[1.5]" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-black tracking-tight">Customer Directory</h1>
            <p className="text-xs text-zinc-500 font-semibold mt-0.5">
              Manage commercial buyers, car wash accounts, hotel laundries, and customer accounts.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setErrorMsg('');
            setIsAddModalOpen(true);
          }}
          className="px-5 py-3 rounded-2xl bg-black hover:bg-zinc-800 text-white font-black text-xs uppercase tracking-wider flex items-center space-x-2 shadow-md transition-all"
        >
          <UserPlus className="w-4 h-4 stroke-[2]" />
          <span>Add New Customer</span>
        </button>
      </div>

      {/* Quick Add Inline Form Card */}
      <div className="bg-white border border-black rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-black" />
            <h2 className="text-xs font-black uppercase text-black tracking-wider">
              Quick Customer Registration Form
            </h2>
          </div>
          <span className="text-[10px] font-extrabold text-zinc-500">
            Instant Directory Add
          </span>
        </div>

        {errorMsg && (
          <div className="p-3 bg-zinc-100 border border-black text-black rounded-2xl text-xs font-bold">
            ⚠️ {errorMsg}
          </div>
        )}

        <form onSubmit={handleCreateCustomer} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          <div className="md:col-span-3 space-y-1">
            <label className="text-xs font-black text-black block">Customer Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Kochi Auto Care / John"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-zinc-50 text-black font-semibold text-xs px-4 py-3 rounded-2xl border border-zinc-300 outline-none focus:border-black"
            />
          </div>

          <div className="md:col-span-3 space-y-1">
            <label className="text-xs font-black text-black block">Mobile Number</label>
            <input
              type="text"
              placeholder="+91 98765 43210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-zinc-50 text-black font-semibold text-xs px-4 py-3 rounded-2xl border border-zinc-300 outline-none focus:border-black"
            />
          </div>

          <div className="md:col-span-3 space-y-1">
            <label className="text-xs font-black text-black block">Location / Address</label>
            <input
              type="text"
              placeholder="e.g. Kalamassery, Kochi"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-zinc-50 text-black font-semibold text-xs px-4 py-3 rounded-2xl border border-zinc-300 outline-none focus:border-black"
            />
          </div>

          <div className="md:col-span-3">
            <button
              type="submit"
              disabled={!name.trim() || submitting}
              className="w-full py-3 rounded-2xl bg-black hover:bg-zinc-800 disabled:opacity-40 text-white text-xs font-black uppercase tracking-wider shadow transition-all flex items-center justify-center space-x-1.5 h-[46px]"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Plus className="w-4 h-4 stroke-[2]" />
                  <span>Save Customer</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-black p-6 rounded-3xl space-y-1 shadow-sm">
          <span className="text-xs uppercase font-black text-zinc-500 block">Total Registered Customers</span>
          <span className="text-3xl font-black text-black font-mono">{customers.length}</span>
        </div>

        <div className="bg-white border border-black p-6 rounded-3xl space-y-1 shadow-sm">
          <span className="text-xs uppercase font-black text-zinc-500 block">GST Registered Accounts</span>
          <span className="text-3xl font-black text-black font-mono">
            {customers.filter((c) => c.gstin).length}
          </span>
        </div>

        <div className="bg-white border border-black p-6 rounded-3xl space-y-1 shadow-sm">
          <span className="text-xs uppercase font-black text-zinc-500 block">Total Outstanding Balance</span>
          <span className="text-3xl font-black text-black font-mono">{formatRupees(totalBalancePaise)}</span>
        </div>
      </div>

      {/* Search & Directory Table */}
      <div className="bg-white border border-black rounded-3xl p-6 shadow-sm space-y-6">
        <div className="relative w-full max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 stroke-[1.5]" />
          <input
            type="text"
            placeholder="Search customer by name, phone, location, GSTIN..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-50 text-black placeholder-zinc-400 text-xs font-semibold pl-11 pr-4 py-3 rounded-2xl border border-zinc-300 outline-none focus:border-black"
          />
        </div>

        {loading ? (
          <div className="py-20 text-center text-zinc-500 font-bold text-sm">Loading customer directory...</div>
        ) : filteredCustomers.length === 0 ? (
          <div className="p-12 text-center rounded-2xl border border-zinc-300 bg-zinc-50 font-bold text-zinc-500 text-sm">
            No customers found matching &quot;{searchQuery}&quot;. Add your first customer above!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-100 text-black font-black uppercase tracking-wider border-b border-black">
                <tr>
                  <th className="p-4">Customer Name</th>
                  <th className="p-4">Phone Number</th>
                  <th className="p-4">Location / Address</th>
                  <th className="p-4">GSTIN</th>
                  <th className="p-4 text-right">Account Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 font-semibold text-black">
                {filteredCustomers.map((cust) => (
                  <tr key={cust.id} className="hover:bg-zinc-50 transition-colors">
                    <td className="p-4 font-black text-black text-sm">{cust.name}</td>
                    <td className="p-4 text-zinc-700 font-mono font-bold">{cust.phone || '—'}</td>
                    <td className="p-4 text-zinc-700">{cust.location || '—'}</td>
                    <td className="p-4 font-mono text-zinc-700">{cust.gstin || 'Unregistered'}</td>
                    <td className="p-4 text-right font-mono font-black text-sm">
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
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg p-6 rounded-3xl shadow-2xl border border-black bg-white text-black space-y-4">
            <div className="flex items-center space-x-3 pb-3 border-b border-zinc-200">
              <div className="w-10 h-10 rounded-2xl bg-black text-white flex items-center justify-center">
                <UserPlus className="w-5 h-5 stroke-[1.5]" />
              </div>
              <h3 className="text-lg font-black">Add New Customer</h3>
            </div>

            {errorMsg && (
              <div className="p-3 bg-zinc-100 border border-black text-black rounded-2xl text-xs font-bold">
                ⚠️ {errorMsg}
              </div>
            )}

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
                  className="w-full p-3 rounded-2xl border border-zinc-300 bg-zinc-50 text-black text-xs font-bold outline-none focus:border-black"
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
                  className="w-full p-3 rounded-2xl border border-zinc-300 bg-zinc-50 text-black text-xs font-bold outline-none focus:border-black"
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
                  className="w-full p-3 rounded-2xl border border-zinc-300 bg-zinc-50 text-black text-xs font-bold outline-none focus:border-black"
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
                  className="w-full p-3 rounded-2xl border border-zinc-300 bg-zinc-50 text-black font-mono text-xs font-bold outline-none focus:border-black"
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
                  className="w-full p-3 rounded-2xl border border-zinc-300 bg-zinc-50 text-black font-mono text-xs font-black outline-none focus:border-black"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold bg-zinc-100 text-black border border-zinc-300 hover:bg-zinc-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-black text-white text-xs font-black shadow-md hover:bg-zinc-800"
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
