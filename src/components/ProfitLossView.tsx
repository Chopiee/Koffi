import React, { useState, useMemo } from 'react';
import {
  Calendar,
  ChevronDown,
  ChevronRight,
  Download,
  Search,
  BookOpen,
  X,
  Check,
  Clock,
} from 'lucide-react';

interface AccountNode {
  id: string;
  name: string;
  level: number; // 0: Top Section, 1: Sub Category, 2: Detail Account
  values: number[]; // Months: Apr, May, Jun, Jul, Aug, Sep 2026
  children?: AccountNode[];
}

interface MonthHeader {
  label: string;
  isUpcoming?: boolean;
}

const MONTH_HEADERS: MonthHeader[] = [
  { label: 'Apr 2026' },
  { label: 'May 2026' },
  { label: 'Jun 2026' },
  { label: 'Jul 2026' },
  { label: 'Aug 2026', isUpcoming: true },
  { label: 'Sep 2026', isUpcoming: true },
];

// Raw Account Financial Data for Profit & Loss
const RAW_INCOME_DATA: AccountNode[] = [
  {
    id: 'inc-rev',
    name: 'Operating Revenue',
    level: 1,
    values: [0, 0, 0, 0, 0, 0],
    children: [
      { id: 'rev-prod', name: 'Product Sales', level: 2, values: [120450.00, 128900.00, 135400.00, 142100.00, 158900.00, 162400.00] },
      { id: 'rev-serv', name: 'Service Revenue', level: 2, values: [45200.00, 48100.00, 52300.00, 56000.00, 61200.00, 64500.00] },
      { id: 'rev-saas', name: 'Subscription & SaaS Revenue', level: 2, values: [38900.00, 41200.00, 44500.00, 48900.00, 54200.00, 58100.00] },
      { id: 'rev-plat', name: 'Platform & Marketplace Fees', level: 2, values: [12400.00, 13100.00, 14800.00, 16200.00, 18400.00, 19800.00] },
    ],
  },
  {
    id: 'inc-oth',
    name: 'Other Income',
    level: 1,
    values: [0, 0, 0, 0, 0, 0],
    children: [
      { id: 'oth-int', name: 'Interest Income', level: 2, values: [1250.00, 1420.00, 1380.00, 1550.00, 1620.00, 1750.00] },
      { id: 'oth-inv', name: 'Investment Returns', level: 2, values: [0.00, 2500.00, 0.00, 3100.00, 0.00, 2800.00] },
    ],
  },
];

const RAW_COGS_DATA: AccountNode[] = [
  { id: 'cogs-mat', name: 'Direct Cost of Materials', level: 1, values: [48200.00, 51400.00, 54100.00, 56800.00, 63500.00, 65100.00] },
  { id: 'cogs-mer', name: 'Merchant & Processing Fees', level: 1, values: [6500.00, 6900.00, 7400.00, 7900.00, 8800.00, 9100.00] },
  { id: 'cogs-hos', name: 'Direct Hosting & Infrastructure', level: 1, values: [8400.00, 8900.00, 9200.00, 9800.00, 10500.00, 11200.00] },
  { id: 'cogs-lab', name: 'Direct Labor & Fulfillment', level: 1, values: [24000.00, 25500.00, 26800.00, 28100.00, 31000.00, 32400.00] },
];

