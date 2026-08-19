export type SidebarTab = 'purchase' | 'sales' | 'cost' | 'accounting' | 'profit-loss' | 'balance-sheet' | 'cash-flow';
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
