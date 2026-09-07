import React, { useState, useRef, useEffect, FormEvent } from 'react';
import {
  ArrowLeft,
  ChevronRight,
  ChevronDown,
  CreditCard,
  Plus,
  BookOpen,
  Printer,
  Download,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Paperclip,
  Check,
  X,
  ExternalLink,
  DollarSign,
  Building2,
  Calendar,
  Layers,
  MoreHorizontal,
  Trash2,
  CornerDownLeft,
} from 'lucide-react';
import { PurchaseTransaction, PurchaseItem, SidebarTab } from '../types';

interface PurchaseInvoiceViewProps {
  transaction: PurchaseTransaction;
  onBack: () => void;
  onUpdateTransaction?: (updated: PurchaseTransaction) => void;
  onDeleteTransaction?: (id: string) => void;
  onNavigateTab?: (tab: SidebarTab) => void;
}

const PAYMENT_METHODS = [
  'Bank Transfer (BCA / Mandiri / Wire)',
  'Corporate Credit Card',
  'Airbnb Payout Deduction',
  'Booking Virtual Card (VCC)',
  'Cash / Petty Cash',
];

const getCreditAccountForPaymentMethod = (method: string): string => {
  if (method.includes('Bank Transfer') || method.includes('BCA') || method.includes('Mandiri')) {
    return '1010 - Bank Transfer (BCA / Mandiri Account)';
  }
  if (method.includes('Credit Card')) {
    return '2100 - Corporate Credit Card Payable';
  }
  if (method.includes('Airbnb')) {
    return '1030 - Airbnb Payout Deduction Account';
  }
  if (method.includes('Booking')) {
    return '1040 - Booking Virtual Card (VCC)';
  }
  if (method.includes('Cash')) {
    return '1050 - Petty Cash Account';
  }
  return `1010 - ${method} Account`;
};

