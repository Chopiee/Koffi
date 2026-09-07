import { useState, useRef, useEffect, FormEvent } from 'react';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Calendar as CalendarIcon,
  Check,
  Building2,
  Paperclip,
  FileText,
  Sun,
  ChevronRight,
  ChevronDown,
  X,
  ScanBarcode,
} from 'lucide-react';
import { PurchaseTransaction, PurchaseItem } from '../types';

export interface CreateSalesInitialData {
  customer: string;
  invoiceNo: string;
  date: string;
  dueDate: string;
}

interface CreateSalesPageProps {
  initialData: CreateSalesInitialData;
  onBack: () => void;
  onCancel: () => void;
  onSave: (transaction: Omit<PurchaseTransaction, 'id' | 'createdAt'>) => void;
}

const CUSTOMER_OPTIONS = [
  'Booking',
  'Airbnb',
  'Guesty',
  'Walk-in Guest',
  'Corporate Client',
  'Direct Customer',
  'Sunset Resort',
  'N/A',
];

// Default product presets by customer
const CUSTOMER_PRESETS: Record<
  string,
  Omit<PurchaseItem, 'id' | 'total' | 'subtotal' | 'discountAmount' | 'taxAmount'>[]
> = {
  Booking: [
    { name: 'Deluxe Villa Booking Package', quantity: 1, unitPrice: 1250, discountPercent: 0, taxPercent: 11, category: 'Services' },
    { name: 'Welcome Amenities & Airport Transfer', quantity: 1, unitPrice: 170, discountPercent: 0, taxPercent: 11, category: 'Services' },
  ],
  Airbnb: [
    { name: 'Suite Room Weekend Stay', quantity: 2, unitPrice: 200, discountPercent: 0, taxPercent: 11, category: 'Services' },
    { name: 'Breakfast & Refreshment Add-on', quantity: 1, unitPrice: 50, discountPercent: 0, taxPercent: 11, category: 'Services' },
  ],
  Guesty: [
    { name: 'Executive Villa Direct Reservation', quantity: 1, unitPrice: 1100, discountPercent: 5, taxPercent: 11, category: 'Services' },
  ],
  'Walk-in Guest': [
    { name: 'Standard Deluxe Night Stay', quantity: 1, unitPrice: 280, discountPercent: 0, taxPercent: 11, category: 'Services' },
    { name: 'Dining & Spa Voucher', quantity: 1, unitPrice: 30, discountPercent: 0, taxPercent: 11, category: 'Services' },
  ],
  'Corporate Client': [
    { name: 'Corporate Conference & Suite Package', quantity: 1, unitPrice: 2500, discountPercent: 10, taxPercent: 11, category: 'Services' },
    { name: 'Catering & Meeting Room Rental', quantity: 1, unitPrice: 800, discountPercent: 0, taxPercent: 11, category: 'Services' },
  ],
  'Direct Customer': [
    { name: 'Private Ocean View Villa Stay', quantity: 3, unitPrice: 400, discountPercent: 5, taxPercent: 11, category: 'Services' },
  ],
  'Sunset Resort': [
    { name: 'Group Accommodation Service', quantity: 5, unitPrice: 350, discountPercent: 8, taxPercent: 11, category: 'Services' },
  ],
  'N/A': [
    { name: 'Custom Sales Product / Service', quantity: 1, unitPrice: 100, discountPercent: 0, taxPercent: 11, category: 'Services' },
  ],
};

