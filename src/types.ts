export type SidebarTab = 'overview' | 'purchase' | 'sales' | 'cost' | 'accounting' | 'profit-loss' | 'balance-sheet' | 'cash-flow';
export type FilterTab = 'overview' | 'schedule' | 'tasks' | 'done_today';

export interface TaskItem {
  id: string;
  title: string;
  completed: boolean;
  completedAt?: string;
  dueDate?: string;
  priority?: 'low' | 'medium' | 'high';
  project?: string;
  createdAt: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  time: string;
  duration?: string;
  location?: string;
  calendarName?: string;
  color?: string;
}

export interface PurchaseItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  discountPercent?: number;
  discountAmount?: number;
  taxPercent?: number;
  taxAmount?: number;
  subtotal?: number;
  total: number;
  category?: string;
}

export interface PurchaseTransaction {
  id: string;
  invoiceNo: string;
  date: string;
  deadline?: string;
  description: string;
  supplier: string;
  connection?: 'Booking' | 'Airbnb' | 'Guesty' | 'N/A' | string;
  tag?: string;
  guestName?: string;
  nights?: number;
  category: 'Inventory' | 'Equipment' | 'Raw Material' | 'Office' | 'Utilities' | 'Services' | string;
  amount: number;
  subtotal?: number;
  totalDiscount?: number;
  totalTax?: number;
  status: 'Paid' | 'Unpaid' | 'Partially Paid' | 'Pending' | 'Cancelled' | string;
  paymentMethod: string;
  dueDate?: string;
  notes?: string;
  items?: PurchaseItem[];
  attachments?: { id: string; name: string; size: string; type: string }[];
  createdAt: string;
}

export interface JournalTransaction {
  id: string;
  journalNo: string;
  referenceNo: string;
  account?: string;
  debitAccount: string;
  creditAccount: string;
  description: string;
  date: string;
  debit: number;
  credit: number;
  status: 'Posted' | 'Draft' | 'Approved' | string;
  category?: string;
  createdAt: string;
}
