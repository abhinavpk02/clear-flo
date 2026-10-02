'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShoppingCart,
  Receipt,
  TrendingUp,
  Users,
  Percent,
  QrCode,
  PackageCheck,
  Plus,
  Minus,
  CheckCircle2,
  Truck,
  ShoppingBag,
  Search,
} from 'lucide-react';
import { formatRupees, calculateKeralaGST, GSTBreakdown } from '@/lib/money';
import { getDynamicProductIcon } from '@/lib/iconMapper';

interface Product {
  id: string;
  name: string;
  category: string;
  unit: string;
  priceInPaise: number;
  stock: number;
  hsnCode: string;
  iconName: string;
}

interface CartItem {
  product: Product;
  quantity: number;
}

export default function EverloopsPOSDashboardPage() {
  const router = useRouter();

  // 6-Column Desktop Software Modules Navigation
  const modules = [
    {
      id: 'pos',
      title: 'Quick POS',
      href: '/',
      icon: ShoppingCart,
      primary: true, // Sleek green background
      desc: 'Instant Billing Terminal',
    },
    {
      id: 'invoices',
      title: 'A4 Invoices',
      href: '/invoices',
      icon: Receipt,
      primary: false,
      desc: 'Kerala GST Print Editor',
    },
    {
      id: 'accounts',
      title: 'Ledger & Accounts',
      href: '/accounting',
      icon: TrendingUp,
      primary: false,
      desc: 'Tally P&L Dashboard',
    },
    {
      id: 'payroll',
      title: 'Staff Payroll',
      href: '/payroll',
      icon: Users,
      primary: false,
      desc: 'Attendance & Salaries',
    },
    {
      id: 'tax',
      title: 'Tax & GST',
      href: '/settings',
      icon: Percent,
      primary: false,
      desc: '18% Intra-State Filing',
    },
    {
      id: 'qr',
      title: 'QR Payments',
      href: '/settings',
      icon: QrCode,
      primary: false,
      desc: 'UPI Payment Setup',
    },
    {
      id: 'stock',
      title: 'Stock Update / Inventory',
      href: '/stock',
      icon: PackageCheck,
      primary: false,
      desc: 'Detergent Stock & Cans',
    },
  ];

  // POS Catalog State
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState('Walk-in Customer');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerLocation, setCustomerLocation] = useState('Kalamassery, Kochi');
  const [orderType, setOrderType] = useState<'DELIVERY' | 'PICKUP'>('DELIVERY');
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CASH' | 'BANK_TRANSFER'>('UPI');
  const [submitting, setSubmitting] = useState(false);

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

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex((item) => item.product.id === product.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += 1;
        return updated;
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const clearCart = () => setCart([]);

  const subtotalInPaise = cart.reduce(
    (acc, item) => acc + item.product.priceInPaise * item.quantity,
    0
  );
  const gst: GSTBreakdown = calculateKeralaGST(subtotalInPaise);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    try {
      setSubmitting(true);
      const payload = {
        customerName: customerName || 'Walk-in Customer',
        customerPhone,
        customerLocation: customerLocation || 'Local Store',
        orderType,
        paymentMethod,
        items: cart.map((item) => ({
          productId: item.product.id,
          productName: item.product.name,
          unit: item.product.unit,
          unitPriceInPaise: item.product.priceInPaise,
          quantity: item.quantity,
        })),
      };

      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const invoice = await res.json();
      if (res.ok && invoice.id) {
        router.push(`/invoice/${invoice.id}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const categories = ['ALL', ...Array.from(new Set(products.map((p) => p.category)))];

  const filteredProducts = products.filter((p) => {
    const matchesCat = selectedCategory === 'ALL' || p.category === selectedCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.unit.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-8 text-slate-900">
      {/* 5-6 COLUMN DESKTOP GRID LAYOUT (SOFTWARE MODULES) */}
      <div className="space-y-3">
        <div className="flex justify-between items-center px-1">
          <h2 className="text-xs font-extrabold uppercase text-slate-500 tracking-wider">
            Software Modules & Navigation
          </h2>
          <span className="text-[11px] font-bold text-zinc-500">ClearFlo POS v2.4</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {modules.map((m) => {
            const Icon = m.icon;

            return (
              <Link
                key={m.id}
                href={m.href}
                className={`group relative aspect-square p-5 rounded-3xl flex flex-col justify-between items-center text-center transition-all duration-300 shadow-xl ${
                  m.primary
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/25 scale-[1.03] ring-4 ring-emerald-600/30'
                    : 'bg-slate-900 hover:bg-slate-800 text-white shadow-slate-950/40 hover:scale-[1.02]'
                }`}
              >
                <div className="flex-1 flex items-center justify-center">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${
                      m.primary ? 'bg-white/10 text-white' : 'bg-slate-800 text-white'
                    }`}
                  >
                    {/* Strictly Minimal Thin-Line (Outline) Icon */}
                    <Icon className="w-8 h-8 stroke-[1.5]" />
                  </div>
                </div>

                <div className="space-y-0.5">
                  <h3 className="font-extrabold text-sm text-white tracking-tight">{m.title}</h3>
                  <p className="text-[10px] text-white/70 font-semibold">{m.desc}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <hr className="border-slate-200/80" />

      {/* POS SELECTION GRID WITH DYNAMIC ICON MAPPING */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT: Product Catalog Grid (8 Cols) */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-4">
          {/* Search & Category Filter Chips */}
          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 stroke-[1.5]" />
              <input
                type="text"
                placeholder="Search car washer, dishwash, floor cleaner, fabric softener..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 text-slate-900 placeholder-slate-400 text-xs font-semibold pl-11 pr-4 py-3 rounded-2xl border border-slate-200 outline-none focus:border-slate-400 shadow-inner"
              />
            </div>

            <div className="flex items-center space-x-2 overflow-x-auto w-full pb-1 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-2xl text-xs font-black whitespace-nowrap transition-all border ${
                    selectedCategory === cat
                      ? 'bg-slate-900 text-white border-slate-900 shadow-md scale-[1.02]'
                      : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* POS Product Cards Grid (Dynamic Icon Mapping) */}
          {loading ? (
            <div className="py-20 text-center text-slate-400 font-bold text-sm">
              Loading detergent products...
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center text-slate-400 font-semibold">
              No products found matching your search.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredProducts.map((product) => {
                // Dynamically Map Accurate Minimal Icon
                const DynamicIcon = getDynamicProductIcon(product.name, product.category);
                const cartItem = cart.find((i) => i.product.id === product.id);
                const inCartQty = cartItem?.quantity || 0;

                return (
                  <div
                    key={product.id}
                    onClick={() => addToCart(product)}
                    className={`group relative bg-white border rounded-3xl p-5 flex flex-col justify-between items-center text-center cursor-pointer transition-all duration-300 select-none shadow-sm ${
                      inCartQty > 0
                        ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-md scale-[1.02]'
                        : 'border-slate-200 hover:border-slate-400 hover:shadow-lg hover:scale-[1.02]'
                    }`}
                  >
                    {/* Quantity Badge */}
                    {inCartQty > 0 && (
                      <span className="absolute top-3 right-3 bg-emerald-600 text-white font-black text-[10px] px-2.5 py-0.5 rounded-full shadow">
                        {inCartQty} in cart
                      </span>
                    )}

                    {/* TOP: Dynamically mapped accurate minimal icon inside dark rounded square */}
                    <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center mb-3 transition-transform group-hover:scale-110 shadow-md">
                      <DynamicIcon className="w-7 h-7 stroke-[1.5]" />
                    </div>

                    {/* MIDDLE: Product Name and Volume */}
                    <div className="w-full space-y-1 mb-4">
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
                        {product.unit}
                      </span>
                      <h3 className="font-extrabold text-xs text-slate-900 leading-snug line-clamp-2 min-h-[2.25rem] flex items-center justify-center">
                        {product.name}
                      </h3>
                    </div>

                    {/* BOTTOM: Price aligned left, dark slate "+" button aligned right */}
                    <div className="w-full pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-sm font-black font-mono text-slate-900">
                        {formatRupees(product.priceInPaise)}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(product);
                        }}
                        className="w-8 h-8 rounded-xl bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center transition-transform hover:scale-105 shadow-sm"
                        title="Add to order"
                      >
                        <Plus className="w-4 h-4 stroke-[2.5]" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT: Quick Order Summary (4 Cols) */}
        <div className="lg:col-span-5 xl:col-span-4 bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100">
            <h3 className="font-black text-sm text-slate-900 flex items-center space-x-2">
              <ShoppingCart className="w-4 h-4 text-emerald-600 stroke-[1.5]" />
              <span>Current Order</span>
            </h3>
            <span className="text-xs font-bold text-slate-400">{cart.length} items</span>
          </div>

          <div className="space-y-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-400 font-extrabold block mb-1">
                  Customer
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-white text-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 font-semibold outline-none focus:border-slate-400"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 font-extrabold block mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={customerLocation}
                  onChange={(e) => setCustomerLocation(e.target.value)}
                  className="w-full bg-white text-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 font-semibold outline-none focus:border-slate-400"
                />
              </div>
            </div>

            <div className="flex bg-white p-1 rounded-xl border border-slate-200 justify-between items-center mt-2">
              <button
                onClick={() => setOrderType('DELIVERY')}
                className={`flex-1 py-1 rounded-lg font-black text-[11px] flex items-center justify-center space-x-1 ${
                  orderType === 'DELIVERY'
                    ? 'bg-emerald-600 text-white shadow'
                    : 'text-slate-500'
                }`}
              >
                <Truck className="w-3.5 h-3.5 stroke-[1.5]" />
                <span>Delivery</span>
              </button>
              <button
                onClick={() => setOrderType('PICKUP')}
                className={`flex-1 py-1 rounded-lg font-black text-[11px] flex items-center justify-center space-x-1 ${
                  orderType === 'PICKUP'
                    ? 'bg-emerald-600 text-white shadow'
                    : 'text-slate-500'
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5 stroke-[1.5]" />
                <span>Pickup</span>
              </button>
            </div>
          </div>

          {/* Cart Item Rows */}
          <div className="max-h-48 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {cart.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs font-semibold">
                Tap product cards to add detergent items to cart.
              </div>
            ) : (
              cart.map(({ product, quantity }) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs"
                >
                  <div className="flex-1 pr-2">
                    <p className="font-extrabold text-slate-900 truncate">{product.name}</p>
                    <p className="text-[10px] text-slate-500 font-mono">
                      {formatRupees(product.priceInPaise)} × {quantity}
                    </p>
                  </div>
                  <div className="flex items-center space-x-1.5 bg-white p-1 rounded-xl border border-slate-200">
                    <button
                      onClick={() => updateQuantity(product.id, -1)}
                      className="w-6 h-6 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg flex items-center justify-center font-black"
                    >
                      <Minus className="w-3.5 h-3.5 stroke-[2]" />
                    </button>
                    <span className="w-5 text-center font-black text-emerald-600 text-xs">
                      {quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(product.id, 1)}
                      className="w-6 h-6 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg flex items-center justify-center font-black"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[2]" />
                    </button>
                  </div>
                  <span className="font-black font-mono text-slate-900 ml-3 text-right">
                    {formatRupees(product.priceInPaise * quantity)}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Checkout Breakdown */}
          <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
            <div className="flex justify-between font-black text-sm text-slate-900">
              <span>Total (18% Kerala GST)</span>
              <span className="font-mono text-emerald-600">{formatRupees(gst.totalInPaise)}</span>
            </div>
            <button
              onClick={handleCheckout}
              disabled={cart.length === 0 || submitting}
              className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center space-x-2"
            >
              <CheckCircle2 className="w-4 h-4 stroke-[2]" />
              <span>Checkout & Print A4</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