function CustomerLogo({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' | 'lg' }) {
  const isSm = size === 'sm';
  const isLg = size === 'lg';
  const containerClass = isSm
    ? 'w-4 h-4 text-[9px]'
    : isLg
    ? 'w-6 h-6 text-[11px]'
    : 'w-5 h-5 text-[9.5px]';

  if (name === 'Booking') {
    return (
      <div className={`${containerClass} rounded-full bg-[#003580] text-white flex items-center justify-center font-bold shrink-0 shadow-2xs`}>
        B.
      </div>
    );
  }

  if (name === 'Airbnb') {
    return (
      <div className={`${containerClass} rounded-full bg-[#FF5A5F] text-white flex items-center justify-center shrink-0 shadow-2xs p-0.5`}>
        <svg viewBox="0 0 32 32" className="w-3 h-3 fill-current">
          <path d="M16 1c2.008 0 3.463.963 4.751 3.269l.533 1.025c1.954 3.83 4.293 8.793 5.433 12.35 1.554 4.846.541 8.924-2.593 11.025-2.222 1.488-5.06 1.706-7.828.618l-.296-.123c-2.846-1.229-5.187-3.955-6.31-7.469-.974-3.053-.941-6.425.093-9.525.993-2.977 2.665-6.326 4.786-10.428l.492-.934C13.292 2.308 14.492 1 16 1zm0 2c-1.341 0-2.22.997-3.23 2.871l-.479.911c-2.148 4.153-3.805 7.472-4.78 10.398-.946 2.839-.976 5.86-.115 8.561.966 3.023 2.946 5.344 5.34 6.381 2.348.923 4.72.716 6.536-.503 2.502-1.677 3.324-5.09 1.96-9.349-1.077-3.364-3.385-8.257-5.31-12.029l-.515-.992C18.423 4.385 17.29 3 16 3zm0 13a4 4 0 1 1 0 8 4 4 0 0 1 0-8zm0 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" />
        </svg>
      </div>
    );
  }

  if (name === 'Guesty') {
    return (
      <div className={`${containerClass} rounded-full bg-[#38BDF8] text-white flex items-center justify-center shrink-0 shadow-2xs p-0.5`}>
        <svg viewBox="0 0 24 24" className="w-3 h-3 fill-current">
          <path d="M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3z" />
        </svg>
      </div>
    );
  }

  return (
    <div className={`${containerClass} rounded-full bg-neutral-800 text-white flex items-center justify-center font-bold shrink-0 shadow-2xs`}>
      <Building2 size={isSm ? 10 : 12} />
    </div>
  );
}

export function CreateSalesPage({
  initialData,
  onBack,
  onCancel,
  onSave,
}: CreateSalesPageProps) {
  const [customer, setCustomer] = useState(initialData.customer || CUSTOMER_OPTIONS[0]);
  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);
  const customerDropdownRef = useRef<HTMLDivElement>(null);

  const [invoiceNo, setInvoiceNo] = useState(
    initialData.invoiceNo || `SL-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
  );
  const [date, setDate] = useState(initialData.date || new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(
    initialData.dueDate || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]
  );

  const [notes, setNotes] = useState('Payment due within net terms. Thank you for your business.');
  const [status, setStatus] = useState<'Paid' | 'Unpaid' | 'Partially Paid'>('Paid');
  const [paymentMethod, setPaymentMethod] = useState('Bank Transfer');

  const defaultPreset = CUSTOMER_PRESETS[customer] || CUSTOMER_PRESETS['Booking'];
  const [items, setItems] = useState<PurchaseItem[]>(
    defaultPreset.map((p, index) => {
      const subtotal = p.quantity * p.unitPrice;
      const discAmt = (subtotal * (p.discountPercent || 0)) / 100;
      const taxable = subtotal - discAmt;
      const taxAmt = (taxable * (p.taxPercent || 0)) / 100;
      return {
        ...p,
        id: `item-${index + 1}`,
        subtotal,
        discountAmount: discAmt,
        taxAmount: taxAmt,
        total: taxable + taxAmt,
      };
    })
  );

  // Close customer dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        customerDropdownRef.current &&
        !customerDropdownRef.current.contains(event.target as Node)
      ) {
        setIsCustomerDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectCustomer = (selected: string) => {
    setCustomer(selected);
    setIsCustomerDropdownOpen(false);

    const preset = CUSTOMER_PRESETS[selected] || CUSTOMER_PRESETS['Booking'];
    setItems(
      preset.map((p, index) => {
        const subtotal = p.quantity * p.unitPrice;
        const discAmt = (subtotal * (p.discountPercent || 0)) / 100;
        const taxable = subtotal - discAmt;
        const taxAmt = (taxable * (p.taxPercent || 0)) / 100;
        return {
          ...p,
          id: `item-${Date.now()}-${index}`,
          subtotal,
          discountAmount: discAmt,
          taxAmount: taxAmt,
          total: taxable + taxAmt,
        };
      })
    );
  };

  const handleItemChange = (
    id: string,
    field: keyof PurchaseItem,
    value: string | number
  ) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, [field]: value };

        const qty = Number(updated.quantity) || 0;
        const price = Number(updated.unitPrice) || 0;
        const discP = Number(updated.discountPercent) || 0;
        const taxP = Number(updated.taxPercent) || 0;

        const subtotal = qty * price;
        const discAmt = (subtotal * discP) / 100;
        const taxable = subtotal - discAmt;
        const taxAmt = (taxable * taxP) / 100;
        const total = taxable + taxAmt;

        return {
          ...updated,
          subtotal,
          discountAmount: discAmt,
          taxAmount: taxAmt,
          total,
        };
      })
    );
  };

  const handleAddItem = () => {
    const newItem: PurchaseItem = {
      id: `item-${Date.now()}`,
      name: 'New Service Item',
      quantity: 1,
      unitPrice: 100,
      discountPercent: 0,
      discountAmount: 0,
      taxPercent: 11,
      taxAmount: 11,
      subtotal: 100,
      total: 111,
      category: 'Services',
    };
    setItems((prev) => [...prev, newItem]);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const subtotalSum = items.reduce((sum, item) => sum + (item.subtotal || 0), 0);
  const discountSum = items.reduce((sum, item) => sum + (item.discountAmount || 0), 0);
  const taxSum = items.reduce((sum, item) => sum + (item.taxAmount || 0), 0);
  const grandTotal = items.reduce((sum, item) => sum + item.total, 0);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSave({
      invoiceNo,
      date,
      dueDate,
      deadline: 'In 14 days',
      description: items.map((i) => i.name).join(', '),
      supplier: customer,
      connection: customer,
      tag: status,
      category: items[0]?.category || 'Services',
      amount: Math.round(grandTotal),
      subtotal: subtotalSum,
      totalDiscount: discountSum,
      totalTax: taxSum,
      status,
      paymentMethod,
      notes,
      items,
    });
  };

  return (
    <div className="w-full max-w-[1000px] mx-auto pt-8 md:pt-12 pb-24 px-4 md:px-8 font-sans animate-in fade-in duration-200">
      {/* 1. Header Breadcrumbs */}
      <div className="flex items-center gap-1.5 text-[13px] text-neutral-500 mb-4">
        <button
          onClick={onBack}
          className="hover:text-neutral-800 transition-colors cursor-pointer"
        >
          Sales
        </button>
        <ChevronRight size={13} className="text-neutral-400 stroke-[2]" />
        <span className="text-neutral-900 font-medium">New Sales Invoice</span>
      </div>

      {/* 2. Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl border border-neutral-200/80 hover:bg-neutral-100 text-neutral-600 hover:text-neutral-900 transition-colors cursor-pointer shadow-2xs"
            title="Back to Sales List"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-[22px] font-bold text-neutral-950 tracking-tight">
              Create Sales Invoice
            </h1>
            <p className="text-[13px] text-neutral-500">
              Fill in customer details and invoice line items below
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-xl border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 transition-colors text-[13.5px] font-medium cursor-pointer shadow-2xs"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white transition-colors text-[13.5px] font-medium cursor-pointer shadow-2xs flex items-center gap-2"
          >
            <Check size={15} />
            <span>Save Sales Invoice</span>
          </button>
        </div>
      </div>

      {/* 3. Main Invoice Form Card */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl border border-neutral-200/90 p-6 md:p-8 shadow-2xs space-y-6">
          {/* Customer & Invoice Meta Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            {/* Customer Dropdown */}
            <div className="md:col-span-2 relative" ref={customerDropdownRef}>
              <label className="block text-[12px] font-semibold text-neutral-500 mb-1.5">
                Customer
              </label>
              <button
                type="button"
                onClick={() => setIsCustomerDropdownOpen(!isCustomerDropdownOpen)}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-neutral-200/90 bg-neutral-50/50 hover:bg-neutral-50 text-left text-[14px] transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5 truncate">
                  <CustomerLogo name={customer} />
                  <span className="text-neutral-900 font-medium truncate">{customer}</span>
                </div>
                <ChevronDown size={15} className="text-neutral-400 shrink-0 ml-2" />
              </button>

              {isCustomerDropdownOpen && (
                <div className="absolute top-[calc(100%+4px)] left-0 right-0 z-50 bg-white rounded-xl shadow-xl border border-neutral-200 py-1 max-h-56 overflow-y-auto">
                  {CUSTOMER_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => handleSelectCustomer(opt)}
                      className={`w-full flex items-center justify-between px-3.5 py-2 text-left text-[13.5px] hover:bg-neutral-50 cursor-pointer ${
                        customer === opt ? 'font-medium bg-neutral-50' : 'text-neutral-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <CustomerLogo name={opt} size="sm" />
                        <span className="truncate">{opt}</span>
                      </div>
                      {customer === opt && <Check size={14} className="text-neutral-900 shrink-0" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Invoice No */}
            <div>
              <label className="block text-[12px] font-semibold text-neutral-500 mb-1.5">
                Invoice Number
              </label>
              <input
                type="text"
                value={invoiceNo}
                onChange={(e) => setInvoiceNo(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200/90 bg-white text-[13.5px] font-mono text-neutral-900 outline-none focus:border-neutral-400 transition-colors"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-[12px] font-semibold text-neutral-500 mb-1.5">
                Payment Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200/90 bg-white text-[13.5px] text-neutral-900 outline-none focus:border-neutral-400 transition-colors cursor-pointer"
              >
                <option value="Paid">Paid</option>
                <option value="Partially Paid">Partially Paid</option>
                <option value="Unpaid">Unpaid</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2 border-t border-neutral-100">
            {/* Invoice Date */}
            <div>
              <label className="block text-[12px] font-semibold text-neutral-500 mb-1.5">
                Invoice Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200/90 bg-white text-[13.5px] text-neutral-900 outline-none focus:border-neutral-400 transition-colors cursor-pointer"
              />
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-[12px] font-semibold text-neutral-500 mb-1.5">
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200/90 bg-white text-[13.5px] text-neutral-900 outline-none focus:border-neutral-400 transition-colors cursor-pointer"
              />
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-[12px] font-semibold text-neutral-500 mb-1.5">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200/90 bg-white text-[13.5px] text-neutral-900 outline-none focus:border-neutral-400 transition-colors cursor-pointer"
              >
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Airbnb Payout">Airbnb Payout</option>
                <option value="Cash">Cash</option>
                <option value="Wire Transfer">Wire Transfer</option>
              </select>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-[14px] font-bold text-neutral-900">Line Items</h3>
              <button
                type="button"
                onClick={handleAddItem}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200/80 text-neutral-800 text-[12.5px] font-medium transition-colors cursor-pointer"
              >
                <Plus size={14} />
                <span>Add Item</span>
              </button>
            </div>

            <div className="border border-neutral-200/90 rounded-xl overflow-hidden">
              <table className="w-full text-left text-[13px]">
                <thead className="bg-neutral-50 text-neutral-600 font-medium border-b border-neutral-200/80">
                  <tr>
                    <th className="py-2.5 px-3">Item Description</th>
                    <th className="py-2.5 px-2 text-center w-20">Qty</th>
                    <th className="py-2.5 px-3 text-right w-28">Price ($)</th>
                    <th className="py-2.5 px-2 text-center w-24">Disc (%)</th>
                    <th className="py-2.5 px-2 text-center w-20">Tax (%)</th>
                    <th className="py-2.5 px-3 text-right w-28">Total ($)</th>
                    <th className="py-2.5 px-2 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {items.map((item) => (
                    <tr key={item.id} className="hover:bg-neutral-50/50">
                      <td className="py-2.5 px-3">
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => handleItemChange(item.id, 'name', e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-neutral-200 bg-white text-[13px] text-neutral-900 outline-none focus:border-neutral-400"
                        />
                      </td>
                      <td className="py-2.5 px-2">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(item.id, 'quantity', Number(e.target.value))}
                          className="w-full px-2 py-1.5 text-center rounded-lg border border-neutral-200 bg-white text-[13px] text-neutral-900 outline-none focus:border-neutral-400 font-mono"
                        />
                      </td>
                      <td className="py-2.5 px-3">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) => handleItemChange(item.id, 'unitPrice', Number(e.target.value))}
                          className="w-full px-2 py-1.5 text-right rounded-lg border border-neutral-200 bg-white text-[13px] text-neutral-900 outline-none focus:border-neutral-400 font-mono"
                        />
                      </td>
                      <td className="py-2.5 px-2">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={item.discountPercent || 0}
                          onChange={(e) => handleItemChange(item.id, 'discountPercent', Number(e.target.value))}
                          className="w-full px-2 py-1.5 text-center rounded-lg border border-neutral-200 bg-white text-[13px] text-neutral-900 outline-none focus:border-neutral-400 font-mono"
                        />
                      </td>
                      <td className="py-2.5 px-2">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={item.taxPercent || 0}
                          onChange={(e) => handleItemChange(item.id, 'taxPercent', Number(e.target.value))}
                          className="w-full px-2 py-1.5 text-center rounded-lg border border-neutral-200 bg-white text-[13px] text-neutral-900 outline-none focus:border-neutral-400 font-mono"
                        />
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-medium text-neutral-900">
                        ${item.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.id)}
                          disabled={items.length <= 1}
                          className="p-1 text-neutral-400 hover:text-rose-600 disabled:opacity-30 disabled:hover:text-neutral-400 transition-colors cursor-pointer"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Invoice Summary & Notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-neutral-100">
            <div>
              <label className="block text-[12px] font-semibold text-neutral-500 mb-1.5">
                Notes & Terms
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-3 rounded-xl border border-neutral-200 bg-white text-[13px] text-neutral-900 outline-none focus:border-neutral-400 resize-none"
              />
            </div>

            <div className="bg-neutral-50/70 p-4 rounded-xl border border-neutral-200/80 space-y-2 text-[13.5px]">
              <div className="flex justify-between text-neutral-600">
                <span>Subtotal</span>
                <span className="font-mono">${subtotalSum.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
              {discountSum > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount</span>
                  <span className="font-mono">-${discountSum.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
              )}
              <div className="flex justify-between text-neutral-600">
                <span>Tax (11%)</span>
                <span className="font-mono">${taxSum.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="pt-2 border-t border-neutral-200 flex justify-between font-bold text-[16px] text-neutral-950">
                <span>Grand Total</span>
                <span className="font-mono">${grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
