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

export interface CreateCostInitialData {
  vendor: string;
  invoiceNo: string;
  date: string;
  dueDate: string;
  category?: string;
}

const VENDOR_OPTIONS = [
  'Utilities & Electricity',
  'Operational Supplies',
  'Software & SaaS',
  'Marketing & Ads',
  'Office Maintenance',
  'Rent & Property',
  'Professional Services',
  'Booking Commission',
  'Airbnb Service Fee',
  'Other Expenses',
];

function VendorLogo({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' }) {
  const isSm = size === 'sm';
  const containerClass = isSm
    ? 'w-4.5 h-4.5 text-[9px]'
    : 'w-5 h-5 text-[9.5px]';

  return (
    <div className={`${containerClass} rounded-full bg-neutral-900 text-white flex items-center justify-center font-bold shrink-0 shadow-2xs`}>
      <Building2 size={isSm ? 10 : 11} className="text-neutral-300" />
    </div>
  );
}

function formatDisplayDate(dateStr: string): string {
  if (!dateStr) return 'Select date';
  const [year, month, day] = dateStr.split('-');
  if (!year || !month || !day) return dateStr;
  const dateObj = new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10));
  return dateObj.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getDaysDiffFromToday(dateStr: string): number | null {
  if (!dateStr) return null;
  const [year, month, day] = dateStr.split('-');
  if (!year || !month || !day) return null;
  const target = new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10));
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  const diffTime = target.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function getDeadlineBadgeText(dueDateStr: string): string {
  const diff = getDaysDiffFromToday(dueDateStr);
  if (diff === null) return '';
  if (diff < 0) return `Overdue by ${Math.abs(diff)} d`;
  if (diff === 0) return 'Due Today';
  if (diff === 1) return 'Due Tomorrow';
  return `In ${diff} days`;
}

interface CustomDatePickerProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  icon?: 'calendar' | 'clock';
  badge?: string;
  idPrefix: string;
}

