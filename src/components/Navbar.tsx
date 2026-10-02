'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ShoppingCart,
  Receipt,
  TrendingUp,
  Users,
  Settings as SettingsIcon,
  Sparkles,
  Sun,
  Moon,
} from 'lucide-react';
import { useTheme } from './ThemeProvider';

export default function Navbar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  const navItems = [
    { label: 'POS Terminal', href: '/', icon: ShoppingCart },
    { label: 'Invoices', href: '/invoices', icon: Receipt },
    { label: 'Accounting (P&L)', href: '/accounting', icon: TrendingUp },
    { label: 'Staff Payroll', href: '/payroll', icon: Users },
    { label: 'Settings', href: '/settings', icon: SettingsIcon },
  ];

  return (
    <header
      className={`border-b sticky top-0 z-40 print:hidden shadow-lg backdrop-blur-lg transition-colors duration-200 ${
        theme === 'light'
          ? 'bg-white/90 border-slate-200/80 shadow-slate-200/50'
          : 'bg-slate-900/95 border-slate-800 shadow-slate-950/50'
      }`}
    >
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Left Aligned Brand Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-all duration-300">
              <Sparkles className="w-6 h-6 text-white stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span
                  className={`font-extrabold text-2xl tracking-tight ${
                    theme === 'light'
                      ? 'bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-600 bg-clip-text text-transparent'
                      : 'bg-gradient-to-r from-indigo-300 via-sky-300 to-emerald-300 bg-clip-text text-transparent'
                  }`}
                >
                  ClearFlo
                </span>
                <span
                  className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    theme === 'light'
                      ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                      : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                  }`}
                >
                  Kerala POS
                </span>
              </div>
              <span
                className={`text-[11px] block font-semibold -mt-0.5 tracking-wide ${
                  theme === 'light' ? 'text-slate-500' : 'text-slate-400'
                }`}
              >
                Liquid Detergent & Billing Suite
              </span>
            </div>
          </Link>

          {/* Right Aligned Navigation Links + Theme Switcher */}
          <div className="flex items-center space-x-3">
            <nav className="flex space-x-1 sm:space-x-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.href === '/'
                    ? pathname === '/' || pathname === '/pos'
                    : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center space-x-2 px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-indigo-600 to-cyan-500 text-white shadow-lg shadow-indigo-500/25 scale-[1.02]'
                        : theme === 'light'
                        ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <Icon className={`w-4 h-4 stroke-[2.2] ${isActive ? 'text-white' : theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`} />
                    <span className="hidden md:inline">{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Dark / Light Mode Toggle Button */}
            <button
              onClick={toggleTheme}
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
              className={`p-2.5 rounded-2xl border transition-all duration-200 flex items-center justify-center ${
                theme === 'light'
                  ? 'bg-slate-100 border-slate-200 text-amber-500 hover:bg-amber-50'
                  : 'bg-slate-800 border-slate-700 text-indigo-300 hover:bg-slate-700'
              }`}
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 stroke-[2.2]" />
              ) : (
                <Moon className="w-5 h-5 stroke-[2.2] text-indigo-600" />
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
