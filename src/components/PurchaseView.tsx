import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  ChevronDown,
  ChevronRight,
  ChevronsUpDown,
  Plus,
  Calendar,
  DollarSign,
  Trash2,
  Check,
  Search,
  X,
  SlidersHorizontal,
  Building2,
  FileText,
  Clock,
  MoreHorizontal,
  Scan,
  Barcode,
  Camera,
} from 'lucide-react';
import { PurchaseTransaction, SidebarTab } from '../types';
import { AddTransactionModal } from './AddTransactionModal';
import { CreatePurchasePage, CreatePurchaseInitialData } from './CreatePurchasePage';
import { PurchaseInvoiceView } from './PurchaseInvoiceView';
import { Pagination } from './Pagination';

interface PurchaseViewProps {
  transactions?: PurchaseTransaction[];
  onAddTransaction?: (transaction: Omit<PurchaseTransaction, 'id' | 'createdAt'>) => void;
  onDeleteTransaction?: (id: string) => void;
  onToggleTransactionStatus?: (id: string) => void;
  onUpdateTransaction?: (transaction: PurchaseTransaction) => void;
  onNavigateTab?: (tab: SidebarTab) => void;
}

type SortField = 'id' | 'distributor' | 'status' | 'date' | 'deadline' | 'invoice' | 'remaining' | 'amount';
type SortOrder = 'asc' | 'desc';

// Helper to calculate remaining balance
const getRemainingAmount = (tx: PurchaseTransaction) => {
  const status = (tx.status || tx.tag || 'Paid').toLowerCase();
  if (status === 'paid') return 0;
  if (status === 'unpaid') return tx.amount;
  if (status === 'partially paid' || status === 'partial') return tx.amount * 0.5;
  return 0;
};