function CustomDatePicker({
  label,
  value,
  onChange,
  icon = 'calendar',
  badge,
  idPrefix,
}: CustomDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const initialYear = value ? parseInt(value.split('-')[0], 10) : new Date().getFullYear();
  const initialMonth = value ? parseInt(value.split('-')[1], 10) - 1 : new Date().getMonth();

  const [viewYear, setViewYear] = useState(initialYear);
  const [viewMonth, setViewMonth] = useState(initialMonth);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();

  const handleSelectDay = (day: number) => {
    const formattedMonth = String(viewMonth + 1).padStart(2, '0');
    const formattedDay = String(day).padStart(2, '0');
    onChange(`${viewYear}-${formattedMonth}-${formattedDay}`);
    setIsOpen(false);
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
          className="absolute top-[calc(100%+6px)] left-0 z-50 bg-white rounded-2xl shadow-xl border border-neutral-200/90 p-3.5 w-64 animate-in fade-in zoom-in-95 duration-100 font-sans"
        >
          <div className="flex items-center justify-between mb-3 px-1">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1 rounded-lg text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-[13px] font-semibold text-neutral-800">
              {monthNames[viewMonth]} {viewYear}
            </span>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1 rounded-lg text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-medium text-neutral-400 mb-1">
            <span>Su</span>
            <span>Mo</span>
            <span>Tu</span>
            <span>We</span>
            <span>Th</span>
            <span>Fr</span>
            <span>Sa</span>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center">
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const formattedM = String(viewMonth + 1).padStart(2, '0');
              const formattedD = String(dayNum).padStart(2, '0');
              const currentDateStr = `${viewYear}-${formattedM}-${formattedD}`;
              const isSelected = value === currentDateStr;

              return (
                <button
                  key={dayNum}
                  type="button"
                  onClick={() => handleSelectDay(dayNum)}
                  className={`h-7 w-7 rounded-lg text-[12px] flex items-center justify-center cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-neutral-900 text-white font-medium shadow-2xs'
                      : 'text-neutral-700 hover:bg-neutral-100'
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

interface AddCostTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedToDetails: (data: CreateCostInitialData) => void;
  initialValues?: CreateCostInitialData;
}

export function AddCostTransactionModal({
  isOpen,
  onClose,
  onProceedToDetails,
  initialValues,
}: AddCostTransactionModalProps) {
  const [vendor, setVendor] = useState(initialValues?.vendor || 'Utilities & Electricity');
  const [invoiceNo, setInvoiceNo] = useState(initialValues?.invoiceNo || '');
  const [date, setDate] = useState(
    initialValues?.date || new Date().toISOString().split('T')[0]
  );
  const [dueDate, setDueDate] = useState(initialValues?.dueDate || '');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const invoiceInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialValues) {
      setVendor(initialValues.vendor || 'Utilities & Electricity');
      setInvoiceNo(initialValues.invoiceNo || '');
      setDate(initialValues.date || new Date().toISOString().split('T')[0]);
      setDueDate(initialValues.dueDate || '');
    }
  }, [initialValues]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen) {
      const generateNumber = () => {
        const rand = Math.floor(1000 + Math.random() * 9000);
        return `CST-${new Date().getFullYear()}-${rand}`;
      };
      if (!invoiceNo) {
        setInvoiceNo(generateNumber());
      }
      setTimeout(() => {
        invoiceInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelectVendor = (opt: string) => {
    setVendor(opt);
    setIsDropdownOpen(false);
  };

  const deadlineBadgePreview = getDeadlineBadgeText(dueDate);

  const handleProceed = (e: FormEvent) => {
    e.preventDefault();
    if (!invoiceNo.trim()) return;
    onProceedToDetails({
      vendor,
      invoiceNo: invoiceNo.trim(),
      date,
      dueDate,
    });
  };

  return (
    <div
      id="add-cost-modal-overlay"
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150 font-sans"
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-neutral-200/90 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[15px] font-semibold text-neutral-900">
                Add Cost Transaction
              </span>
            </div>
            <p className="text-[12px] text-neutral-400 mt-0.5">
              Enter vendor details, expense invoice, and payment schedule
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
          {/* 1. Vendor Selection */}
          <div className="relative" ref={dropdownRef}>
            <label className="block text-[12px] font-medium text-neutral-500 mb-1">Vendor / Expense Category</label>
            <button
              type="button"
              id="select-vendor-trigger"
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl bg-neutral-50 border transition-all cursor-pointer text-left ${
                isDropdownOpen
                  ? 'border-neutral-900 bg-white ring-1 ring-neutral-900/10'
                  : 'border-neutral-200/80 hover:border-neutral-300'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <VendorLogo name={vendor} size="md" />
                <span className="text-[13px] text-neutral-800 font-medium">
                  {vendor}
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
                id="vendor-dropdown-menu"
                className="absolute top-[calc(100%+6px)] left-0 z-50 bg-white rounded-xl shadow-lg border border-neutral-200/80 p-1.5 w-full max-h-56 overflow-y-auto animate-in fade-in zoom-in-95 duration-100 font-sans"
              >
                <div className="text-[11px] text-neutral-400 font-medium px-2.5 py-1 select-none">
                  Select category / vendor
                </div>
                {VENDOR_OPTIONS.map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => handleSelectVendor(v)}
                    className={`w-full px-2.5 py-2 rounded-lg text-left text-[13px] flex items-center justify-between cursor-pointer transition-colors ${
                      vendor === v
                        ? 'bg-neutral-100 font-medium text-neutral-900'
                        : 'text-neutral-700 hover:bg-neutral-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <VendorLogo name={v} size="sm" />
                      <span>{v}</span>
                    </div>
                    {vendor === v && <Check size={13} className="text-neutral-900" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 2. Invoice Input */}
          <div>
            <label className="block text-[12px] font-medium text-neutral-500 mb-1">Invoice / Receipt Number</label>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-neutral-50 border border-neutral-200/80 focus-within:border-neutral-900 focus-within:bg-white transition-colors">
              <FileText size={14} className="text-neutral-400 shrink-0" />
              <input
                ref={invoiceInputRef}
                id="input-invoice"
                type="text"
                value={invoiceNo}
                onChange={(e) => setInvoiceNo(e.target.value)}
                placeholder="e.g. CST-2023-0101"
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
