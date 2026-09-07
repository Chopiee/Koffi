import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  ChevronDown,
  ChevronsUpDown,
  Plus,
  Calendar,
  Trash2,
  Check,
  X,
  FileText,
  MoreHorizontal,
  Scan,
  BookOpen,
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-react';
import { JournalTransaction } from '../types';
import { initialJournalTransactions } from '../data/initialJournalTransactions';
import { Pagination } from './Pagination';

type SortField = 'id' | 'account' | 'reference' | 'debit' | 'credit' | 'date';
type SortOrder = 'asc' | 'desc';

interface JournalLineItem {
  id: string;
  journalNo: string;
  account: string;
  referenceNo: string;
  description: string;
  date: string;
  debit: number;
  credit: number;
  category: string;
  parentId: string;
}

// Account codes mapping helper
const ACCOUNT_CODES: Record<string, string> = {
  'Kas & Bank Operasional': '1101',
  'Piutang Usaha (Pelanggan)': '1102',
  'Persediaan Bahan Baku': '1103',
  'Peralatan & Mesin Dapur': '1201',
  'Hutang Usaha (Supplier)': '2101',
  'Hutang Kartu Kredit Perusahaan': '2102',
  'Pendapatan Penjualan': '4101',
  'Beban Listrik & Air': '5101',
  'Beban Sewa Gedung': '5102',
  'Beban Pemasaran & Iklan': '5103',
  'Beban Pemeliharaan Kantor': '5104',
};

function getAccountCode(name: string): string {
  if (ACCOUNT_CODES[name]) return ACCOUNT_CODES[name];
  const lower = (name || '').toLowerCase();
  if (lower.includes('kas') || lower.includes('bank')) return '1101';
  if (lower.includes('piutang')) return '1102';
  if (lower.includes('persediaan') || lower.includes('stok')) return '1103';
  if (lower.includes('peralatan') || lower.includes('mesin') || lower.includes('aset')) return '1201';
  if (lower.includes('hutang supplier') || lower.includes('hutang usaha')) return '2101';
  if (lower.includes('hutang')) return '2102';
  if (lower.includes('pendapatan') || lower.includes('penjualan')) return '4101';
  if (lower.includes('beban')) return '5199';
  return '1000';
}

