import { useState, useRef, useEffect, FormEvent } from 'react';
import {
  ArrowLeft,
  FileText,
  Printer,
  ChevronRight,
  MoreHorizontal,
  Check,
  CreditCard,
  Building2,
  Calendar as CalendarIcon,
  X,
  Plus,
  Trash2,
  ChevronDown,
  CheckCircle2,
} from 'lucide-react';
import { PurchaseTransaction, PurchaseItem } from '../types';

interface SalesInvoiceViewProps {
  transaction: PurchaseTransaction;
  onBack: () => void;
  onUpdateTransaction?: (transaction: PurchaseTransaction) => void;
}

const PAYMENT_METHODS = [
  'Bank Transfer (BCA / Mandiri / Wire)',
  'Corporate Credit Card',
  'Airbnb Payout Deduction',
  'Booking Virtual Card (VCC)',
  'Cash / Petty Cash',
];

function getCreditAccountForPaymentMethod(method: string): string {
  if (method.includes('Airbnb')) {
    return '1030 - Airbnb Payout Deduction Account';
  }
  if (method.includes('Booking') || method.includes('VCC')) {
    return '1040 - Booking Virtual Card (VCC)';
  }
  if (method.includes('Cash')) {
    return '1050 - Petty Cash Account';
  }
  if (method.includes('Credit Card')) {
    return '2100 - Corporate Credit Card Payable';
  }
  return '1010 - Bank Transfer (BCA / Mandiri Account)';
}

function CustomerLogo({ name }: { name: string }) {
  if (name === 'Booking') {
    return (
      <div className="w-5 h-5 rounded-full bg-[#003580] text-white flex items-center justify-center font-bold text-[9px] shrink-0 shadow-2xs">
        B.
      </div>
    );
  }
  if (name === 'Airbnb') {
    return (
      <div className="w-5 h-5 rounded-full bg-[#FF5A5F] text-white flex items-center justify-center shrink-0 shadow-2xs p-0.5">
        <svg viewBox="0 0 32 32" className="w-3 h-3 fill-current">
          <path d="M16 1c2.008 0 3.463.963 4.751 3.269l.533 1.025c1.954 3.83 4.293 8.793 5.433 12.35 1.554 4.846.541 8.924-2.593 11.025-2.222 1.488-5.06 1.706-7.828.618l-.296-.123c-2.846-1.229-5.187-3.955-6.31-7.469-.974-3.053-.941-6.425.093-9.525.993-2.977 2.665-6.326 4.786-10.428l.492-.934C13.292 2.308 14.492 1 16 1zm0 2c-1.341 0-2.22.997-3.23 2.871l-.479.911c-2.148 4.153-3.805 7.472-4.78 10.398-.946 2.839-.976 5.86-.115 8.561.966 3.023 2.946 5.344 5.34 6.381 2.348.923 4.72.716 6.536-.503 2.502-1.677 3.324-5.09 1.96-9.349-1.077-3.364-3.385-8.257-5.31-12.029l-.515-.992C18.423 4.385 17.29 3 16 3zm0 13a4 4 0 1 1 0 8 4 4 0 0 1 0-8zm0 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" />
        </svg>
      </div>
    );
  }
  if (name === 'Guesty') {
    return (
      <div className="w-5 h-5 rounded-full bg-[#38BDF8] text-white flex items-center justify-center shrink-0 shadow-2xs p-0.5">
        <svg viewBox="0 0 24 24" className="w-3 h-3 fill-current">
          <path d="M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3z" />
        </svg>
      </div>
    );
  }
  return (
    <div className="w-5 h-5 rounded-full bg-neutral-800 text-white flex items-center justify-center shrink-0 shadow-2xs">
      <Building2 size={11} />
    </div>
  );
}

