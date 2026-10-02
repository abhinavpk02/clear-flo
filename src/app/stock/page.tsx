'use client';

import { useState, useEffect } from 'react';
import {
  PackageCheck,
  Plus,
  Search,
  Sparkles,
} from 'lucide-react';
import { formatRupees, toPaise } from '@/lib/money';
import { getDynamicProductIcon } from '@/lib/iconMapper';

interface Product {
  id: string;
  name: string;
  category: string;
  unit: string;
  priceInPaise: number;
  stock: number;
  hsnCode: string;
}

export default function StockUpdatePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Add New Stock Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Liquid Detergent');
  const [unit, setUnit] = useState('5L Can');
  const [priceRupees, setPriceRupees] = useState('');
  const [stock, setStock] = useState('100');
  const [hsnCode, setHsnCode] = useState('3402');
  const [saving, setSaving] = useState(false);

  // Real-Time Dynamic Icon Preview based on text input
  const LivePreviewIcon = getDynamicProductIcon(name, category);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/products');
      const data = await res.json();
      if (Array.isArray(data)) {
        setProducts(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !priceRupees) return;

    try {
      setSaving(true);
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          category,
          unit,
          priceInPaise: toPaise(priceRupees),
          stock: parseInt(stock) || 100,
          hsnCode,
        }),
      });

      if (res.ok) {
        setIsModalOpen(false);
        setName('');
        setPriceRupees('');
        fetchProducts();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 text-black">
      {/* Header */}
      <div className="flex justify-between items-center bg-white border border-black p-6 rounded-3xl shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-black tracking-tight flex items-center space-x-3">
            <PackageCheck className="w-7 h-7 text-black stroke-[1.5]" />
            <span>Stock Update & Inventory</span>
          </h1>
          <p className="text-zinc-500 text-xs font-semibold mt-1">
            Real-time dynamic icon parser for stock entries, HSN codes, and warehouse catalog.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-3 rounded-2xl bg-black hover:bg-zinc-800 text-white font-black text-xs uppercase tracking-wider flex items-center space-x-2 shadow-lg transition-all"
        >
          <Plus className="w-4 h-4 stroke-[2]" />
          <span>Add New Stock</span>
        </button>
      </div>

      {/* Embedded Quick Add Form Mockup with Real-Time Icon Parser */}
      <div className="bg-white border border-black rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-black" />
            <h2 className="text-xs font-black uppercase text-black tracking-wider">
              Real-Time Dynamic Icon Mapping Parser Form
            </h2>
          </div>
          <span className="text-[10px] font-extrabold text-zinc-500">
            Type "car wash", "dish wash", "floor cleaner", "hand wash", or "fabric"
          </span>
        </div>

        {/* Form Mockup Grid with Live Icon Preview */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          {/* Live Icon Preview Box */}
          <div className="md:col-span-2 flex flex-col items-center justify-center bg-black text-white p-4 rounded-2xl border border-black space-y-1 text-center shadow-md">
            <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center text-white">
              <LivePreviewIcon className="w-7 h-7 stroke-[1.5]" />
            </div>
            <span className="text-[9px] font-black uppercase text-white tracking-wider">
              Live Icon Preview
            </span>
          </div>

          {/* Product Name Input */}
          <div className="md:col-span-6 space-y-1">
            <label className="text-xs font-black text-black block">
              Product Name (Type keywords to test real-time icon detection)
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder='e.g. "5L CAN car washer liquid" or "5L CAN hand wash"'
              className="w-full bg-zinc-50 text-black font-semibold text-xs px-4 py-3 rounded-2xl border border-zinc-300 outline-none focus:border-black transition-all"
            />
          </div>

          {/* Price & Add Button */}
          <div className="md:col-span-2 space-y-1">
            <label className="text-xs font-black text-black block">
              Unit Price (₹)
            </label>
            <input
              type="number"
              step="0.01"
              placeholder="e.g. 550"
              value={priceRupees}
              onChange={(e) => setPriceRupees(e.target.value)}
              className="w-full bg-zinc-50 text-black font-black text-xs font-mono px-4 py-3 rounded-2xl border border-zinc-300 outline-none focus:border-black"
            />
          </div>

          <div className="md:col-span-2 pt-5">
            <button
              onClick={handleCreateProduct}
              disabled={!name || !priceRupees || saving}
              className="w-full py-3 rounded-2xl bg-black hover:bg-zinc-800 disabled:opacity-40 text-white text-xs font-black uppercase tracking-wider shadow transition-all flex items-center justify-center space-x-1.5"
            >
              <Plus className="w-4 h-4 stroke-[2]" />
              <span>{saving ? 'Saving...' : 'Add Stock'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stock Inventory Table Card */}
      <div className="bg-white border border-black rounded-3xl overflow-hidden shadow-sm space-y-4 p-6">
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-black stroke-[1.5]" />
          <input
            type="text"
            placeholder="Search inventory items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-50 text-black text-xs font-semibold pl-11 pr-4 py-2.5 rounded-2xl border border-zinc-300 outline-none focus:border-black"
          />
        </div>

        {loading ? (
          <div className="py-20 text-center text-zinc-400 font-bold text-sm">Loading stock inventory...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-100 text-black font-black uppercase tracking-wider border-b border-black">
                <tr>
                  <th className="p-4">Icon</th>
                  <th className="p-4">Product Name</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Unit</th>
                  <th className="p-4 text-right">Unit Price (₹)</th>
                  <th className="p-4 text-center">Available Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 font-semibold text-black">
                {filtered.map((item) => {
                  const ItemIcon = getDynamicProductIcon(item.name, item.category);

                  return (
                    <tr key={item.id} className="hover:bg-zinc-50 transition-colors">
                      <td className="p-4">
                        <div className="w-9 h-9 rounded-xl bg-black text-white flex items-center justify-center">
                          <ItemIcon className="w-5 h-5 stroke-[1.5]" />
                        </div>
                      </td>
                      <td className="p-4 font-black">{item.name}</td>
                      <td className="p-4 text-zinc-700">{item.category}</td>
                      <td className="p-4 text-zinc-700">{item.unit}</td>
                      <td className="p-4 text-right font-mono font-black">{formatRupees(item.priceInPaise)}</td>
                      <td className="p-4 text-center">
                        <span
                          className={`px-3 py-1 rounded-full font-black font-mono border ${
                            item.stock < 20
                              ? 'bg-zinc-200 text-black border-black'
                              : 'bg-black text-white border-black'
                          }`}
                        >
                          {item.stock} Cans
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