const RAW_OPEX_DATA: AccountNode[] = [
  {
    id: 'opex-sm',
    name: 'Sales & Marketing',
    level: 1,
    values: [0, 0, 0, 0, 0, 0],
    children: [
      { id: 'sm-ads', name: 'Digital Advertising & Paid Ads', level: 2, values: [18500.00, 21000.00, 23400.00, 25100.00, 28900.00, 30200.00] },
      { id: 'sm-eve', name: 'Events & Sponsorships', level: 2, values: [3500.00, 1200.00, 4800.00, 2200.00, 5400.00, 1800.00] },
      { id: 'sm-seo', name: 'Content & SEO Marketing', level: 2, values: [4200.00, 4200.00, 4500.00, 4500.00, 5000.00, 5000.00] },
    ],
  },
  {
    id: 'opex-ga',
    name: 'General & Administrative',
    level: 1,
    values: [0, 0, 0, 0, 0, 0],
    children: [
      { id: 'ga-sal', name: 'Salaries & Wages', level: 2, values: [52000.00, 52000.00, 54500.00, 54500.00, 58000.00, 58000.00] },
      { id: 'ga-sw', name: 'Software & SaaS Subscriptions', level: 2, values: [6800.00, 7100.00, 7400.00, 7800.00, 8200.00, 8500.00] },
      { id: 'ga-rent', name: 'Office Rent & Real Estate', level: 2, values: [12500.00, 12500.00, 12500.00, 12500.00, 14000.00, 14000.00] },
      { id: 'ga-util', name: 'Utilities & Internet', level: 2, values: [1800.00, 1950.00, 2100.00, 2250.00, 2400.00, 2300.00] },
      { id: 'ga-leg', name: 'Legal & Professional Fees', level: 2, values: [4500.00, 3200.00, 5100.00, 2800.00, 4200.00, 3900.00] },
      { id: 'ga-sup', name: 'Office Maintenance & Supplies', level: 2, values: [1400.00, 1600.00, 1500.00, 1800.00, 2100.00, 1900.00] },
      { id: 'ga-trv', name: 'Travel & Client Entertainment', level: 2, values: [2800.00, 3400.00, 4100.00, 3800.00, 4600.00, 4200.00] },
    ],
  },
  {
    id: 'opex-rd',
    name: 'Research & Development',
    level: 1,
    values: [0, 0, 0, 0, 0, 0],
    children: [
      { id: 'rd-sw', name: 'R&D Software & Cloud Credit', level: 2, values: [7200.00, 7500.00, 8100.00, 8400.00, 9100.00, 9500.00] },
      { id: 'rd-con', name: 'Specialist Contractors', level: 2, values: [8500.00, 9200.00, 10500.00, 9800.00, 11200.00, 10800.00] },
    ],
  },
];

const RAW_OTHER_EXPENSES_DATA: AccountNode[] = [
  { id: 'oth-exp-int', name: 'Interest Expense', level: 1, values: [2100.00, 2050.00, 2000.00, 1950.00, 1900.00, 1850.00] },
  { id: 'oth-exp-tax', name: 'Income Tax Provision', level: 1, values: [5400.00, 5800.00, 6200.00, 6800.00, 7500.00, 8100.00] },
  { id: 'oth-exp-dep', name: 'Depreciation & Amortization', level: 1, values: [3200.00, 3200.00, 3200.00, 3200.00, 3200.00, 3200.00] },
];

// Sum helper
function sumValues(arrays: number[][]): number[] {
  const result = [0, 0, 0, 0, 0, 0];
  arrays.forEach((arr) => {
    arr.forEach((val, idx) => {
      result[idx] += val;
    });
  });
  return result;
}

// Resolved node values
function getResolvedValues(node: AccountNode): number[] {
  if (!node.children || node.children.length === 0) {
    return node.values;
  }
  return sumValues(node.children.map(getResolvedValues));
}

