import { useState } from 'react';
import {
  PanelLeft,
  Plus,
  Search,
  ShoppingCart,
  Tag,
  TrendingDown,
  TrendingUp,
  Scale,
  ArrowRightLeft,
  Calculator,
  Pin,
  HelpCircle,
  ChevronsUpDown,
  Check,
} from 'lucide-react';
import { SidebarTab } from '../types';

interface SidebarProps {
  currentTab: SidebarTab;
  onSelectTab: (tab: SidebarTab) => void;
  onOpenNewTask: () => void;
  onOpenSearch: () => void;
  onOpenFeedback: () => void;
  onOpenPurchase: () => void;
  onOpenLinear: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export function Sidebar({
  currentTab,
  onSelectTab,
  onOpenNewTask,
  onOpenSearch,
  onOpenFeedback,
  onOpenPurchase,
  onOpenLinear,
  collapsed,
  onToggleCollapse,
}: SidebarProps) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [accountName, setAccountName] = useState('Choppie');

  return (
    <aside
      className={`bg-[#F2F2F2] flex flex-col justify-between select-none shrink-0 font-sans transition-all duration-300 ease-in-out overflow-hidden ${
        collapsed ? 'w-0 p-0 opacity-0' : 'w-[236px] p-3 pl-[9px] opacity-100'
      }`}
    >
      <div className="w-[212px] h-full flex flex-col justify-between">
        {/* Top section */}
        <div className="flex flex-col space-y-0.5">
          {/* Toggle Sidebar Icon Button */}
          <div className="px-1 pt-0.5 pb-2">
            <button
              id="btn-toggle-sidebar"
              onClick={onToggleCollapse}
              className="p-1 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/50 rounded-md transition-colors cursor-pointer inline-flex items-center justify-center"
              title="Collapse sidebar"
            >
              <PanelLeft size={15.5} strokeWidth={1.5} />
            </button>
          </div>

          {/* + New task button */}
          <button
            id="sidebar-new-task-btn"
            onClick={onOpenNewTask}
            className="w-full h-[29px] px-2 rounded-lg text-neutral-700 hover:bg-neutral-200/50 text-[15px] font-normal flex items-center gap-2.5 transition-colors cursor-pointer text-left"
          >
            <Plus size={14.5} strokeWidth={1.5} className="text-neutral-700 shrink-0" />
            <span>New task</span>
          </button>

          {/* Search row */}
          <button
            id="sidebar-search-btn"
            onClick={onOpenSearch}
            className="w-full h-[29px] px-2 rounded-lg text-neutral-700 hover:bg-neutral-200/50 text-[15px] font-normal flex items-center gap-2.5 transition-colors cursor-pointer text-left"
          >
            <Search size={14.5} strokeWidth={1.5} className="text-neutral-700 shrink-0" />
            <span>Search</span>
          </button>

          {/* Transaction section */}
        <div className="pt-3">
          <div className="px-2 pb-2 text-[13px] font-normal text-neutral-500 tracking-normal">
            Transaction
          </div>

          <div className="space-y-0.5">
            {/* Purchase */}
            <button
              id="sidebar-tab-purchase"
              onClick={() => onSelectTab('purchase')}
              className={`w-full h-[29px] px-2 rounded-lg text-[15px] flex items-center gap-2.5 transition-colors cursor-pointer text-left ${
                currentTab === 'purchase'
                  ? 'bg-[#e5e5e7] font-medium text-neutral-900'
                  : 'text-neutral-700 hover:bg-neutral-200/50 font-normal'
              }`}
            >
              <ShoppingCart size={14.5} strokeWidth={1.5} className="text-neutral-700 shrink-0" />
              <span>Purchase</span>
            </button>

            {/* Sales */}
            <button
              id="sidebar-tab-sales"
              onClick={() => onSelectTab('sales')}
              className={`w-full h-[29px] px-2 rounded-lg text-[15px] flex items-center gap-2.5 transition-colors cursor-pointer text-left ${
                currentTab === 'sales'
                  ? 'bg-[#e5e5e7] font-medium text-neutral-900'
                  : 'text-neutral-700 hover:bg-neutral-200/50 font-normal'
              }`}
            >
              <Tag size={14.5} strokeWidth={1.5} className="text-neutral-700 shrink-0" />
              <span>Sales</span>
            </button>

            {/* Cost */}
            <button
              id="sidebar-tab-cost"
              onClick={() => onSelectTab('cost')}
              className={`w-full h-[29px] px-2 rounded-lg text-[15px] flex items-center gap-2.5 transition-colors cursor-pointer text-left ${
                currentTab === 'cost'
                  ? 'bg-[#e5e5e7] font-medium text-neutral-900'
                  : 'text-neutral-700 hover:bg-neutral-200/50 font-normal'
              }`}
            >
              <TrendingDown size={14.5} strokeWidth={1.5} className="text-neutral-700 shrink-0" />
              <span>Cost</span>
            </button>

            {/* Accounting */}
            <button
              id="sidebar-tab-accounting"
              onClick={() => onSelectTab('accounting')}
              className={`w-full h-[29px] px-2 rounded-lg text-[15px] flex items-center gap-2.5 transition-colors cursor-pointer text-left ${
                currentTab === 'accounting'
                  ? 'bg-[#e5e5e7] font-medium text-neutral-900'
                  : 'text-neutral-700 hover:bg-neutral-200/50 font-normal'
              }`}
            >
              <Calculator size={14.5} strokeWidth={1.5} className="text-neutral-700 shrink-0" />
              <span>Accounting</span>
            </button>
          </div>
        </div>

        {/* Report section */}
        <div className="pt-3">
          <div className="px-2 pb-2 text-[13px] font-normal text-neutral-500 tracking-normal">
            Report
          </div>
          <div className="space-y-0.5">
            {/* Profit & Loss */}
            <button
              id="sidebar-tab-profit-loss"
              onClick={() => onSelectTab('profit-loss')}
              className={`w-full h-[29px] px-2 rounded-lg text-[15px] flex items-center gap-2.5 transition-colors cursor-pointer text-left ${
                currentTab === 'profit-loss'
                  ? 'bg-[#e5e5e7] font-medium text-neutral-900'
                  : 'text-neutral-700 hover:bg-neutral-200/50 font-normal'
              }`}
            >
              <TrendingUp size={14.5} strokeWidth={1.5} className="text-neutral-700 shrink-0" />
              <span>Profit & Loss</span>
            </button>

            {/* Balance Sheet */}
            <button
              id="sidebar-tab-balance-sheet"
              onClick={() => onSelectTab('balance-sheet')}
              className={`w-full h-[29px] px-2 rounded-lg text-[15px] flex items-center gap-2.5 transition-colors cursor-pointer text-left ${
                currentTab === 'balance-sheet'
                  ? 'bg-[#e5e5e7] font-medium text-neutral-900'
                  : 'text-neutral-700 hover:bg-neutral-200/50 font-normal'
              }`}
            >
              <Scale size={14.5} strokeWidth={1.5} className="text-neutral-700 shrink-0" />
              <span>Balance Sheet</span>
            </button>

            {/* Cash Flow */}
            <button
              id="sidebar-tab-cash-flow"
              onClick={() => onSelectTab('cash-flow')}
              className={`w-full h-[29px] px-2 rounded-lg text-[15px] flex items-center gap-2.5 transition-colors cursor-pointer text-left ${
                currentTab === 'cash-flow'
                  ? 'bg-[#e5e5e7] font-medium text-neutral-900'
                  : 'text-neutral-700 hover:bg-neutral-200/50 font-normal'
              }`}
            >
              <ArrowRightLeft size={14.5} strokeWidth={1.5} className="text-neutral-700 shrink-0" />
              <span>Cash Flow</span>
            </button>
          </div>
        </div>

        {/* Try section */}
        <div className="pt-3">
          <div className="px-2 pb-2 text-[13px] font-normal text-neutral-500 tracking-normal">
            Try
          </div>
          <div className="space-y-0.5">
            {/* Share feedback */}
            <button
              id="sidebar-btn-feedback"
              onClick={onOpenFeedback}
              className="w-full h-[29px] px-2 rounded-lg text-[15px] text-neutral-700 hover:bg-neutral-200/50 flex items-center gap-2.5 transition-colors cursor-pointer text-left"
            >
              <HelpCircle size={14.5} strokeWidth={1.5} className="text-neutral-700 shrink-0" />
              <span>Share feedback</span>
            </button>

            {/* Purchase Koffi */}
            <button
              id="sidebar-btn-purchase"
              onClick={onOpenPurchase}
              className="w-full h-[29px] px-2 rounded-lg text-[15px] text-neutral-700 hover:bg-neutral-200/50 flex items-center gap-2.5 transition-colors cursor-pointer text-left"
            >
              <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-tr from-[#00e5ff] via-[#00b4d8] to-[#0077b6] shadow-xs shrink-0 ring-1 ring-sky-300/40" />
              <span>Purchase Koffi</span>
            </button>

            {/* Connect Linear */}
            <button
              id="sidebar-btn-linear"
              onClick={onOpenLinear}
              className="w-full h-[29px] px-2 rounded-lg text-[15px] text-neutral-700 hover:bg-neutral-200/50 flex items-center gap-2.5 transition-colors cursor-pointer text-left"
            >
              {/* Linear-like icon / sphere */}
              <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-tr from-[#5E6AD2] to-[#7C88ED] flex items-center justify-center shrink-0 shadow-xs">
                <div className="w-1.5 h-1.5 border-t border-l border-white rounded-tl-[2px] transform -rotate-45" />
              </div>
              <span>Connect Linear</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Profile / Account section */}
      <div className="pt-2 relative">
        <button
          id="sidebar-profile-btn"
          onClick={() => setShowProfileMenu(!showProfileMenu)}
          className="w-full h-[32px] px-2 rounded-lg hover:bg-neutral-200/50 flex items-center justify-between text-[15px] text-neutral-800 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-tr from-[#00d2ff] to-[#0072ff] shadow-xs shrink-0" />
            <span className="font-normal text-[15px] text-neutral-800">{accountName}</span>
          </div>
          <ChevronsUpDown size={13.5} strokeWidth={1.5} className="text-neutral-400" />
        </button>

        {/* Profile popup dropdown */}
        {showProfileMenu && (
          <div className="absolute bottom-10 left-1 right-1 bg-white rounded-xl shadow-lg border border-neutral-200/80 p-1.5 z-50 text-[15px]">
            <div className="px-2 py-1.5 text-[16px] text-neutral-400 font-medium border-b border-neutral-100">
              Switch Workspace
            </div>
            <button
              onClick={() => {
                setAccountName('Choppie');
                setShowProfileMenu(false);
              }}
              className="w-full px-2 py-1.5 rounded-md hover:bg-neutral-100 flex items-center justify-between text-left cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gradient-to-tr from-[#00d2ff] to-[#0072ff]" />
                <span className="font-medium text-neutral-800">Choppie (Personal)</span>
              </div>
              {accountName === 'Choppie' && <Check size={13.5} className="text-neutral-800" />}
            </button>
            <button
              onClick={() => {
                setAccountName('Work / Studio');
                setShowProfileMenu(false);
              }}
              className="w-full px-2 py-1.5 rounded-md hover:bg-neutral-100 flex items-center justify-between text-left cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-600" />
                <span className="text-neutral-700">Work / Studio</span>
              </div>
              {accountName === 'Work / Studio' && <Check size={13.5} className="text-neutral-800" />}
            </button>
          </div>
        )}
      </div>
      </div>
    </aside>
  );
}