export function SalesInvoiceView({
  transaction: initialTransaction,
  onBack,
  onUpdateTransaction,
}: SalesInvoiceViewProps) {
  const [currentTx, setCurrentTx] = useState<PurchaseTransaction>(initialTransaction);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [isEditPaymentOpen, setIsEditPaymentOpen] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState<string | null>(null);

  const moreMenuRef = useRef<HTMLDivElement>(null);
  const paymentMethodDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target as Node)) {
        setIsMoreMenuOpen(false);
      }
      if (paymentMethodDropdownRef.current && !paymentMethodDropdownRef.current.contains(e.target as Node)) {
        setIsPaymentMethodDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const [editPaymentMethod, setEditPaymentMethod] = useState<string>(
    currentTx.paymentMethod || PAYMENT_METHODS[0]
  );
  const [editUnpaidAmount, setEditUnpaidAmount] = useState<string>('0');
  const [isPaymentMethodDropdownOpen, setIsPaymentMethodDropdownOpen] = useState(false);

  const showToast = (msg: string) => {
    setShowSuccessToast(msg);
    setTimeout(() => setShowSuccessToast(null), 3000);
  };

  const grandTotal = currentTx.amount || 0;

  const handleSavePayment = (e: FormEvent) => {
    e.preventDefault();
    const remaining = Math.max(0, parseFloat(editUnpaidAmount) || 0);

    let newStatus = 'Paid';
    if (remaining >= grandTotal) {
      newStatus = 'Unpaid';
    } else if (remaining > 0) {
      newStatus = 'Partially Paid';
    }

    const updated: PurchaseTransaction = {
      ...currentTx,
      status: newStatus,
      tag: newStatus,
      paymentMethod: editPaymentMethod,
      unpaidAmount: remaining,
      journalRef: `4100 - Sales Revenue / ${getCreditAccountForPaymentMethod(editPaymentMethod)}`,
    };
    setCurrentTx(updated);
    if (onUpdateTransaction) {
      onUpdateTransaction(updated);
    }
    setIsEditPaymentOpen(false);
    showToast('Payment details & accounting journal updated!');
  };

  const handlePrint = () => {
    window.print();
  };

  const defaultItems: PurchaseItem[] = currentTx.items || [
    {
      id: 'i-1',
      name: currentTx.description || 'Sales Service / Booking Stay',
      quantity: currentTx.nights || 1,
      unitPrice: currentTx.amount || 100,
      subtotal: currentTx.amount || 100,
      total: currentTx.amount || 100,
    },
  ];

  return (
    <div className="w-full max-w-[1000px] mx-auto pt-6 md:pt-8 pb-20 px-6 md:px-8 font-sans animate-in fade-in duration-200">
      {/* Toast Notification */}
      {showSuccessToast && (
        <div className="fixed top-6 right-6 z-50 bg-neutral-900 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-[13px] font-medium animate-in slide-in-from-top-3 duration-200">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{showSuccessToast}</span>
        </div>
      )}

      {/* 1. Navigation Header (Breadcrumbs at top left) */}
      <div className="flex items-center gap-1.5 text-[13px] text-neutral-500 mb-5">
        <button
          onClick={onBack}
          className="hover:text-neutral-800 transition-colors cursor-pointer"
        >
          Transaction
        </button>
        <ChevronRight size={13} className="text-neutral-400 stroke-[1.75]" />
        <button
          onClick={onBack}
          className="hover:text-neutral-800 transition-colors cursor-pointer"
        >
          Sales
        </button>
        <ChevronRight size={13} className="text-neutral-400 stroke-[1.75]" />
        <span className="text-neutral-700 font-normal font-mono text-[12.5px]">
          {currentTx.invoiceNo || `INV-${currentTx.id}`}
        </span>
      </div>

      {/* 2. Main Page Title & Top Action Bar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <button
            onClick={onBack}
            className="p-1 rounded-lg hover:bg-neutral-200/60 text-neutral-600 hover:text-neutral-950 transition-colors cursor-pointer"
            title="Back to Sales List"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-[26px] font-bold text-neutral-950 tracking-tight">
            Invoice
          </h1>
        </div>

        {/* Top Quick Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            id="btn-payment"
            onClick={() => setIsEditPaymentOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-medium text-[13px] flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
          >
            <CreditCard size={14} />
            <span>Add Payment</span>
          </button>

          <div className="relative inline-flex items-center" ref={moreMenuRef}>
            <button
              type="button"
              onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
              className="p-2 rounded-xl border border-neutral-200/90 bg-white hover:bg-neutral-50 text-neutral-700 transition-colors cursor-pointer shadow-2xs"
            >
              <MoreHorizontal size={16} />
            </button>

            {isMoreMenuOpen && (
              <div className="absolute right-0 top-10 w-44 bg-white rounded-xl shadow-xl border border-neutral-200 py-1.5 z-50 text-left text-[13px]">
                <button
                  onClick={handlePrint}
                  className="w-full flex items-center gap-2 px-3.5 py-2 text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer"
                >
                  <Printer size={14} className="text-neutral-400" />
                  <span>Print Invoice</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Printable Invoice Card */}
      <div id="printable-invoice" className="bg-white rounded-2xl border border-neutral-200/90 shadow-2xs p-8 space-y-8">
        {/* Invoice Header */}
        <div className="flex flex-col sm:flex-row justify-between gap-6 pb-6 border-b border-neutral-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-[20px] font-bold text-neutral-950 tracking-tight">
                {currentTx.invoiceNo || `INV-${currentTx.id.toUpperCase()}`}
              </h2>
            </div>
            <p className="text-[13px] text-neutral-500">
              Date: {currentTx.date}
            </p>
          </div>
        </div>

        {/* Customer & Bill To Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 rounded-xl bg-neutral-50/70 border border-neutral-100 text-[13px]">
          <div>
            <span className="text-[13px] font-normal text-neutral-500 block mb-1">
              Customer
            </span>
            <div className="flex items-center gap-2">
              <CustomerLogo name={currentTx.supplier || currentTx.connection || 'Booking'} />
              <span className="font-bold text-neutral-900 text-[14px]">
                {currentTx.supplier || currentTx.connection || 'Booking'}
              </span>
            </div>
          </div>

          <div>
            <span className="text-[13px] font-normal text-neutral-500 block mb-1">
              Payment Information
            </span>
            <p className="font-medium text-neutral-800">
              Method: <span className="font-normal text-neutral-600">{currentTx.paymentMethod || 'Bank Transfer'}</span>
            </p>
          </div>

          <div>
            <span className="text-[13px] font-normal text-neutral-500 block mb-1">
              Order Notes & Summary
            </span>
            <p className="text-neutral-700 italic text-[12.5px] leading-relaxed">
              {currentTx.notes || 'Sales invoice cleared and verified.'}
            </p>
          </div>
        </div>

        {/* Table Items */}
        <div className="border border-neutral-200/80 rounded-xl overflow-hidden">
          <table className="w-full text-left text-[13px] border-collapse">
            <thead>
              <tr className="bg-neutral-50/80 text-neutral-600 border-b border-neutral-200 font-medium">
                <th className="py-3 px-3.5 text-center w-12">No</th>
                <th className="py-3 px-4">Item & Description</th>
                <th className="py-3 px-3 text-center w-16">Qty</th>
                <th className="py-3 px-3.5 text-right w-24">Price</th>
                <th className="py-3 px-3 text-center w-20">Disc (%)</th>
                <th className="py-3 px-3.5 text-right w-28">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {defaultItems.map((item, idx) => {
                const itemQty = item.quantity || 1;
                const itemPrice = item.unitPrice || 0;
                const discP = item.discountPercent || 0;
                const itemTotal = item.total || itemQty * itemPrice;

                return (
                  <tr key={item.id || idx} className="hover:bg-neutral-50/50">
                    <td className="py-3 px-3.5 text-center text-neutral-400 font-mono text-[12px]">
                      {idx + 1}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-neutral-900">
                        {item.name || `Item #${idx + 1}`}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center font-medium text-neutral-800">
                      {itemQty}
                    </td>
                    <td className="py-3 px-3.5 text-right font-mono text-neutral-700">
                      ${itemPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-neutral-500">
                      {discP}%
                    </td>
                    <td className="py-3 px-3.5 text-right font-mono font-semibold text-neutral-900">
                      ${itemTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Grand Total Bar */}
        <div className="flex justify-end pt-2">
          <div className="w-full max-w-xs space-y-2 text-[13.5px]">
            <div className="flex justify-between text-neutral-600">
              <span>Subtotal</span>
              <span className="font-mono">${grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between font-bold text-[16px] text-neutral-950 pt-2 border-t border-neutral-200">
              <span>Total Amount</span>
              <span className="font-mono">${grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Payment Modal */}
      {isEditPaymentOpen && (
        <div className="fixed inset-0 z-50 bg-neutral-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-4 border-b border-neutral-100 bg-neutral-50/50">
              <h3 className="font-bold text-neutral-900 text-[15px]">Edit Payment Details</h3>
              <button
                type="button"
                onClick={() => setIsEditPaymentOpen(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-800 hover:bg-neutral-200/50 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSavePayment} className="p-5 space-y-4 text-[14px]">
              {/* Summary Metric Bar */}
              <div className="grid grid-cols-2 gap-3 bg-neutral-50/80 p-3 rounded-xl border border-neutral-200/80">
                <div className="bg-white p-2.5 rounded-lg border border-neutral-200/60 shadow-2xs">
                  <span className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider block">
                    Total Invoice
                  </span>
                  <span className="text-[15px] font-mono font-bold text-neutral-900 block mt-0.5">
                    ${grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="bg-amber-50/70 p-2.5 rounded-lg border border-amber-200/70">
                  <span className="text-[11px] font-medium text-amber-700 uppercase tracking-wider block">
                    Sisa Belum Dibayar
                  </span>
                  <span className="text-[15px] font-mono font-bold text-amber-950 block mt-0.5">
                    ${(parseFloat(editUnpaidAmount) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Payment Method */}
              <div className="relative" ref={paymentMethodDropdownRef}>
                <label className="block text-[12px] font-medium text-neutral-500 mb-1">
                  Payment Method
                </label>
                <button
                  type="button"
                  onClick={() => setIsPaymentMethodDropdownOpen(!isPaymentMethodDropdownOpen)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl border border-neutral-200 bg-white text-left text-[13px] hover:border-neutral-300 transition-all cursor-pointer"
                >
                  <span className="text-neutral-900 font-medium truncate">{editPaymentMethod}</span>
                  <ChevronDown size={14} className="text-neutral-400 shrink-0 ml-2" />
                </button>

                {isPaymentMethodDropdownOpen && (
                  <div className="absolute top-[calc(100%+4px)] left-0 right-0 z-50 bg-white rounded-xl shadow-xl border border-neutral-200 py-1 max-h-48 overflow-y-auto">
                    {PAYMENT_METHODS.map((pm) => (
                      <button
                        key={pm}
                        type="button"
                        onClick={() => {
                          setEditPaymentMethod(pm);
                          setIsPaymentMethodDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3.5 py-2 text-left text-[13px] hover:bg-neutral-50 cursor-pointer ${
                          editPaymentMethod === pm ? 'font-medium bg-neutral-50' : 'text-neutral-700'
                        }`}
                      >
                        <span className="truncate">{pm}</span>
                        {editPaymentMethod === pm && <Check size={14} className="text-neutral-900 shrink-0" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Unpaid Amount */}
              <div>
                <label className="block text-[12px] font-medium text-neutral-500 mb-1">
                  Sisa Nominal Belum Dibayar ($)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={editUnpaidAmount}
                  onChange={(e) => setEditUnpaidAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-200 bg-white text-[13px] text-neutral-900 font-mono outline-none focus:border-neutral-400"
                />
              </div>

              {/* Jurnal Accounting */}
              <div className="space-y-2 border-t border-neutral-100 pt-3">
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[12px] font-medium text-neutral-500">
                    Jurnal Accounting
                  </label>
                  <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60 font-medium flex items-center gap-1">
                    <CheckCircle2 size={11} /> Balanced
                  </span>
                </div>

                <div className="border border-neutral-200/90 rounded-xl overflow-hidden bg-neutral-50/50 text-[12px]">
                  <table className="w-full text-left">
                    <thead className="bg-neutral-100/80 text-neutral-600 border-b border-neutral-200 font-medium text-[11.5px]">
                      <tr>
                        <th className="py-2.5 px-3">Account</th>
                        <th className="py-2.5 px-3 text-right w-28">Debit ($)</th>
                        <th className="py-2.5 px-3 text-right w-28">Credit ($)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 font-mono">
                      <tr>
                        <td className="py-2.5 px-3 text-neutral-800 font-sans font-medium text-[12px]">
                          4100 - Sales Revenue
                        </td>
                        <td className="py-2.5 px-3 text-right text-neutral-900 font-semibold align-middle">
                          ${(parseFloat(editUnpaidAmount) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-2.5 px-3 text-right text-neutral-400 align-middle">-</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 text-neutral-800 font-sans font-medium text-[12px]">
                          {getCreditAccountForPaymentMethod(editPaymentMethod)}
                        </td>
                        <td className="py-2.5 px-3 text-right text-neutral-400 align-middle">-</td>
                        <td className="py-2.5 px-3 text-right text-neutral-900 font-semibold align-middle">
                          ${(parseFloat(editUnpaidAmount) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="pt-3 border-t border-neutral-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditPaymentOpen(false)}
                  className="px-4 py-2 rounded-xl border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 transition-colors text-[13px] font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white transition-colors text-[13px] font-medium cursor-pointer shadow-2xs"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
