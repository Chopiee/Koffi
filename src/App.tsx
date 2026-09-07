import { useState } from 'react';
import { PanelLeft } from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { OverviewView } from './components/OverviewView';
import { PurchaseView } from './components/PurchaseView';
import { SalesView } from './components/SalesView';
import { CostView } from './components/CostView';
import { AccountingView } from './components/AccountingView';
import { ProfitLossView } from './components/ProfitLossView';
import { BalanceSheetView } from './components/BalanceSheetView';
import { CashFlowView } from './components/CashFlowView';
import { NewTaskModal } from './components/NewTaskModal';
import { FeedbackModal } from './components/FeedbackModal';
import { PurchaseModal } from './components/PurchaseModal';
import { LinearModal } from './components/LinearModal';
import { SearchModal } from './components/SearchModal';
import { SidebarTab, TaskItem, CalendarEvent, PurchaseTransaction } from './types';
import {
  initialPurchaseTransactions,
  initialSalesTransactions,
  initialCostTransactions,
} from './data/initialTransactions';
export default function App() {
  const [currentTab, setCurrentTab] = useState<SidebarTab>('purchase');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  // Modals state
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isPurchaseOpen, setIsPurchaseOpen] = useState(false);
  const [isLinearOpen, setIsLinearOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Purchase transactions data state
  const [purchaseTransactions, setPurchaseTransactions] = useState<PurchaseTransaction[]>(initialPurchaseTransactions);

  // Sales transactions data state
  const [salesTransactions, setSalesTransactions] = useState<PurchaseTransaction[]>(initialSalesTransactions);

  // Cost transactions data state
  const [costTransactions, setCostTransactions] = useState<PurchaseTransaction[]>(initialCostTransactions);

  const handleAddPurchaseTransaction = (newTxData: Omit<PurchaseTransaction, 'id' | 'createdAt'>) => {
    const newTx: PurchaseTransaction = {
      ...newTxData,
      id: `tx-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setPurchaseTransactions((prev) => [newTx, ...prev]);
  };

  const handleDeletePurchaseTransaction = (id: string) => {
    setPurchaseTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const handleTogglePurchaseStatus = (id: string) => {
    setPurchaseTransactions((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        let nextStatus: string = 'Paid';
        if (t.status === 'Paid') nextStatus = 'Partially Paid';
        else if (t.status === 'Partially Paid') nextStatus = 'Unpaid';
        else nextStatus = 'Paid';
        return { ...t, status: nextStatus, tag: nextStatus };
      })
    );
  };

  const handleUpdatePurchaseTransaction = (updatedTx: PurchaseTransaction) => {
    setPurchaseTransactions((prev) =>
      prev.map((t) => (t.id === updatedTx.id ? updatedTx : t))
    );
  };

  const handleAddSalesTransaction = (newTxData: Omit<PurchaseTransaction, 'id' | 'createdAt'>) => {
    const newTx: PurchaseTransaction = {
      ...newTxData,
      id: `sl-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setSalesTransactions((prev) => [newTx, ...prev]);
  };

  const handleDeleteSalesTransaction = (id: string) => {
    setSalesTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const handleToggleSalesStatus = (id: string) => {
    setSalesTransactions((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        let nextStatus: string = 'Paid';
        if (t.status === 'Paid') nextStatus = 'Partially Paid';
        else if (t.status === 'Partially Paid') nextStatus = 'Unpaid';
        else nextStatus = 'Paid';
        return { ...t, status: nextStatus, tag: nextStatus };
      })
    );
  };

  const handleUpdateSalesTransaction = (updatedTx: PurchaseTransaction) => {
    setSalesTransactions((prev) =>
      prev.map((t) => (t.id === updatedTx.id ? updatedTx : t))
    );
  };

  const handleAddCostTransaction = (newTxData: Omit<PurchaseTransaction, 'id' | 'createdAt'>) => {
    const newTx: PurchaseTransaction = {
      ...newTxData,
      id: `cst-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setCostTransactions((prev) => [newTx, ...prev]);
  };

  const handleDeleteCostTransaction = (id: string) => {
    setCostTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const handleToggleCostStatus = (id: string) => {
    setCostTransactions((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        let nextStatus: string = 'Paid';
        if (t.status === 'Paid') nextStatus = 'Partially Paid';
        else if (t.status === 'Partially Paid') nextStatus = 'Unpaid';
        else nextStatus = 'Paid';
        return { ...t, status: nextStatus, tag: nextStatus };
      })
    );
  };

  const handleUpdateCostTransaction = (updatedTx: PurchaseTransaction) => {
    setCostTransactions((prev) =>
      prev.map((t) => (t.id === updatedTx.id ? updatedTx : t))
    );
  };

  // App data state - starts with empty tasks to match screenshot exactly
  const [tasks, setTasks] = useState<TaskItem[]>([]);

  const [isCalendarConnected, setIsCalendarConnected] = useState(false);
  const sampleEvents: CalendarEvent[] = [
    {
      id: 'e1',
      title: 'Design Review & Planning',
      time: '10:00 AM - 11:00 AM',
      duration: '1 hr',
      location: 'Conference Room B',
    },
    {
      id: 'e2',
      title: 'Product Strategy Sync',
      time: '2:30 PM - 3:15 PM',
      duration: '45m',
      location: 'Online Meeting',
    },
  ];
  const handleAddTask = (title: string, dueDate?: string, project?: string) => {
    const newTask: TaskItem = {
      id: Date.now().toString(),
      title,
      completed: false,
      dueDate,
      project,
      createdAt: new Date().toISOString(),
    };
    setTasks((prev) => [newTask, ...prev]);
  };
  const handleToggleTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              completed: !t.completed,
              completedAt: !t.completed ? new Date().toISOString() : undefined,
            }
          : t
      )
    );
  };
  const handleDeleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };
  return (
    <div className="flex h-screen w-screen bg-[#F2F2F2] text-neutral-900 overflow-hidden select-none">
      {/* Left Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenNewTask={() => setIsNewTaskOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenFeedback={() => setIsFeedbackOpen(true)}
        onOpenPurchase={() => setIsPurchaseOpen(true)}
        onOpenLinear={() => setIsLinearOpen(true)}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      {/* Main Content Area */}
      <div className={`flex-1 py-[5px] pr-[5px] flex flex-col min-w-0 transition-all duration-300 ease-in-out ${sidebarCollapsed ? 'pl-[5px]' : 'pl-0'}`}>
        <main className="flex-1 bg-[#F9F9F9] rounded-[22px] border border-neutral-200/70 shadow-sm overflow-y-auto relative">
          {sidebarCollapsed && (
            <button
              onClick={() => setSidebarCollapsed(false)}
              className="absolute top-4 left-4 z-50 p-1.5 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/50 rounded-md transition-colors cursor-pointer bg-[#F2F2F2] shadow-sm border border-neutral-200"
              title="Expand sidebar"
            >
              <PanelLeft size={15.5} strokeWidth={1.75} />
            </button>
          )}
        {currentTab === 'overview' && <OverviewView />}
        {currentTab === 'purchase' && (
          <PurchaseView
            transactions={purchaseTransactions}
            onAddTransaction={handleAddPurchaseTransaction}
            onDeleteTransaction={handleDeletePurchaseTransaction}
            onToggleTransactionStatus={handleTogglePurchaseStatus}
            onUpdateTransaction={handleUpdatePurchaseTransaction}
            onNavigateTab={setCurrentTab}
          />
        )}
        {currentTab === 'sales' && (
          <SalesView
            transactions={salesTransactions}
            onAddTransaction={handleAddSalesTransaction}
            onDeleteTransaction={handleDeleteSalesTransaction}
            onToggleTransactionStatus={handleToggleSalesStatus}
            onUpdateTransaction={handleUpdateSalesTransaction}
            onNavigateTab={setCurrentTab}
          />
        )}
        {currentTab === 'cost' && (
          <CostView
            transactions={costTransactions}
            onAddTransaction={handleAddCostTransaction}
            onDeleteTransaction={handleDeleteCostTransaction}
            onToggleTransactionStatus={handleToggleCostStatus}
            onUpdateTransaction={handleUpdateCostTransaction}
            onNavigateTab={setCurrentTab}
          />
        )}
        {currentTab === 'accounting' && <AccountingView />}
        {currentTab === 'profit-loss' && <ProfitLossView />}
          {currentTab === 'balance-sheet' && <BalanceSheetView />}
          {currentTab === 'cash-flow' && <CashFlowView />}
        </main>
      </div>
      {/* Modals & Dialogs */}
      <NewTaskModal
        isOpen={isNewTaskOpen}
        onClose={() => setIsNewTaskOpen(false)}
        onAddTask={handleAddTask}
      />
      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
      />
      <PurchaseModal
        isOpen={isPurchaseOpen}
        onClose={() => setIsPurchaseOpen(false)}
      />
      <LinearModal
        isOpen={isLinearOpen}
        onClose={() => setIsLinearOpen(false)}
      />
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        tasks={tasks}
        events={sampleEvents}
        onToggleTask={handleToggleTask}
      />
    </div>
  );
}
