import { useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Plus,
  AlertCircle,
  CheckCircle2,
  Circle,
  Calendar as CalendarIconLucide,
  Trash2,
} from 'lucide-react';
import { CalendarIcon } from './CalendarIcon';
import { FilterTab, TaskItem, CalendarEvent } from '../types';

interface PurchaseViewProps {
  tasks: TaskItem[];
  calendarEvents: CalendarEvent[];
  isCalendarConnected: boolean;
  onConnectCalendar: () => void;
  onDisconnectCalendar: () => void;
  onToggleTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onOpenNewTask: () => void;
}

export function PurchaseView({
  tasks,
  calendarEvents,
  isCalendarConnected,
  onConnectCalendar,
  onDisconnectCalendar,
  onToggleTask,
  onDeleteTask,
  onOpenNewTask,
}: PurchaseViewProps) {
  return (
    <div className="w-full max-w-[700px] mx-auto pt-10 md:pt-14 pb-20 px-6 font-sans">
      {/* Title */}
      <h1 className="text-[22px] font-bold text-neutral-900 tracking-tight mb-4">
        Today
      </h1>
    </div>
  );
}
