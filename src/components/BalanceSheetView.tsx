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
} from 'lucide-react';

interface AccountNode {
  id: string;
  name: string;
  level: number;
  values: number[];
  children?: AccountNode[];
}

const MONTH_LABELS = ['APR 2026', 'MAY 2026', 'JUN 2026', 'JUL 2026', 'AUG 2026', 'SEP 2026'];

// Exact Balance Sheet structure matching IMG_2548.jpg
const RAW_CURRENT_ASSETS_BANK: AccountNode[] = [
  { id: 'b1', name: 'Bank Transfers in Progress', level: 2, values: [0.00, 0.00, 0.00, 0.00, 0.00, 0.00] },
  { id: 'b2', name: 'Mercury Checking x0759', level: 2, values: [50528.06, 50493.06, 50458.06, 50423.06, 50388.06, 50353.06] },
  { id: 'b3', name: 'Mercury Choice x3208', level: 2, values: [520327.81, 493321.85, 2684351.32, 471527.99, 11750440.12, 12030089.60] },
  { id: 'b4', name: 'Mercury Treasury', level: 2, values: [20945585.63, 19405629.99, 17103136.13, 16054289.45, 41110971.78, 41196574.63] },
  { id: 'b5', name: 'Stripe Balance', level: 2, values: [70947.69, 103882.16, 171732.48, 193637.14, 347306.79, 147145.33] },
];

const RAW_CURRENT_ASSETS_AR: AccountNode[] = [
  { id: 'ar1', name: 'Accounts Receivable', level: 2, values: [1602077.03, 1665626.78, 468863.08, 494627.01, 649546.41, 654896.61] },
];

const RAW_CURRENT_ASSETS_OTHER: AccountNode[] = [
  { id: 'oca1', name: 'Accrued Revenue', level: 2, values: [548892.18, 698434.07, 870215.58, 1237647.97, 218650.58, -18981.94] },
  { id: 'oca2', name: 'Credit Card Payment Funds in Transit', level: 2, values: [0.00, 0.00, 0.00, 3401418.13, 662519.62, 662519.62] },
  { id: 'oca3', name: 'Prepaid Expenses', level: 2, values: [40352.33, 2917.33, 49432.85, 166121.64, 355221.49, 230804.30] },
  { id: 'oca4', name: 'Rental Security Deposits', level: 2, values: [85801.74, 85801.74, 85801.74, 85801.74, 688494.36, 688494.36] },
];

const RAW_FIXED_ASSETS: AccountNode[] = [
  { id: 'fa1', name: 'Accumulated Amortization - Leasehold Improvements', level: 1, values: [0.00, 0.00, 0.00, 0.00, -526.88, -1053.76] },
  {
    id: 'fa2',
    name: 'Computers & Equipment',
    level: 1,
    values: [0, 0, 0, 0, 0, 0],
    children: [
      { id: 'ce1', name: 'Computers & Equipment Base', level: 2, values: [32292.15, 33763.55, 33763.55, 36087.26, 52998.57, 52998.57] },
      { id: 'ce2', name: 'Accumulated Depreciation - Computers & Equipment', level: 2, values: [-6161.14, -7099.00, -8036.86, -9039.27, -10511.44, -11983.61] },
    ],
  },
  {
    id: 'fa3',
    name: 'Furniture & Fixtures',
    level: 1,
    values: [0, 0, 0, 0, 0, 0],
    children: [
      { id: 'ff1', name: 'Furniture & Fixtures Base', level: 2, values: [23119.01, 36699.01, 36699.01, 50149.01, 50149.01, 50149.01] },
      { id: 'ff2', name: 'Accumulated Depreciation - Furniture & Fixtures', level: 2, values: [-5290.11, -6309.52, -7328.93, -8721.95, -10114.97, -11507.99] },
    ],
  },
  { id: 'fa4', name: 'Leasehold Improvements', level: 1, values: [0.00, 0.00, 0.00, 0.00, 18967.74, 18967.74] },
];

function sumValues(arrays: number[][]): number[] {
  const result = [0, 0, 0, 0, 0, 0];
  arrays.forEach((arr) => {
    arr.forEach((val, idx) => {
      result[idx] += val;
    });
  });
  return result;
}

function getResolvedValues(node: AccountNode): number[] {
  if (!node.children || node.children.length === 0) {
    return node.values;
  }
  return sumValues(node.children.map(getResolvedValues));
}