export function PurchaseInvoiceView({
  transaction,
  onBack,
  onUpdateTransaction,
  onDeleteTransaction,
  onNavigateTab,
}: PurchaseInvoiceViewProps) {
  const [currentTx, setCurrentTx] = useState<PurchaseTransaction>(transaction);
  const [isEditPaymentOpen, setIsEditPaymentOpen] = useState(false);
  const [isAccountingModalOpen, setIsAccountingModalOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState<string | null>(null);

  const moreMenuRef = useRef<HTMLDivElement>(null);
  const paymentMethodDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target as Node)) {
        setIsMoreMenuOpen(false);
      }
      if (paymentMethodDropdownRef.current && !paymentMethodDropdownRef.current.contains(e.target as Node)) {
        setIsPaymentMethodDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Edit payment form state
  const [editPaymentMethod, setEditPaymentMethod] = useState<string>(
    currentTx.paymentMethod || PAYMENT_METHODS[0]
  );
  const [editUnpaidAmount, setEditUnpaidAmount] = useState<string>('0');
  const [isPaymentMethodDropdownOpen, setIsPaymentMethodDropdownOpen] = useState(false);

  const showToast = (msg: string) => {
    setShowSuccessToast(msg);
    setTimeout(() => setShowSuccessToast(null), 3000);
  };

  const handleSavePayment = (e: React.FormEvent) => {
    e.preventDefault();
    const remaining = parseFloat(editUnpaidAmount) || 0;
    let newStatus = 'Unpaid';
    if (remaining === 0) {
      newStatus = 'Paid';
    } else if (remaining < grandTotal && remaining > 0) {
      newStatus = 'Partially Paid';
    } else {
      newStatus = 'Unpaid';
    }

    const updated: PurchaseTransaction = {
      ...currentTx,
      status: newStatus,
      tag: newStatus,
      paymentMethod: editPaymentMethod,
      unpaidAmount: remaining,
      journalRef: `5100 - Direct Purchase Expense / ${getCreditAccountForPaymentMethod(editPaymentMethod)}`,
    };
    setCurrentTx(updated);
    if (onUpdateTransaction) {
      onUpdateTransaction(updated);
    }
    setIsEditPaymentOpen(false);
    showToast('Payment details updated successfully');
  };

  const handlePrint = () => {
    window.print();
  };

  // Helper formatting
  const formatDisplayDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    try {
      const [y, m, d] = dateStr.split('-');
      const dateObj = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
      return dateObj.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  // Calculations
  const items: PurchaseItem[] =
    currentTx.items && currentTx.items.length > 0
      ? currentTx.items
      : [
          {
            id: 'item-1',
            name: currentTx.description || `${currentTx.supplier} Services`,
            quantity: 1,
            unitPrice: currentTx.amount,
            discountPercent: 0,
            discountAmount: 0,
            taxPercent: 0,
            taxAmount: 0,
            subtotal: currentTx.amount,
            total: currentTx.amount,
            category: currentTx.category || 'Services',
          },
        ];

  const subtotal =
    currentTx.subtotal !== undefined
      ? currentTx.subtotal
      : items.reduce((acc, it) => acc + (it.subtotal || it.quantity * it.unitPrice), 0);

  const discount =
    currentTx.totalDiscount !== undefined
      ? currentTx.totalDiscount
      : items.reduce((acc, it) => acc + (it.discountAmount || 0), 0);

  const tax =
    currentTx.totalTax !== undefined
      ? currentTx.totalTax
      : items.reduce((acc, it) => acc + (it.taxAmount || 0), 0);

  const grandTotal = currentTx.amount || Math.max(0, subtotal - discount + tax);

  // Sync edit form state when modal opens
  useEffect(() => {
    if (isEditPaymentOpen) {
      setEditPaymentMethod(currentTx.paymentMethod || PAYMENT_METHODS[0]);
      const initialUnpaid = currentTx.unpaidAmount !== undefined
        ? currentTx.unpaidAmount
        : currentTx.status === 'Paid'
        ? 0
        : currentTx.status === 'Partially Paid'
        ? grandTotal / 2
        : grandTotal;
      setEditUnpaidAmount(initialUnpaid.toString());
      setIsPaymentMethodDropdownOpen(false);
    }
  }, [isEditPaymentOpen, currentTx, grandTotal]);

  // Status visual styles
  const isPaid = currentTx.status === 'Paid';
  const isPartial = currentTx.status === 'Partially Paid';

  return (
    <div className="w-full max-w-[1000px] mx-auto pt-6 md:pt-8 pb-20 px-6 md:px-8 font-sans animate-in fade-in duration-200">
      {/* Toast Notification */}
      {showSuccessToast && (
        <div className="fixed top-6 right-6 z-50 bg-neutral-900 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-[13px] font-medium animate-in slide-in-from-top-3 duration-200">
          <Check size={16} className="text-emerald-400" />
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
          Purchase
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
            title="Back to Purchase List"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-[26px] font-bold text-neutral-950 tracking-tight">
            Invoice
          </h1>
        </div>

        {/* Top Quick Actions */}
        <div className="flex items-center gap-2">
          {/* Add Payment Button */}
          <button
            type="button"
            id="btn-payment"
            onClick={() => setIsEditPaymentOpen(true)}
            className="text-neutral-800 hover:text-neutral-950 hover:bg-neutral-200/50 text-[14px] font-normal px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus size={15} strokeWidth={1.75} className="text-neutral-700 shrink-0" />
            <span>Add Payment</span>
          </button>

          {/* 3-Dots Dropdown Button */}
          <div className="relative inline-flex items-center" ref={moreMenuRef}>
            <button
              type="button"
              id="btn-invoice-more"
              onClick={() => setIsMoreMenuOpen((prev) => !prev)}
              className={`p-1.5 rounded-lg border border-neutral-200/90 text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 transition-colors cursor-pointer ${
                isMoreMenuOpen ? 'bg-neutral-100 text-neutral-900 border-neutral-300' : 'bg-white'
              }`}
              title="More actions"
            >
              <MoreHorizontal size={16} />
            </button>

            {isMoreMenuOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-44 bg-white rounded-xl shadow-lg border border-neutral-200/90 py-1.5 z-40 text-left text-[13px] animate-in fade-in zoom-in-95 duration-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsMoreMenuOpen(false);
                    setIsAccountingModalOpen(true);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer text-left"
                >
                  <BookOpen size={14} className="text-neutral-400" />
                  <span>Accounting</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsMoreMenuOpen(false);
                    handlePrint();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer text-left"
                >
                  <Download size={14} className="text-neutral-400" />
                  <span>Download</span>
                </button>
                <div className="my-1 border-t border-neutral-100" />
                <button
                  type="button"
                  onClick={() => {
                    setIsMoreMenuOpen(false);
                    if (onDeleteTransaction) {
                      onDeleteTransaction(currentTx.id);
                    }
                    onBack();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer text-left font-medium"
                >
                  <Trash2 size={14} className="text-rose-500" />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. Main Printable Invoice Sheet */}
      <div
        id="printable-invoice"
        className="bg-white rounded-2xl border border-neutral-200/80 shadow-sm p-6 md:p-8 space-y-8 print:p-0 print:border-none print:shadow-none"
      >
        {/* Invoice Top Header */}
        <div className="flex flex-col sm:flex-row items-start justify-between gap-6 pb-6 border-b border-neutral-100">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-neutral-900 text-white flex items-center justify-center font-bold text-[14px]">
                F.
              </div>
              <div>
                <span className="font-bold text-[16px] tracking-tight text-neutral-900 block">
                  FINALYTIC
                </span>
                <span className="text-[11.5px] text-neutral-400 font-mono uppercase tracking-wider block">
                  Hotel & Property Management
                </span>
              </div>
            </div>

            <div className="text-[12.5px] text-neutral-500 space-y-0.5 pt-1">
              <p>Financial Administration & Procurement Dept.</p>
              <p>100 Sunset Boulevard, Suite 400</p>
              <p>support@finalytic.com • +1 (555) 234-5678</p>
            </div>
          </div>

          <div className="sm:text-right space-y-1">
            <div className="text-[20px] font-bold text-neutral-950 font-mono pt-1">
              {currentTx.invoiceNo || `INV-${currentTx.id.toUpperCase()}`}
            </div>
            <div className="text-[13px] text-neutral-500 space-y-0.5">
              <p>
                <span className="text-neutral-400">Date Issued:</span>{' '}
                <span className="text-neutral-800 font-medium">{formatDisplayDate(currentTx.date)}</span>
              </p>
              <p>
                <span className="text-neutral-400">Due Date:</span>{' '}
                <span className="text-neutral-800 font-medium">
                  {currentTx.dueDate ? formatDisplayDate(currentTx.dueDate) : currentTx.deadline || 'Net 30'}
                </span>
              </p>
              <p>
                <span className="text-neutral-400">Payment Status:</span>{' '}
                <span className="font-semibold text-neutral-900">{currentTx.status}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Vendor & Bill To Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 rounded-xl bg-neutral-50/70 border border-neutral-100 text-[13px]">
          <div>
            <span className="text-[13px] font-normal text-neutral-500 block mb-1">
              Vendor / Distributor
            </span>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-neutral-900 text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                {(currentTx.supplier || currentTx.connection || 'B').charAt(0)}
              </div>
              <p className="font-semibold text-neutral-900 text-[14px]">
                {currentTx.supplier || currentTx.connection || 'Booking'}
              </p>
            </div>
            <p className="text-neutral-500 text-[12.5px] mt-1">Channel Partner / Supplier</p>
            <p className="text-neutral-500 text-[12.5px]">Category: {currentTx.category || 'Inventory'}</p>
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
              {currentTx.notes || currentTx.description || 'No additional notes provided.'}
            </p>
          </div>
        </div>

        {/* Invoice Items Table */}
        <div className="overflow-x-auto rounded-xl border border-neutral-200/80">
          <table className="w-full text-left text-[13px] border-collapse">
            <thead>
              <tr className="bg-neutral-50/80 text-neutral-600 border-b border-neutral-200 font-medium">
                <th className="py-3 px-3.5 text-center w-12">No</th>
                <th className="py-3 px-4">Item & Description</th>
                <th className="py-3 px-3 text-center w-16">Qty</th>
                <th className="py-3 px-3.5 text-right w-24">Price</th>
                <th className="py-3 px-3 text-center w-20">Disc (%)</th>
                <th className="py-3 px-3 text-center w-20">Tax (%)</th>
                <th className="py-3 px-4 text-right w-28">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {items.map((item, idx) => {
                const itemQty = item.quantity || 1;
                const itemPrice = item.unitPrice || 0;
                const itemSubtotal = item.subtotal || itemQty * itemPrice;
                const itemDiscount = item.discountAmount || (itemSubtotal * (item.discountPercent || 0)) / 100;
                const taxable = itemSubtotal - itemDiscount;
                const itemTax = item.taxAmount || (taxable * (item.taxPercent || 0)) / 100;
                const itemTotal = item.total || taxable + itemTax;

                return (
                  <tr key={item.id || idx} className="hover:bg-neutral-50/40">
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
                      ${itemPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-neutral-500">
                      {item.discountPercent ? `${item.discountPercent}%` : '-'}
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-neutral-500">
                      {item.taxPercent ? `${item.taxPercent}%` : '-'}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-medium text-neutral-900">
                      ${itemTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Calculation & Attachment Summary */}
        <div className="flex flex-col lg:flex-row items-start justify-between gap-8 pt-2">
          {/* Left: Attachments and Remarks */}
          <div className="flex-1 w-full space-y-4">
            <div>
              <div className="flex items-center gap-2 text-neutral-700 font-medium text-[13px] mb-2">
                <Paperclip size={14} className="text-neutral-400" />
                <span>Attachments ({currentTx.attachments?.length || 0})</span>
              </div>

              {currentTx.attachments && currentTx.attachments.length > 0 ? (
                <div className="flex flex-wrap gap-2.5">
                  {currentTx.attachments.map((att) => (
                    <div
                      key={att.id}
                      className="flex items-center gap-2 bg-neutral-50 border border-neutral-200/80 rounded-xl px-3 py-2 text-[12.5px]"
                    >
                      <FileText size={14} className="text-neutral-500" />
                      <span className="font-medium text-neutral-800 truncate max-w-[160px]">
                        {att.name}
                      </span>
                      <span className="text-neutral-400 text-[11px]">({att.size})</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[12px] text-neutral-400 italic">No attachments attached to this invoice.</p>
              )}
            </div>
          </div>

          {/* Right: Numbers Summary */}
          <div className="w-full lg:w-80 space-y-2.5 text-[13.5px] bg-neutral-50/70 p-5 rounded-2xl border border-neutral-100">
            <div className="flex items-center justify-between text-neutral-600">
              <span>Subtotal</span>
              <span className="font-mono text-neutral-900 font-medium">
                ${subtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex items-center justify-between text-neutral-600">
              <span>Discount</span>
              <span className={`font-mono font-medium ${discount > 0 ? 'text-emerald-600' : 'text-neutral-400'}`}>
                -${discount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex items-center justify-between text-neutral-600">
              <span>Tax</span>
              <span className="font-mono text-neutral-900 font-medium">
                +${tax.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            <div className="h-px bg-neutral-200 my-2" />

            <div className="flex items-center justify-between pt-0.5">
              <span className="text-[14.5px] font-bold text-neutral-900">Grand Total</span>
              <span className="text-[20px] font-bold text-neutral-950 font-mono">
                ${grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>


          </div>
        </div>
      </div>

      {/* Edit Payment Modal (matching AddTransactionModal design) */}
      {isEditPaymentOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-neutral-200/90 w-full max-w-lg overflow-visible animate-in fade-in zoom-in-95 duration-150 transition-all font-sans">
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-neutral-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[15px] font-semibold text-neutral-900">
                    Edit Payment Details
                  </span>
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600 font-mono">
                    {currentTx.invoiceNo}
                  </span>
                </div>
                <p className="text-[12px] text-neutral-400 mt-0.5">
                  Update payment method, unpaid balance, and accounting journal
                </p>
              </div>

              <button
                id="btn-close-payment-modal"
                type="button"
                onClick={() => setIsEditPaymentOpen(false)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSavePayment} className="p-5 space-y-4 text-[14px]">
              {/* Invoice Summary Metric Bar */}
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

              {/* 1. Payment Method Custom Dropdown */}
              <div className="relative" ref={paymentMethodDropdownRef}>
                <label className="block text-[12px] font-medium text-neutral-500 mb-1">
                  Payment Method
                </label>
                <button
                  type="button"
                  id="select-payment-method-trigger"
                  onClick={() => setIsPaymentMethodDropdownOpen((prev) => !prev)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl bg-neutral-50 border transition-all cursor-pointer text-left ${
                    isPaymentMethodDropdownOpen
                      ? 'border-neutral-900 bg-white ring-1 ring-neutral-900/10'
                      : 'border-neutral-200/80 hover:border-neutral-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    <CreditCard size={14} className="text-neutral-500 shrink-0" />
                    <span className="text-[13px] text-neutral-800 font-medium truncate">
                      {editPaymentMethod}
                    </span>
                  </div>
                  <ChevronDown
                    size={13}
                    className={`text-neutral-400 shrink-0 transition-transform duration-150 ${
                      isPaymentMethodDropdownOpen ? 'rotate-180 text-neutral-700' : ''
                    }`}
                  />
                </button>

                {/* Custom Payment Method Dropdown Menu */}
                {isPaymentMethodDropdownOpen && (
                  <div className="absolute top-[calc(100%+6px)] left-0 right-0 z-50 bg-white rounded-2xl shadow-xl border border-neutral-200/90 py-1.5 animate-in fade-in zoom-in-95 duration-100 max-h-56 overflow-y-auto font-sans">
                    {PAYMENT_METHODS.map((method) => (
                      <button
                        key={method}
                        type="button"
                        onClick={() => {
                          setEditPaymentMethod(method);
                          setIsPaymentMethodDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3.5 py-2 text-left hover:bg-neutral-50 transition-colors cursor-pointer ${
                          editPaymentMethod === method ? 'bg-neutral-50/80 font-medium' : ''
                        }`}
                      >
                        <span className="text-[13px] text-neutral-800">{method}</span>
                        {editPaymentMethod === method && (
                          <Check size={14} className="text-neutral-900 shrink-0 ml-2" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 2. Sisa Nominal Belum Dibayar */}
              <div>
                <label className="block text-[12px] font-medium text-neutral-500 mb-1">
                  Sisa Nominal Belum Dibayar ($)
                </label>
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-neutral-50 border border-neutral-200/80 focus-within:border-neutral-900 focus-within:bg-white transition-colors">
                  <span className="text-neutral-400 text-[13.5px] font-medium shrink-0">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max={grandTotal}
                    value={editUnpaidAmount}
                    onChange={(e) => setEditUnpaidAmount(e.target.value)}
                    placeholder="0.00"
                    className="bg-transparent text-[13.5px] font-mono text-neutral-800 outline-none w-full"
                  />
                </div>
              </div>

              {/* 3. Jurnal Accounting (Debit & Kredit Table) */}
              <div className="space-y-2 border-t border-neutral-100 pt-3">
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[12px] font-medium text-neutral-500">
                    Jurnal Accounting
                  </label>
                  <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60 font-medium flex items-center gap-1">
                    <CheckCircle2 size={11} /> Balanced
                  </span>
                </div>

                <div className="rounded-xl border border-neutral-200 overflow-hidden bg-white text-[12.5px]">
                  <table className="w-full text-left">
                    <thead className="bg-neutral-100/80 text-neutral-600 border-b border-neutral-200 font-medium text-[11.5px]">
                      <tr>
                        <th className="py-2.5 px-3">Account</th>
                        <th className="py-2.5 px-3 text-right w-28">Debit ($)</th>
                        <th className="py-2.5 px-3 text-right w-28">Credit ($)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 font-mono">
                      {/* Debit Line */}
                      <tr>
                        <td className="py-2.5 px-3 text-neutral-800 font-sans font-medium text-[12px]">
                          5100 - Direct Purchase Expense
                        </td>
                        <td className="py-2.5 px-3 text-right text-neutral-900 font-semibold align-middle">
                          ${(parseFloat(editUnpaidAmount) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-2.5 px-3 text-right text-neutral-400 align-middle">-</td>
                      </tr>

                      {/* Credit Line (Dynamically mapped to selected Payment Method) */}
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
                    <tfoot className="bg-neutral-50 font-medium border-t border-neutral-200 text-[12px]">
                      <tr>
                        <td className="py-2 px-3 text-neutral-900 font-sans">Total Balanced</td>
                        <td className="py-2 px-3 text-right font-mono text-neutral-900 font-semibold">
                          ${(parseFloat(editUnpaidAmount) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-2 px-3 text-right font-mono text-neutral-900 font-semibold">
                          ${(parseFloat(editUnpaidAmount) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Footer Action Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-neutral-100 text-[13px]">
                <span className="text-neutral-400 text-[12px]">Update payment status & journal</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditPaymentOpen(false)}
                    className="px-3.5 py-2 rounded-xl text-neutral-600 hover:bg-neutral-100 transition-colors cursor-pointer font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-black hover:bg-neutral-800 text-white font-medium flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                  >
                    <span>Save Changes</span>
                    <CornerDownLeft size={13} />
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Accounting Journal Entry / Integration Modal */}
      {isAccountingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-neutral-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-5 border-b border-neutral-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-neutral-900 text-white flex items-center justify-center">
                  <BookOpen size={16} />
                </div>
                <div>
                  <h3 className="font-bold text-neutral-900 text-[15px]">Accounting & Ledger Entry</h3>
                  <p className="text-[12px] text-neutral-500">General Ledger double-entry synchronization</p>
                </div>
              </div>
              <button
                onClick={() => setIsAccountingModalOpen(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-5 space-y-4 text-[13px]">
              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100 flex items-center justify-between">
                <div>
                  <span className="text-neutral-400 text-[11px] uppercase tracking-wider block font-semibold">
                    Transaction Ref
                  </span>
                  <span className="font-mono font-medium text-neutral-800">
                    {currentTx.invoiceNo || currentTx.id}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-neutral-400 text-[11px] uppercase tracking-wider block font-semibold">
                    Status
                  </span>
                  <span className="inline-flex items-center gap-1 text-emerald-600 font-medium text-[12px]">
                    <CheckCircle2 size={12} />
                    <span>Balanced & Synced</span>
                  </span>
                </div>
              </div>

              {/* Journal Entry Table */}
              <div>
                <span className="text-[12px] font-semibold text-neutral-700 block mb-1.5">
                  Automated Double-Entry Journal
                </span>
                <div className="rounded-xl border border-neutral-200 overflow-hidden">
                  <table className="w-full text-left text-[12.5px]">
                    <thead className="bg-neutral-100/70 text-neutral-600 border-b border-neutral-200 font-medium">
                      <tr>
                        <th className="py-2 px-3">Account</th>
                        <th className="py-2 px-3 text-right">Debit ($)</th>
                        <th className="py-2 px-3 text-right">Credit ($)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 font-mono">
                      <tr>
                        <td className="py-2 px-3 text-neutral-800 font-sans">
                          5100 - Inventory / Cost of Goods
                        </td>
                        <td className="py-2 px-3 text-right text-neutral-900">
                          ${subtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-2 px-3 text-right text-neutral-400">-</td>
                      </tr>
                      {tax > 0 && (
                        <tr>
                          <td className="py-2 px-3 text-neutral-800 font-sans">
                            1180 - VAT / Tax Input (Claimable)
                          </td>
                          <td className="py-2 px-3 text-right text-neutral-900">
                            ${tax.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="py-2 px-3 text-right text-neutral-400">-</td>
                        </tr>
                      )}
                      {discount > 0 && (
                        <tr>
                          <td className="py-2 px-3 text-neutral-800 font-sans">
                            5190 - Purchase Discount (Contra)
                          </td>
                          <td className="py-2 px-3 text-right text-neutral-400">-</td>
                          <td className="py-2 px-3 text-right text-emerald-600">
                            ${discount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                        </tr>
                      )}
                      <tr>
                        <td className="py-2 px-3 text-neutral-800 font-sans font-medium">
                          {isPaid ? '1010 - Cash & Bank Account' : '2010 - Accounts Payable (AP)'}
                        </td>
                        <td className="py-2 px-3 text-right text-neutral-400">-</td>
                        <td className="py-2 px-3 text-right text-neutral-900 font-medium">
                          ${grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                      </tr>
                    </tbody>
                    <tfoot className="bg-neutral-50 font-medium border-t border-neutral-200">
                      <tr>
                        <td className="py-2 px-3 text-neutral-900">Total</td>
                        <td className="py-2 px-3 text-right font-mono text-neutral-900">
                          ${(subtotal + tax).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-2 px-3 text-right font-mono text-neutral-900">
                          ${(grandTotal + discount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setIsAccountingModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-[13px] font-medium text-neutral-600 hover:bg-neutral-100 transition-colors cursor-pointer"
                >
                  Close
                </button>

                {onNavigateTab && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsAccountingModalOpen(false);
                      onNavigateTab('accounting');
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-neutral-900 hover:bg-black text-white text-[13px] font-semibold transition-all cursor-pointer shadow-xs"
                  >
                    <span>Open Accounting View</span>
                    <ExternalLink size={13} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
