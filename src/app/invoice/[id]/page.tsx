'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Printer,
  Edit3,
  Check,
  ArrowLeft,
  Plus,
  Trash2,
} from 'lucide-react';
import { formatRupees, calculateKeralaGST, toPaise, toRupees } from '@/lib/money';

interface InvoiceItem {
  id?: string;
  productName: string;
  unit: string;
  unitPriceInPaise: number;
  quantity: number;
  totalInPaise: number;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string;
  customerName: string;
  customerPhone?: string;
  customerLocation: string;
  customerGstin?: string;
  orderType: 'DELIVERY' | 'PICKUP';
  paymentMethod: string;
  paymentStatus: string;
  subtotalInPaise: number;
  cgstInPaise: number;
  sgstInPaise: number;
  totalInPaise: number;
  notes?: string;
  items: InvoiceItem[];
}

interface Settings {
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

export default function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Editable Form State
  const [editableInvoice, setEditableInvoice] = useState<Invoice | null>(null);

  useEffect(() => {
    fetchInvoiceAndSettings();
  }, [id]);

  const fetchInvoiceAndSettings = async () => {
    try {
      setLoading(true);
      const [invRes, setRes] = await Promise.all([
        fetch(`/api/invoices/${id}`),
        fetch('/api/settings'),
      ]);

      const invData = await invRes.json();
      const setData = await setRes.json();

      if (invRes.ok) {
        setInvoice(invData);
        setEditableInvoice(JSON.parse(JSON.stringify(invData)));
      }
      if (setRes.ok) {
        setSettings(setData);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Pre-Print Editor Changes
  const handleItemChange = (index: number, field: string, value: any) => {
    if (!editableInvoice) return;
    const updatedItems = [...editableInvoice.items];
    const item = { ...updatedItems[index] };

    if (field === 'productName') item.productName = value;
    if (field === 'unit') item.unit = value;
    if (field === 'unitPriceRupees') {
      item.unitPriceInPaise = toPaise(value);
    }
    if (field === 'quantity') {
      item.quantity = Math.max(1, parseInt(value) || 1);
    }

    item.totalInPaise = item.unitPriceInPaise * item.quantity;
    updatedItems[index] = item;

    // Recalculate Subtotal and Tax
    const subtotalInPaise = updatedItems.reduce((acc, i) => acc + i.totalInPaise, 0);
    const { cgstInPaise, sgstInPaise, totalInPaise } = calculateKeralaGST(subtotalInPaise);

    setEditableInvoice({
      ...editableInvoice,
      items: updatedItems,
      subtotalInPaise,
      cgstInPaise,
      sgstInPaise,
      totalInPaise,
    });
  };

  const handleAddItem = () => {
    if (!editableInvoice) return;
    const newItem: InvoiceItem = {
      productName: 'ClearFlo Detergent Item',
      unit: '5L Can',
      unitPriceInPaise: 45000,
      quantity: 1,
      totalInPaise: 45000,
    };
    const updatedItems = [...editableInvoice.items, newItem];
    const subtotalInPaise = updatedItems.reduce((acc, i) => acc + i.totalInPaise, 0);
    const { cgstInPaise, sgstInPaise, totalInPaise } = calculateKeralaGST(subtotalInPaise);

    setEditableInvoice({
      ...editableInvoice,
      items: updatedItems,
      subtotalInPaise,
      cgstInPaise,
      sgstInPaise,
      totalInPaise,
    });
  };

  const handleRemoveItem = (index: number) => {
    if (!editableInvoice || editableInvoice.items.length <= 1) return;
    const updatedItems = editableInvoice.items.filter((_, i) => i !== index);
    const subtotalInPaise = updatedItems.reduce((acc, i) => acc + i.totalInPaise, 0);
    const { cgstInPaise, sgstInPaise, totalInPaise } = calculateKeralaGST(subtotalInPaise);

    setEditableInvoice({
      ...editableInvoice,
      items: updatedItems,
      subtotalInPaise,
      cgstInPaise,
      sgstInPaise,
      totalInPaise,
    });
  };

  const handleSaveEdits = async () => {
    if (!editableInvoice) return;
    try {
      setSaving(true);
      const res = await fetch(`/api/invoices/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editableInvoice),
      });

      const updated = await res.json();
      if (res.ok) {
        setInvoice(updated);
        setEditableInvoice(JSON.parse(JSON.stringify(updated)));
        setIsEditing(false);
      } else {
        alert(updated.error || 'Failed to save invoice edits');
      }
    } catch (err) {
      console.error(err);
      alert('Error saving edits');
    } finally {
      setSaving(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading || !editableInvoice) {
    return (
      <div className="py-20 text-center text-zinc-400 font-bold text-sm">
        Generating A4 Printable Invoice preview...
      </div>
    );
  }

  const activeInvoice = isEditing ? editableInvoice : invoice || editableInvoice;

  return (
    <div className="space-y-6 text-black">
      {/* Action Bar (Hidden on Print) */}
      <div className="print:hidden p-4 rounded-3xl border border-black bg-white flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center space-x-3">
          <Link
            href="/"
            className="px-4 py-2 rounded-2xl text-xs font-bold flex items-center space-x-2 transition-colors bg-zinc-100 hover:bg-zinc-200 text-black border border-zinc-300"
          >
            <ArrowLeft className="w-4 h-4 stroke-[1.5]" />
            <span>Back to POS</span>
          </Link>
          <div className="h-5 w-px bg-zinc-300" />
          <span className="font-black text-sm text-black">
            Invoice: {activeInvoice.invoiceNumber}
          </span>
          <span className="text-[11px] font-black px-3 py-0.5 rounded-full bg-black text-white uppercase tracking-wider">
            {activeInvoice.orderType}
          </span>
        </div>

        <div className="flex items-center space-x-3">
          {isEditing ? (
            <>
              <button
                onClick={() => {
                  setEditableInvoice(JSON.parse(JSON.stringify(invoice)));
                  setIsEditing(false);
                }}
                className="px-4 py-2 rounded-2xl bg-zinc-100 hover:bg-zinc-200 text-black text-xs font-bold border border-zinc-300"
              >
                Cancel Edits
              </button>
              <button
                onClick={handleSaveEdits}
                disabled={saving}
                className="px-4 py-2 rounded-2xl bg-black hover:bg-zinc-800 text-white text-xs font-black flex items-center space-x-1.5 shadow"
              >
                <Check className="w-4 h-4 stroke-[2]" />
                <span>{saving ? 'Saving...' : 'Save Pre-Print Edits'}</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 rounded-2xl bg-zinc-100 hover:bg-zinc-200 text-black text-xs font-black flex items-center space-x-2 transition-colors border border-zinc-300"
              >
                <Edit3 className="w-4 h-4 stroke-[1.5]" />
                <span>Pre-Print Editor</span>
              </button>
              <button
                onClick={handlePrint}
                className="px-5 py-2.5 rounded-2xl bg-black hover:bg-zinc-800 text-white font-black text-xs uppercase tracking-wider flex items-center space-x-2 shadow transition-all"
              >
                <Printer className="w-4 h-4 stroke-[1.5]" />
                <span>Print A4 Invoice</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* A4 PRINTABLE SHEET CONTAINER (Pixel-Perfect A4 Sheet: 210mm width) */}
      <div className="flex justify-center">
        <div
          id="printable-a4-sheet"
          className={`w-full max-w-[210mm] min-h-[297mm] bg-white text-slate-900 p-8 sm:p-10 rounded-lg shadow-2xl print:shadow-none print:m-0 print:p-8 print:w-full print:max-w-none text-xs leading-relaxed select-text font-sans relative ${
            isEditing ? 'ring-4 ring-black' : ''
          }`}
        >
          {/* Top Pre-print Banner (Hidden on Print) */}
          {isEditing && (
            <div className="print:hidden bg-zinc-100 border border-black text-black p-3 rounded-xl mb-6 flex items-center justify-between text-xs font-bold">
              <span className="flex items-center space-x-2">
                <Edit3 className="w-4 h-4 text-black stroke-[1.5]" />
                <span>Pre-Print Live Editor Enabled: Edit text, quantities, prices, or line items below before printing.</span>
              </span>
            </div>
          )}

          {/* Business Header */}
          <div className="flex justify-between items-start pb-6 border-b-2 border-black">
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">
                {settings?.businessName || 'ClearFlo Liquid Detergents'}
              </h1>
              <p className="text-slate-600 text-[11px] font-medium max-w-sm mt-1">
                {settings?.businessAddress || 'Industrial Development Plot, Kalamassery, Kochi, Kerala - 683109'}
              </p>
              <div className="flex items-center space-x-4 text-[11px] text-slate-600 mt-2">
                <span><strong>Phone:</strong> {settings?.businessPhone || '+91 94471 23456'}</span>
                <span><strong>GSTIN:</strong> <span className="font-mono font-bold text-slate-900">{settings?.businessGstin || '32ABCDE1234F1Z5'}</span></span>
              </div>
            </div>

            <div className="text-right">
              <div className="bg-black text-white font-black text-lg px-4 py-1.5 rounded uppercase tracking-wider inline-block mb-2">
                TAX INVOICE
              </div>
              <p className="text-slate-800 font-bold font-mono text-sm">
                #{activeInvoice.invoiceNumber}
              </p>
              <p className="text-slate-600 text-[11px]">
                Date: {new Date(activeInvoice.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
              </p>
            </div>
          </div>

          {/* Customer & Order Details Grid */}
          <div className="grid grid-cols-2 gap-6 py-5 border-b border-slate-200">
            {/* Customer Details */}
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block">
                Billed To (Customer):
              </span>
              {isEditing ? (
                <div className="space-y-1.5">
                  <input
                    type="text"
                    value={editableInvoice.customerName}
                    onChange={(e) => setEditableInvoice({ ...editableInvoice, customerName: e.target.value })}
                    className="w-full font-bold border border-black rounded px-2 py-1 text-xs"
                    placeholder="Customer Name"
                  />
                  <input
                    type="text"
                    value={editableInvoice.customerLocation}
                    onChange={(e) => setEditableInvoice({ ...editableInvoice, customerLocation: e.target.value })}
                    className="w-full border border-black rounded px-2 py-1 text-xs"
                    placeholder="Location"
                  />
                  <input
                    type="text"
                    value={editableInvoice.customerPhone || ''}
                    onChange={(e) => setEditableInvoice({ ...editableInvoice, customerPhone: e.target.value })}
                    className="w-full border border-black rounded px-2 py-1 text-xs"
                    placeholder="Phone"
                  />
                  <input
                    type="text"
                    value={editableInvoice.customerGstin || ''}
                    onChange={(e) => setEditableInvoice({ ...editableInvoice, customerGstin: e.target.value })}
                    className="w-full border border-black rounded px-2 py-1 text-xs"
                    placeholder="Customer GSTIN (Optional)"
                  />
                </div>
              ) : (
                <>
                  <h2 className="font-extrabold text-sm text-slate-900">{activeInvoice.customerName}</h2>
                  <p className="text-slate-700 text-xs font-medium">{activeInvoice.customerLocation}</p>
                  {activeInvoice.customerPhone && (
                    <p className="text-slate-600 text-[11px]">Ph: {activeInvoice.customerPhone}</p>
                  )}
                  {activeInvoice.customerGstin && (
                    <p className="text-slate-600 text-[11px]">GSTIN: <span className="font-mono font-semibold">{activeInvoice.customerGstin}</span></p>
                  )}
                </>
              )}
            </div>

            {/* Order & Transport Info */}
            <div className="space-y-1 text-right">
              <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block">
                Order & Transport:
              </span>
              <div className="flex justify-end items-center space-x-2 my-1">
                <span className="font-bold text-slate-700">Order Type:</span>
                {isEditing ? (
                  <select
                    value={editableInvoice.orderType}
                    onChange={(e: any) => setEditableInvoice({ ...editableInvoice, orderType: e.target.value })}
                    className="border border-black font-bold rounded px-2 py-0.5 text-xs bg-white"
                  >
                    <option value="DELIVERY">DELIVERY</option>
                    <option value="PICKUP">PICKUP</option>
                  </select>
                ) : (
                  <span className="font-extrabold uppercase text-white px-2 py-0.5 bg-black rounded">
                    {activeInvoice.orderType}
                  </span>
                )}
              </div>
              <p className="text-slate-600 text-[11px]">State of Supply: <strong>Kerala (32)</strong></p>
              <p className="text-slate-600 text-[11px]">Payment Mode: <strong>{activeInvoice.paymentMethod}</strong></p>
              <p className="text-slate-600 text-[11px]">Payment Status: <span className="font-bold text-black">{activeInvoice.paymentStatus}</span></p>
            </div>
          </div>

          {/* Line Items Table with Kerala GST Breakdown */}
          <div className="my-6">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-black text-white font-extrabold text-[11px] uppercase tracking-wider">
                  <th className="p-2.5 rounded-l text-center w-10">#</th>
                  <th className="p-2.5">Item & Description</th>
                  <th className="p-2.5 text-center">Unit</th>
                  <th className="p-2.5 text-center">Qty</th>
                  <th className="p-2.5 text-right">Rate (₹)</th>
                  <th className="p-2.5 text-right rounded-r">Amount (₹)</th>
                  {isEditing && <th className="p-2.5 text-center print:hidden w-10">Action</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {activeInvoice.items.map((item, index) => (
                  <tr key={index} className="hover:bg-slate-50">
                    <td className="p-2.5 text-center font-bold text-slate-500">{index + 1}</td>
                    <td className="p-2.5 font-bold text-slate-900">
                      {isEditing ? (
                        <input
                          type="text"
                          value={item.productName}
                          onChange={(e) => handleItemChange(index, 'productName', e.target.value)}
                          className="w-full border border-black rounded px-2 py-1 text-xs"
                        />
                      ) : (
                        item.productName
                      )}
                    </td>
                    <td className="p-2.5 text-center text-slate-600">
                      {isEditing ? (
                        <input
                          type="text"
                          value={item.unit}
                          onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                          className="w-16 text-center border border-black rounded px-1 py-1 text-xs"
                        />
                      ) : (
                        item.unit
                      )}
                    </td>
                    <td className="p-2.5 text-center font-bold">
                      {isEditing ? (
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                          className="w-14 text-center border border-black rounded px-1 py-1 text-xs font-bold"
                        />
                      ) : (
                        item.quantity
                      )}
                    </td>
                    <td className="p-2.5 text-right font-mono">
                      {isEditing ? (
                        <input
                          type="number"
                          step="0.01"
                          value={toRupees(item.unitPriceInPaise)}
                          onChange={(e) => handleItemChange(index, 'unitPriceRupees', e.target.value)}
                          className="w-20 text-right border border-black rounded px-1 py-1 text-xs font-mono"
                        />
                      ) : (
                        formatRupees(item.unitPriceInPaise)
                      )}
                    </td>
                    <td className="p-2.5 text-right font-mono font-bold text-slate-900">
                      {formatRupees(item.totalInPaise)}
                    </td>
                    {isEditing && (
                      <td className="p-2.5 text-center print:hidden">
                        <button
                          onClick={() => handleRemoveItem(index)}
                          className="text-black hover:text-zinc-600 p-1"
                        >
                          <Trash2 className="w-4 h-4 stroke-[1.5]" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>

            {isEditing && (
              <div className="mt-3 print:hidden">
                <button
                  onClick={handleAddItem}
                  className="px-3 py-1.5 rounded bg-black text-white font-bold text-xs flex items-center space-x-1"
                >
                  <Plus className="w-4 h-4 stroke-[2]" />
                  <span>Add Line Item</span>
                </button>
              </div>
            )}
          </div>

          {/* Financial Calculation Summary (Subtotal + 9% CGST + 9% SGST + Grand Total) */}
          <div className="flex justify-end pt-3">
            <div className="w-72 space-y-2 border-t-2 border-black pt-3">
              <div className="flex justify-between text-slate-700 font-medium">
                <span>Subtotal (Excl. Tax):</span>
                <span className="font-mono font-bold">{formatRupees(activeInvoice.subtotalInPaise)}</span>
              </div>
              <div className="flex justify-between text-slate-600 text-[11px]">
                <span>CGST @ 9% (Kerala):</span>
                <span className="font-mono">{formatRupees(activeInvoice.cgstInPaise)}</span>
              </div>
              <div className="flex justify-between text-slate-600 text-[11px]">
                <span>SGST @ 9% (Kerala):</span>
                <span className="font-mono">{formatRupees(activeInvoice.sgstInPaise)}</span>
              </div>
              <div className="flex justify-between text-sm font-black text-slate-900 border-t border-slate-300 pt-2">
                <span>Grand Total (Incl. 18% GST):</span>
                <span className="font-mono text-base">{formatRupees(activeInvoice.totalInPaise)}</span>
              </div>
            </div>
          </div>

          {/* Footer with UPI QR Code Payment Placeholder & Bank Details */}
          <div className="mt-12 pt-6 border-t border-slate-300 grid grid-cols-2 gap-6 items-end">
            <div className="space-y-2 text-[11px] text-slate-700">
              <h4 className="font-bold text-slate-900 uppercase">Bank Details for Payment:</h4>
              <p>Bank Name: <strong>{settings?.bankName || 'State Bank of India'}</strong></p>
              <p>Account No: <strong className="font-mono">{settings?.accountNo || '123456789012'}</strong></p>
              <p>IFSC Code: <strong className="font-mono">{settings?.ifscCode || 'SBIN0001234'}</strong></p>
              <p>UPI ID: <strong className="font-mono">{settings?.upiId || 'clearflo@upi'}</strong></p>
            </div>

            <div className="flex flex-col items-end text-right space-y-2">
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                Scan to Pay via UPI:
              </span>
              <div className="w-28 h-28 bg-slate-50 border-2 border-black p-1 rounded-lg flex items-center justify-center shadow-sm">
                <img
                  src={settings?.qrCodeImage || `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=${settings?.upiId || 'clearflo@upi'}&pn=ClearFlo%20Detergents&am=${toRupees(activeInvoice.totalInPaise)}`}
                  alt="UPI QR Code"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-[10px] text-slate-500 font-mono">
                {settings?.upiId || 'clearflo@upi'}
              </span>
            </div>
          </div>

          {/* Terms & Signature */}
          <div className="mt-8 pt-4 border-t border-slate-200 flex justify-between items-end text-[10px] text-slate-500">
            <div>
              <p className="font-semibold text-slate-700">Terms & Conditions:</p>
              <p>1. Goods once sold are non-refundable after 7 days.</p>
              <p>2. Subject to Kochi jurisdiction only.</p>
            </div>
            <div className="text-right">
              <div className="h-10 border-b border-slate-400 w-40 mb-1"></div>
              <p className="font-bold text-slate-900 uppercase">Authorized Signatory</p>
              <p>ClearFlo Liquid Detergents</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
