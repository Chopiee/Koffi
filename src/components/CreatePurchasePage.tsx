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
  CreditCard,
} from 'lucide-react';
import { PurchaseTransaction, PurchaseItem } from '../types';

export interface CreatePurchaseInitialData {
  distributor: string;
  invoiceNo: string;
  date: string;
  dueDate: string;
}

interface CreatePurchasePageProps {
  initialData: CreatePurchaseInitialData;
  onBack: () => void;
  onCancel: () => void;
  onSave: (transaction: Omit<PurchaseTransaction, 'id' | 'createdAt'>) => void;
  pageType?: 'purchase' | 'cost';
}

const PAYMENT_METHOD_OPTIONS = [
  'Bank Transfer',
  'Credit Card',
  'Cash',
  'Debit Card',
  'E-Wallet',
  'Check',
  'N/A',
];

const DISTRIBUTOR_OPTIONS = [
  'Booking',
  'Airbnb',
  'Guesty',
  'N/A',
  'Kencana Roastery',
  'La Marzocco',
  'EcoPack Solution',
  'Greenfields Hub',
];

// Default product suggestions by distributor
const DISTRIBUTOR_PRESETS: Record<
  string,
  Omit<PurchaseItem, 'id' | 'total' | 'subtotal' | 'discountAmount' | 'taxAmount'>[]
> = {
  Booking: [
    { name: 'Standard Room Linen & Bedding Set', quantity: 2, unitPrice: 125, discountPercent: 0, taxPercent: 11, category: 'Services' },
    { name: 'Welcome Amenities & Toiletries Pack', quantity: 1, unitPrice: 80, discountPercent: 5, taxPercent: 11, category: 'Inventory' },
  ],
  Airbnb: [
    { name: 'Deluxe Suite Towel & Linen Refresh', quantity: 2, unitPrice: 110, discountPercent: 0, taxPercent: 11, category: 'Services' },
    { name: 'Guest Welcome Refreshment Basket', quantity: 1, unitPrice: 45, discountPercent: 0, taxPercent: 11, category: 'Inventory' },
  ],
  Guesty: [
    { name: 'Channel Manager & Automation Fee', quantity: 1, unitPrice: 220, discountPercent: 10, taxPercent: 11, category: 'Services' },
    { name: 'Direct Booking Portal Add-on', quantity: 1, unitPrice: 65, discountPercent: 0, taxPercent: 11, category: 'Services' },
  ],
  'Kencana Roastery': [
    { name: 'Arabica Specialty Beans - Gayo (1kg)', quantity: 5, unitPrice: 24, discountPercent: 5, taxPercent: 11, category: 'Raw Material' },
    { name: 'Single Origin Filter Roast - Flores (500g)', quantity: 3, unitPrice: 16, discountPercent: 0, taxPercent: 11, category: 'Raw Material' },
  ],
  'La Marzocco': [
    { name: 'Espresso Machine Grouphead Gasket Set', quantity: 2, unitPrice: 45, discountPercent: 0, taxPercent: 11, category: 'Equipment' },
    { name: 'Steam Wand Precision Tip & Filter Basket', quantity: 1, unitPrice: 60, discountPercent: 0, taxPercent: 11, category: 'Equipment' },
  ],
  'EcoPack Solution': [
    { name: 'Biodegradable Hot Cups 12oz (500 pcs)', quantity: 2, unitPrice: 65, discountPercent: 5, taxPercent: 11, category: 'Inventory' },
    { name: 'Kraft Paper Bags Medium (250 pcs)', quantity: 1, unitPrice: 40, discountPercent: 0, taxPercent: 11, category: 'Inventory' },
  ],
  'Greenfields Hub': [
    { name: 'Fresh Whole Milk 1L (Carton of 12)', quantity: 6, unitPrice: 22, discountPercent: 0, taxPercent: 11, category: 'Raw Material' },
    { name: 'Barista Oat Milk 1L (Carton of 6)', quantity: 4, unitPrice: 25, discountPercent: 5, taxPercent: 11, category: 'Raw Material' },
  ],
  'N/A': [
    { name: 'Operational & Office Supplies', quantity: 1, unitPrice: 150, discountPercent: 0, taxPercent: 11, category: 'Office' },
  ],
};