export function AccountingView() {
  const [transactions, setTransactions] = useState<JournalTransaction[]>(initialJournalTransactions);

  // Sorting
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Filters State
  const [selectedDatePreset, setSelectedDatePreset] = useState<string>('All Time');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('All');
  const [scannedBarcode, setScannedBarcode] = useState<string>('');

  // Active Popover Dropdown Filter state
  const [activeFilterDropdown, setActiveFilterDropdown] = useState<string | null>(null);
  const filterDropdownRef = useRef<HTMLDivElement>(null);

  // Active 3-dots action row state
  const [activeActionId, setActiveActionId] = useState<string | null>(null);
  const actionMenuRef = useRef<HTMLDivElement>(null);

  // Modal State for Adding New Journal Entry
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newJournalData, setNewJournalData] = useState<{
    journalNo: string;
    referenceNo: string;
    debitAccount: string;
    creditAccount: string;
    description: string;
    date: string;
    amount: string;
    category: string;
  }>({
    journalNo: `JRN-2026-00${Math.floor(10 + Math.random() * 89)}`,
    referenceNo: 'Penerimaan Penjualan Harian Kafe & Resto',
    debitAccount: 'Kas & Bank Operasional',
    creditAccount: 'Pendapatan Penjualan',
    description: 'Penerimaan Penjualan Harian Kafe & Resto',
    date: new Date().toISOString().split('T')[0],
    amount: '',
    category: 'Cash & Bank',
  });

  // Close dropdowns on outside click
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
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Compute all individual journal line items (Debit & Credit rows)
  const allJournalLines = useMemo(() => {
    const lines: JournalLineItem[] = [];
    transactions.forEach((tx) => {
      // Debit Line
      lines.push({
        id: `${tx.id}-D`,
        journalNo: `${tx.journalNo}-D`,
        account: tx.debitAccount || tx.account || 'Kas & Bank Operasional',
        referenceNo: tx.referenceNo || tx.description || '',
        description: tx.description || '',
        date: tx.date,
        debit: tx.debit || 0,
        credit: 0,
        category: tx.category || 'General',
        parentId: tx.id,
      });

      // Credit Line
      lines.push({
        id: `${tx.id}-C`,
        journalNo: `${tx.journalNo}-C`,
        account: tx.creditAccount || 'Pendapatan Penjualan',
        referenceNo: tx.referenceNo || tx.description || '',
        description: tx.description || '',
        date: tx.date,
        debit: 0,
        credit: tx.credit || tx.debit || 0,
        category: tx.category || 'General',
        parentId: tx.id,
      });
    });
    return lines;
  }, [transactions]);

  // Filter & Sort Logic
  const filteredJournalLines = useMemo(() => {
    return allJournalLines
      .filter((line) => {
        // 1. Account Category Filter
        if (selectedCategoryFilter !== 'All') {
          if ((line.category || '').toLowerCase() !== selectedCategoryFilter.toLowerCase()) {
            return false;
          }
        }

        // 2. Date Preset Filter
        if (selectedDatePreset !== 'All Time') {
          const txDate = new Date(line.date);
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          if (selectedDatePreset === 'Today') {
            const sameDay =
              txDate.getFullYear() === today.getFullYear() &&
              txDate.getMonth() === today.getMonth() &&
              txDate.getDate() === today.getDate();
            if (!sameDay) return false;
          } else if (selectedDatePreset === 'Yesterday') {
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            const sameDay =
              txDate.getFullYear() === yesterday.getFullYear() &&
              txDate.getMonth() === yesterday.getMonth() &&
              txDate.getDate() === yesterday.getDate();
            if (!sameDay) return false;
          } else if (selectedDatePreset === 'This Month') {
            const sameMonth =
              txDate.getFullYear() === today.getFullYear() &&
              txDate.getMonth() === today.getMonth();
            if (!sameMonth) return false;
          } else if (selectedDatePreset === 'Last Month') {
            const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            const sameMonth =
              txDate.getFullYear() === lastMonth.getFullYear() &&
              txDate.getMonth() === lastMonth.getMonth();
            if (!sameMonth) return false;
          } else if (selectedDatePreset === 'This Year') {
            if (txDate.getFullYear() !== today.getFullYear()) return false;
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

        // 3. Search Bar Filter
        if (scannedBarcode.trim()) {
          const query = scannedBarcode.toLowerCase().trim();
          const accountCode = getAccountCode(line.account);
          const matches =
            (line.journalNo || '').toLowerCase().includes(query) ||
            (line.account || '').toLowerCase().includes(query) ||
            accountCode.toLowerCase().includes(query) ||
            (line.referenceNo || '').toLowerCase().includes(query) ||
            (line.description || '').toLowerCase().includes(query) ||
            line.id.toLowerCase().includes(query);
          if (!matches) return false;
        }

        return true;
      })
      .sort((a, b) => {
        let valA: any = '';
        let valB: any = '';

        if (sortField === 'id') {
          valA = a.journalNo || a.id;
          valB = b.journalNo || b.id;
        } else if (sortField === 'account') {
          valA = a.account || '';
          valB = b.account || '';
        } else if (sortField === 'reference') {
          valA = a.referenceNo;
          valB = b.referenceNo;
        } else if (sortField === 'debit') {
          valA = a.debit;
          valB = b.debit;
        } else if (sortField === 'credit') {
          valA = a.credit;
          valB = b.credit;
        } else if (sortField === 'date') {
          valA = new Date(a.date).getTime();
          valB = new Date(b.date).getTime();
        }

        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
  }, [
    allJournalLines,
    selectedCategoryFilter,
    selectedDatePreset,
    customStartDate,
    customEndDate,
    scannedBarcode,
    sortField,
    sortOrder,
  ]);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    selectedDatePreset,
    customStartDate,
    customEndDate,
    selectedCategoryFilter,
    scannedBarcode,
    transactions.length,
    sortField,
    sortOrder,
  ]);

  const totalPages = Math.ceil(filteredJournalLines.length / itemsPerPage) || 1;

  const paginatedJournalLines = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredJournalLines.slice(start, start + itemsPerPage);
  }, [filteredJournalLines, currentPage, itemsPerPage]);

  // Sorting Handler
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Delete Single Entry
  const handleDelete = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    if (activeActionId === id) setActiveActionId(null);
  };

  // Format readable date
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

  // Add New Journal Submission
  const handleAddJournalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(newJournalData.amount) || 0;

    const newEntry: JournalTransaction = {
      id: `jrn-${Date.now()}`,
      journalNo: newJournalData.journalNo || `JRN-2026-00${Math.floor(10 + Math.random() * 89)}`,
      referenceNo: newJournalData.referenceNo || newJournalData.description || 'Penerimaan Penjualan Harian Kafe & Resto',
      debitAccount: newJournalData.debitAccount,
      creditAccount: newJournalData.creditAccount,
      account: newJournalData.debitAccount,
      description: newJournalData.description || newJournalData.referenceNo || 'Penerimaan Penjualan Harian Kafe & Resto',
      date: newJournalData.date,
      debit: parsedAmount,
      credit: parsedAmount,
      status: 'Posted',
      category: newJournalData.category,
      createdAt: new Date().toISOString(),
    };

    setTransactions([newEntry, ...transactions]);
    setIsAddModalOpen(false);
    setNewJournalData({
      journalNo: `JRN-2026-00${Math.floor(10 + Math.random() * 89)}`,
      referenceNo: 'Penerimaan Penjualan Harian Kafe & Resto',
      debitAccount: 'Kas & Bank Operasional',
      creditAccount: 'Pendapatan Penjualan',
      description: 'Penerimaan Penjualan Harian Kafe & Resto',
      date: new Date().toISOString().split('T')[0],
      amount: '',
      category: 'Cash & Bank',
    });
  };

  return (
    <div className="w-full max-w-full pt-4 md:pt-6 pb-20 px-4 md:px-6 font-sans text-neutral-900">
      {/* 1. Page Title */}
      <div className="mb-2.5">
        <h1 className="text-[16.5px] font-semibold text-neutral-900 tracking-tight">
          Accounting
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

          {/* Account Category Filter Pill */}
          <div className="relative inline-block">
            <button
              id="filter-pill-account"
              onClick={() =>
                setActiveFilterDropdown(activeFilterDropdown === 'account' ? null : 'account')
              }
              className={`bg-white hover:bg-neutral-50 border rounded-md px-2.5 py-1 flex items-center gap-1.5 transition-colors cursor-pointer text-neutral-800 shadow-2xs font-normal text-[12px] ${
                selectedCategoryFilter !== 'All'
                  ? 'border-neutral-900 text-neutral-900 font-medium'
                  : 'border-neutral-200/90'
              }`}
            >
              <BookOpen size={13} className="text-neutral-500 shrink-0" />
              <span>{selectedCategoryFilter !== 'All' ? selectedCategoryFilter : 'Account'}</span>
              <ChevronDown size={11} className="text-neutral-400 ml-0.5" />
            </button>

            {activeFilterDropdown === 'account' && (
              <div className="absolute top-[calc(100%+4px)] left-0 z-40 bg-white rounded-lg shadow-lg border border-neutral-200/80 p-1.5 w-56 max-h-56 overflow-y-auto animate-in fade-in zoom-in-95 duration-100">
                <div className="text-[11px] text-neutral-400 font-medium px-2 py-1">
                  Select account type
                </div>
                {[
                  'All',
                  'Cash & Bank',
                  'Revenue',
                  'Expenses',
                  'Inventory',
                  'Accounts Payable',
                  'Accounts Receivable',
                  'Asset',
                  'Liabilities',
                ].map((acc) => (
                  <button
                    key={acc}
                    onClick={() => {
                      setSelectedCategoryFilter(acc);
                      setActiveFilterDropdown(null);
                    }}
                    className={`w-full px-2 py-1 rounded text-left text-[12px] flex items-center justify-between cursor-pointer transition-colors ${
                      selectedCategoryFilter === acc
                        ? 'bg-neutral-100 font-medium text-neutral-900'
                        : 'text-neutral-700 hover:bg-neutral-50'
                    }`}
                  >
                    <span className="truncate">{acc}</span>
                    {selectedCategoryFilter === acc && <Check size={12} className="text-neutral-900 shrink-0" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Search / Barcode Input Bar directly next to Account */}
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

          {/* Clear Filters button if any active */}
          {(selectedDatePreset !== 'All Time' ||
            selectedCategoryFilter !== 'All' ||
            scannedBarcode) && (
            <button
              onClick={() => {
                setSelectedDatePreset('All Time');
                setCustomStartDate('');
                setCustomEndDate('');
                setSelectedCategoryFilter('All');
                setScannedBarcode('');
              }}
              className="text-[12px] text-neutral-500 hover:text-neutral-900 underline underline-offset-2 ml-1 cursor-pointer"
            >
              Clear all
            </button>
          )}
        </div>

        {/* Right Controls - Add Journal Button */}
        <div className="flex items-center gap-2">
          <button
            id="btn-add-journal-top"
            onClick={() => setIsAddModalOpen(true)}
            className="hover:text-neutral-950 text-neutral-700 font-normal px-2 py-1 flex items-center gap-1 transition-colors cursor-pointer text-[12px]"
          >
            <Plus size={13} className="text-neutral-600" />
            <span>Add Journal</span>
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-lg border border-neutral-200 shadow-2xs overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          {/* Table Header */}
          <thead>
            <tr className="border-b border-neutral-200 text-[11.5px] font-semibold text-neutral-500 tracking-wider">
              {/* ID Header */}
              <th
                onClick={() => handleSort('id')}
                className="py-2.5 pl-4 pr-3 cursor-pointer hover:text-neutral-900 transition-colors select-none whitespace-nowrap"
              >
                <div className="flex items-center gap-1.5">
                  <span>ID</span>
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

              {/* Accounting Header (Nama Akun) */}
              <th
                onClick={() => handleSort('account')}
                className="py-2.5 px-4 cursor-pointer hover:text-neutral-900 transition-colors select-none whitespace-nowrap"
              >
                <div className="flex items-center gap-1.5">
                  <span>Accounting</span>
                  <ChevronsUpDown size={12} className="text-neutral-400" />
                </div>
              </th>

              {/* Reference Header */}
              <th
                onClick={() => handleSort('reference')}
                className="py-2.5 px-4 cursor-pointer hover:text-neutral-900 transition-colors select-none whitespace-nowrap"
              >
                <div className="flex items-center gap-1.5">
                  <span>Reference</span>
                  <ChevronsUpDown size={12} className="text-neutral-400" />
                </div>
              </th>

              {/* Debit Header */}
              <th
                onClick={() => handleSort('debit')}
                className="py-2.5 px-4 text-right cursor-pointer hover:text-neutral-900 transition-colors select-none whitespace-nowrap"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>Debit</span>
                  <ChevronsUpDown size={12} className="text-neutral-400" />
                </div>
              </th>

              {/* Kredit Header */}
              <th
                onClick={() => handleSort('credit')}
                className="py-2.5 px-4 text-right cursor-pointer hover:text-neutral-900 transition-colors select-none whitespace-nowrap"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>Kredit</span>
                  <ChevronsUpDown size={12} className="text-neutral-400" />
                </div>
              </th>

              {/* Action Header */}
              <th className="py-2.5 pl-2 pr-4 text-right w-14 text-[11.5px] font-semibold text-neutral-500 select-none whitespace-nowrap">
                Action
              </th>
            </tr>
          </thead>

          {/* Table Body Rows */}
          <tbody className="divide-y divide-neutral-100 font-sans text-[12.5px] text-neutral-800">
            {filteredJournalLines.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-neutral-400 text-[13px]">
                  No journal entries found matching the current filters.
                </td>
              </tr>
            ) : (
              paginatedJournalLines.map((line) => {
                return (
                  <tr
                    key={line.id}
                    className="hover:bg-neutral-100/60 transition-colors border-b border-neutral-100/70 group"
                  >
                    {/* ID */}
                    <td className="py-2.5 pl-4 pr-3 whitespace-nowrap text-neutral-600 font-mono text-[12.5px] max-w-[130px]">
                      <span className="truncate block font-medium" title={line.journalNo}>
                        #{line.journalNo}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="py-2.5 px-4 whitespace-nowrap text-neutral-800 text-[12.5px]">
                      {formatDisplayDate(line.date)}
                    </td>

                    {/* Accounting (Kode & Nama Akun - Teks Biasa) */}
                    <td className="py-2.5 px-4 whitespace-nowrap max-w-[280px]">
                      <span className="font-medium text-neutral-900 truncate block" title={`${getAccountCode(line.account)} - ${line.account}`}>
                        {getAccountCode(line.account)} - {line.account}
                      </span>
                    </td>

                    {/* Reference */}
                    <td className="py-2.5 px-4 whitespace-nowrap text-[12.5px] max-w-[300px]">
                      <div className="flex items-center gap-1.5 text-neutral-800">
                        <FileText size={13} className="text-neutral-400 shrink-0" />
                        <span
                          className="text-[12.5px] text-neutral-800 font-normal truncate"
                          title={line.referenceNo || line.description}
                        >
                          {line.referenceNo || line.description}
                        </span>
                      </div>
                    </td>

                    {/* Debit */}
                    <td className="py-2.5 px-4 text-right whitespace-nowrap font-mono text-[12.5px]">
                      {line.debit > 0 ? (
                        <span className="text-neutral-950 font-medium">
                          ${line.debit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      ) : (
                        <span className="text-neutral-400 font-mono">$0.00</span>
                      )}
                    </td>

                    {/* Kredit */}
                    <td className="py-2.5 px-4 text-right whitespace-nowrap font-mono text-[12.5px]">
                      {line.credit > 0 ? (
                        <span className="text-neutral-950 font-medium">
                          ${line.credit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      ) : (
                        <span className="text-neutral-400 font-mono">$0.00</span>
                      )}
                    </td>

                    {/* Action - Three dots button */}
                    <td className="py-2.5 pl-2 pr-4 text-right whitespace-nowrap">
                      <div className="relative inline-flex items-center justify-end">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveActionId(activeActionId === line.id ? null : line.id);
                          }}
                          className="p-1 rounded text-neutral-400 hover:text-neutral-800 hover:bg-neutral-200/60 transition-colors cursor-pointer"
                          title="Actions"
                        >
                          <MoreHorizontal size={15} />
                        </button>

                        {activeActionId === line.id && (
                          <div
                            ref={actionMenuRef}
                            className="absolute right-0 top-7 w-36 bg-white rounded-lg shadow-lg border border-neutral-200/90 py-1 z-40 text-left text-[12px] animate-in fade-in zoom-in-95 duration-100"
                          >
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(line.parentId);
                              }}
                              className="w-full px-3 py-1.5 hover:bg-rose-50 text-rose-600 flex items-center gap-2 cursor-pointer"
                            >
                              <Trash2 size={13} className="text-rose-500" />
                              <span>Delete Entry</span>
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

      {/* 5. Bottom Pagination Bar */}
      {filteredJournalLines.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredJournalLines.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={(newCount) => {
            setItemsPerPage(newCount);
            setCurrentPage(1);
          }}
        />
      )}

      {/* 6. Add Journal Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-neutral-200/90 w-full max-w-md p-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 mb-4">
              <h3 className="text-[15px] font-semibold text-neutral-900">Add Journal Entry</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-700 cursor-pointer p-1 rounded-md hover:bg-neutral-100"
              >
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleAddJournalSubmit} className="space-y-3.5 text-[12.5px]">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11.5px] font-medium text-neutral-600 mb-1">
                    Debit Account (D)
                  </label>
                  <select
                    value={newJournalData.debitAccount}
                    onChange={(e) =>
                      setNewJournalData({ ...newJournalData, debitAccount: e.target.value })
                    }
                    className="w-full px-2.5 py-1.5 bg-neutral-50 border border-neutral-200 rounded-md outline-none text-neutral-900 focus:border-neutral-400 transition-colors text-[12px]"
                  >
                    <option value="Kas & Bank Operasional">1101 - Kas & Bank Operasional</option>
                    <option value="Persediaan Bahan Baku">1103 - Persediaan Bahan Baku</option>
                    <option value="Beban Listrik & Air">5101 - Beban Listrik & Air</option>
                    <option value="Beban Sewa Gedung">5102 - Beban Sewa Gedung</option>
                    <option value="Beban Pemasaran & Iklan">5103 - Beban Pemasaran & Iklan</option>
                    <option value="Peralatan & Mesin Dapur">1201 - Peralatan & Mesin Dapur</option>
                    <option value="Piutang Usaha (Pelanggan)">1102 - Piutang Usaha (Pelanggan)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11.5px] font-medium text-neutral-600 mb-1">
                    Credit Account (K)
                  </label>
                  <select
                    value={newJournalData.creditAccount}
                    onChange={(e) =>
                      setNewJournalData({ ...newJournalData, creditAccount: e.target.value })
                    }
                    className="w-full px-2.5 py-1.5 bg-neutral-50 border border-neutral-200 rounded-md outline-none text-neutral-900 focus:border-neutral-400 transition-colors text-[12px]"
                  >
                    <option value="Pendapatan Penjualan">4101 - Pendapatan Penjualan</option>
                    <option value="Kas & Bank Operasional">1101 - Kas & Bank Operasional</option>
                    <option value="Hutang Usaha (Supplier)">2101 - Hutang Usaha (Supplier)</option>
                    <option value="Hutang Kartu Kredit Perusahaan">2102 - Hutang Kartu Kredit Perusahaan</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11.5px] font-medium text-neutral-600 mb-1">
                    Journal No.
                  </label>
                  <input
                    type="text"
                    value={newJournalData.journalNo}
                    onChange={(e) => setNewJournalData({ ...newJournalData, journalNo: e.target.value })}
                    className="w-full px-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-md outline-none font-mono text-neutral-900 focus:border-neutral-400"
                  />
                </div>
                <div>
                  <label className="block text-[11.5px] font-medium text-neutral-600 mb-1">
                    Reference / Catatan
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Penerimaan Penjualan Harian Kafe"
                    value={newJournalData.referenceNo}
                    onChange={(e) => setNewJournalData({ ...newJournalData, referenceNo: e.target.value, description: e.target.value })}
                    className="w-full px-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-md outline-none text-neutral-900 focus:border-neutral-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11.5px] font-medium text-neutral-600 mb-1">
                  Description / Keterangan
                </label>
                <input
                  type="text"
                  placeholder="e.g. Pembayaran listrik atau penerimaan kas"
                  value={newJournalData.description}
                  onChange={(e) => setNewJournalData({ ...newJournalData, description: e.target.value })}
                  className="w-full px-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-md outline-none text-neutral-900 focus:border-neutral-400"
                />
              </div>

              <div>
                <label className="block text-[11.5px] font-medium text-neutral-600 mb-1">
                  Amount ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={newJournalData.amount}
                  onChange={(e) => setNewJournalData({ ...newJournalData, amount: e.target.value })}
                  required
                  className="w-full px-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-md outline-none font-mono text-neutral-900 focus:border-neutral-400"
                />
              </div>

              <div>
                <label className="block text-[11.5px] font-medium text-neutral-600 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={newJournalData.date}
                  onChange={(e) => setNewJournalData({ ...newJournalData, date: e.target.value })}
                  className="w-full px-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-md outline-none text-neutral-900 focus:border-neutral-400"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100 mt-4">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 rounded-md text-neutral-600 hover:bg-neutral-100 font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded-md bg-neutral-900 hover:bg-neutral-800 text-white font-medium cursor-pointer"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
