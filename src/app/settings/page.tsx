'use client';

import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Save, Building2, Landmark } from 'lucide-react';

interface SettingsData {
  businessName: string;
  businessAddress: string;
  businessPhone: string;
  businessGstin: string;
  bankName: string;
  accountNo: string;
  ifscCode: string;
  upiId: string;
  qrCodeImage: string;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsData>({
    businessName: '',
    businessAddress: '',
    businessPhone: '',
    businessGstin: '',
    bankName: '',
    accountNo: '',
    ifscCode: '',
    upiId: '',
    qrCodeImage: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (res.ok && data) {
        setSettings(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setSavedSuccess(false);
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        setSavedSuccess(true);
        window.dispatchEvent(new Event('settingsUpdated'));
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };


  if (loading) {
    return <div className="py-20 text-center text-zinc-400 font-bold text-sm">Loading business settings...</div>;
  }

  return (
    <div className="w-full space-y-6 text-black">
      {/* Sub-Section Header Bar */}
      <div className="flex justify-between items-center border border-black bg-white p-6 rounded-3xl shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-black tracking-tight flex items-center space-x-3">
            <SettingsIcon className="w-7 h-7 text-black stroke-[1.5]" />
            <span>Business Profile & Settings</span>
          </h1>
          <p className="text-zinc-500 text-xs font-semibold mt-1">
            Configure Kerala GSTIN, invoice header address, bank details, and UPI QR code footer.
          </p>
        </div>
      </div>

      {savedSuccess && (
        <div className="bg-black text-white px-4 py-3 rounded-2xl text-xs font-bold shadow">
          Settings updated successfully! Changes will reflect on all new A4 invoices.
        </div>
      )}

      {/* Settings Form Sub-Section */}
      <form
        onSubmit={handleSave}
        className="bg-white border border-black rounded-3xl p-6 shadow-sm space-y-6"
      >
        {/* Company & GST Info */}
        <div className="space-y-4">
          <h2 className="text-sm font-black uppercase text-black tracking-wider flex items-center space-x-2">
            <Building2 className="w-4 h-4 stroke-[1.5]" />
            <span>Company & GST Info</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-zinc-500 block mb-1">Business Name</label>
              <input
                type="text"
                value={settings.businessName}
                onChange={(e) => setSettings({ ...settings, businessName: e.target.value })}
                className="w-full p-3 rounded-2xl border border-zinc-300 bg-zinc-50 text-black text-xs font-semibold outline-none focus:border-black"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-500 block mb-1">Kerala GSTIN Number</label>
              <input
                type="text"
                value={settings.businessGstin}
                onChange={(e) => setSettings({ ...settings, businessGstin: e.target.value })}
                className="w-full p-3 rounded-2xl border border-zinc-300 bg-zinc-50 text-black text-xs font-mono font-bold outline-none focus:border-black"
                placeholder="32ABCDE1234F1Z5"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-zinc-500 block mb-1">Business Phone</label>
              <input
                type="text"
                value={settings.businessPhone}
                onChange={(e) => setSettings({ ...settings, businessPhone: e.target.value })}
                className="w-full p-3 rounded-2xl border border-zinc-300 bg-zinc-50 text-black text-xs font-semibold outline-none focus:border-black"
                required
              />
            </div>
            <div>
              <label className="text-xs font-bold text-zinc-500 block mb-1">Factory / Office Address</label>
              <input
                type="text"
                value={settings.businessAddress}
                onChange={(e) => setSettings({ ...settings, businessAddress: e.target.value })}
                className="w-full p-3 rounded-2xl border border-zinc-300 bg-zinc-50 text-black text-xs font-semibold outline-none focus:border-black"
                required
              />
            </div>
          </div>
        </div>

        <hr className="border-zinc-200" />

        {/* Bank & UPI QR Setup */}
        <div className="space-y-4">
          <h2 className="text-sm font-black uppercase text-black tracking-wider flex items-center space-x-2">
            <Landmark className="w-4 h-4 stroke-[1.5]" />
            <span>Bank Account & UPI QR Code Setup</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-zinc-500 block mb-1">Bank Name & Branch</label>
              <input
                type="text"
                value={settings.bankName || ''}
                onChange={(e) => setSettings({ ...settings, bankName: e.target.value })}
                className="w-full p-3 rounded-2xl border border-zinc-300 bg-zinc-50 text-black text-xs font-semibold outline-none focus:border-black"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-zinc-500 block mb-1">Account Number</label>
              <input
                type="text"
                value={settings.accountNo || ''}
                onChange={(e) => setSettings({ ...settings, accountNo: e.target.value })}
                className="w-full p-3 rounded-2xl border border-zinc-300 bg-zinc-50 text-black text-xs font-mono font-bold outline-none focus:border-black"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-zinc-500 block mb-1">IFSC Code</label>
              <input
                type="text"
                value={settings.ifscCode || ''}
                onChange={(e) => setSettings({ ...settings, ifscCode: e.target.value })}
                className="w-full p-3 rounded-2xl border border-zinc-300 bg-zinc-50 text-black text-xs font-mono font-bold outline-none focus:border-black"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-zinc-500 block mb-1">UPI VPA Handle</label>
              <input
                type="text"
                value={settings.upiId || ''}
                onChange={(e) => setSettings({ ...settings, upiId: e.target.value })}
                className="w-full p-3 rounded-2xl border border-zinc-300 bg-zinc-50 text-black text-xs font-mono font-bold outline-none focus:border-black"
                placeholder="clearflo@upi"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-zinc-500 block mb-1">Custom UPI QR Image URL</label>
              <input
                type="text"
                value={settings.qrCodeImage || ''}
                onChange={(e) => setSettings({ ...settings, qrCodeImage: e.target.value })}
                className="w-full p-3 rounded-2xl border border-zinc-300 bg-zinc-50 text-black text-xs font-mono outline-none focus:border-black"
                placeholder="https://..."
              />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-zinc-200 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3.5 rounded-2xl bg-black hover:bg-zinc-800 text-white font-black text-xs uppercase tracking-wider flex items-center space-x-2 shadow transition-all"
          >
            <Save className="w-4 h-4 stroke-[2]" />
            <span>{saving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
