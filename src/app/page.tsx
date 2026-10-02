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
  User,
  Phone,
  MapPin,
  FileText,
  CreditCard,
  Building2,
  Trash2,
  ArrowRight,
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

export default function ClearFloPOSDashboardPage() {
  const router = useRouter();

  // 6-Column Desktop Software Modules Navigation (100% Black & White)
  const modules = [
    {
      id: 'pos',
      title: 'Quick POS',
      href: '/',
      icon: ShoppingCart,
      primary: true,
      desc: 'Instant 1-2-3 POS Terminal',
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

  // Step 1: Customer Details
  const [customerName, setCustomerName] = useState('Walk-in Customer');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerLocation, setCustomerLocation] = useState('Kochi, Kerala');
  const [customerGstin, setCustomerGstin] = useState('');
  const [orderType, setOrderType] = useState<'DELIVERY' | 'PICKUP'>('DELIVERY');

  // Step 2: Product Selection / Cart
  const [cart, setCart] = useState<CartItem[]>([]);

  // Step 3: Checkout / Payment
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CASH' | 'BANK_TRANSFER' | 'CREDIT'>('UPI');
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
        customerGstin,
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

  // Quick Customer Presets
  const applyPresetCustomer = (preset: { name: string; location: string; gstin?: string }) => {
    setCustomerName(preset.name);
    setCustomerLocation(preset.location);
    if (preset.gstin) setCustomerGstin(preset.gstin);
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
    <div className="space-y-8 text-black bg-zinc-50 min-h-screen p-2 sm:p-4">
      {/* MODULES NAVIGATION (STRICT B&W) */}
      <div className="space-y-3">
        <div className="flex justify-between items-center px-1">
          <h2 className="text-xs font-black uppercase text-zinc-600 tracking-wider">
            ClearFlo Software Modules & Navigation
          </h2>
          <span className="text-xs font-mono font-bold text-black border border-black bg-white px-2 py-0.5 rounded-full">
            Kerala 18% GST Compliant
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {modules.map((m) => {
            const Icon = m.icon;

            return (
              <Link
                key={m.id}
                href={m.href}
                className={`group relative p-4 rounded-2xl border flex flex-col justify-between items-center text-center transition-all duration-200 ${
                  m.primary
                    ? 'bg-black text-white border-black shadow-lg scale-[1.02]'
                    : 'bg-white hover:bg-zinc-100 text-black border-zinc-300 shadow-sm hover:border-black'
                }`}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-2 transition-transform group-hover:scale-110 border border-zinc-200 bg-zinc-100 text-black">
                  <Icon className="w-5 h-5 stroke-[1.5]" />
                </div>

                <div className="space-y-0.5">
                  <h3 className="font-extrabold text-xs tracking-tight">{m.title}</h3>
                  <p className={`text-[10px] font-medium ${m.primary ? 'text-zinc-400' : 'text-zinc-500'}`}>
                    {m.desc}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <hr className="border-zinc-300" />

      {/* QUICK POS STEP-BY-STEP WORKFLOW: STEP 1 -> STEP 2 -> STEP 3 */}
      <div className="space-y-6">
        {/* HEADER BAR */}
        <div className="flex items-center justify-between bg-black text-white px-6 py-4 rounded-2xl shadow-md">
          <div className="flex items-center space-x-3">
            <ShoppingCart className="w-6 h-6 stroke-[1.5]" />
            <div>
              <h1 className="font-black text-lg tracking-tight">Quick POS Terminal</h1>
              <p className="text-xs text-zinc-400">Step-by-step billing: Customer → Product & Quantity → Checkout</p>
            </div>
          </div>
          <div className="flex items-center space-x-4 text-xs font-mono font-bold">
            <span className="bg-zinc-800 text-white px-3 py-1.5 rounded-xl border border-zinc-700">
              Cart: {cart.length} item{cart.length === 1 ? '' : 's'}
            </span>
            <span className="bg-white text-black px-3 py-1.5 rounded-xl font-black">
              Total: {formatRupees(gst.totalInPaise)}
            </span>
          </div>
        </div>

        {/* STEP 1: SELECT CUSTOMER & ORDER TYPE */}
        <div className="bg-white border-2 border-black rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-black text-sm">
                1
              </div>
              <div>
                <h2 className="font-extrabold text-base text-black flex items-center space-x-2">
                  <span>Select Customer & Order Details</span>
                  <User className="w-4 h-4 text-zinc-600 stroke-[1.5]" />
                </h2>
                <p className="text-xs text-zinc-500">First step: Enter or pick customer details for the invoice</p>
              </div>
            </div>

            {/* Quick Preset Buttons */}
            <div className="hidden md:flex items-center space-x-2">
              <span className="text-[10px] uppercase font-bold text-zinc-400">Presets:</span>
              <button
                type="button"
                onClick={() => applyPresetCustomer({ name: 'Walk-in Customer', location: 'Kochi, Kerala' })}
                className="px-2.5 py-1 bg-zinc-100 hover:bg-black hover:text-white text-black text-xs font-bold rounded-lg border border-zinc-300 transition-colors"
              >
                Walk-in
              </button>
              <button
                type="button"
                onClick={() => applyPresetCustomer({ name: 'Kochi Auto Spares & Wash', location: 'Edapally, Kochi', gstin: '32AAACK1234F1Z1' })}
                className="px-2.5 py-1 bg-zinc-100 hover:bg-black hover:text-white text-black text-xs font-bold rounded-lg border border-zinc-300 transition-colors"
              >
                Car Washer
              </button>
              <button
                type="button"
                onClick={() => applyPresetCustomer({ name: 'Malabar Grand Hotel Laundry', location: 'MG Road, Ernakulam', gstin: '32BBBGH5678F1Z9' })}
                className="px-2.5 py-1 bg-zinc-100 hover:bg-black hover:text-white text-black text-xs font-bold rounded-lg border border-zinc-300 transition-colors"
              >
                Hotel Laundry
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-black uppercase text-zinc-700 block mb-1 flex items-center space-x-1">
                <User className="w-3.5 h-3.5 stroke-[1.5]" />
                <span>Customer Name *</span>
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Walk-in Customer / Business Name"
                className="w-full bg-zinc-50 text-black font-semibold text-xs px-3.5 py-2.5 rounded-xl border border-zinc-300 outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="text-xs font-black uppercase text-zinc-700 block mb-1 flex items-center space-x-1">
                <Phone className="w-3.5 h-3.5 stroke-[1.5]" />
                <span>Mobile Number</span>
              </label>
              <input
                type="text"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full bg-zinc-50 text-black font-semibold text-xs px-3.5 py-2.5 rounded-xl border border-zinc-300 outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="text-xs font-black uppercase text-zinc-700 block mb-1 flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5 stroke-[1.5]" />
                <span>Delivery Location / Address *</span>
              </label>
              <input
                type="text"
                value={customerLocation}
                onChange={(e) => setCustomerLocation(e.target.value)}
                placeholder="e.g. Kalamassery, Kochi"
                className="w-full bg-zinc-50 text-black font-semibold text-xs px-3.5 py-2.5 rounded-xl border border-zinc-300 outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="text-xs font-black uppercase text-zinc-700 block mb-1 flex items-center space-x-1">
                <FileText className="w-3.5 h-3.5 stroke-[1.5]" />
                <span>GSTIN (Optional)</span>
              </label>
              <input
                type="text"
                value={customerGstin}
                onChange={(e) => setCustomerGstin(e.target.value)}
                placeholder="32ABCDE1234F1Z5"
                className="w-full bg-zinc-50 text-black font-mono font-semibold text-xs px-3.5 py-2.5 rounded-xl border border-zinc-300 outline-none focus:border-black"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs font-black uppercase text-zinc-600">Order Fulfillment Type:</span>
            <div className="flex bg-zinc-100 p-1 rounded-xl border border-zinc-300 space-x-1">
              <button
                type="button"
                onClick={() => setOrderType('DELIVERY')}
                className={`px-4 py-1.5 rounded-lg font-black text-xs flex items-center space-x-1.5 transition-all ${
                  orderType === 'DELIVERY'
                    ? 'bg-black text-white shadow'
                    : 'text-zinc-600 hover:text-black'
                }`}
              >
                <Truck className="w-4 h-4 stroke-[1.5]" />
                <span>Delivery Order</span>
              </button>
              <button
                type="button"
                onClick={() => setOrderType('PICKUP')}
                className={`px-4 py-1.5 rounded-lg font-black text-xs flex items-center space-x-1.5 transition-all ${
                  orderType === 'PICKUP'
                    ? 'bg-black text-white shadow'
                    : 'text-zinc-600 hover:text-black'
                }`}
              >
                <ShoppingBag className="w-4 h-4 stroke-[1.5]" />
                <span>Store Pickup</span>
              </button>
            </div>
          </div>
        </div>

        {/* STEP 2: SELECT PRODUCT & QUANTITY */}
        <div className="bg-white border-2 border-black rounded-3xl p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-black text-sm">
                2
              </div>
              <div>
                <h2 className="font-extrabold text-base text-black flex items-center space-x-2">
                  <span>Select Products & Quantity</span>
                  <PackageCheck className="w-4 h-4 text-zinc-600 stroke-[1.5]" />
                </h2>
                <p className="text-xs text-zinc-500">Second step: Click products to add to cart and adjust quantities</p>
              </div>
            </div>

            {cart.length > 0 && (
              <button
                type="button"
                onClick={clearCart}
                className="text-xs font-bold text-zinc-500 hover:text-black flex items-center space-x-1 underline"
              >
                <Trash2 className="w-3.5 h-3.5 stroke-[1.5]" />
                <span>Clear Cart ({cart.length})</span>
              </button>
            )}
          </div>

          {/* Product Search & Category Filters */}
          <div className="space-y-3">
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 stroke-[1.5]" />
              <input
                type="text"
                placeholder="Search liquid detergent products (car wash, dishwash, floor cleaner, fabric softener...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-50 text-black placeholder-zinc-400 text-xs font-semibold pl-11 pr-4 py-3 rounded-2xl border border-zinc-300 outline-none focus:border-black shadow-inner"
              />
            </div>

            <div className="flex items-center space-x-2 overflow-x-auto w-full pb-1 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all border ${
                    selectedCategory === cat
                      ? 'bg-black text-white border-black shadow'
                      : 'bg-zinc-100 text-zinc-700 border-zinc-300 hover:bg-zinc-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* POS Product Grid with Dynamic Outline Icon Mapping */}
          {loading ? (
            <div className="py-12 text-center text-zinc-500 font-bold text-xs">
              Loading detergent product catalog...
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="bg-zinc-50 p-12 rounded-2xl border border-zinc-300 text-center text-zinc-500 font-medium text-xs">
              No products found matching &quot;{searchQuery}&quot;.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {filteredProducts.map((product) => {
                const DynamicIcon = getDynamicProductIcon(product.name, product.category);
                const cartItem = cart.find((i) => i.product.id === product.id);
                const inCartQty = cartItem?.quantity || 0;

                return (
                  <div
                    key={product.id}
                    onClick={() => addToCart(product)}
                    className={`group relative bg-white border-2 rounded-2xl p-4 flex flex-col justify-between items-center text-center cursor-pointer transition-all duration-200 select-none ${
                      inCartQty > 0
                        ? 'border-black bg-zinc-50 shadow-md scale-[1.02]'
                        : 'border-zinc-200 hover:border-black hover:shadow-md'
                    }`}
                  >
                    {/* Quantity Badge */}
                    {inCartQty > 0 && (
                      <span className="absolute top-2 right-2 bg-black text-white font-black text-[10px] px-2 py-0.5 rounded-full">
                        {inCartQty} in cart
                      </span>
                    )}

                    {/* Dynamic Outline Icon */}
                    <div className="w-12 h-12 rounded-xl bg-black text-white flex items-center justify-center mb-2 transition-transform group-hover:scale-110">
                      <DynamicIcon className="w-6 h-6 stroke-[1.5]" />
                    </div>

                    {/* Name & Unit */}
                    <div className="w-full space-y-0.5 mb-3">
                      <span className="text-[10px] font-black uppercase text-zinc-400 block">
                        {product.unit}
                      </span>
                      <h3 className="font-extrabold text-xs text-black leading-tight line-clamp-2 min-h-[2rem]">
                        {product.name}
                      </h3>
                    </div>

                    {/* Price & Add/Quantity Controls */}
                    <div className="w-full pt-2 border-t border-zinc-200 flex items-center justify-between">
                      <span className="text-xs font-black font-mono text-black">
                        {formatRupees(product.priceInPaise)}
                      </span>

                      {inCartQty > 0 ? (
                        <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => updateQuantity(product.id, -1)}
                            className="w-6 h-6 bg-zinc-200 hover:bg-black hover:text-white rounded-md flex items-center justify-center font-bold"
                          >
                            <Minus className="w-3 h-3 stroke-[2]" />
                          </button>
                          <span className="text-xs font-black font-mono w-4 text-center">{inCartQty}</span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(product.id, 1)}
                            className="w-6 h-6 bg-zinc-200 hover:bg-black hover:text-white rounded-md flex items-center justify-center font-bold"
                          >
                            <Plus className="w-3 h-3 stroke-[2]" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCart(product);
                          }}
                          className="w-7 h-7 rounded-lg bg-black hover:bg-zinc-800 text-white flex items-center justify-center transition-transform hover:scale-105"
                          title="Add product"
                        >
                          <Plus className="w-4 h-4 stroke-[2]" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Selected Products Table Summary */}
          {cart.length > 0 && (
            <div className="mt-4 border border-zinc-300 rounded-2xl p-4 bg-zinc-50 space-y-3">
              <h3 className="font-extrabold text-xs uppercase text-black tracking-wider flex items-center space-x-2">
                <ShoppingCart className="w-4 h-4 stroke-[1.5]" />
                <span>Selected Items in Cart ({cart.length})</span>
              </h3>

              <div className="divide-y divide-zinc-200">
                {cart.map(({ product, quantity }) => (
                  <div key={product.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="flex-1 pr-4">
                      <p className="font-extrabold text-black">{product.name}</p>
                      <p className="text-[10px] text-zinc-500 font-mono">
                        Unit: {product.unit} | HSN: {product.hsnCode} | Price: {formatRupees(product.priceInPaise)}
                      </p>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1.5 bg-white px-2 py-1 rounded-xl border border-zinc-300">
                        <button
                          type="button"
                          onClick={() => updateQuantity(product.id, -1)}
                          className="w-5 h-5 bg-zinc-100 hover:bg-black hover:text-white rounded flex items-center justify-center font-bold text-xs"
                        >
                          -
                        </button>
                        <span className="w-6 text-center font-black font-mono text-xs">{quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(product.id, 1)}
                          className="w-5 h-5 bg-zinc-100 hover:bg-black hover:text-white rounded flex items-center justify-center font-bold text-xs"
                        >
                          +
                        </button>
                      </div>

                      <span className="font-mono font-black text-black text-xs w-20 text-right">
                        {formatRupees(product.priceInPaise * quantity)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* STEP 3: CHECKOUT & FINAL PAYMENT */}
        <div className="bg-white border-2 border-black rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-black text-sm">
                3
              </div>
              <div>
                <h2 className="font-extrabold text-base text-black flex items-center space-x-2">
                  <span>Checkout & Complete Billing</span>
                  <CreditCard className="w-4 h-4 text-zinc-600 stroke-[1.5]" />
                </h2>
                <p className="text-xs text-zinc-500">Third step: Choose payment method and generate A4 invoice</p>
              </div>
            </div>

            <div className="text-right font-mono">
              <span className="text-[10px] uppercase font-bold text-zinc-500 block">Final Bill Total:</span>
              <span className="text-lg font-black text-black">{formatRupees(gst.totalInPaise)}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Left: Payment Method Choice */}
            <div className="space-y-3">
              <label className="text-xs font-black uppercase text-black block">
                Payment Method:
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'UPI', label: 'UPI / QR Payment', icon: QrCode },
                  { id: 'CASH', label: 'Cash Payment', icon: BanknoteIcon },
                  { id: 'BANK_TRANSFER', label: 'Bank Transfer', icon: Building2 },
                  { id: 'CREDIT', label: 'Customer Credit', icon: CreditCard },
                ].map((pm) => {
                  const Icon = pm.icon;
                  return (
                    <button
                      key={pm.id}
                      type="button"
                      onClick={() => setPaymentMethod(pm.id as any)}
                      className={`p-3.5 rounded-xl border-2 font-bold text-xs flex items-center space-x-2 justify-start transition-all ${
                        paymentMethod === pm.id
                          ? 'bg-black text-white border-black shadow'
                          : 'bg-zinc-50 text-black border-zinc-300 hover:border-black'
                      }`}
                    >
                      <Icon className="w-4 h-4 stroke-[1.5]" />
                      <span>{pm.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right: Bill Breakdown & Action Button */}
            <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-300 space-y-3 text-xs">
              <div className="flex justify-between text-zinc-600">
                <span>Items Subtotal:</span>
                <span className="font-mono font-bold text-black">{formatRupees(gst.subtotalInPaise)}</span>
              </div>
              <div className="flex justify-between text-zinc-600">
                <span>CGST (9% Kerala):</span>
                <span className="font-mono font-bold text-black">{formatRupees(gst.cgstInPaise)}</span>
              </div>
              <div className="flex justify-between text-zinc-600">
                <span>SGST (9% Kerala):</span>
                <span className="font-mono font-bold text-black">{formatRupees(gst.sgstInPaise)}</span>
              </div>
              <hr className="border-zinc-300" />
              <div className="flex justify-between font-black text-base text-black">
                <span>Total Amount Due:</span>
                <span className="font-mono">{formatRupees(gst.totalInPaise)}</span>
              </div>

              <button
                type="button"
                onClick={handleCheckout}
                disabled={cart.length === 0 || submitting}
                className="w-full py-4 rounded-xl bg-black hover:bg-zinc-800 disabled:opacity-30 text-white font-black text-xs uppercase tracking-wider shadow-lg transition-all flex items-center justify-center space-x-2 mt-4"
              >
                <CheckCircle2 className="w-5 h-5 stroke-[1.5]" />
                <span>{submitting ? 'Processing Invoice...' : 'Complete Checkout & Print A4 Invoice'}</span>
                <ArrowRight className="w-4 h-4 stroke-[1.5]" />
              </button>

              {cart.length === 0 && (
                <p className="text-[11px] text-center text-zinc-500 font-bold">
                  ⚠️ Please add at least one product in Step 2 to enable checkout.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Fallback icon for Cash Payment
function BanknoteIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="12" x="2" y="6" rx="2" />
      <circle cx="12" cy="12" r="2" />
      <path d="M6 12h.01M18 12h.01" />
    </svg>
  );
}