export function BalanceSheetView() {
  const [dateRangeText, setDateRangeText] = useState('Apr 1 - Sep 30, 2026');
  const [displayPeriod, setDisplayPeriod] = useState('Month to month');
  const [depthLevel, setDepthLevel] = useState<'0' | '1' | '2' | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [collapsedNodes, setCollapsedNodes] = useState<{ [id: string]: boolean }>({});

  const toggleCollapse = (id: string) => {
    setCollapsedNodes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const isExpanded = (id: string, level: number) => {
    if (collapsedNodes[id] !== undefined) return !collapsedNodes[id];
    if (depthLevel === '0') return false;
    if (depthLevel === '1') return level < 1;
    if (depthLevel === '2') return level < 2;
    return true;
  };

  const formatCurrency = (amount: number) => {
    if (amount === 0) return '$0.00';
    const isNegative = amount < 0;
    const absVal = Math.abs(amount).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return isNegative ? `-$${absVal}` : `$${absVal}`;
  };

  const bankTotal = useMemo(() => sumValues(RAW_CURRENT_ASSETS_BANK.map((n) => n.values)), []);
  const arTotal = useMemo(() => sumValues(RAW_CURRENT_ASSETS_AR.map((n) => n.values)), []);
  const ocaTotal = useMemo(() => sumValues(RAW_CURRENT_ASSETS_OTHER.map((n) => n.values)), []);
  const totalCurrentAssets = useMemo(() => sumValues([bankTotal, arTotal, ocaTotal]), [bankTotal, arTotal, ocaTotal]);

  const fixedAssetsTotal = useMemo(() => sumValues(RAW_FIXED_ASSETS.map(getResolvedValues)), []);

  return (
    <div className="w-full max-w-[1200px] mx-auto pt-4 md:pt-6 pb-20 px-4 md:px-6 font-sans text-neutral-900">
      <div className="mb-2.5">
        <h1 className="text-[16.5px] font-semibold text-neutral-900 tracking-tight">
          Balance Sheet
        </h1>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 text-[12px]">
        <div className="flex flex-wrap items-center gap-2">
          <div className="bg-white border border-neutral-200/90 rounded-md px-2.5 py-1 flex items-center gap-1.5 text-neutral-800 shadow-2xs font-normal">
            <Calendar size={13} className="text-neutral-500" />
            <span>{dateRangeText}</span>
          </div>

          <div className="bg-white border border-neutral-200/90 rounded-md px-2.5 py-1 flex items-center gap-1.5 text-neutral-800 shadow-2xs font-normal">
            <BookOpen size={13} className="text-neutral-500" />
            <span>{displayPeriod}</span>
            <ChevronDown size={11} className="text-neutral-400 ml-0.5" />
          </div>

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

        <button
          onClick={() => alert('Exporting Balance Sheet report...')}
          className="hover:text-neutral-950 text-neutral-700 font-normal px-2 py-1 flex items-center gap-1 transition-colors cursor-pointer text-[12px]"
        >
          <Download size={13} className="text-neutral-600" />
          <span>Export</span>
        </button>
      </div>

      <div className="bg-white rounded-xl border border-neutral-200/90 shadow-2xs overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50/70 text-[11.5px] font-medium text-neutral-500 uppercase tracking-wider">
              <th className="py-3 px-4 w-[340px]">ACCOUNT</th>
              {MONTH_LABELS.map((m) => (
                <th key={m} className="py-3 px-4 text-right">{m}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 text-[13px] text-neutral-800 font-sans">
            <tr className="bg-neutral-50/40 font-bold text-neutral-950">
              <td colSpan={7} className="py-2.5 px-4">Assets</td>
            </tr>

            {/* Current Assets */}
            <tr className="font-semibold text-neutral-900">
              <td colSpan={7} className="py-2 pl-6 px-4">Current Assets</td>
            </tr>

            {/* Bank */}
            <tr className="font-medium text-neutral-800">
              <td colSpan={7} className="py-1.5 pl-10 px-4 flex items-center gap-1 cursor-pointer" onClick={() => toggleCollapse('bank')}>
                {isExpanded('bank', 1) ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                <span>Bank</span>
              </td>
            </tr>
            {isExpanded('bank', 1) && RAW_CURRENT_ASSETS_BANK.map((item) => (
              <tr key={item.id} className="hover:bg-neutral-50 text-neutral-700">
                <td className="py-1.5 pl-16 px-4">{item.name}</td>
                {item.values.map((v, i) => (
                  <td key={i} className="py-1.5 px-4 text-right font-mono">{formatCurrency(v)}</td>
                ))}
              </tr>
            ))}
            <tr className="font-semibold text-neutral-900 bg-neutral-50/30">
              <td className="py-1.5 pl-10 px-4">Total Bank</td>
              {bankTotal.map((v, i) => (
                <td key={i} className="py-1.5 px-4 text-right font-mono">{formatCurrency(v)}</td>
              ))}
            </tr>

            {/* Accounts Receivable */}
            <tr className="font-medium text-neutral-800">
              <td colSpan={7} className="py-1.5 pl-10 px-4 flex items-center gap-1 cursor-pointer" onClick={() => toggleCollapse('ar')}>
                {isExpanded('ar', 1) ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                <span>Accounts Receivable</span>
              </td>
            </tr>
            {isExpanded('ar', 1) && RAW_CURRENT_ASSETS_AR.map((item) => (
              <tr key={item.id} className="hover:bg-neutral-50 text-neutral-700">
                <td className="py-1.5 pl-16 px-4">{item.name}</td>
                {item.values.map((v, i) => (
                  <td key={i} className="py-1.5 px-4 text-right font-mono">{formatCurrency(v)}</td>
                ))}
              </tr>
            ))}
            <tr className="font-semibold text-neutral-900 bg-neutral-50/30">
              <td className="py-1.5 pl-10 px-4">Total Accounts Receivable</td>
              {arTotal.map((v, i) => (
                <td key={i} className="py-1.5 px-4 text-right font-mono">{formatCurrency(v)}</td>
              ))}
            </tr>

            {/* Other Current Assets */}
            <tr className="font-medium text-neutral-800">
              <td colSpan={7} className="py-1.5 pl-10 px-4 flex items-center gap-1 cursor-pointer" onClick={() => toggleCollapse('oca')}>
                {isExpanded('oca', 1) ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                <span>Other Current Asset</span>
              </td>
            </tr>
            {isExpanded('oca', 1) && RAW_CURRENT_ASSETS_OTHER.map((item) => (
              <tr key={item.id} className="hover:bg-neutral-50 text-neutral-700">
                <td className="py-1.5 pl-16 px-4">{item.name}</td>
                {item.values.map((v, i) => (
                  <td key={i} className="py-1.5 px-4 text-right font-mono">{formatCurrency(v)}</td>
                ))}
              </tr>
            ))}
            <tr className="font-semibold text-neutral-900 bg-neutral-50/30">
              <td className="py-1.5 pl-10 px-4">Total Other Current Asset</td>
              {ocaTotal.map((v, i) => (
                <td key={i} className="py-1.5 px-4 text-right font-mono">{formatCurrency(v)}</td>
              ))}
            </tr>

            {/* Total Current Assets */}
            <tr className="font-bold text-neutral-950 bg-neutral-100/70 border-t border-b border-neutral-300">
              <td className="py-2.5 pl-6 px-4">Total Current Assets</td>
              {totalCurrentAssets.map((v, i) => (
                <td key={i} className="py-2.5 px-4 text-right font-mono">{formatCurrency(v)}</td>
              ))}
            </tr>

            {/* Fixed Assets */}
            <tr className="font-semibold text-neutral-900">
              <td colSpan={7} className="py-2 pl-6 px-4">Fixed Assets</td>
            </tr>
            {RAW_FIXED_ASSETS.map((item) => {
              const vals = getResolvedValues(item);
              return (
                <tr key={item.id} className="hover:bg-neutral-50 text-neutral-800">
                  <td className="py-1.5 pl-10 px-4">{item.name}</td>
                  {vals.map((v, i) => (
                    <td key={i} className="py-1.5 px-4 text-right font-mono">{formatCurrency(v)}</td>
                  ))}
                </tr>
              );
            })}
            <tr className="font-bold text-neutral-950 bg-neutral-100/70 border-t border-neutral-300">
              <td className="py-2.5 pl-6 px-4">Total Fixed Assets</td>
              {fixedAssetsTotal.map((v, i) => (
                <td key={i} className="py-2.5 px-4 text-right font-mono">{formatCurrency(v)}</td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