function DistributorLogo({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' | 'lg' }) {
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

  if (name.includes('Roastery')) {
    return (
      <div className={`${containerClass} rounded-full bg-[#8B5A2B] text-white flex items-center justify-center font-bold shrink-0 shadow-2xs text-[10px]`}>
        ☕
      </div>
    );
  }

  if (name.includes('Marzocco')) {
    return (
      <div className={`${containerClass} rounded-full bg-[#C2410C] text-white flex items-center justify-center font-bold shrink-0 shadow-2xs text-[10px]`}>
        ⚙️
      </div>
    );
  }

  if (name.includes('EcoPack')) {
    return (
      <div className={`${containerClass} rounded-full bg-[#16A34A] text-white flex items-center justify-center font-bold shrink-0 shadow-2xs text-[10px]`}>
        🌿
      </div>
    );
  }

  if (name.includes('Greenfields')) {
    return (
      <div className={`${containerClass} rounded-full bg-[#0284C7] text-white flex items-center justify-center font-bold shrink-0 shadow-2xs text-[10px]`}>
        🥛
      </div>
    );
  }

  return (
    <div className={`${containerClass} rounded-full bg-neutral-800 text-white flex items-center justify-center font-bold shrink-0 shadow-2xs`}>
      <Building2 size={isSm ? 10 : 12} />
    </div>
  );
}

function formatDateDisplay(dateStr: string): string {
  if (!dateStr) return 'Not set';
  try {
    const [y, m, d] = dateStr.split('-').map(Number);
    const dt = new Date(y, m - 1, d);
    return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

function calculateItemFinancials(item: {
  quantity: number;
  unitPrice: number;
  discountPercent?: number;
  taxPercent?: number;
}) {
  const qty = typeof item.quantity === 'number' && !isNaN(item.quantity) ? Math.max(0, item.quantity) : 0;
  const price = typeof item.unitPrice === 'number' && !isNaN(item.unitPrice) ? Math.max(0, item.unitPrice) : 0;
  const discPercent = typeof item.discountPercent === 'number' && !isNaN(item.discountPercent) ? Math.max(0, item.discountPercent) : 0;
  const taxPercent = typeof item.taxPercent === 'number' && !isNaN(item.taxPercent) ? Math.max(0, item.taxPercent) : 0;

  const subtotal = qty * price;
  const discountAmount = (subtotal * discPercent) / 100;
  const taxableSubtotal = Math.max(0, subtotal - discountAmount);
  const taxAmount = (taxableSubtotal * taxPercent) / 100;
  const total = taxableSubtotal + taxAmount;

  return {
    qty,
    price,
    discPercent,
    taxPercent,
    subtotal,
    discountAmount,
    taxAmount,
    total,
  };
}

export function CreatePurchasePage({
  initialData,
  onBack,
  onCancel,
  onSave,
  pageType = 'purchase',
}: CreatePurchasePageProps) {
  const isCostPage = pageType === 'cost';

  // Title defaults to the invoice number input from Step 1
  const [invoiceNo, setInvoiceNo] = useState(initialData.invoiceNo || '');
  const [title, setTitle] = useState(
    initialData.invoiceNo || (isCostPage ? `CST-${Date.now().toString().slice(-6)}` : `${initialData.distributor} Invoice`)
  );
  const [distributor, setDistributor] = useState(initialData.distributor || 'Booking');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>(
    initialData.distributor && PAYMENT_METHOD_OPTIONS.includes(initialData.distributor)
      ? initialData.distributor
      : 'Bank Transfer'
  );
  const [date, setDate] = useState(initialData.date || new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(initialData.dueDate || '');
  const [paymentStatus, setPaymentStatus] = useState<'Paid' | 'Unpaid' | 'Partially Paid'>('Unpaid');
  const [description, setDescription] = useState('');

  // Popover states using the app's dropdown design
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [isDistributorDropdownOpen, setIsDistributorDropdownOpen] = useState(false);

  const statusRef = useRef<HTMLDivElement>(null);
  const distRef = useRef<HTMLDivElement>(null);

  // Attachments state - default empty
  const [attachments, setAttachments] = useState<{ id: string; name: string; size: string; type: string }[]>([]);
  const [barcodeInput, setBarcodeInput] = useState('');

  // Line items state initialized with a single blank row
  const [items, setItems] = useState<PurchaseItem[]>(() => {
    const fin = calculateItemFinancials({
      quantity: 1,
      unitPrice: 0,
      discountPercent: 0,
      taxPercent: 0,
    });
    return [
      {
        id: `item-${Date.now()}-0`,
        name: '',
        quantity: 1,
        unitPrice: 0,
        discountPercent: 0,
        taxPercent: 0,
        subtotal: fin.subtotal,
        discountAmount: fin.discountAmount,
        taxAmount: fin.taxAmount,
        total: fin.total,
        category: 'Inventory',
      },
    ];
  });

  // Handle outside clicks for all dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (statusRef.current && !statusRef.current.contains(e.target as Node)) {
        setIsStatusDropdownOpen(false);
      }
      if (distRef.current && !distRef.current.contains(e.target as Node)) {
        setIsDistributorDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Calculate relative deadline string
  const calculateDeadlineText = (startDateStr: string, targetDueDateStr: string): string => {
    if (!targetDueDateStr) return 'In 3 days';
    try {
      const start = new Date(startDateStr);
      const target = new Date(targetDueDateStr);
      const diffTime = target.getTime() - start.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < 0) return 'Overdue';
      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return 'Tomorrow';
      return `In ${diffDays} days`;
    } catch {
      return 'In 3 days';
    }
  };

  const handleItemChange = (
    index: number,
    field: keyof Omit<PurchaseItem, 'id' | 'subtotal' | 'discountAmount' | 'taxAmount' | 'total'>,
    value: string | number
  ) => {
    setItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        const updated = { ...item, [field]: value };
        const fin = calculateItemFinancials({
          quantity: typeof updated.quantity === 'number' ? updated.quantity : parseFloat(String(updated.quantity)) || 0,
          unitPrice: typeof updated.unitPrice === 'number' ? updated.unitPrice : parseFloat(String(updated.unitPrice)) || 0,
          discountPercent: typeof updated.discountPercent === 'number' ? updated.discountPercent : parseFloat(String(updated.discountPercent)) || 0,
          taxPercent: typeof updated.taxPercent === 'number' ? updated.taxPercent : parseFloat(String(updated.taxPercent)) || 0,
        });

        return {
          ...updated,
          subtotal: fin.subtotal,
          discountAmount: fin.discountAmount,
          taxAmount: fin.taxAmount,
          total: fin.total,
        };
      })
    );
  };

  const handleAddItem = () => {
    const fin = calculateItemFinancials({
      quantity: 1,
      unitPrice: 0,
      discountPercent: 0,
      taxPercent: 0,
    });
    const newItem: PurchaseItem = {
      id: `item-${Date.now()}-${items.length}`,
      name: '',
      quantity: 1,
      unitPrice: 0,
      discountPercent: 0,
      taxPercent: 0,
      subtotal: fin.subtotal,
      discountAmount: fin.discountAmount,
      taxAmount: fin.taxAmount,
      total: fin.total,
      category: 'Inventory',
    };
    setItems((prev) => [...prev, newItem]);
  };

  const handleAddByBarcode = (e?: FormEvent) => {
    if (e) e.preventDefault();
    const code = barcodeInput.trim();
    if (!code) return;

    // Check if an item exists or add new
    const fin = calculateItemFinancials({
      quantity: 1,
      unitPrice: 0,
      discountPercent: 0,
      taxPercent: 0,
    });
    const newItem: PurchaseItem = {
      id: `item-${Date.now()}-${items.length}`,
      name: `Item (${code})`,
      quantity: 1,
      unitPrice: 0,
      discountPercent: 0,
      taxPercent: 0,
      subtotal: fin.subtotal,
      discountAmount: fin.discountAmount,
      taxAmount: fin.taxAmount,
      total: fin.total,
      category: 'Inventory',
    };
    setItems((prev) => [...prev, newItem]);
    setBarcodeInput('');
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) {
      const fin = calculateItemFinancials({
        quantity: 1,
        unitPrice: 0,
        discountPercent: 0,
        taxPercent: 0,
      });
      setItems([
        {
          id: `item-${Date.now()}-0`,
          name: '',
          quantity: 1,
          unitPrice: 0,
          discountPercent: 0,
          taxPercent: 0,
          subtotal: fin.subtotal,
          discountAmount: fin.discountAmount,
          taxAmount: fin.taxAmount,
          total: fin.total,
          category: 'Inventory',
        },
      ]);
      return;
    }
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddAttachment = () => {
    const newAtt = {
      id: `att-${Date.now()}`,
      name: `PO_Document_${attachments.length + 1}.pdf`,
      size: '2.1 Mb',
      type: 'pdf',
    };
    setAttachments((prev) => [...prev, newAtt]);
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  // Grand totals
  const overallSubtotal = items.reduce((acc, it) => acc + (it.subtotal || 0), 0);
  const overallDiscount = items.reduce((acc, it) => acc + (it.discountAmount || 0), 0);
  const overallTax = items.reduce((acc, it) => acc + (it.taxAmount || 0), 0);
  const overallGrandTotal = Math.max(0, overallSubtotal - overallDiscount + overallTax);

  const handleSubmit = (e?: FormEvent) => {
    if (e) e.preventDefault();

    const validItems = items.filter((it) => it.name.trim() !== '');
    const productNames = validItems.map((it) => it.name.trim()).filter(Boolean);
    const itemSummary =
      productNames.length > 0
        ? productNames.length === 1
          ? productNames[0]
          : `${productNames[0]} (+${productNames.length - 1} more items)`
        : isCostPage
        ? 'Operational Expense / Cost'
        : `${distributor} Purchase Order`;

    const finalInvoiceNo = (title.trim() || invoiceNo.trim() || `${isCostPage ? 'CST' : 'INV'}-${Date.now().toString().slice(-6)}`);
    const finalSupplier = isCostPage ? selectedPaymentMethod : distributor;
    const finalPaymentMethod = isCostPage ? selectedPaymentMethod : 'Bank Transfer';

    onSave({
      invoiceNo: finalInvoiceNo,
      date: date || new Date().toISOString().split('T')[0],
      deadline: isCostPage ? 'Instant' : calculateDeadlineText(date, dueDate),
      description: itemSummary,
      supplier: finalSupplier,
      connection: finalSupplier,
      tag: paymentStatus,
      nights: 2,
      category: isCostPage ? 'Cost' : 'Inventory',
      amount: overallGrandTotal > 0 ? overallGrandTotal : 150,
      subtotal: overallSubtotal,
      totalDiscount: overallDiscount,
      totalTax: overallTax,
      status: paymentStatus,
      paymentMethod: finalPaymentMethod,
      dueDate: isCostPage ? date : (dueDate || undefined),
      notes: description.trim() || `${isCostPage ? 'Cost' : distributor} invoice ${finalInvoiceNo}`,
      items: validItems.length > 0 ? validItems : items,
      attachments: attachments.length > 0 ? attachments : undefined,
    });
  };

  // Status badge dot color matching PurchaseView
  const statusSquareColor =
    paymentStatus === 'Paid'
      ? 'bg-[#38BDF8]'
      : paymentStatus === 'Partially Paid'
      ? 'bg-[#F59E0B]'
      : 'bg-[#EF4444]';

  return (
    <div
      id="create-purchase-page"
      className="w-full max-w-[1000px] mx-auto pt-10 md:pt-14 pb-20 px-6 md:px-8 font-sans animate-in fade-in duration-150"
    >
      {/* 1. Breadcrumbs (Exactly matching main view navigation level & spacing) */}
      <div className="flex items-center gap-1.5 text-[13px] text-neutral-500 mb-2">
        <div className="w-4 h-4 rounded-[4px] border border-neutral-300 flex items-center justify-center text-neutral-600 bg-neutral-100/80 shadow-2xs">
          <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 24 24">
            <path d="M4 4h7v7H4V4zm9 0h7v7h-7V4zm-9 9h7v7H4v-7zm9 0h7v7h-7v-7z" />
          </svg>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="hover:text-neutral-800 transition-colors cursor-pointer"
        >
          Finalytic
        </button>
        <ChevronRight size={13} className="text-neutral-400 stroke-[2]" />
        <button
          type="button"
          onClick={onCancel}
          className="text-neutral-800 font-medium hover:text-neutral-950 transition-colors cursor-pointer"
        >
          {isCostPage ? 'Cost' : 'Purchase'}
        </button>
      </div>

      {/* 2. Main Page Title (Matching exact mb-4 from PurchaseView) */}
      <div className="flex items-center justify-between mb-4">
        <input
          type="text"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setInvoiceNo(e.target.value);
          }}
          className="w-full text-[24px] font-normal text-neutral-900 bg-transparent outline-none border-b border-transparent hover:border-neutral-200 focus:border-neutral-900 transition-colors pb-0.5 tracking-tight font-sans"
          placeholder="Invoice Number..."
        />
      </div>

      {/* 3. Metadata Rows with Standard App Dropdowns (Matching exact mb-6 spacing from PurchaseView) */}
      <div className="space-y-3 mb-6 text-[13.5px]">
        
        {/* Row 1: Status (Matching PurchaseView Status Badge + Dropdown) */}
        <div className="flex items-center min-h-[32px]">
          <div className="w-36 flex items-center gap-2.5 text-neutral-500 font-normal shrink-0">
            <Sun size={15} className="text-neutral-400" />
            <span>Status</span>
          </div>
          
          <div className="relative" ref={statusRef}>
            <button
              type="button"
              id="select-status-trigger"
              onClick={() => setIsStatusDropdownOpen((prev) => !prev)}
              className="bg-white hover:bg-neutral-50 border border-neutral-200/90 rounded-full px-3 py-1.5 flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs text-[13px] text-neutral-700 font-normal"
            >
              <span className={`w-2 h-2 rounded-full ${statusSquareColor} shrink-0`} />
              <span>{paymentStatus}</span>
              <ChevronDown size={12} className="text-neutral-400 ml-0.5" />
            </button>

            {isStatusDropdownOpen && (
              <div
                id="select-status-dropdown"
                className="absolute top-[calc(100%+6px)] left-0 z-40 bg-white rounded-xl shadow-lg border border-neutral-200/80 p-1.5 w-48 animate-in fade-in zoom-in-95 duration-100"
              >
                <div className="text-[12px] text-neutral-500 font-medium px-2 py-1 select-none">
                  Select status
                </div>
                {(['Paid', 'Partially Paid', 'Unpaid'] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => {
                      setPaymentStatus(st);
                      setIsStatusDropdownOpen(false);
                    }}
                    className={`w-full px-2.5 py-1.5 rounded-lg text-left text-[13px] flex items-center justify-between cursor-pointer transition-colors ${
                      paymentStatus === st
                        ? 'bg-neutral-100 font-medium text-neutral-900'
                        : 'text-neutral-700 hover:bg-neutral-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-[2px] ${
                          st === 'Paid'
                            ? 'bg-[#38BDF8]'
                            : st === 'Partially Paid'
                            ? 'bg-[#F59E0B]'
                            : 'bg-[#EF4444]'
                        }`}
                      />
                      <span>{st}</span>
                    </div>
                    {paymentStatus === st && <Check size={13} className="text-neutral-900" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Row 2: Distributor or Payment Method */}
        <div className="flex items-center min-h-[32px]">
          <div className="w-36 flex items-center gap-2.5 text-neutral-500 font-normal shrink-0">
            {isCostPage ? (
              <CreditCard size={15} className="text-neutral-400" />
            ) : (
              <Building2 size={15} className="text-neutral-400" />
            )}
            <span>{isCostPage ? 'Payment Method' : 'Distributor'}</span>
          </div>

          <div className="relative" ref={distRef}>
            <button
              type="button"
              id={isCostPage ? 'select-payment-method-trigger' : 'select-distributor-trigger'}
              onClick={() => setIsDistributorDropdownOpen((prev) => !prev)}
              className="bg-white hover:bg-neutral-50 border border-neutral-200/90 rounded-full px-3 py-1.5 flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs text-[13px] text-neutral-700 font-normal"
            >
              {isCostPage ? (
                <CreditCard size={13} className="text-neutral-400 shrink-0" />
              ) : (
                <Building2 size={13} className="text-neutral-400 shrink-0" />
              )}
              <span>{isCostPage ? selectedPaymentMethod : distributor}</span>
              <ChevronDown size={12} className="text-neutral-400 ml-0.5" />
            </button>

            {isDistributorDropdownOpen && (
              <div
                id={isCostPage ? 'select-payment-method-dropdown' : 'select-distributor-dropdown'}
                className="absolute top-[calc(100%+6px)] left-0 z-40 bg-white rounded-xl shadow-lg border border-neutral-200/80 p-1.5 w-52 max-h-56 overflow-y-auto animate-in fade-in zoom-in-95 duration-100"
              >
                <div className="text-[12px] text-neutral-500 font-medium px-2 py-1 select-none">
                  {isCostPage ? 'Select payment method' : 'Select distributor'}
                </div>
                {isCostPage
                  ? PAYMENT_METHOD_OPTIONS.map((method) => (
                      <button
                        key={method}
                        type="button"
                        onClick={() => {
                          setSelectedPaymentMethod(method);
                          setIsDistributorDropdownOpen(false);
                        }}
                        className={`w-full px-2.5 py-1.5 rounded-lg text-left text-[13px] flex items-center justify-between cursor-pointer transition-colors ${
                          selectedPaymentMethod === method
                            ? 'bg-neutral-100 font-medium text-neutral-900'
                            : 'text-neutral-700 hover:bg-neutral-50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <CreditCard size={13} className="text-neutral-500" />
                          <span>{method}</span>
                        </div>
                        {selectedPaymentMethod === method && <Check size={13} className="text-neutral-900" />}
                      </button>
                    ))
                  : DISTRIBUTOR_OPTIONS.map((dist) => (
                      <button
                        key={dist}
                        type="button"
                        onClick={() => {
                          setDistributor(dist);
                          setIsDistributorDropdownOpen(false);
                        }}
                        className={`w-full px-2.5 py-1.5 rounded-lg text-left text-[13px] flex items-center justify-between cursor-pointer transition-colors ${
                          distributor === dist
                            ? 'bg-neutral-100 font-medium text-neutral-900'
                            : 'text-neutral-700 hover:bg-neutral-50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <DistributorLogo name={dist} size="sm" />
                          <span>{dist}</span>
                        </div>
                        {distributor === dist && <Check size={13} className="text-neutral-900" />}
                      </button>
                    ))}
              </div>
            )}
          </div>
        </div>

        {/* Row 3: Date Range & Due Date */}
        <div className="flex flex-wrap items-center min-h-[32px] gap-y-2">
          <div className="w-36 flex items-center gap-2.5 text-neutral-500 font-normal shrink-0">
            <CalendarIcon size={15} className="text-neutral-400" />
            <span>Date</span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 text-[13px]">
            {/* Transaction Date Picker */}
            <div className="relative inline-flex items-center bg-white border border-neutral-200/90 hover:border-neutral-300 focus-within:border-neutral-900 rounded-full px-3 py-1 shadow-2xs transition-colors">
              <input
                type="date"
                id="transaction-date-input"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="bg-transparent text-[13px] text-neutral-800 font-medium outline-none cursor-pointer font-sans"
              />
            </div>

            {!isCostPage && (
              <>
                <span className="text-neutral-400 font-medium">→</span>

                {/* Due Date Picker */}
                <div className="relative inline-flex items-center bg-white border border-neutral-200/90 hover:border-neutral-300 focus-within:border-neutral-900 rounded-full px-3 py-1 shadow-2xs transition-colors">
                  <span className="text-[12px] text-neutral-400 font-normal mr-1 select-none">Due:</span>
                  <input
                    type="date"
                    id="due-date-input"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="bg-transparent text-[13px] text-neutral-800 font-medium outline-none cursor-pointer font-sans"
                  />
                </div>

                <span className="px-2.5 py-1 rounded-full text-[11.5px] font-medium bg-neutral-100/80 text-neutral-600 border border-neutral-200/70">
                  {calculateDeadlineText(date, dueDate)}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Row 4: Description */}
        <div className="pt-1">
          <div className="flex items-center gap-2.5 text-neutral-500 font-normal mb-2">
            <FileText size={15} className="text-neutral-400" />
            <span>Description</span>
          </div>

          <div className="relative">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full p-3.5 rounded-xl bg-white border border-neutral-200/80 hover:border-neutral-300 focus:border-neutral-900 focus:bg-white text-[13.5px] text-neutral-700 leading-relaxed outline-none transition-colors shadow-2xs resize-y font-sans"
              placeholder="Add detailed purchase order notes..."
            />
          </div>
        </div>

      </div>

      {/* 4. Product Input Table & Top Controls */}
      <div className="mb-6">
        {/* Top Controls: Barcode Input & Add Item Button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-3">
          {/* Barcode Input */}
          <form onSubmit={handleAddByBarcode} className="relative flex-1 max-w-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
              <ScanBarcode size={15} />
            </div>
            <input
              type="text"
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
              placeholder="Scan or enter barcode..."
              className="w-full pl-9 pr-20 py-2 rounded-xl bg-white border border-neutral-200/80 hover:border-neutral-300 focus:border-neutral-900 focus:bg-white text-[13px] text-neutral-800 placeholder:text-neutral-400 outline-none transition-colors shadow-2xs font-sans"
            />
            {barcodeInput.trim() && (
              <button
                type="submit"
                className="absolute right-1.5 top-1.5 bottom-1.5 px-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-[11.5px] font-medium transition-colors cursor-pointer flex items-center gap-1"
              >
                <span>Add</span>
              </button>
            )}
          </form>

          {/* Add Item Button */}
          <div className="flex items-center justify-end">
            <button
              type="button"
              onClick={handleAddItem}
              className="text-neutral-800 hover:text-neutral-950 hover:bg-neutral-200/50 text-[14px] font-normal px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus size={15} strokeWidth={1.75} className="text-neutral-700 shrink-0" />
              <span>Add Item</span>
            </button>
          </div>
        </div>

        {/* Table Frame */}
        <div className="border border-neutral-200/80 rounded-2xl bg-white shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[14px] border-collapse font-sans">
              {/* Header */}
              <thead>
                <tr className="border-b border-neutral-100 bg-[#F9FAFB] text-[13px] font-medium text-neutral-500 select-none">
                  <th className="py-3.5 pl-5 pr-3 w-12 text-center">No</th>
                  <th className="py-3.5 px-4 min-w-[220px]">Product / Description</th>
                  <th className="py-3.5 px-2 w-20 text-center">Qty</th>
                  <th className="py-3.5 px-3 w-28 text-right">Price</th>
                  <th className="py-3.5 px-2 w-20 text-right">Disc (%)</th>
                  <th className="py-3.5 px-3 w-24 text-right">Tax (%)</th>
                  <th className="py-3.5 px-4 w-32 text-right">Amount</th>
                  <th className="py-3.5 pl-2 pr-5 text-right w-12">Action</th>
                </tr>
              </thead>

              {/* Body */}
              <tbody className="divide-y divide-neutral-100 text-neutral-800">
                {items.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-neutral-50/70 transition-colors group">
                    {/* No */}
                    <td className="py-3.5 pl-5 pr-3 text-center text-neutral-400 text-[13px]">
                      {idx + 1}
                    </td>

                    {/* Product Name Input */}
                    <td className="py-2.5 px-4">
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => handleItemChange(idx, 'name', e.target.value)}
                        placeholder="Enter item name or service..."
                        className="w-full bg-transparent hover:bg-neutral-50 focus:bg-white px-2 py-1 rounded-lg border border-transparent focus:border-neutral-300 outline-none text-[13.5px] text-neutral-800 placeholder:text-neutral-400 font-normal transition-colors"
                        required
                      />
                    </td>

                    {/* Qty */}
                    <td className="py-2.5 px-2">
                      <input
                        type="number"
                        min="0"
                        value={item.quantity === 0 ? '' : item.quantity}
                        onChange={(e) => {
                          const val = e.target.value === '' ? 0 : parseInt(e.target.value) || 0;
                          handleItemChange(idx, 'quantity', val);
                        }}
                        placeholder="0"
                        className="w-full text-center px-1 py-1 rounded-lg bg-transparent hover:bg-neutral-50 focus:bg-white border border-transparent focus:border-neutral-300 outline-none text-[13.5px] font-medium text-neutral-800 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </td>

                    {/* Unit Price */}
                    <td className="py-2.5 px-3">
                      <div className="relative flex items-center justify-end">
                        <span className="text-neutral-400 text-[12px] mr-1">$</span>
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={item.unitPrice === 0 ? '' : item.unitPrice}
                          onChange={(e) => {
                            const val = e.target.value === '' ? 0 : parseFloat(e.target.value) || 0;
                            handleItemChange(idx, 'unitPrice', val);
                          }}
                          placeholder="0"
                          className="w-20 text-right px-1 py-1 rounded-lg bg-transparent hover:bg-neutral-50 focus:bg-white border border-transparent focus:border-neutral-300 outline-none text-[13.5px] text-neutral-800 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                      </div>
                    </td>

                    {/* Discount % */}
                    <td className="py-2.5 px-2">
                      <div className="relative flex items-center justify-end">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="any"
                          value={(item.discountPercent === 0 || item.discountPercent === undefined) ? '' : item.discountPercent}
                          onChange={(e) => {
                            const val = e.target.value === '' ? 0 : Math.min(100, Math.max(0, parseFloat(e.target.value) || 0));
                            handleItemChange(idx, 'discountPercent', val);
                          }}
                          placeholder="0"
                          className="w-14 text-right pr-4 pl-1 py-1 rounded-lg bg-transparent hover:bg-neutral-50 focus:bg-white border border-transparent focus:border-neutral-300 outline-none text-[12.5px] text-neutral-800 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <span className="absolute right-1 text-neutral-400 text-[10.5px]">%</span>
                      </div>
                    </td>

                    {/* Tax % */}
                    <td className="py-2.5 px-3">
                      <div className="relative flex items-center justify-end">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="any"
                          value={(item.taxPercent === 0 || item.taxPercent === undefined) ? '' : item.taxPercent}
                          onChange={(e) => {
                            const val = e.target.value === '' ? 0 : Math.min(100, Math.max(0, parseFloat(e.target.value) || 0));
                            handleItemChange(idx, 'taxPercent', val);
                          }}
                          placeholder="0"
                          className="w-14 text-right pr-4 pl-1 py-1 rounded-lg bg-transparent hover:bg-neutral-50 focus:bg-white border border-transparent focus:border-neutral-300 outline-none text-[12.5px] text-neutral-800 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <span className="absolute right-1 text-neutral-400 text-[10.5px]">%</span>
                      </div>
                    </td>

                    {/* Total Amount */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap text-neutral-900 font-medium text-[13.5px]">
                      ${(item.total || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>

                    {/* Delete action */}
                    <td className="py-3.5 pl-2 pr-5 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="p-1 rounded text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Remove item"
                      >
                        <Trash2 size={13.5} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 5. Purchase Order Financial Summary Card (with Attachment Input on Left) & Action Buttons */}
      <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-2xs mb-8">
        <div className="flex flex-col lg:flex-row items-start justify-between gap-6">
          {/* Left: Attachment Section */}
          <div className="flex-1 w-full space-y-2.5">
            <div className="flex items-center gap-2 text-neutral-600 font-medium text-[13px]">
              <Paperclip size={14} className="text-neutral-400" />
              <span>Attachment</span>
              {attachments.length > 0 && (
                <span className="text-[11px] bg-neutral-100 text-neutral-500 px-1.5 py-0.5 rounded-full font-normal">
                  {attachments.length}
                </span>
              )}
            </div>

            {attachments.length === 0 ? (
              <button
                type="button"
                onClick={handleAddAttachment}
                className="w-full border border-dashed border-neutral-200 hover:border-neutral-400 bg-neutral-50/50 hover:bg-neutral-100/60 rounded-xl py-3 px-4 flex items-center justify-center gap-2 text-[12.5px] text-neutral-600 font-normal transition-all cursor-pointer group"
              >
                <Plus size={14} className="text-neutral-500 group-hover:text-neutral-800 transition-colors" />
                <span className="font-medium text-neutral-700">Add Attachment</span>
                <span className="text-neutral-400 text-[11.5px]">(PDF, JPG, PNG)</span>
              </button>
            ) : (
              <div className="flex flex-wrap items-center gap-2.5">
                {attachments.map((att) => (
                  <div
                    key={att.id}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-neutral-50/80 border border-neutral-200/80 hover:border-neutral-300 transition-colors shadow-2xs min-w-[180px] group"
                  >
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center text-white text-[9.5px] font-bold uppercase tracking-wider shrink-0 ${
                        att.type === 'pdf' ? 'bg-[#EF4444]' : 'bg-[#8B5CF6]'
                      }`}
                    >
                      {att.type}
                    </div>
                    <div className="truncate flex-1">
                      <div className="text-[12px] font-medium text-neutral-800 truncate max-w-[120px]">
                        {att.name}
                      </div>
                      <div className="text-[10.5px] text-neutral-400">{att.size}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveAttachment(att.id)}
                      className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-neutral-200/60 rounded text-neutral-400 hover:text-rose-500 transition-all cursor-pointer"
                      title="Remove attachment"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={handleAddAttachment}
                  className="h-[38px] px-3 rounded-xl border border-dashed border-neutral-200 hover:border-neutral-400 bg-neutral-50/50 hover:bg-neutral-100 text-neutral-600 hover:text-neutral-900 flex items-center gap-1.5 text-[12px] font-medium transition-colors cursor-pointer"
                >
                  <Plus size={13} strokeWidth={2} />
                  <span>Add File</span>
                </button>
              </div>
            )}
          </div>

          {/* Right: Numbers calculation */}
          <div className="w-full lg:w-80 space-y-2 text-[13px] pt-1 lg:pt-0 border-t lg:border-t-0 border-neutral-100">
            <div className="flex items-center justify-between text-neutral-500">
              <span>Subtotal</span>
              <span className="text-neutral-800 font-medium">
                ${overallSubtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex items-center justify-between text-neutral-500">
              <span>Discount</span>
              <span className={overallDiscount > 0 ? 'text-emerald-600 font-medium' : 'text-neutral-400'}>
                -${overallDiscount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex items-center justify-between text-neutral-500">
              <span>Tax</span>
              <span className="text-neutral-800 font-medium">
                +${overallTax.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            <div className="h-px bg-neutral-100 my-1.5" />

            <div className="flex items-center justify-between pt-0.5">
              <span className="text-[14px] font-bold text-neutral-900">Grand Total</span>
              <span className="text-[20px] font-bold text-neutral-950">
                ${overallGrandTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-5 mt-5 border-t border-neutral-100 flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-neutral-200/80 bg-white hover:bg-neutral-50 text-neutral-700 text-[13px] font-medium transition-colors cursor-pointer shadow-2xs"
          >
            <ArrowLeft size={14} />
            <span>{isCostPage ? 'Back' : 'Back to Step 1'}</span>
          </button>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 rounded-xl text-neutral-600 hover:bg-neutral-100 text-[13px] font-medium transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => handleSubmit()}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-neutral-900 hover:bg-black text-white text-[13px] font-semibold transition-all cursor-pointer shadow-xs"
            >
              <Check size={14} />
              <span>Save Transaction</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
