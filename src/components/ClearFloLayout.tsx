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

  const quickNav = [
    { label: 'Quick POS', href: '/', icon: ShoppingCart, primary: true },
    { label: 'A4 Invoices', href: '/invoices', icon: Receipt },
    { label: 'Staff Payroll', href: '/payroll', icon: Users },
    { label: 'Stock Update', href: '/stock', icon: PackageCheck },
    { label: 'Ledger & Accounts', href: '/accounting', icon: TrendingUp },
    { label: 'Settings', href: '/settings', icon: SettingsIcon },
  ];

  const notifications = [
    {
      id: 1,
      title: 'Low Stock Alert',
      desc: 'ClearFlo Top Load 5L is down to 12 cans left in warehouse.',
      time: '10m ago',
    },
    {
      id: 2,
      title: 'Payment Pending',
      desc: 'Royal Laundry - ₹4,800.00 pending for Invoice #INV-2026-0002.',
      time: '1h ago',
    },
  ];

  return (
    <div className="min-h-screen bg-white font-sans flex text-black">
      {/* FIXED LEFT SIDEBAR (Pure Black Background) */}
      <aside className="w-64 bg-black text-white flex flex-col justify-between fixed inset-y-0 left-0 z-40 border-r border-zinc-900 shadow-2xl">
        <div className="p-6 space-y-8">
          {/* Logo Header: Bold White "ClearFlo" */}
          <Link href="/" className="flex items-center space-x-3 group block">
            <div className="w-10 h-10 rounded-xl bg-white text-black flex items-center justify-center font-black shadow group-hover:scale-105 transition-transform">
              <Droplet className="w-6 h-6 stroke-[1.5]" />
            </div>
            <div>
              <h1 className="font-extrabold text-xl tracking-tight text-white font-sans">
                ClearFlo
              </h1>
              <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block -mt-1">
                Detergent POS & Tax
              </span>
            </div>
          </Link>

          {/* Vertical Quick Access Tabs */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-extrabold uppercase text-zinc-500 tracking-wider block px-3 mb-2">
              Quick Access
            </span>
            <nav className="space-y-1">
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
                    className={`flex items-center space-x-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all duration-200 ${
                      isActive && item.primary
                        ? 'bg-white text-black font-black shadow-md'
                        : isActive
                        ? 'bg-zinc-900 text-white border-l-4 border-white pl-2.5 font-extrabold'
                        : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4 stroke-[1.5] shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Sidebar Footer Info */}
        <div className="p-4 m-4 bg-zinc-950 rounded-xl border border-zinc-900 text-center space-y-1">
          <p className="text-[11px] font-bold text-zinc-300">ClearFlo Liquid Detergents</p>
          <p className="text-[10px] text-zinc-500 font-mono">Kerala GST: 32ABCDE1234F1Z5</p>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 pl-64 flex flex-col min-h-screen">
        {/* HEADER BAR (Pure White with Crisp Black Border) */}
        <header className="h-20 bg-white border-b border-zinc-200 px-8 flex items-center justify-between sticky top-0 z-30">
          {/* Top Left: Notification Bell Icon + Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="relative p-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-black transition-colors border border-zinc-300"
              title="Notifications"
            >
              <Bell className="w-5 h-5 stroke-[1.5]" />
              <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-black ring-2 ring-white" />
            </button>

            {/* Notification Dropdown Mockup */}
            {isNotifOpen && (
              <div className="absolute left-0 mt-3 w-80 bg-white border border-zinc-300 rounded-2xl shadow-2xl p-4 z-50 space-y-3 text-black">
                <div className="flex justify-between items-center pb-2 border-b border-zinc-100">
                  <span className="font-extrabold text-xs text-black uppercase tracking-wider">
                    Alerts & Notifications
                  </span>
                  <span className="text-[10px] font-bold text-white bg-black px-2 py-0.5 rounded-full">
                    2 Active
                  </span>
                </div>

                <div className="space-y-2">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className="p-3 bg-zinc-50 hover:bg-zinc-100 rounded-xl border border-zinc-200 text-xs space-y-1 transition-colors"
                    >
                      <div className="flex items-center space-x-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-black stroke-[1.5]" />
                        <span className="font-extrabold text-black">{n.title}</span>
                      </div>
                      <p className="text-zinc-600 text-[11px] leading-snug">{n.desc}</p>
                      <span className="text-[9px] text-zinc-400 font-bold block text-right">
                        {n.time}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Center: Wide White Pill-Shaped Search Bar */}
          <div className="flex-1 max-w-xl mx-8">
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 stroke-[1.5]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Modules or Customers"
                className="w-full bg-white text-black placeholder-zinc-400 text-xs font-semibold pl-11 pr-4 py-3 rounded-full border border-zinc-300 shadow-sm focus:outline-none focus:border-black transition-all"
              />
            </div>
          </div>

          {/* Top Right: Refresh Icon & Logout Text Link */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => window.location.reload()}
              className="p-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-black transition-colors border border-zinc-300"
              title="Refresh System"
            >
              <RotateCw className="w-4 h-4 stroke-[1.5]" />
            </button>

            <Link
              href="/"
              className="flex items-center space-x-1.5 text-xs font-extrabold text-black hover:text-zinc-600 transition-colors"
            >
              <LogOut className="w-4 h-4 stroke-[1.5]" />
              <span>Logout</span>
            </Link>
          </div>
        </header>

        {/* Content Container */}
        <main className="flex-1 p-8 bg-zinc-50">{children}</main>
      </div>
    </div>
  );
}
