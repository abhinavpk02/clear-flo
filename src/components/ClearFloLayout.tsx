'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ShoppingCart,
  Receipt,
  Users,
  PackageCheck,
  TrendingUp,
  Settings as SettingsIcon,
  Bell,
  Search,
  RotateCw,
  LogOut,
  Droplet,
  AlertTriangle,
} from 'lucide-react';

export default function ClearFloLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [settings, setSettings] = useState<{ businessName?: string; businessGstin?: string } | null>(null);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (res.ok && data) {
        setSettings(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  React.useEffect(() => {
    fetchSettings();
    const handleUpdate = () => fetchSettings();
    window.addEventListener('settingsUpdated', handleUpdate);
    return () => window.removeEventListener('settingsUpdated', handleUpdate);
  }, []);

  const quickNav = [
    { label: 'Quick POS', href: '/', icon: ShoppingCart, primary: true },
    { label: 'A4 Invoices', href: '/invoices', icon: Receipt },
    { label: 'Customers', href: '/customers', icon: Users },
    { label: 'Staff Payroll', href: '/payroll', icon: Users },
    { label: 'Stock Update', href: '/stock', icon: PackageCheck },
    { label: 'Ledger & Accounts', href: '/accounting', icon: TrendingUp },
    { label: 'Settings', href: '/settings', icon: SettingsIcon },
  ];

  const notifications = [
    {
      id: 1,
      title: 'Low Stock Alert',
      desc: 'Top Load Detergent 5L is down to 12 cans.',
      time: '10m ago',
    },
    {
      id: 2,
      title: 'Payment Pending',
      desc: 'Invoice #INV-2026-0002 has ₹4,800.00 pending.',
      time: '1h ago',
    },
  ];

  return (
    <div className="min-h-screen bg-white font-sans flex text-black">
      {/* FIXED LEFT SIDEBAR */}
      <aside className="print:hidden w-72 bg-black text-white flex flex-col justify-between fixed inset-y-0 left-0 z-40 border-r border-zinc-900 shadow-2xl">
        <div className="p-6 space-y-8">
          {/* Logo Header: ClearFlo */}
          <Link href="/" className="flex items-center space-x-3.5 group block">
            <div className="w-12 h-12 rounded-2xl bg-white text-black flex items-center justify-center font-black shadow-lg group-hover:scale-105 transition-transform">
              <Droplet className="w-7 h-7 stroke-[1.5]" />
            </div>
            <div>
              <h1 className="font-black text-2xl tracking-tight text-white font-sans">
                ClearFlo
              </h1>
              <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider block -mt-0.5">
                POS & Accounting
              </span>
            </div>
          </Link>

          {/* Vertical Quick Access Tabs */}
          <div className="space-y-2">
            <span className="text-xs font-black uppercase text-zinc-500 tracking-wider block px-3 mb-2">
              Navigation
            </span>
            <nav className="space-y-1.5">
              {quickNav.map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.href === '/'
                    ? pathname === '/' || pathname === '/pos'
                    : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center space-x-3.5 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all duration-200 ${
                      isActive && item.primary
                        ? 'bg-white text-black font-black shadow-lg scale-[1.02]'
                        : isActive
                        ? 'bg-zinc-900 text-white border-l-4 border-white pl-3 font-extrabold'
                        : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5 stroke-[1.5] shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Sidebar Footer Info */}
        <div className="p-4 m-4 bg-zinc-950 rounded-2xl border border-zinc-900 text-center space-y-1">
          <p className="text-xs font-black text-zinc-200">
            {settings?.businessName || 'ClearFlo Business POS'}
          </p>
          <p className="text-xs text-zinc-400 font-mono font-bold">
            GSTIN: {settings?.businessGstin || '32ABCDE1234F1Z5'}
          </p>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 pl-72 print:pl-0 flex flex-col min-h-screen print:min-h-0">
        {/* HEADER BAR */}
        <header className="print:hidden h-20 bg-white border-b-2 border-zinc-200 px-8 flex items-center justify-between sticky top-0 z-30">
          {/* Notification Bell Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="relative p-3 rounded-2xl bg-zinc-100 hover:bg-zinc-200 text-black transition-colors border-2 border-zinc-300"
              title="Notifications"
            >
              <Bell className="w-5 h-5 stroke-[1.5]" />
              <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 rounded-full bg-black ring-2 ring-white" />
            </button>

            {isNotifOpen && (
              <div className="absolute left-0 mt-3 w-88 bg-white border-2 border-black rounded-3xl shadow-2xl p-5 z-50 space-y-4 text-black">
                <div className="flex justify-between items-center pb-2 border-b border-zinc-200">
                  <span className="font-black text-xs text-black uppercase tracking-wider">
                    Notifications
                  </span>
                  <span className="text-xs font-bold text-white bg-black px-2.5 py-0.5 rounded-full">
                    2 New
                  </span>
                </div>

                <div className="space-y-2.5">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className="p-3.5 bg-zinc-50 hover:bg-zinc-100 rounded-2xl border border-zinc-300 text-xs space-y-1.5 transition-colors"
                    >
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="w-4 h-4 text-black stroke-[1.5]" />
                        <span className="font-extrabold text-black text-xs">{n.title}</span>
                      </div>
                      <p className="text-zinc-600 text-xs leading-snug">{n.desc}</p>
                      <span className="text-[10px] text-zinc-400 font-bold block text-right">
                        {n.time}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-xl mx-8">
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 stroke-[1.5]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full bg-white text-black placeholder-zinc-400 text-sm font-semibold pl-12 pr-4 py-3 rounded-full border-2 border-zinc-300 shadow-sm focus:outline-none focus:border-black transition-all"
              />
            </div>
          </div>

          {/* Refresh & Logout Links */}
          <div className="flex items-center space-x-5">
            <button
              onClick={() => window.location.reload()}
              className="p-3 rounded-2xl bg-zinc-100 hover:bg-zinc-200 text-black transition-colors border-2 border-zinc-300"
              title="Refresh"
            >
              <RotateCw className="w-5 h-5 stroke-[1.5]" />
            </button>

            <Link
              href="/"
              className="flex items-center space-x-2 text-sm font-black text-black hover:text-zinc-600 transition-colors"
            >
              <LogOut className="w-5 h-5 stroke-[1.5]" />
              <span>Logout</span>
            </Link>
          </div>
        </header>

        {/* Content Container */}
        <main className="flex-1 p-8 print:p-0 bg-zinc-50 print:bg-white">{children}</main>
      </div>
    </div>
  );
}
