import React, { useState, useMemo } from 'react';
import {
  Calendar,
  ChevronDown,
  ChevronRight,
  Download,
  BookOpen,
} from 'lucide-react';

interface AccountNode {
  id: string;
  name: string;
  values: number[];
}

const MONTH_LABELS = ['APR 2026', 'MAY 2026', 'JUN 2026', 'JUL 2026', 'AUG 2026', 'SEP 2026'];

const OPERATING_ACTIVITIES: AccountNode[] = [
  { id: 'cf-op-1', name: 'Net Profit / Income', values: [32150.00, 36800.00, 38400.00, 42100.00, 49500.00, 52100.00] },
  { id: 'cf-op-2', name: 'Depreciation & Amortization', values: [3200.00, 3200.00, 3200.00, 3200.00, 3200.00, 3200.00] },
  { id: 'cf-op-3', name: 'Change in Accounts Receivable', values: [-12400.00, -8500.00, 15200.00, -5800.00, -12100.00, -6400.00] },
  { id: 'cf-op-4', name: 'Change in Prepaid Expenses & Deposits', values: [-4200.00, 1800.00, -2100.00, -8400.00, -15200.00, 8900.00] },
];

const INVESTING_ACTIVITIES: AccountNode[] = [
  { id: 'cf-inv-1', name: 'Purchase of Computers & Equipment', values: [-2500.00, -1470.00, 0.00, -2323.71, -16911.31, 0.00] },
  { id: 'cf-inv-2', name: 'Furniture & Fixtures Purchases', values: [0.00, -13580.00, 0.00, -13450.00, 0.00, 0.00] },
  { id: 'cf-inv-3', name: 'Leasehold Improvements', values: [0.00, 0.00, 0.00, 0.00, -18967.74, 0.00] },
];

