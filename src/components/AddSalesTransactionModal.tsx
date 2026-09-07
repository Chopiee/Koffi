import { useState, useEffect, useRef, FormEvent } from 'react';
import {
  X,
  Calendar as CalendarIcon,
  FileText,
  Clock,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Check,
  CornerDownLeft,
  Building2,
} from 'lucide-react';
import { CreateSalesInitialData } from './CreateSalesPage';

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

function CustomerLogo({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' }) {
  const isSm = size === 'sm';
  const containerClass = isSm
    ? 'w-4.5 h-4.5 text-[9px]'
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

function formatDisplayDate(dateStr: string): string {
  if (!dateStr) return 'Select date';
  try {
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

interface CustomDatePickerProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  icon: 'calendar' | 'clock';
  badge?: string;
  idPrefix: string;
}

function CustomDatePicker({
  label,
  value,
  onChange,
  icon,
  badge,
  idPrefix,
}: CustomDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const initialDate = value ? new Date(value) : new Date();
  const [currentYear, setCurrentYear] = useState(initialDate.getFullYear() || new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(initialDate.getMonth() || new Date().getMonth());

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && value) {
      const parts = value.split('-').map(Number);
      if (parts.length === 3) {
        setCurrentYear(parts[0]);
        setCurrentMonth(parts[1] - 1);
      }
    }
  }, [isOpen, value]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();

  const handleSelectDay = (day: number) => {
    const yStr = currentYear.toString();
    const mStr = (currentMonth + 1).toString().padStart(2, '0');
    const dStr = day.toString().padStart(2, '0');
    onChange(`${yStr}-${mStr}-${dStr}`);
    setIsOpen(false);
  };

  const isSelected = (day: number) => {
    if (!value) return false;
    const parts = value.split('-').map(Number);
    return (
      parts[0] === currentYear &&
      parts[1] - 1 === currentMonth &&
      parts[2] === day
    );
  };

  const isToday = (day: number) => {
    const now = new Date();
    return (
      now.getFullYear() === currentYear &&
      now.getMonth() === currentMonth &&
      now.getDate() === day
    );
  };

  return (
    <div className="relative" ref={containerRef}>
      <div className="flex items-center justify-between mb-1">
        <label className="block text-[12px] font-medium text-neutral-500">{label}</label>
        {badge && (
          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700">
            {badge}
          </span>
        )}
      </div>

      <button
        type="button"
        id={`${idPrefix}-trigger`}
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl bg-neutral-50 border text-left transition-all cursor-pointer ${
          isOpen
            ? 'border-neutral-900 bg-white ring-1 ring-neutral-900/10'
            : 'border-neutral-200/80 hover:border-neutral-300'
        }`}
      >
        <div className="flex items-center gap-2">
          {icon === 'calendar' ? (
            <CalendarIcon size={14} className="text-neutral-400 shrink-0" />
          ) : (
            <Clock size={14} className="text-neutral-400 shrink-0" />
          )}
          <span className="text-[13px] text-neutral-800 font-medium">
            {formatDisplayDate(value)}
          </span>
        </div>
        <ChevronDown
          size={13}
          className={`text-neutral-400 transition-transform duration-150 ${
            isOpen ? 'rotate-180 text-neutral-700' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div
          id={`${idPrefix}-popover`}
          className="absolute top-[calc(100%+6px)] left-0 z-50 bg-white rounded-2xl shadow-xl border border-neutral-200/90 p-3 w-64 animate-in fade-in zoom-in-95 duration-100 font-sans"
        >
          <div className="flex items-center justify-between mb-2 px-0.5">
            <span className="text-[12.5px] font-semibold text-neutral-900">
              {monthNames[currentMonth]} {currentYear}
            </span>
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1 rounded-md hover:bg-neutral-100 text-neutral-500 hover:text-neutral-900 transition-colors cursor-pointer"
                title="Previous Month"
              >
                <ChevronLeft size={13.5} />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1 rounded-md hover:bg-neutral-100 text-neutral-500 hover:text-neutral-900 transition-colors cursor-pointer"
                title="Next Month"
              >
                <ChevronRight size={13.5} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((w) => (
              <div key={w} className="text-[10px] font-medium text-neutral-400 py-0.5">
                {w}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1 text-center">
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`blank-${i}`} className="w-6.5 h-6.5" />
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const selected = isSelected(dayNum);
              const today = isToday(dayNum);

              return (
                <button
                  key={`day-${dayNum}`}
                  type="button"
                  onClick={() => handleSelectDay(dayNum)}
                  className={`w-6.5 h-6.5 rounded-md text-[11.5px] flex items-center justify-center transition-all cursor-pointer ${
                    selected
                      ? 'bg-neutral-900 text-white font-semibold shadow-2xs'
                      : today
                      ? 'bg-neutral-100 text-neutral-900 font-semibold border border-neutral-300'
                      : 'text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900'
                  }`}
                >
                  {dayNum}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

interface AddSalesTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedToDetails: (data: CreateSalesInitialData) => void;
  initialValues?: CreateSalesInitialData;
}

export function AddSalesTransactionModal({
  isOpen,
  onClose,
  onProceedToDetails,
  initialValues,
}: AddSalesTransactionModalProps) {
  const [customer, setCustomer] = useState('Booking');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [invoiceNo, setInvoiceNo] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');

  const invoiceInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

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

  useEffect(() => {
    if (isOpen) {
      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];
      const futureDate = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
      const dueStr = futureDate.toISOString().split('T')[0];

      setCustomer(initialValues?.customer || 'Booking');
      setInvoiceNo(initialValues?.invoiceNo || `SL-${now.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
      setDate(initialValues?.date || todayStr);
      setDueDate(initialValues?.dueDate || dueStr);
      setIsDropdownOpen(false);

      setTimeout(() => invoiceInputRef.current?.focus(), 50);
    }
  }, [isOpen, initialValues]);

  const handleSelectCustomer = (cust: string) => {
    setCustomer(cust);
    setIsDropdownOpen(false);
  };

  if (!isOpen) return null;

  const deadlineBadgePreview = calculateDeadlineText(date, dueDate);

  const handleProceed = (e: FormEvent) => {
    e.preventDefault();
    if (!invoiceNo.trim()) return;

    onProceedToDetails({
      customer,
      invoiceNo: invoiceNo.trim(),
      date,
      dueDate,
    });
  };

  return (
    <div
      id="add-sales-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4 font-sans overflow-y-auto animate-in fade-in duration-150"
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-neutral-200/90 w-full max-w-lg overflow-visible animate-in fade-in zoom-in-95 duration-150 transition-all">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-neutral-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[15px] font-semibold text-neutral-900">
                Add Sales Transaction
              </span>
            </div>
            <p className="text-[12px] text-neutral-400 mt-0.5">
              Enter customer reference, invoice information, and delivery schedule
            </p>
          </div>

          <button
            id="btn-close-modal"
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>

        {/* STEP 1: Basic Transaction Info */}
        <form onSubmit={handleProceed} className="p-5 space-y-4 text-[14px]">
          {/* 1. Customer Custom Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <label className="block text-[12px] font-medium text-neutral-500 mb-1">Customer / Channel</label>
            <button
              type="button"
              id="select-customer-trigger"
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl bg-neutral-50 border transition-all cursor-pointer text-left ${
                isDropdownOpen
                  ? 'border-neutral-900 bg-white ring-1 ring-neutral-900/10'
                  : 'border-neutral-200/80 hover:border-neutral-300'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <CustomerLogo name={customer} size="md" />
                <span className="text-[13px] text-neutral-800 font-medium">
                  {customer}
                </span>
              </div>
              <ChevronDown
                size={13}
                className={`text-neutral-400 transition-transform duration-150 ${
                  isDropdownOpen ? 'rotate-180 text-neutral-700' : ''
                }`}
              />
            </button>

            {/* Custom Dropdown Menu */}
            {isDropdownOpen && (
              <div
                id="customer-dropdown-menu"
                className="absolute top-[calc(100%+6px)] left-0 z-50 bg-white rounded-xl shadow-lg border border-neutral-200/80 p-1.5 w-full max-h-56 overflow-y-auto animate-in fade-in zoom-in-95 duration-100 font-sans"
              >
                <div className="text-[11px] text-neutral-400 font-medium px-2.5 py-1 select-none">
                  Select customer
                </div>
                {CUSTOMER_OPTIONS.map((cust) => (
                  <button
                    key={cust}
                    type="button"
                    onClick={() => handleSelectCustomer(cust)}
                    className={`w-full px-2.5 py-2 rounded-lg text-left text-[13px] flex items-center justify-between cursor-pointer transition-colors ${
                      customer === cust
                        ? 'bg-neutral-100 font-medium text-neutral-900'
                        : 'text-neutral-700 hover:bg-neutral-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <CustomerLogo name={cust} size="sm" />
                      <span>{cust}</span>
                    </div>
                    {customer === cust && <Check size={13} className="text-neutral-900" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 2. Invoice Input */}
          <div>
            <label className="block text-[12px] font-medium text-neutral-500 mb-1">Invoice Number</label>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-neutral-50 border border-neutral-200/80 focus-within:border-neutral-900 focus-within:bg-white transition-colors">
              <FileText size={14} className="text-neutral-400 shrink-0" />
              <input
                ref={invoiceInputRef}
                id="input-invoice"
                type="text"
                value={invoiceNo}
                onChange={(e) => setInvoiceNo(e.target.value)}
                placeholder="e.g. SL-2023-0610"
                className="bg-transparent text-[13.5px] text-neutral-800 placeholder:text-neutral-400 outline-none w-full font-mono"
                required
              />
            </div>
          </div>

          {/* 3. Date & Due Date Custom Pickers Grid */}
          <div className="grid grid-cols-2 gap-3">
            <CustomDatePicker
              label="Date"
              value={date}
              onChange={setDate}
              icon="calendar"
              idPrefix="input-date"
            />

            <CustomDatePicker
              label="Due Date"
              value={dueDate}
              onChange={setDueDate}
              icon="clock"
              idPrefix="input-due-date"
              badge={deadlineBadgePreview}
            />
          </div>

          {/* Footer Action buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-neutral-100 text-[13px]">
            <span className="text-neutral-400 text-[12px]">Continue to enter items & calculation</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 rounded-xl text-neutral-600 hover:bg-neutral-100 transition-colors cursor-pointer font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!invoiceNo.trim()}
                className="px-4 py-2 rounded-xl bg-black hover:bg-neutral-800 disabled:opacity-40 text-white font-medium flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
              >
                <span>Next</span>
                <CornerDownLeft size={13} />
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
