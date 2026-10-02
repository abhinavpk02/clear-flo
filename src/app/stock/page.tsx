'use client';

import { useState, useEffect } from 'react';
import {
  PackageCheck,
  Plus,
  Minus,
  Search,
  Check,
  Loader2,
  X,
  RefreshCw,
  Boxes,
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

  // Stock editing per item state
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [editingStockInput, setEditingStockInput] = useState<{ [id: string]: string }>({});

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
        const stockMap: { [id: string]: string } = {};
        data.forEach((p: Product) => {
          stockMap[p.id] = p.stock.toString();
        });
        setEditingStockInput(stockMap);
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
        setStock('100');
        fetchProducts();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateStock = async (productId: string, newStock: number) => {
    const validStock = Math.max(0, newStock);
    try {
      setUpdatingId(productId);
      const res = await fetch('/api/products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: productId, stock: validStock }),
      });

      if (res.ok) {
        setProducts((prev) =>
          prev.map((p) => (p.id === productId ? { ...p, stock: validStock } : p))
        );
        setEditingStockInput((prev) => ({ ...prev, [productId]: validStock.toString() }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeltaStock = async (productId: string, delta: number) => {
    const item = products.find((p) => p.id === productId);
    if (!item) return;
    const currentStock = typeof editingStockInput[productId] !== 'undefined'
      ? parseInt(editingStockInput[productId]) || item.stock
      : item.stock;
    const newStock = Math.max(0, currentStock + delta);
    await handleUpdateStock(productId, newStock);
  };

  const handleInputBlurOrSubmit = (productId: string) => {
    const val = parseInt(editingStockInput[productId]);
    if (!isNaN(val)) {
      handleUpdateStock(productId, val);
    }
  };

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 text-black pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white border border-black p-6 rounded-3xl shadow-sm gap-4">
        <div>
          <h1 className="text-2xl font-black text-black tracking-tight flex items-center space-x-3">
            <PackageCheck className="w-7 h-7 text-black stroke-[1.5]" />
            <span>Stock Update & Inventory</span>
          </h1>
          <p className="text-zinc-600 text-xs font-semibold mt-1">
            Update stock quantities, set initial inventories, and manage product catalog.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchProducts}
            className="p-3 rounded-2xl bg-zinc-100 hover:bg-zinc-200 text-black border border-black transition-all"
            title="Refresh Stock List"
          >
            <RefreshCw className={`w-4 h-4 stroke-[2] ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-3 rounded-2xl bg-black hover:bg-zinc-800 text-white font-black text-xs uppercase tracking-wider flex items-center space-x-2 shadow-md transition-all"
          >
            <Plus className="w-4 h-4 stroke-[2]" />
            <span>Add New Stock Item</span>
          </button>
        </div>
      </div>

      {/* Quick Add Stock Form Card */}
      <div className="bg-white border border-black rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-black" />
            <h2 className="text-xs font-black uppercase text-black tracking-wider">
              Quick Add Stock & New Item Entry
            </h2>
          </div>
          <span className="text-[10px] font-extrabold text-zinc-500">
            Real-Time Dynamic Icon Detection
          </span>
        </div>

        {/* Form Grid with Live Icon Preview */}
        <form onSubmit={handleCreateProduct} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          {/* Live Icon Preview Box */}
          <div className="md:col-span-2 flex flex-col items-center justify-center bg-black text-white p-3 rounded-2xl border border-black space-y-1 text-center shadow-sm h-[68px]">
            <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-white">
              <LivePreviewIcon className="w-5 h-5 stroke-[1.5]" />
            </div>
            <span className="text-[8px] font-black uppercase text-white tracking-wider">
              Live Preview
            </span>
          </div>

          {/* Product Name Input */}
          <div className="md:col-span-4 space-y-1">
            <label className="text-xs font-black text-black block">
              Product Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder='e.g. 5L CAN Car Wash Liquid'
              className="w-full bg-zinc-50 text-black font-semibold text-xs px-4 py-3 rounded-2xl border border-zinc-300 outline-none focus:border-black transition-all"
            />
          </div>

          {/* Price Input */}
          <div className="md:col-span-2 space-y-1">
            <label className="text-xs font-black text-black block">
              Unit Price (₹) *
            </label>
            <input
              type="number"
              required
              step="0.01"
              placeholder="e.g. 550"
              value={priceRupees}
              onChange={(e) => setPriceRupees(e.target.value)}
              className="w-full bg-zinc-50 text-black font-black text-xs font-mono px-4 py-3 rounded-2xl border border-zinc-300 outline-none focus:border-black"
            />
          </div>

          {/* Stock Quantity Input */}
          <div className="md:col-span-2 space-y-1">
            <label className="text-xs font-black text-black block">
              Initial Quantity *
            </label>
            <input
              type="number"
              required
              min="0"
              placeholder="e.g. 100"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              className="w-full bg-zinc-50 text-black font-black text-xs font-mono px-4 py-3 rounded-2xl border border-zinc-300 outline-none focus:border-black"
            />
          </div>

          {/* Add Button */}
          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={!name || !priceRupees || saving}
              className="w-full py-3 rounded-2xl bg-black hover:bg-zinc-800 disabled:opacity-40 text-white text-xs font-black uppercase tracking-wider shadow transition-all flex items-center justify-center space-x-1.5 h-[46px]"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Plus className="w-4 h-4 stroke-[2]" />
                  <span>Save Product</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Stock Inventory Table Card */}
      <div className="bg-white border border-black rounded-3xl overflow-hidden shadow-sm space-y-4 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-black stroke-[1.5]" />
            <input
              type="text"
              placeholder="Search by product name or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-50 text-black text-xs font-semibold pl-11 pr-4 py-2.5 rounded-2xl border border-zinc-300 outline-none focus:border-black"
            />
          </div>
          <div className="text-xs font-black text-zinc-600 uppercase tracking-wider">
            Total Items: <span className="text-black font-mono text-sm">{filtered.length}</span>
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center text-zinc-500 font-bold text-sm flex items-center justify-center space-x-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Loading stock inventory...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-zinc-500 font-bold text-sm">
            No stock products found. Add your first item above!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-100 text-black font-black uppercase tracking-wider border-b border-black">
                <tr>
                  <th className="p-4">Item</th>
                  <th className="p-4">Product Name</th>
                  <th className="p-4">Category / Unit</th>
                  <th className="p-4 text-right">Unit Price (₹)</th>
                  <th className="p-4 text-center">Stock Adjustment & Quantity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 font-semibold text-black">
                {filtered.map((item) => {
                  const ItemIcon = getDynamicProductIcon(item.name, item.category);
                  const isUpdating = updatingId === item.id;
                  const currentInputValue =
                    editingStockInput[item.id] !== undefined
                      ? editingStockInput[item.id]
                      : item.stock.toString();

                  return (
                    <tr key={item.id} className="hover:bg-zinc-50 transition-colors">
                      <td className="p-4">
                        <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center shadow-sm">
                          <ItemIcon className="w-5 h-5 stroke-[1.5]" />
                        </div>
                      </td>
                      <td className="p-4 font-black text-sm">
                        {item.name}
                        <div className="text-[10px] font-extrabold text-zinc-500">
                          HSN: {item.hsnCode}
                        </div>
                      </td>
                      <td className="p-4 text-zinc-700">
                        <span className="font-bold">{item.category}</span>
                        <div className="text-[10px] text-zinc-500 font-semibold">{item.unit}</div>
                      </td>
                      <td className="p-4 text-right font-mono font-black text-sm">
                        {formatRupees(item.priceInPaise)}
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col items-center justify-center space-y-2">
                          {/* Stock Quantity Modifier Row */}
                          <div className="flex items-center justify-center space-x-1.5 bg-zinc-100 p-1.5 rounded-2xl border border-zinc-300">
                            {/* Decrement Buttons */}
                            <button
                              onClick={() => handleDeltaStock(item.id, -10)}
                              disabled={isUpdating || item.stock <= 0}
                              className="px-2 py-1 rounded-xl bg-white hover:bg-zinc-200 disabled:opacity-30 border border-zinc-300 font-mono text-[11px] font-black transition-all"
                              title="Subtract 10"
                            >
                              -10
                            </button>
                            <button
                              onClick={() => handleDeltaStock(item.id, -1)}
                              disabled={isUpdating || item.stock <= 0}
                              className="w-8 h-8 rounded-xl bg-white hover:bg-zinc-200 disabled:opacity-30 border border-zinc-300 flex items-center justify-center text-black font-black transition-all"
                              title="Subtract 1"
                            >
                              <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
                            </button>

                            {/* Direct Numeric Input Box */}
                            <div className="relative">
                              <input
                                type="number"
                                min="0"
                                value={currentInputValue}
                                onChange={(e) =>
                                  setEditingStockInput((prev) => ({
                                    ...prev,
                                    [item.id]: e.target.value,
                                  }))
                                }
                                onBlur={() => handleInputBlurOrSubmit(item.id)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    handleInputBlurOrSubmit(item.id);
                                  }
                                }}
                                className="w-20 text-center bg-white text-black font-black font-mono text-sm py-1.5 px-2 rounded-xl border border-black outline-none focus:ring-2 focus:ring-black"
                              />
                            </div>

                            {/* Increment Buttons */}
                            <button
                              onClick={() => handleDeltaStock(item.id, 1)}
                              disabled={isUpdating}
                              className="w-8 h-8 rounded-xl bg-white hover:bg-zinc-200 disabled:opacity-30 border border-zinc-300 flex items-center justify-center text-black font-black transition-all"
                              title="Add 1"
                            >
                              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                            </button>
                            <button
                              onClick={() => handleDeltaStock(item.id, 10)}
                              disabled={isUpdating}
                              className="px-2 py-1 rounded-xl bg-white hover:bg-zinc-200 disabled:opacity-30 border border-zinc-300 font-mono text-[11px] font-black transition-all"
                              title="Add 10"
                            >
                              +10
                            </button>
                            <button
                              onClick={() => handleDeltaStock(item.id, 50)}
                              disabled={isUpdating}
                              className="px-2 py-1 rounded-xl bg-black text-white hover:bg-zinc-800 disabled:opacity-30 font-mono text-[11px] font-black transition-all"
                              title="Add 50"
                            >
                              +50
                            </button>

                            {/* Status Indicator */}
                            {isUpdating ? (
                              <Loader2 className="w-4 h-4 animate-spin text-black ml-1" />
                            ) : (
                              <button
                                onClick={() => handleInputBlurOrSubmit(item.id)}
                                className="p-1.5 rounded-xl bg-black text-white hover:bg-zinc-800 transition-all ml-1"
                                title="Save Stock"
                              >
                                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                              </button>
                            )}
                          </div>

                          {/* Stock Status Badge */}
                          <div className="flex items-center space-x-2">
                            <span
                              className={`px-3 py-0.5 rounded-full font-black text-[10px] uppercase font-mono border ${
                                item.stock <= 0
                                  ? 'bg-zinc-200 text-black border-black'
                                  : item.stock < 20
                                  ? 'bg-zinc-100 text-black border-black'
                                  : 'bg-black text-white border-black'
                              }`}
                            >
                              {item.stock <= 0
                                ? 'OUT OF STOCK'
                                : item.stock < 20
                                ? `LOW STOCK (${item.stock} CANS)`
                                : `${item.stock} CANS AVAILABLE`}
                            </span>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add New Stock Item Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-black rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-zinc-200">
              <h3 className="text-lg font-black text-black flex items-center space-x-2">
                <Boxes className="w-5 h-5 text-black stroke-[1.5]" />
                <span>Add New Product & Initial Stock</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl hover:bg-zinc-100 text-black"
              >
                <X className="w-5 h-5 stroke-[2]" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4">
              <div>
                <label className="text-xs font-black text-black block mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. 5L CAN Floor Cleaner"
                  className="w-full bg-zinc-50 text-black text-xs font-semibold px-4 py-3 rounded-2xl border border-zinc-300 outline-none focus:border-black"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-black text-black block mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-zinc-50 text-black text-xs font-semibold px-4 py-3 rounded-2xl border border-zinc-300 outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="text-xs font-black text-black block mb-1">
                    Packaging Unit
                  </label>
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full bg-zinc-50 text-black text-xs font-semibold px-4 py-3 rounded-2xl border border-zinc-300 outline-none focus:border-black"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-black text-black block mb-1">
                    Unit Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    placeholder="550"
                    value={priceRupees}
                    onChange={(e) => setPriceRupees(e.target.value)}
                    className="w-full bg-zinc-50 text-black text-xs font-black font-mono px-4 py-3 rounded-2xl border border-zinc-300 outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="text-xs font-black text-black block mb-1">
                    Initial Stock (Cans) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="100"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="w-full bg-zinc-50 text-black text-xs font-black font-mono px-4 py-3 rounded-2xl border border-zinc-300 outline-none focus:border-black"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-black text-black block mb-1">
                  HSN Code
                </label>
                <input
                  type="text"
                  value={hsnCode}
                  onChange={(e) => setHsnCode(e.target.value)}
                  className="w-full bg-zinc-50 text-black text-xs font-mono font-bold px-4 py-3 rounded-2xl border border-zinc-300 outline-none focus:border-black"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-3 rounded-2xl bg-zinc-100 hover:bg-zinc-200 text-black font-black text-xs uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!name || !priceRupees || saving}
                  className="px-6 py-3 rounded-2xl bg-black hover:bg-zinc-800 disabled:opacity-40 text-white font-black text-xs uppercase tracking-wider shadow"
                >
                  {saving ? 'Saving...' : 'Add Stock Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