const FINANCING_ACTIVITIES: AccountNode[] = [
  { id: 'cf-fin-1', name: 'Repayment of Short-term Debt', values: [-5000.00, -5000.00, -5000.00, -5000.00, -5000.00, -5000.00] },
  { id: 'cf-fin-2', name: 'Owner Investment / Capital Inflow', values: [100000.00, 0.00, 200000.00, 0.00, 500000.00, 0.00] },
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

export function CashFlowView() {
  const [dateRangeText] = useState('Apr 1 - Sep 30, 2026');
  const [displayPeriod] = useState('Month to month');

  const formatCurrency = (amount: number) => {
    if (amount === 0) return '$0.00';
    const isNegative = amount < 0;
    const absVal = Math.abs(amount).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return isNegative ? `-$${absVal}` : `$${absVal}`;
  };

  const totalOperating = useMemo(() => sumValues(OPERATING_ACTIVITIES.map((n) => n.values)), []);
  const totalInvesting = useMemo(() => sumValues(INVESTING_ACTIVITIES.map((n) => n.values)), []);
  const totalFinancing = useMemo(() => sumValues(FINANCING_ACTIVITIES.map((n) => n.values)), []);

  const netCashFlow = useMemo(() => {
    return totalOperating.map((op, idx) => op + totalInvesting[idx] + totalFinancing[idx]);
  }, [totalOperating, totalInvesting, totalFinancing]);

  return (
    <div className="w-full max-w-[1100px] mx-auto pt-6 md:pt-8 pb-20 px-4 md:px-8 font-sans">
      <div className="mb-4">
        <h1 className="text-[24px] md:text-[26px] font-bold text-neutral-950 tracking-tight">
          Cash Flow Statement
        </h1>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 mb-5 text-[13px]">
        <div className="flex items-center gap-2.5">
          <div className="bg-white border border-neutral-200 rounded-lg px-3 py-1.5 flex items-center gap-2 text-neutral-800 font-medium shadow-2xs">
            <Calendar size={14} className="text-neutral-500" />
            <span>{dateRangeText}</span>
          </div>

          <div className="bg-white border border-neutral-200 rounded-lg px-3 py-1.5 flex items-center gap-2 text-neutral-800 shadow-2xs">
            <BookOpen size={14} className="text-neutral-500" />
            <span>{displayPeriod}</span>
            <ChevronDown size={12} className="text-neutral-400" />
          </div>
        </div>

        <button
          onClick={() => alert('Exporting Cash Flow report...')}
          className="bg-white hover:bg-neutral-50 border border-neutral-200 text-neutral-800 font-medium px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-2xs"
        >
          <Download size={14} className="text-neutral-600" />
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
            {/* Operating Activities */}
            <tr className="bg-neutral-50/40 font-bold text-neutral-950">
              <td colSpan={7} className="py-2.5 px-4 flex items-center gap-1">
                <ChevronDown size={14} />
                <span>Operating Activities</span>
              </td>
            </tr>
            {OPERATING_ACTIVITIES.map((item) => (
              <tr key={item.id} className="hover:bg-neutral-50 text-neutral-700">
                <td className="py-1.5 pl-10 px-4">{item.name}</td>
                {item.values.map((v, i) => (
                  <td key={i} className="py-1.5 px-4 text-right font-mono">{formatCurrency(v)}</td>
                ))}
              </tr>
            ))}
            <tr className="font-semibold text-neutral-900 bg-neutral-50/30">
              <td className="py-2 pl-6 px-4">Net Cash from Operating Activities</td>
              {totalOperating.map((v, i) => (
                <td key={i} className="py-2 px-4 text-right font-mono">{formatCurrency(v)}</td>
              ))}
            </tr>

            {/* Investing Activities */}
            <tr className="bg-neutral-50/40 font-bold text-neutral-950">
              <td colSpan={7} className="py-2.5 px-4 flex items-center gap-1">
                <ChevronDown size={14} />
                <span>Investing Activities</span>
              </td>
            </tr>
            {INVESTING_ACTIVITIES.map((item) => (
              <tr key={item.id} className="hover:bg-neutral-50 text-neutral-700">
                <td className="py-1.5 pl-10 px-4">{item.name}</td>
                {item.values.map((v, i) => (
                  <td key={i} className="py-1.5 px-4 text-right font-mono">{formatCurrency(v)}</td>
                ))}
              </tr>
            ))}
            <tr className="font-semibold text-neutral-900 bg-neutral-50/30">
              <td className="py-2 pl-6 px-4">Net Cash from Investing Activities</td>
              {totalInvesting.map((v, i) => (
                <td key={i} className="py-2 px-4 text-right font-mono">{formatCurrency(v)}</td>
              ))}
            </tr>

            {/* Financing Activities */}
            <tr className="bg-neutral-50/40 font-bold text-neutral-950">
              <td colSpan={7} className="py-2.5 px-4 flex items-center gap-1">
                <ChevronDown size={14} />
                <span>Financing Activities</span>
              </td>
            </tr>
            {FINANCING_ACTIVITIES.map((item) => (
              <tr key={item.id} className="hover:bg-neutral-50 text-neutral-700">
                <td className="py-1.5 pl-10 px-4">{item.name}</td>
                {item.values.map((v, i) => (
                  <td key={i} className="py-1.5 px-4 text-right font-mono">{formatCurrency(v)}</td>
                ))}
              </tr>
            ))}
            <tr className="font-semibold text-neutral-900 bg-neutral-50/30">
              <td className="py-2 pl-6 px-4">Net Cash from Financing Activities</td>
              {totalFinancing.map((v, i) => (
                <td key={i} className="py-2 px-4 text-right font-mono">{formatCurrency(v)}</td>
              ))}
            </tr>

            {/* Net Change in Cash */}
            <tr className="font-bold text-white bg-neutral-900 text-[14px]">
              <td className="py-3 px-4">Net Increase / (Decrease) in Cash</td>
              {netCashFlow.map((v, i) => (
                <td key={i} className="py-3 px-4 text-right font-mono text-emerald-400">{formatCurrency(v)}</td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