export function ProfitLossView() {
  const [dateRangeText, setDateRangeText] = useState('Apr 1 - Sep 30, 2026');
  const [isDatePopoverOpen, setIsDatePopoverOpen] = useState(false);
  const [displayPeriod, setDisplayPeriod] = useState('Month to month');
  const [isPeriodDropdownOpen, setIsPeriodDropdownOpen] = useState(false);
  const [depthLevel, setDepthLevel] = useState<'0' | '1' | '2' | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [exportToast, setExportToast] = useState<string | null>(null);

  // Collapse state
  const [collapsedNodes, setCollapsedNodes] = useState<{ [id: string]: boolean }>({});

  const toggleCollapse = (id: string) => {
    setCollapsedNodes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const isNodeExpanded = (id: string, level: number) => {
    if (collapsedNodes[id] !== undefined) return !collapsedNodes[id];
    if (depthLevel === '0') return false;
    if (depthLevel === '1') return level < 1;
    if (depthLevel === '2') return level < 2;
    return true; // 'All'
  };

  // Financial Calculations
  const incomeCategoryValues = useMemo(() => sumValues(RAW_INCOME_DATA.map(getResolvedValues)), []);
  const cogsCategoryValues = useMemo(() => sumValues(RAW_COGS_DATA.map(getResolvedValues)), []);
  const grossProfitValues = useMemo(
    () => incomeCategoryValues.map((inc, i) => inc - cogsCategoryValues[i]),
    [incomeCategoryValues, cogsCategoryValues]
  );
  const opexCategoryValues = useMemo(() => sumValues(RAW_OPEX_DATA.map(getResolvedValues)), []);
  const operatingIncomeValues = useMemo(
    () => grossProfitValues.map((gp, i) => gp - opexCategoryValues[i]),
    [grossProfitValues, opexCategoryValues]
  );
  const otherExpensesCategoryValues = useMemo(
    () => sumValues(RAW_OTHER_EXPENSES_DATA.map(getResolvedValues)),
    []
  );
  const netIncomeValues = useMemo(
    () => operatingIncomeValues.map((op, i) => op - otherExpensesCategoryValues[i]),
    [operatingIncomeValues, otherExpensesCategoryValues]
  );

  // Currency Formatter
  const formatCurrency = (amount: number) => {
    if (amount === 0) return '$0.00';
    const isNegative = amount < 0;
    const absVal = Math.abs(amount).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return isNegative ? `-$${absVal}` : `$${absVal}`;
  };

  // Export handler
  const handleExport = () => {
    const csvLines = [
      ['Account', ...MONTH_HEADERS.map((m) => m.label)].join(','),
      ['Total Income', ...incomeCategoryValues.map((v) => v.toFixed(2))].join(','),
      ['Total Cost of Goods Sold', ...cogsCategoryValues.map((v) => v.toFixed(2))].join(','),
      ['Gross Profit', ...grossProfitValues.map((v) => v.toFixed(2))].join(','),
      ['Total Operating Expenses', ...opexCategoryValues.map((v) => v.toFixed(2))].join(','),
      ['Operating Income', ...operatingIncomeValues.map((v) => v.toFixed(2))].join(','),
      ['Total Other Expenses & Taxes', ...otherExpensesCategoryValues.map((v) => v.toFixed(2))].join(','),
      ['Net Profit / Net Income', ...netIncomeValues.map((v) => v.toFixed(2))].join(','),
    ].join('\n');

    const blob = new Blob([csvLines], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Profit_Loss_Report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    setExportToast('Report exported to CSV successfully!');
    setTimeout(() => setExportToast(null), 3000);
  };

  // Tree Node Renderer matching IMG_2548.jpg 1:1
  const renderAccountRow = (
    node: AccountNode,
    options?: {
      isSubtotalRow?: boolean;
      overrideName?: string;
      overrideValues?: number[];
      isMainMetric?: boolean;
      customPaddingLeft?: number;
    }
  ) => {
    const values = options?.overrideValues || getResolvedValues(node);
    const name = options?.overrideName || node.name;
    const expanded = isNodeExpanded(node.id, node.level);
    const hasChildren = node.children && node.children.length > 0;

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchName = name.toLowerCase().includes(q);
      const matchChild = node.children?.some((c) => c.name.toLowerCase().includes(q));
      if (!matchName && !matchChild) return null;
    }

    const paddingLeft = options?.customPaddingLeft !== undefined
      ? options.customPaddingLeft
      : node.level * 18 + 12;

    return (
      <React.Fragment key={node.id}>
        <tr className="hover:bg-neutral-100/60 transition-colors text-[12.5px] border-b border-neutral-100/70 group">
          {/* ACCOUNT Name Column with Vertical Line Divider */}
          <td className="py-1.5 pr-3 whitespace-nowrap border-r border-neutral-200/80 relative select-none">
            <div className="flex items-center gap-1.5" style={{ paddingLeft: `${paddingLeft}px` }}>
              {/* Tree guide line */}
              {node.level > 0 && (
                <span
                  className="absolute top-0 bottom-0 border-l border-dotted border-neutral-300 pointer-events-none"
                  style={{ left: `${paddingLeft - 12}px` }}
                />
              )}

              {/* Expand / Collapse Triangle */}
              {hasChildren ? (
                <button
                  onClick={() => toggleCollapse(node.id)}
                  className="w-3.5 h-3.5 flex items-center justify-center text-neutral-500 hover:text-neutral-800 cursor-pointer shrink-0"
                >
                  {expanded ? (
                    <ChevronDown size={12} className="stroke-[2.5]" />
                  ) : (
                    <ChevronRight size={12} className="stroke-[2.5]" />
                  )}
                </button>
              ) : (
                <span className="w-3.5 shrink-0" />
              )}

              <span
                className={`${
                  node.level === 0
                    ? 'font-bold text-neutral-900 text-[13px]'
                    : options?.isSubtotalRow
                    ? 'font-semibold text-neutral-900'
                    : node.level === 1
                    ? 'font-semibold text-neutral-800'
                    : 'font-normal text-neutral-700'
                } truncate max-w-[320px]`}
              >
                {name}
              </span>
            </div>
          </td>

          {/* Month Data Columns */}
          {values.map((val, idx) => (
            <td
              key={idx}
              className={`py-1.5 px-4 text-right whitespace-nowrap font-mono text-[12.5px] ${
                options?.isMainMetric
                  ? 'font-bold text-neutral-950'
                  : options?.isSubtotalRow
                  ? 'font-semibold text-neutral-900'
                  : 'font-normal text-neutral-800'
              }`}
            >
              {formatCurrency(val)}
            </td>
          ))}
        </tr>

        {/* Render Children if Expanded */}
        {hasChildren && expanded && (
          <>
            {node.children!.map((child) => renderAccountRow(child))}
            {node.level === 1 && (
              <tr className="hover:bg-neutral-100/60 text-[12.5px] font-semibold text-neutral-900 border-b border-neutral-100/70">
                <td className="py-1.5 pr-3 whitespace-nowrap border-r border-neutral-200/80">
                  <div className="flex items-center gap-1.5" style={{ paddingLeft: `${paddingLeft + 18}px` }}>
                    <span>Total {node.name}</span>
                  </div>
                </td>
                {values.map((val, idx) => (
                  <td key={idx} className="py-1.5 px-4 text-right whitespace-nowrap font-mono font-semibold">
                    {formatCurrency(val)}
                  </td>
                ))}
              </tr>
            )}
          </>
        )}
      </React.Fragment>
    );
  };

  return (
    <div className="w-full max-w-full pt-4 md:pt-6 pb-20 px-4 md:px-6 font-sans text-neutral-900">
      {/* Toast Notification */}
      {exportToast && (
        <div className="fixed top-5 right-5 z-50 bg-neutral-900 text-white text-[13px] px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-in fade-in duration-200">
          <Check size={14} className="text-emerald-400" />
          <span>{exportToast}</span>
        </div>
      )}

      {/* Page Title exact 1:1 like IMG_2548.jpg */}
      <div className="mb-2.5">
        <h1 className="text-[16.5px] font-semibold text-neutral-900 tracking-tight">
          Profit & Loss
        </h1>
      </div>

      {/* Toolbar Controls exact 1:1 like IMG_2548.jpg */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 text-[12px]">
        {/* Left Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Date Range Picker */}
          <div className="relative">
            <button
              onClick={() => setIsDatePopoverOpen(!isDatePopoverOpen)}
              className="bg-white hover:bg-neutral-50 border border-neutral-200/90 rounded-md px-2.5 py-1 flex items-center gap-1.5 transition-colors cursor-pointer text-neutral-800 shadow-2xs font-normal"
            >
              <Calendar size={13} className="text-neutral-500" />
              <span>{dateRangeText}</span>
            </button>

            {isDatePopoverOpen && (
              <div className="absolute top-[calc(100%+4px)] left-0 z-40 bg-white rounded-lg shadow-lg border border-neutral-200 p-2 w-60 animate-in fade-in zoom-in-95 duration-100">
                <div className="text-[11px] font-medium text-neutral-400 mb-1.5 px-2">
                  Select Period Range
                </div>
                {[
                  'Apr 1 - Sep 30, 2026',
                  'Jan 1 - Jun 30, 2026',
                  'Q1 2026 (Jan - Mar)',
                  'Q2 2026 (Apr - Jun)',
                  'Q3 2026 (Jul - Sep)',
                  'Full Year 2026',
                ].map((range) => (
                  <button
                    key={range}
                    onClick={() => {
                      setDateRangeText(range);
                      setIsDatePopoverOpen(false);
                    }}
                    className={`w-full px-2 py-1 rounded text-left text-[12px] flex items-center justify-between cursor-pointer transition-colors ${
                      dateRangeText === range
                        ? 'bg-neutral-100 font-medium text-neutral-900'
                        : 'text-neutral-700 hover:bg-neutral-50'
                    }`}
                  >
                    <span>{range}</span>
                    {dateRangeText === range && <Check size={12} className="text-neutral-900" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Period Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsPeriodDropdownOpen(!isPeriodDropdownOpen)}
              className="bg-white hover:bg-neutral-50 border border-neutral-200/90 rounded-md px-2.5 py-1 flex items-center gap-1.5 transition-colors cursor-pointer text-neutral-800 shadow-2xs font-normal"
            >
              <BookOpen size={13} className="text-neutral-500" />
              <span>{displayPeriod}</span>
              <ChevronDown size={11} className="text-neutral-400 ml-0.5" />
            </button>

            {isPeriodDropdownOpen && (
              <div className="absolute top-[calc(100%+4px)] left-0 z-40 bg-white rounded-lg shadow-lg border border-neutral-200 p-1.5 w-44 animate-in fade-in zoom-in-95 duration-100">
                {['Month to month', 'Quarter to quarter', 'Year to date', 'Total only'].map((period) => (
                  <button
                    key={period}
                    onClick={() => {
                      setDisplayPeriod(period);
                      setIsPeriodDropdownOpen(false);
                    }}
                    className={`w-full px-2 py-1 rounded text-left text-[12px] flex items-center justify-between cursor-pointer transition-colors ${
                      displayPeriod === period
                        ? 'bg-neutral-100 font-medium text-neutral-900'
                        : 'text-neutral-700 hover:bg-neutral-50'
                    }`}
                  >
                    <span>{period}</span>
                    {displayPeriod === period && <Check size={12} className="text-neutral-900" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Depth Selector */}
          <div className="flex items-center gap-1 text-[12px] pl-1">
            <span className="text-neutral-500 font-normal mr-1">Depth</span>
            {(['0', '1', '2', 'All'] as const).map((lvl) => (
              <button
                key={lvl}
                onClick={() => setDepthLevel(lvl)}
                className={`px-2 py-0.5 rounded text-[12px] transition-all cursor-pointer ${
                  depthLevel === lvl
                    ? 'bg-neutral-200/80 text-neutral-900 font-semibold'
                    : 'text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Right Controls - Export Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="hover:text-neutral-950 text-neutral-700 font-normal px-2 py-1 flex items-center gap-1 transition-colors cursor-pointer text-[12px]"
          >
            <Download size={13} className="text-neutral-600" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Main Financial Statement Table matching IMG_2548.jpg */}
      <div className="bg-white rounded-lg border border-neutral-200 shadow-2xs overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[850px]">
          {/* Table Header */}
          <thead>
            <tr className="border-b border-neutral-200 text-[11.5px] font-semibold text-neutral-500 tracking-wider">
              <th className="py-2.5 px-4 w-[340px] border-r border-neutral-200">
                Account
              </th>
              {MONTH_HEADERS.map((m) => (
                <th key={m.label} className="py-2.5 px-4 text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-1">
                    {m.isUpcoming && <Clock size={11} className="text-neutral-400 shrink-0" />}
                    <span>{m.label}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-neutral-100 font-sans text-[12.5px]">
            {/* 1. REVENUE / INCOME SECTION */}
            <tr className="hover:bg-neutral-100/60 font-semibold text-neutral-900">
              <td colSpan={7} className="py-2 px-4 border-r border-neutral-200 flex items-center gap-1 cursor-pointer" onClick={() => toggleCollapse('sec-inc')}>
                <ChevronDown size={12} className="text-neutral-500" />
                <span>Revenue / Income</span>
              </td>
            </tr>

            {isNodeExpanded('sec-inc', 0) && (
              <>
                {RAW_INCOME_DATA.map((node) => renderAccountRow(node))}

                {/* Total Income Row */}
                <tr className="hover:bg-neutral-100/60 font-semibold text-neutral-950 border-t border-b border-neutral-200">
                  <td className="py-2 pl-6 pr-4 border-r border-neutral-200 whitespace-nowrap">
                    Total Income
                  </td>
                  {incomeCategoryValues.map((val, idx) => (
                    <td key={idx} className="py-2 px-4 text-right whitespace-nowrap font-mono font-semibold">
                      {formatCurrency(val)}
                    </td>
                  ))}
                </tr>
              </>
            )}

            {/* 2. COST OF GOODS SOLD SECTION */}
            <tr className="hover:bg-neutral-100/60 font-semibold text-neutral-900">
              <td colSpan={7} className="py-2 px-4 border-r border-neutral-200 flex items-center gap-1 cursor-pointer" onClick={() => toggleCollapse('sec-cogs')}>
                <ChevronDown size={12} className="text-neutral-500" />
                <span>Cost of Goods Sold</span>
              </td>
            </tr>

            {isNodeExpanded('sec-cogs', 0) && (
              <>
                {RAW_COGS_DATA.map((node) => renderAccountRow(node))}

                {/* Total COGS Row */}
                <tr className="hover:bg-neutral-100/60 font-semibold text-neutral-950 border-t border-b border-neutral-200">
                  <td className="py-2 pl-6 pr-4 border-r border-neutral-200 whitespace-nowrap">
                    Total Cost of Goods Sold
                  </td>
                  {cogsCategoryValues.map((val, idx) => (
                    <td key={idx} className="py-2 px-4 text-right whitespace-nowrap font-mono font-semibold">
                      {formatCurrency(val)}
                    </td>
                  ))}
                </tr>
              </>
            )}

            {/* GROSS PROFIT TOTAL ROW */}
            <tr className="hover:bg-neutral-100/70 font-bold text-neutral-950 border-t-2 border-b-2 border-neutral-250 bg-neutral-50/50">
              <td className="py-2.5 px-4 border-r border-neutral-200 whitespace-nowrap">
                Total Gross Profit
              </td>
              {grossProfitValues.map((val, idx) => (
                <td key={idx} className="py-2.5 px-4 text-right whitespace-nowrap font-mono font-bold">
                  {formatCurrency(val)}
                </td>
              ))}
            </tr>

            {/* 3. OPERATING EXPENSES SECTION */}
            <tr className="hover:bg-neutral-100/60 font-semibold text-neutral-900">
              <td colSpan={7} className="py-2 px-4 border-r border-neutral-200 flex items-center gap-1 cursor-pointer" onClick={() => toggleCollapse('sec-opex')}>
                <ChevronDown size={12} className="text-neutral-500" />
                <span>Operating Expenses</span>
              </td>
            </tr>

            {isNodeExpanded('sec-opex', 0) && (
              <>
                {RAW_OPEX_DATA.map((node) => renderAccountRow(node))}

                {/* Total Operating Expenses Row */}
                <tr className="hover:bg-neutral-100/60 font-semibold text-neutral-950 border-t border-b border-neutral-200">
                  <td className="py-2 pl-6 pr-4 border-r border-neutral-200 whitespace-nowrap">
                    Total Operating Expenses
                  </td>
                  {opexCategoryValues.map((val, idx) => (
                    <td key={idx} className="py-2 px-4 text-right whitespace-nowrap font-mono font-semibold">
                      {formatCurrency(val)}
                    </td>
                  ))}
                </tr>
              </>
            )}

            {/* OPERATING INCOME (EBIT) ROW */}
            <tr className="hover:bg-neutral-100/70 font-bold text-neutral-950 border-t-2 border-b-2 border-neutral-250 bg-neutral-50/50">
              <td className="py-2.5 px-4 border-r border-neutral-200 whitespace-nowrap">
                Operating Income (EBIT)
              </td>
              {operatingIncomeValues.map((val, idx) => (
                <td key={idx} className="py-2.5 px-4 text-right whitespace-nowrap font-mono font-bold">
                  {formatCurrency(val)}
                </td>
              ))}
            </tr>

            {/* 4. OTHER EXPENSES & TAXES SECTION */}
            <tr className="hover:bg-neutral-100/60 font-semibold text-neutral-900">
              <td colSpan={7} className="py-2 px-4 border-r border-neutral-200 flex items-center gap-1 cursor-pointer" onClick={() => toggleCollapse('sec-oth')}>
                <ChevronDown size={12} className="text-neutral-500" />
                <span>Other Expenses & Taxes</span>
              </td>
            </tr>

            {isNodeExpanded('sec-oth', 0) && (
              <>
                {RAW_OTHER_EXPENSES_DATA.map((node) => renderAccountRow(node))}

                {/* Total Other Expenses Row */}
                <tr className="hover:bg-neutral-100/60 font-semibold text-neutral-950 border-t border-b border-neutral-200">
                  <td className="py-2 pl-6 pr-4 border-r border-neutral-200 whitespace-nowrap">
                    Total Other Expenses & Taxes
                  </td>
                  {otherExpensesCategoryValues.map((val, idx) => (
                    <td key={idx} className="py-2 px-4 text-right whitespace-nowrap font-mono font-semibold">
                      {formatCurrency(val)}
                    </td>
                  ))}
                </tr>
              </>
            )}

            {/* NET PROFIT / NET INCOME HIGHLIGHTED ROW */}
            <tr className="hover:bg-neutral-200/80 font-bold text-neutral-950 border-t-2 border-b-2 border-neutral-300 bg-neutral-100/90">
              <td className="py-2.5 px-4 border-r border-neutral-200 whitespace-nowrap">
                Net Profit / Net Income
              </td>
              {netIncomeValues.map((val, idx) => (
                <td key={idx} className="py-2.5 px-4 text-right whitespace-nowrap font-mono font-bold text-neutral-950">
                  {formatCurrency(val)}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
