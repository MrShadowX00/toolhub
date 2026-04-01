"use client";

import { useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { Plus, Trash2, Printer, Copy } from "lucide-react";

interface LineItem {
  id: number;
  description: string;
  quantity: number;
  unitPrice: number;
}

const CURRENCIES = [
  { code: "USD", symbol: "$" },
  { code: "EUR", symbol: "\u20ac" },
  { code: "GBP", symbol: "\u00a3" },
  { code: "JPY", symbol: "\u00a5" },
  { code: "CAD", symbol: "C$" },
  { code: "AUD", symbol: "A$" },
  { code: "INR", symbol: "\u20b9" },
  { code: "BRL", symbol: "R$" },
];

let nextId = 1;

export default function InvoiceGeneratorTool() {
  const t = useTranslations("toolUi");

  const [companyName, setCompanyName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("INV-001");
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split("T")[0]);
  const [dueDate, setDueDate] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [taxRate, setTaxRate] = useState(0);
  const [items, setItems] = useState<LineItem[]>([
    { id: nextId++, description: "", quantity: 1, unitPrice: 0 },
  ]);
  const [notes, setNotes] = useState("");
  const printRef = useRef<HTMLDivElement>(null);

  const currencySymbol = CURRENCIES.find((c) => c.code === currency)?.symbol || "$";

  const addItem = () => {
    setItems([...items, { id: nextId++, description: "", quantity: 1, unitPrice: 0 }]);
  };

  const removeItem = (id: number) => {
    if (items.length > 1) setItems(items.filter((item) => item.id !== id));
  };

  const updateItem = (id: number, field: keyof LineItem, value: string | number) => {
    setItems(items.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  };

  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const taxAmount = subtotal * (taxRate / 100);
  const total = subtotal + taxAmount;

  const fmt = (n: number) => `${currencySymbol}${n.toFixed(2)}`;

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`<!DOCTYPE html><html><head><title>Invoice ${invoiceNumber}</title><style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 40px; color: #111; }
      .invoice-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; }
      .company-info h1 { font-size: 24px; margin-bottom: 4px; }
      .invoice-meta { text-align: right; }
      .invoice-meta h2 { font-size: 28px; color: #4f46e5; margin-bottom: 8px; }
      .invoice-meta p { font-size: 14px; color: #555; margin-bottom: 2px; }
      .client-info { margin-bottom: 30px; padding: 16px; background: #f8f9fa; border-radius: 8px; }
      .client-info h3 { font-size: 12px; text-transform: uppercase; color: #888; margin-bottom: 6px; }
      .client-info p { font-size: 14px; margin-bottom: 2px; }
      table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
      th { background: #4f46e5; color: #fff; padding: 10px 12px; text-align: left; font-size: 13px; text-transform: uppercase; }
      th:last-child, th:nth-child(3), th:nth-child(2) { text-align: right; }
      td { padding: 10px 12px; border-bottom: 1px solid #e5e7eb; font-size: 14px; }
      td:last-child, td:nth-child(3), td:nth-child(2) { text-align: right; }
      .totals { display: flex; justify-content: flex-end; }
      .totals-table { width: 280px; }
      .totals-table .row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px; }
      .totals-table .row.total { border-top: 2px solid #111; font-weight: 700; font-size: 18px; padding-top: 10px; }
      .notes { margin-top: 30px; padding: 16px; background: #f8f9fa; border-radius: 8px; font-size: 13px; color: #555; }
      .logo { max-height: 60px; max-width: 200px; object-fit: contain; margin-bottom: 8px; }
    </style></head><body>${printContent.innerHTML}</body></html>`);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 300);
  };

  const inputCls = "w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none";
  const labelCls = "block text-sm font-medium text-gray-400 mb-1";
  const btnCls = "bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg px-4 py-2 flex items-center gap-2 transition-colors";

  return (
    <div className="space-y-6">
      {/* Form Section */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 space-y-6">
        <h3 className="text-lg font-semibold text-white">Invoice Details</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Company Name</label>
            <input className={inputCls} value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Your Company" />
          </div>
          <div>
            <label className={labelCls}>Logo URL (optional)</label>
            <input className={inputCls} value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder="https://example.com/logo.png" />
          </div>
          <div>
            <label className={labelCls}>Client Name</label>
            <input className={inputCls} value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Client / Company" />
          </div>
          <div>
            <label className={labelCls}>Client Email</label>
            <input className={inputCls} value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} placeholder="client@example.com" type="email" />
          </div>
          <div>
            <label className={labelCls}>Invoice Number</label>
            <input className={inputCls} value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Currency</label>
            <select className={inputCls} value={currency} onChange={(e) => setCurrency(e.target.value)}>
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>{c.symbol} {c.code}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Invoice Date</label>
            <input className={inputCls} type="date" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Due Date</label>
            <input className={inputCls} type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>
        </div>

        {/* Line Items */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-300">Line Items</h4>
          <div className="hidden md:grid grid-cols-12 gap-2 text-xs text-gray-500 uppercase tracking-wider px-1">
            <div className="col-span-5">Description</div>
            <div className="col-span-2 text-right">Qty</div>
            <div className="col-span-2 text-right">Unit Price</div>
            <div className="col-span-2 text-right">Amount</div>
            <div className="col-span-1" />
          </div>
          {items.map((item) => (
            <div key={item.id} className="grid grid-cols-12 gap-2 items-center">
              <div className="col-span-12 md:col-span-5">
                <input className={inputCls} placeholder="Item description" value={item.description} onChange={(e) => updateItem(item.id, "description", e.target.value)} />
              </div>
              <div className="col-span-4 md:col-span-2">
                <input className={`${inputCls} text-right`} type="number" min="1" value={item.quantity} onChange={(e) => updateItem(item.id, "quantity", Math.max(1, Number(e.target.value)))} />
              </div>
              <div className="col-span-4 md:col-span-2">
                <input className={`${inputCls} text-right`} type="number" min="0" step="0.01" value={item.unitPrice} onChange={(e) => updateItem(item.id, "unitPrice", Math.max(0, Number(e.target.value)))} />
              </div>
              <div className="col-span-3 md:col-span-2 text-right text-gray-300 py-2 text-sm">
                {fmt(item.quantity * item.unitPrice)}
              </div>
              <div className="col-span-1 flex justify-center">
                <button onClick={() => removeItem(item.id)} className="text-gray-500 hover:text-red-400 transition-colors p-1" disabled={items.length === 1}>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
          <button onClick={addItem} className="text-indigo-400 hover:text-indigo-300 text-sm flex items-center gap-1 transition-colors">
            <Plus size={16} /> Add Line Item
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className={labelCls}>Tax Rate (%)</label>
            <input className={inputCls} type="number" min="0" max="100" step="0.5" value={taxRate} onChange={(e) => setTaxRate(Math.max(0, Number(e.target.value)))} />
          </div>
          <div className="md:col-span-2">
            <label className={labelCls}>Notes (optional)</label>
            <input className={inputCls} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Payment terms, thank you note, etc." />
          </div>
        </div>

        {/* Summary */}
        <div className="flex justify-end">
          <div className="w-full max-w-xs space-y-1 text-sm">
            <div className="flex justify-between text-gray-400">
              <span>Subtotal</span>
              <span>{fmt(subtotal)}</span>
            </div>
            {taxRate > 0 && (
              <div className="flex justify-between text-gray-400">
                <span>Tax ({taxRate}%)</span>
                <span>{fmt(taxAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-white font-bold text-lg border-t border-gray-700 pt-2 mt-2">
              <span>Total</span>
              <span>{fmt(total)}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={handlePrint} className={btnCls}>
            <Printer size={16} /> Download / Print PDF
          </button>
        </div>
      </div>

      {/* Hidden print-ready invoice */}
      <div className="hidden">
        <div ref={printRef}>
          <div className="invoice-header">
            <div className="company-info">
              {logoUrl && <img src={logoUrl} alt="Logo" className="logo" crossOrigin="anonymous" />}
              <h1>{companyName || "Your Company"}</h1>
            </div>
            <div className="invoice-meta">
              <h2>INVOICE</h2>
              <p><strong>{invoiceNumber}</strong></p>
              <p>Date: {invoiceDate}</p>
              {dueDate && <p>Due: {dueDate}</p>}
            </div>
          </div>

          <div className="client-info">
            <h3>Bill To</h3>
            <p><strong>{clientName || "Client Name"}</strong></p>
            {clientEmail && <p>{clientEmail}</p>}
          </div>

          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>{item.description || "—"}</td>
                  <td>{item.quantity}</td>
                  <td>{fmt(item.unitPrice)}</td>
                  <td>{fmt(item.quantity * item.unitPrice)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="totals">
            <div className="totals-table">
              <div className="row"><span>Subtotal</span><span>{fmt(subtotal)}</span></div>
              {taxRate > 0 && <div className="row"><span>Tax ({taxRate}%)</span><span>{fmt(taxAmount)}</span></div>}
              <div className="row total"><span>Total ({currency})</span><span>{fmt(total)}</span></div>
            </div>
          </div>

          {notes && <div className="notes"><strong>Notes:</strong> {notes}</div>}
        </div>
      </div>

      {/* Live Preview */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Invoice Preview</h3>
        <div className="bg-white text-gray-900 rounded-lg p-8 max-w-3xl mx-auto">
          <div className="flex justify-between items-start mb-8">
            <div>
              {logoUrl && (
                <img src={logoUrl} alt="Logo" className="max-h-12 max-w-[160px] object-contain mb-2" />
              )}
              <h2 className="text-xl font-bold text-gray-900">{companyName || "Your Company"}</h2>
            </div>
            <div className="text-right">
              <h2 className="text-2xl font-bold text-indigo-600">INVOICE</h2>
              <p className="text-sm text-gray-600 font-semibold">{invoiceNumber}</p>
              <p className="text-sm text-gray-500">Date: {invoiceDate}</p>
              {dueDate && <p className="text-sm text-gray-500">Due: {dueDate}</p>}
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-xs uppercase text-gray-400 font-semibold mb-1">Bill To</p>
            <p className="font-semibold text-gray-800">{clientName || "Client Name"}</p>
            {clientEmail && <p className="text-sm text-gray-500">{clientEmail}</p>}
          </div>

          <table className="w-full mb-6">
            <thead>
              <tr className="bg-indigo-600 text-white text-sm">
                <th className="text-left py-2 px-3 rounded-tl-lg">Description</th>
                <th className="text-right py-2 px-3">Qty</th>
                <th className="text-right py-2 px-3">Price</th>
                <th className="text-right py-2 px-3 rounded-tr-lg">Amount</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-gray-200">
                  <td className="py-2 px-3 text-sm">{item.description || "—"}</td>
                  <td className="py-2 px-3 text-sm text-right">{item.quantity}</td>
                  <td className="py-2 px-3 text-sm text-right">{fmt(item.unitPrice)}</td>
                  <td className="py-2 px-3 text-sm text-right font-medium">{fmt(item.quantity * item.unitPrice)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end">
            <div className="w-64 space-y-1 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span><span>{fmt(subtotal)}</span>
              </div>
              {taxRate > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>Tax ({taxRate}%)</span><span>{fmt(taxAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-900 font-bold text-lg border-t-2 border-gray-900 pt-2 mt-1">
                <span>Total ({currency})</span><span>{fmt(total)}</span>
              </div>
            </div>
          </div>

          {notes && (
            <div className="mt-6 bg-gray-50 rounded-lg p-4 text-sm text-gray-500">
              <strong>Notes:</strong> {notes}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