export function PurchaseView({
  transactions: propTransactions,
  onAddTransaction: propOnAddTransaction,
  onDeleteTransaction: propOnDeleteTransaction,
  onToggleTransactionStatus: propOnToggleTransactionStatus,
  onUpdateTransaction: propOnUpdateTransaction,
  onNavigateTab,
}: PurchaseViewProps) {
  // Default empty transactions list
  const [internalTransactions, setInternalTransactions] = useState<PurchaseTransaction[]>([]);

  const transactions = propTransactions !== undefined ? propTransactions : internalTransactions;

  // Selected row IDs for checkboxes
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Sorting
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Filters State
  const [selectedDatePreset, setSelectedDatePreset] = useState<string>('All Time');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('All');
  const [selectedDistributorFilter, setSelectedDistributorFilter] = useState<string>('All');
  const [scannedBarcode, setScannedBarcode] = useState<string>('');
  const [isScanningSimulated, setIsScanningSimulated] = useState(false);
  const [selectedAmountRange, setSelectedAmountRange] = useState<string>('All');

  // Open Popover Dropdown Filter states
  const [activeFilterDropdown, setActiveFilterDropdown] = useState<string | null>(null);
  const filterDropdownRef = useRef<HTMLDivElement>(null);

  // Active 3-dots action row state
  const [activeActionId, setActiveActionId] = useState<string | null>(null);
  const actionMenuRef = useRef<HTMLDivElement>(null);

  // Modal & View State
  const [viewMode, setViewMode] = useState<'list' | 'create-details' | 'invoice'>('list');
  const [selectedInvoiceTransaction, setSelectedInvoiceTransaction] = useState<PurchaseTransaction | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [createInitialData, setCreateInitialData] = useState<CreatePurchaseInitialData>({
    distributor: 'Booking',
    invoiceNo: '',
    date: new Date().toISOString().split('T')[0],
    dueDate: '',
  });

  // Close filter dropdown and action dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        filterDropdownRef.current &&
        !filterDropdownRef.current.contains(event.target as Node)
      ) {
        setActiveFilterDropdown(null);
      }
      if (
        actionMenuRef.current &&
        !actionMenuRef.current.contains(event.target as Node)
      ) {
        setActiveActionId(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handlers
  const handleAddTransaction = (newTxData: Omit<PurchaseTransaction, 'id' | 'createdAt'>) => {
    const newTx: PurchaseTransaction = {
      ...newTxData,
      id: `tx-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    if (propOnAddTransaction) {
      propOnAddTransaction(newTxData);
    } else {
      setInternalTransactions((prev) => [newTx, ...prev]);
    }
    setSelectedInvoiceTransaction(newTx);
    setViewMode('invoice');
  };

  const handleUpdateTransaction = (updatedTx: PurchaseTransaction) => {
    setSelectedInvoiceTransaction(updatedTx);
    if (propOnUpdateTransaction) {
      propOnUpdateTransaction(updatedTx);
    }
    setInternalTransactions((prev) =>
      prev.map((tx) => (tx.id === updatedTx.id ? updatedTx : tx))
    );
  };

  const handleDelete = (id: string) => {
    if (propOnDeleteTransaction) {
      propOnDeleteTransaction(id);
    } else {
      setInternalTransactions((prev) => prev.filter((tx) => tx.id !== id));
    }
    setSelectedIds((prev) => prev.filter((i) => i !== id));
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    if (propOnDeleteTransaction) {
      selectedIds.forEach((id) => propOnDeleteTransaction(id));
    } else {
      setInternalTransactions((prev) => prev.filter((tx) => !selectedIds.includes(tx.id)));
    }
    setSelectedIds([]);
  };

  const handleBulkSetStatus = (newStatus: 'Paid' | 'Unpaid' | 'Partially Paid') => {
    if (selectedIds.length === 0) return;
    if (propOnToggleTransactionStatus) {
      selectedIds.forEach((id) => propOnToggleTransactionStatus(id));
    } else {
      setInternalTransactions((prev) =>
        prev.map((tx) => (selectedIds.includes(tx.id) ? { ...tx, status: newStatus, tag: newStatus } : tx))
      );
    }
  };

  const handleToggleStatus = (id: string) => {
    if (propOnToggleTransactionStatus) {
      propOnToggleTransactionStatus(id);
    } else {
      setInternalTransactions((prev) =>
        prev.map((tx) => {
          if (tx.id !== id) return tx;
          let nextStatus: string = 'Paid';
          if (tx.status === 'Paid') nextStatus = 'Partially Paid';
          else if (tx.status === 'Partially Paid') nextStatus = 'Unpaid';
          else nextStatus = 'Paid';
          return { ...tx, status: nextStatus, tag: nextStatus };
        })
      );
    }
  };

  // Toggle selection
  const handleToggleSelectRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredTransactions.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredTransactions.map((tx) => tx.id));
    }
  };

  // Sort handler
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Filter and sort transactions
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((tx) => {
        // Date filter
        if (selectedDatePreset !== 'All Time') {
          const txDate = new Date(tx.date);
          const now = new Date();
          const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          const txDayStart = new Date(txDate.getFullYear(), txDate.getMonth(), txDate.getDate());

          if (selectedDatePreset === 'Today') {
            if (txDayStart.getTime() !== todayStart.getTime()) {
              // Also allow matching if data date matches today's YYYY-MM-DD
              const todayStr = now.toISOString().split('T')[0];
              if (tx.date !== todayStr) return false;
            }
          } else if (selectedDatePreset === 'Yesterday') {
            const yesterdayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
            if (txDayStart.getTime() !== yesterdayStart.getTime()) {
              const yest = new Date(Date.now() - 86400000);
              const yestStr = yest.toISOString().split('T')[0];
              if (tx.date !== yestStr) return false;
            }
          } else if (selectedDatePreset === 'This Month') {
            const isSameMonth =
              txDate.getFullYear() === now.getFullYear() &&
              txDate.getMonth() === now.getMonth();
            if (!isSameMonth && txDate.getMonth() !== now.getMonth()) return false;
          } else if (selectedDatePreset === 'Last Month') {
            const prevMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
            const prevYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
            const isLastMonth =
              (txDate.getFullYear() === prevYear && txDate.getMonth() === prevMonth) ||
              txDate.getMonth() === prevMonth;
            if (!isLastMonth) return false;
          } else if (selectedDatePreset === 'This Year') {
            const isThisYear =
              txDate.getFullYear() === now.getFullYear() ||
              txDate.getFullYear() === 2023; // Compatible with dataset base year
            if (!isThisYear) return false;
          } else if (selectedDatePreset === 'Custom') {
            if (customStartDate) {
              const start = new Date(customStartDate);
              start.setHours(0, 0, 0, 0);
              if (txDate < start) return false;
            }
            if (customEndDate) {
              const end = new Date(customEndDate);
              end.setHours(23, 59, 59, 999);
              if (txDate > end) return false;
            }
          }
        }

        // Status filter
        if (selectedStatusFilter !== 'All') {
          const currentStatus = tx.status || tx.tag || 'Paid';
          if (currentStatus.toLowerCase() !== selectedStatusFilter.toLowerCase()) return false;
        }

        // Distributor filter
        if (selectedDistributorFilter !== 'All') {
          const dist = tx.connection || tx.supplier || '';
          if (dist.toLowerCase() !== selectedDistributorFilter.toLowerCase()) return false;
        }

        // Barcode / Scanner filter
        if (scannedBarcode.trim()) {
          const code = scannedBarcode.trim().toLowerCase();
          const matchInvoice = (tx.invoiceNo || '').toLowerCase().includes(code);
          const matchId = (tx.id || '').toLowerCase().includes(code);
          const matchSupplier = (tx.supplier || '').toLowerCase().includes(code);
          const matchDesc = (tx.description || '').toLowerCase().includes(code);
          const matchNotes = (tx.notes || '').toLowerCase().includes(code);
          const matchConn = (tx.connection || '').toLowerCase().includes(code);
          if (!matchInvoice && !matchId && !matchSupplier && !matchDesc && !matchNotes && !matchConn) return false;
        }

        // Amount filter
        if (selectedAmountRange !== 'All') {
          if (selectedAmountRange === 'under_500' && tx.amount >= 500) return false;
          if (selectedAmountRange === '500_1000' && (tx.amount < 500 || tx.amount > 1000)) return false;
          if (selectedAmountRange === 'over_1000' && tx.amount <= 1000) return false;
        }

        return true;
      })
      .sort((a, b) => {
        let valA: any;
        let valB: any;

        if (sortField === 'id') {
          valA = a.id || '';
          valB = b.id || '';
        } else if (sortField === 'distributor') {
          valA = a.connection || a.supplier || '';
          valB = b.connection || b.supplier || '';
        } else if (sortField === 'status') {
          valA = a.status || a.tag || '';
          valB = b.status || b.tag || '';
        } else if (sortField === 'date') {
          valA = new Date(a.date).getTime();
          valB = new Date(b.date).getTime();
        } else if (sortField === 'deadline') {
          valA = a.deadline || '';
          valB = b.deadline || '';
        } else if (sortField === 'invoice') {
          valA = a.invoiceNo || a.id || '';
          valB = b.invoiceNo || b.id || '';
        } else if (sortField === 'remaining') {
          valA = getRemainingAmount(a);
          valB = getRemainingAmount(b);
        } else if (sortField === 'amount') {
          valA = a.amount;
          valB = b.amount;
        }

        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
  }, [
    transactions,
    selectedDatePreset,
    customStartDate,
    customEndDate,
    selectedStatusFilter,
    selectedDistributorFilter,
    scannedBarcode,
    selectedAmountRange,
    sortField,
    sortOrder,
  ]);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    selectedDatePreset,
    customStartDate,
    customEndDate,
    selectedStatusFilter,
    selectedDistributorFilter,
    scannedBarcode,
    selectedAmountRange,
    transactions.length,
    sortField,
    sortOrder,
  ]);

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage) || 1;

  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredTransactions.slice(start, start + itemsPerPage);
  }, [filteredTransactions, currentPage, itemsPerPage]);

  // Format readable date exactly like screenshot (e.g. June 10, 2023)
  const formatDisplayDate = (dateStr: string) => {
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

  // Render Deadline Badge (Relative English days like "In 3 days", "In 5 days", "Tomorrow", "In 1 week")
  const renderDeadlineBadge = (deadlineText?: string, statusText?: string) => {
    if (statusText && statusText.toLowerCase() === 'paid') {
      return <span className="text-neutral-400 font-normal pl-2">-</span>;
    }
    const text = deadlineText || 'In 3 days';

    let badgeClass = 'bg-[#F3F4F6] text-neutral-700 border-neutral-200/70';
    let iconClass = 'text-neutral-400';

    const t = text.toLowerCase();
    if (t.includes('tomorrow') || t.includes('1 day') || t.includes('today')) {
      badgeClass = 'bg-amber-50 text-amber-800 border-amber-200/70';
      iconClass = 'text-amber-500';
    } else if (t.includes('overdue')) {
      badgeClass = 'bg-rose-50 text-rose-800 border-rose-200/70';
      iconClass = 'text-rose-500';
    } else if (t.includes('2 days') || t.includes('3 days')) {
      badgeClass = 'bg-sky-50 text-sky-800 border-sky-200/70';
      iconClass = 'text-sky-500';
    }

    return (
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[12.5px] font-normal border transition-colors ${badgeClass}`}>
        <Clock size={12} className={`shrink-0 ${iconClass}`} />
        <span className="whitespace-nowrap">{text}</span>
      </div>
    );
  };

  // Render Distributor Avatar / Icon
  const renderDistributorCell = (tx: PurchaseTransaction) => {
    const connName = tx.connection || tx.supplier || 'N/A';

    if (connName === 'Booking') {
      return (
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-full bg-[#003580] text-white flex items-center justify-center font-bold text-[11px] shrink-0 shadow-xs">
            B.
          </div>
          <span className="font-medium text-neutral-900 text-[12.5px]">Booking</span>
        </div>
      );
    }

    if (connName === 'Airbnb') {
      return (
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-full bg-[#FF5A5F] text-white flex items-center justify-center shrink-0 shadow-xs p-1">
            <svg viewBox="0 0 32 32" className="w-3.5 h-3.5 fill-current">
              <path d="M16 1c2.008 0 3.463.963 4.751 3.269l.533 1.025c1.954 3.83 4.293 8.793 5.433 12.35 1.554 4.846.541 8.924-2.593 11.025-2.222 1.488-5.06 1.706-7.828.618l-.296-.123c-2.846-1.229-5.187-3.955-6.31-7.469-.974-3.053-.941-6.425.093-9.525.993-2.977 2.665-6.326 4.786-10.428l.492-.934C13.292 2.308 14.492 1 16 1zm0 2c-1.341 0-2.22.997-3.23 2.871l-.479.911c-2.148 4.153-3.805 7.472-4.78 10.398-.946 2.839-.976 5.86-.115 8.561.966 3.023 2.946 5.344 5.34 6.381 2.348.923 4.72.716 6.536-.503 2.502-1.677 3.324-5.09 1.96-9.349-1.077-3.364-3.385-8.257-5.31-12.029l-.515-.992C18.423 4.385 17.29 3 16 3zm0 13a4 4 0 1 1 0 8 4 4 0 0 1 0-8zm0 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" />
            </svg>
          </div>
          <span className="font-medium text-neutral-900 text-[12.5px]">Airbnb</span>
        </div>
      );
    }

    if (connName === 'Guesty') {
      return (
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-full bg-[#38BDF8] text-white flex items-center justify-center shrink-0 shadow-xs p-1">
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current">
              <path d="M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3z" />
            </svg>
          </div>
          <span className="font-medium text-neutral-900 text-[12.5px]">Guesty</span>
        </div>
      );
    }

    if (connName === 'N/A') {
      return (
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-full bg-neutral-200 text-neutral-600 flex items-center justify-center shrink-0 shadow-2xs">
            <svg viewBox="0 0 24 24" className="w-3 h-3 stroke-current stroke-2 fill-none">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </div>
          <span className="font-medium text-neutral-500 text-[12.5px]">N/A</span>
        </div>
      );
    }

    // Default stylized brand icon with letter
    const initial = connName.charAt(0).toUpperCase();
    return (
      <div className="flex items-center gap-2.5">
        <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-[11px] shrink-0 shadow-xs">
          {initial}
        </div>
        <span className="font-medium text-neutral-900 text-[12.5px] truncate max-w-[150px]">
          {connName}
        </span>
      </div>
    );
  };

  // Render Status Badge (styled exactly like previous tags: neutral pill with small square indicator)
  const renderStatusBadge = (statusValue: string, txId: string) => {
    const st = statusValue.toLowerCase();

    let squareColor = 'bg-[#38BDF8]'; // Default cyan square
    let label = 'Paid';

    if (st.includes('partially') || st === 'partial' || st === 'bayar sebagian') {
      squareColor = 'bg-[#F59E0B]';
      label = 'Partially Paid';
    } else if (st === 'unpaid' || st === 'pending') {
      squareColor = 'bg-[#EF4444]';
      label = 'Unpaid';
    } else {
      squareColor = 'bg-[#38BDF8]';
      label = 'Paid';
    }

    return (
      <button
        onClick={() => handleToggleStatus(txId)}
        title="Click to cycle status: Paid → Partially Paid → Unpaid"
        className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#F3F4F6] hover:bg-[#E5E7EB] text-neutral-800 text-[12.5px] font-normal border border-neutral-200/70 transition-colors cursor-pointer"
      >
        <span className={`w-2 h-2 rounded-[2px] ${squareColor} shrink-0`} />
        <span>{label}</span>
      </button>
    );
  };

  if (viewMode === 'create-details') {
    return (
      <CreatePurchasePage
        initialData={createInitialData}
        onBack={() => {
          setViewMode('list');
          setIsAddModalOpen(true);
        }}
        onCancel={() => setViewMode('list')}
        onSave={(newTx) => {
          handleAddTransaction(newTx);
        }}
      />
    );
  }

  if (viewMode === 'invoice' && selectedInvoiceTransaction) {
    return (
      <PurchaseInvoiceView
        transaction={selectedInvoiceTransaction}
        onBack={() => {
          setViewMode('list');
          setSelectedInvoiceTransaction(null);
        }}
        onUpdateTransaction={handleUpdateTransaction}
        onDeleteTransaction={handleDelete}
        onNavigateTab={onNavigateTab}
      />
    );
  }

  return (
    <div className="w-full max-w-full pt-4 md:pt-6 pb-20 px-4 md:px-6 font-sans text-neutral-900">
      {/* 1. Page Title */}
      <div className="mb-2.5">
        <h1 className="text-[16.5px] font-semibold text-neutral-900 tracking-tight">
          Purchase
        </h1>
      </div>

      {/* 2. Toolbar Controls Bar */}
      <div ref={filterDropdownRef} className="flex flex-wrap items-center justify-between gap-3 mb-4 text-[12px]">
        {/* Left Controls - Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Date Filter Pill */}
          <div className="relative inline-block">
            <button
              id="filter-pill-date"
              onClick={() =>
                setActiveFilterDropdown(activeFilterDropdown === 'date' ? null : 'date')
              }
              className={`bg-white hover:bg-neutral-50 border rounded-md px-2.5 py-1 flex items-center gap-1.5 transition-colors cursor-pointer text-neutral-800 shadow-2xs font-normal text-[12px] ${
                selectedDatePreset !== 'All Time'
                  ? 'border-neutral-900 text-neutral-900 font-medium'
                  : 'border-neutral-200/90'
              }`}
            >
              <Calendar size={13} className="text-neutral-500 shrink-0" />
              <span>{selectedDatePreset !== 'All Time' ? selectedDatePreset : 'Date'}</span>
              <ChevronDown size={11} className="text-neutral-400 ml-0.5" />
            </button>

            {activeFilterDropdown === 'date' && (
              <div className="absolute top-[calc(100%+4px)] left-0 z-40 bg-white rounded-lg shadow-lg border border-neutral-200/80 p-2 w-56 animate-in fade-in zoom-in-95 duration-100">
                <div className="text-[11px] text-neutral-400 font-medium px-2 py-1">
                  Select date range
                </div>
                {[
                  'Today',
                  'Yesterday',
                  'This Month',
                  'Last Month',
                  'This Year',
                  'All Time',
                  'Custom',
                ].map((preset) => (
                  <button
                    key={preset}
                    onClick={() => {
                      setSelectedDatePreset(preset);
                      if (preset !== 'Custom') {
                        setActiveFilterDropdown(null);
                      }
                    }}
                    className={`w-full px-2 py-1 rounded text-left text-[12px] flex items-center justify-between cursor-pointer transition-colors ${
                      selectedDatePreset === preset
                        ? 'bg-neutral-100 font-medium text-neutral-900'
                        : 'text-neutral-700 hover:bg-neutral-50'
                    }`}
                  >
                    <span>{preset}</span>
                    {selectedDatePreset === preset && <Check size={12} className="text-neutral-900" />}
                  </button>
                ))}

                {/* Custom Date Range Picker */}
                {selectedDatePreset === 'Custom' && (
                  <div className="mt-2 pt-2 border-t border-neutral-100 px-1 space-y-2">
                    <div className="text-[11px] font-medium text-neutral-500">Custom Date Range:</div>
                    <div className="space-y-1.5">
                      <div>
                        <label className="text-[11px] text-neutral-400 block mb-0.5">From</label>
                        <input
                          type="date"
                          value={customStartDate}
                          onChange={(e) => setCustomStartDate(e.target.value)}
                          className="w-full px-2 py-1 text-[12px] bg-neutral-50 border border-neutral-200 rounded-md outline-none text-neutral-800 focus:border-neutral-400"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-neutral-400 block mb-0.5">To</label>
                        <input
                          type="date"
                          value={customEndDate}
                          onChange={(e) => setCustomEndDate(e.target.value)}
                          className="w-full px-2 py-1 text-[12px] bg-neutral-50 border border-neutral-200 rounded-md outline-none text-neutral-800 focus:border-neutral-400"
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveFilterDropdown(null)}
                      className="w-full mt-2 py-1 px-2 rounded-md bg-neutral-900 text-white text-[12px] font-medium hover:bg-neutral-800 transition-colors cursor-pointer text-center"
                    >
                      Apply Range
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Status Filter Pill */}
          <div className="relative inline-block">
            <button
              id="filter-pill-status"
              onClick={() =>
                setActiveFilterDropdown(activeFilterDropdown === 'status' ? null : 'status')
              }
              className={`bg-white hover:bg-neutral-50 border rounded-md px-2.5 py-1 flex items-center gap-1.5 transition-colors cursor-pointer text-neutral-800 shadow-2xs font-normal text-[12px] ${
                selectedStatusFilter !== 'All'
                  ? 'border-neutral-900 text-neutral-900 font-medium'
                  : 'border-neutral-200/90'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-neutral-400" />
              <span>{selectedStatusFilter !== 'All' ? selectedStatusFilter : 'Status'}</span>
              <ChevronDown size={11} className="text-neutral-400 ml-0.5" />
            </button>

            {activeFilterDropdown === 'status' && (
              <div className="absolute top-[calc(100%+4px)] left-0 z-40 bg-white rounded-lg shadow-lg border border-neutral-200/80 p-1.5 w-48 animate-in fade-in zoom-in-95 duration-100">
                <div className="text-[11px] text-neutral-400 font-medium px-2 py-1">
                  Select status
                </div>
                {['All', 'Paid', 'Unpaid', 'Partially Paid'].map((st) => (
                  <button
                    key={st}
                    onClick={() => {
                      setSelectedStatusFilter(st);
                      setActiveFilterDropdown(null);
                    }}
                    className={`w-full px-2 py-1 rounded text-left text-[12px] flex items-center justify-between cursor-pointer transition-colors ${
                      selectedStatusFilter === st
                        ? 'bg-neutral-100 font-medium text-neutral-900'
                        : 'text-neutral-700 hover:bg-neutral-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {st === 'Paid' && <span className="w-2 h-2 rounded-[2px] bg-[#38BDF8]" />}
                      {st === 'Unpaid' && <span className="w-2 h-2 rounded-[2px] bg-[#EF4444]" />}
                      {st === 'Partially Paid' && <span className="w-2 h-2 rounded-[2px] bg-[#F59E0B]" />}
                      <span>{st}</span>
                    </div>
                    {selectedStatusFilter === st && <Check size={12} className="text-neutral-900" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Distributor Filter Pill */}
          <div className="relative inline-block">
            <button
              id="filter-pill-distributor"
              onClick={() =>
                setActiveFilterDropdown(activeFilterDropdown === 'distributor' ? null : 'distributor')
              }
              className={`bg-white hover:bg-neutral-50 border rounded-md px-2.5 py-1 flex items-center gap-1.5 transition-colors cursor-pointer text-neutral-800 shadow-2xs font-normal text-[12px] ${
                selectedDistributorFilter !== 'All'
                  ? 'border-neutral-900 text-neutral-900 font-medium'
                  : 'border-neutral-200/90'
              }`}
            >
              <Building2 size={13} className="text-neutral-500 shrink-0" />
              <span>{selectedDistributorFilter !== 'All' ? selectedDistributorFilter : 'Distributor'}</span>
              <ChevronDown size={11} className="text-neutral-400 ml-0.5" />
            </button>

            {activeFilterDropdown === 'distributor' && (
              <div className="absolute top-[calc(100%+4px)] left-0 z-40 bg-white rounded-lg shadow-lg border border-neutral-200/80 p-1.5 w-48 animate-in fade-in zoom-in-95 duration-100">
                <div className="text-[11px] text-neutral-400 font-medium px-2 py-1">
                  Select distributor
                </div>
                {['All', 'Booking', 'Airbnb', 'Guesty', 'N/A'].map((dist) => (
                  <button
                    key={dist}
                    onClick={() => {
                      setSelectedDistributorFilter(dist);
                      setActiveFilterDropdown(null);
                    }}
                    className={`w-full px-2 py-1 rounded text-left text-[12px] flex items-center justify-between cursor-pointer transition-colors ${
                      selectedDistributorFilter === dist
                        ? 'bg-neutral-100 font-medium text-neutral-900'
                        : 'text-neutral-700 hover:bg-neutral-50'
                    }`}
                  >
                    <span>{dist}</span>
                    {selectedDistributorFilter === dist && <Check size={12} className="text-neutral-900" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Amount Filter Pill */}
          <div className="relative inline-block">
            <button
              id="filter-pill-amount"
              onClick={() =>
                setActiveFilterDropdown(activeFilterDropdown === 'amount' ? null : 'amount')
              }
              className={`bg-white hover:bg-neutral-50 border rounded-md px-2.5 py-1 flex items-center gap-1.5 transition-colors cursor-pointer text-neutral-800 shadow-2xs font-normal text-[12px] ${
                selectedAmountRange !== 'All'
                  ? 'border-neutral-900 text-neutral-900 font-medium'
                  : 'border-neutral-200/90'
              }`}
            >
              <DollarSign size={13} className="text-neutral-500 shrink-0" />
              <span>{selectedAmountRange !== 'All' ? 'Amount Set' : 'Amount'}</span>
              <ChevronDown size={11} className="text-neutral-400 ml-0.5" />
            </button>

            {activeFilterDropdown === 'amount' && (
              <div className="absolute top-[calc(100%+4px)] left-0 z-40 bg-white rounded-lg shadow-lg border border-neutral-200/80 p-1.5 w-48 animate-in fade-in zoom-in-95 duration-100">
                <div className="text-[11px] text-neutral-400 font-medium px-2 py-1">
                  Filter amount
                </div>
                {[
                  { label: 'All Amounts', val: 'All' },
                  { label: '< $500', val: 'under_500' },
                  { label: '$500 - $1,000', val: '500_1000' },
                  { label: '> $1,000', val: 'over_1000' },
                ].map((rng) => (
                  <button
                    key={rng.val}
                    onClick={() => {
                      setSelectedAmountRange(rng.val);
                      setActiveFilterDropdown(null);
                    }}
                    className={`w-full px-2 py-1 rounded text-left text-[12px] flex items-center justify-between cursor-pointer transition-colors ${
                      selectedAmountRange === rng.val
                        ? 'bg-neutral-100 font-medium text-neutral-900'
                        : 'text-neutral-700 hover:bg-neutral-50'
                    }`}
                  >
                    <span>{rng.label}</span>
                    {selectedAmountRange === rng.val && <Check size={12} className="text-neutral-900" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Search / Barcode Input Bar directly next to Amount */}
          <div className="flex items-center gap-1.5 bg-white border border-neutral-200/90 rounded-md px-2.5 py-1 text-neutral-700 w-56 sm:w-64 focus-within:border-neutral-400 transition-colors shadow-2xs">
            <Scan size={13} className="text-neutral-400 shrink-0" />
            <input
              type="text"
              placeholder="Enter or scan barcode here"
              value={scannedBarcode}
              onChange={(e) => setScannedBarcode(e.target.value)}
              className="bg-transparent outline-none w-full text-neutral-800 placeholder:text-neutral-400 text-[12px]"
            />
            {scannedBarcode && (
              <button onClick={() => setScannedBarcode('')} className="text-neutral-400 hover:text-neutral-600 cursor-pointer">
                <X size={11} />
              </button>
            )}
          </div>

          {/* Clear Filters button */}
          {(selectedDatePreset !== 'All Time' ||
            selectedStatusFilter !== 'All' ||
            selectedDistributorFilter !== 'All' ||
            scannedBarcode ||
            selectedAmountRange !== 'All') && (
            <button
              onClick={() => {
                setSelectedDatePreset('All Time');
                setCustomStartDate('');
                setCustomEndDate('');
                setSelectedStatusFilter('All');
                setSelectedDistributorFilter('All');
                setScannedBarcode('');
                setSelectedAmountRange('All');
              }}
              className="text-[12px] text-neutral-500 hover:text-neutral-900 underline underline-offset-2 ml-1 cursor-pointer"
            >
              Clear all
            </button>
          )}
        </div>

        {/* Right Controls - Add Purchase Button */}
        <div className="flex items-center gap-2">

          {/* Add Purchase Button */}
          <button
            id="btn-add-purchase-top"
            onClick={() => setIsAddModalOpen(true)}
            className="hover:text-neutral-950 text-neutral-700 font-normal px-2 py-1 flex items-center gap-1 transition-colors cursor-pointer text-[12px]"
          >
            <Plus size={13} className="text-neutral-600" />
            <span>Add Purchase</span>
          </button>
        </div>
      </div>

      {/* 3. Selection Batch Action Bar */}
      {selectedIds.length > 0 && (
        <div className="mb-4 p-2.5 px-4 rounded-lg bg-neutral-900 text-white flex items-center justify-between text-[12.5px] shadow-sm animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <span className="font-medium">{selectedIds.length} items selected</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleBulkSetStatus('Paid')}
              className="px-2.5 py-1 rounded bg-emerald-700 hover:bg-emerald-600 text-white transition-colors cursor-pointer flex items-center gap-1 text-[12px]"
            >
              <Check size={12} />
              <span>Mark as Paid</span>
            </button>
            <button
              onClick={() => handleBulkSetStatus('Partially Paid')}
              className="px-2.5 py-1 rounded bg-amber-700 hover:bg-amber-600 text-white transition-colors cursor-pointer flex items-center gap-1 text-[12px]"
            >
              <span>Mark as Partial</span>
            </button>
            <button
              onClick={() => handleBulkSetStatus('Unpaid')}
              className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-colors cursor-pointer flex items-center gap-1 text-[12px]"
            >
              <span>Mark as Unpaid</span>
            </button>
            <button
              onClick={handleBulkDelete}
              className="px-2.5 py-1 rounded bg-rose-600/80 hover:bg-rose-600 text-white transition-colors cursor-pointer flex items-center gap-1 text-[12px]"
            >
              <Trash2 size={12} />
              <span>Delete</span>
            </button>
            <button
              onClick={() => setSelectedIds([])}
              className="text-neutral-400 hover:text-white px-1.5 text-[12px] cursor-pointer"
            >
              Deselect
            </button>
          </div>
        </div>
      )}

      {/* 4. Table Card exact 1:1 like Profit & Loss */}
      <div className="bg-white rounded-lg border border-neutral-200 shadow-2xs overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[850px]">
          {/* Table Header */}
          <thead>
            <tr className="border-b border-neutral-200 text-[11.5px] font-semibold text-neutral-500 tracking-wider">
              {/* ID Header */}
              <th
                onClick={() => handleSort('id')}
                className="py-2.5 px-4 cursor-pointer hover:text-neutral-900 transition-colors select-none whitespace-nowrap"
              >
                <div className="flex items-center gap-1.5">
                  <span>ID</span>
                  <ChevronsUpDown size={12} className="text-neutral-400" />
                </div>
              </th>

              {/* Distributor Header */}
              <th
                onClick={() => handleSort('distributor')}
                className="py-2.5 px-4 cursor-pointer hover:text-neutral-900 transition-colors select-none whitespace-nowrap"
              >
                <div className="flex items-center gap-1.5">
                  <span>Distributor</span>
                  <ChevronsUpDown size={12} className="text-neutral-400" />
                </div>
              </th>

              {/* Invoice Header */}
              <th
                onClick={() => handleSort('invoice')}
                className="py-2.5 px-4 cursor-pointer hover:text-neutral-900 transition-colors select-none whitespace-nowrap"
              >
                <div className="flex items-center gap-1.5">
                  <span>Invoice</span>
                  <ChevronsUpDown size={12} className="text-neutral-400" />
                </div>
              </th>

              {/* Date Header */}
              <th
                onClick={() => handleSort('date')}
                className="py-2.5 px-4 cursor-pointer hover:text-neutral-900 transition-colors select-none whitespace-nowrap"
              >
                <div className="flex items-center gap-1.5">
                  <span>Date</span>
                  <ChevronsUpDown size={12} className="text-neutral-400" />
                </div>
              </th>

              {/* Deadline Header */}
              <th
                onClick={() => handleSort('deadline')}
                className="py-2.5 px-4 cursor-pointer hover:text-neutral-900 transition-colors select-none whitespace-nowrap"
              >
                <div className="flex items-center gap-1.5">
                  <span>Deadline</span>
                  <ChevronsUpDown size={12} className="text-neutral-400" />
                </div>
              </th>

              {/* Status Header */}
              <th
                onClick={() => handleSort('status')}
                className="py-2.5 px-4 cursor-pointer hover:text-neutral-900 transition-colors select-none whitespace-nowrap"
              >
                <div className="flex items-center gap-1.5">
                  <span>Status</span>
                  <ChevronsUpDown size={12} className="text-neutral-400" />
                </div>
              </th>

              {/* Remaining Header */}
              <th
                onClick={() => handleSort('remaining')}
                className="py-2.5 px-4 text-right cursor-pointer hover:text-neutral-900 transition-colors select-none whitespace-nowrap"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>Remaining</span>
                  <ChevronsUpDown size={12} className="text-neutral-400" />
                </div>
              </th>

              {/* Amount Header */}
              <th
                onClick={() => handleSort('amount')}
                className="py-2.5 px-4 text-right cursor-pointer hover:text-neutral-900 transition-colors select-none whitespace-nowrap"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>Amount</span>
                  <ChevronsUpDown size={12} className="text-neutral-400" />
                </div>
              </th>

              {/* Action Header */}
              <th className="py-2.5 pr-4 pl-2 text-right w-14 select-none whitespace-nowrap">
                Action
              </th>
            </tr>
          </thead>

          {/* Table Body Rows */}
          <tbody className="divide-y divide-neutral-100 font-sans text-[12.5px] text-neutral-800">
            {filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-neutral-400 text-[13px]">
                  No purchases found matching the current filters.
                </td>
              </tr>
            ) : (
              paginatedTransactions.map((tx) => {
                const statusValue = tx.status || tx.tag || 'Paid';
                const remainingAmount = getRemainingAmount(tx);
                const formattedId = tx.id.startsWith('tx-')
                  ? `#${tx.id.slice(3, 9).toUpperCase()}`
                  : `#${tx.id.toUpperCase()}`;

                return (
                  <tr
                    key={tx.id}
                    onClick={() => {
                      setSelectedInvoiceTransaction(tx);
                      setViewMode('invoice');
                    }}
                    className="hover:bg-neutral-100/60 transition-colors border-b border-neutral-100/70 group cursor-pointer"
                  >
                    {/* ID */}
                    <td className="py-2 pl-4 pr-3 whitespace-nowrap text-neutral-600 font-mono text-[12.5px] max-w-[120px]">
                      <span className="truncate block" title={formattedId}>{formattedId}</span>
                    </td>

                    {/* Distributor (Logo & Name) */}
                    <td className="py-2 px-4 whitespace-nowrap max-w-[180px] md:max-w-[220px]">
                      {renderDistributorCell(tx)}
                    </td>

                    {/* Invoice */}
                    <td className="py-2 px-4 whitespace-nowrap text-[12.5px] max-w-[160px]">
                      <div className="flex items-center gap-1.5 text-neutral-700 max-w-[150px]">
                        <FileText size={13} className="text-neutral-400 shrink-0" />
                        <span className="font-mono text-[12.5px] text-neutral-800 hover:text-neutral-950 underline decoration-neutral-300 underline-offset-2 truncate" title={tx.invoiceNo || `INV-${tx.id.toUpperCase()}`}>
                          {tx.invoiceNo || `INV-${tx.id.toUpperCase()}`}
                        </span>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="py-2 px-4 whitespace-nowrap text-neutral-800 text-[12.5px]">
                      {formatDisplayDate(tx.date)}
                    </td>

                    {/* Deadline */}
                    <td className="py-2 px-4 whitespace-nowrap text-[12.5px] max-w-[140px]">
                      <div className="truncate">{renderDeadlineBadge(tx.deadline, statusValue)}</div>
                    </td>

                    {/* Status Pill */}
                    <td className="py-2 px-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      {renderStatusBadge(statusValue, tx.id)}
                    </td>

                    {/* Remaining */}
                    <td className="py-2 px-4 text-right whitespace-nowrap text-neutral-800 font-mono text-[12.5px]">
                      ${remainingAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>

                    {/* Amount */}
                    <td className="py-2 px-4 text-right whitespace-nowrap text-neutral-950 font-mono text-[12.5px]">
                      ${tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>

                    {/* Action - Three dots button */}
                    <td className="py-2 pl-2 pr-4 text-right whitespace-nowrap">
                      <div className="relative inline-flex items-center justify-end">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveActionId(activeActionId === tx.id ? null : tx.id);
                          }}
                          className="p-1 rounded text-neutral-400 hover:text-neutral-800 hover:bg-neutral-200/60 transition-colors cursor-pointer"
                          title="Actions"
                        >
                          <MoreHorizontal size={15} />
                        </button>

                        {activeActionId === tx.id && (
                          <div
                            ref={actionMenuRef}
                            className="absolute right-0 top-7 w-40 bg-white rounded-lg shadow-lg border border-neutral-200/90 py-1 z-40 text-left text-[12px] animate-in fade-in zoom-in-95 duration-100"
                          >
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedInvoiceTransaction(tx);
                                setViewMode('invoice');
                                setActiveActionId(null);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-1.5 text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer"
                            >
                              <FileText size={13} className="text-neutral-400" />
                              <span>View Invoice</span>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleStatus(tx.id);
                                setActiveActionId(null);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-1.5 text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer"
                            >
                              <Check size={13} className="text-neutral-400" />
                              <span>Change Status</span>
                            </button>
                            <div className="h-px bg-neutral-100 my-1" />
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(tx.id);
                                setActiveActionId(null);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-1.5 text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            >
                              <Trash2 size={13} className="text-rose-500" />
                              <span>Delete Record</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filteredTransactions.length}
        itemsPerPage={itemsPerPage}
        onPageChange={(page) => setCurrentPage(page)}
        onItemsPerPageChange={(num) => {
          setItemsPerPage(num);
          setCurrentPage(1);
        }}
      />

      {/* Add Transaction Modal */}
      <AddTransactionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        initialValues={createInitialData}
        onProceedToDetails={(data) => {
          setCreateInitialData(data);
          setIsAddModalOpen(false);
          setViewMode('create-details');
        }}
      />
    </div>
  );
}
