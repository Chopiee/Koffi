import { useState } from 'react';
import { Plus, CheckCircle2, Circle, Trash2, AlertCircle } from 'lucide-react';
import { TaskItem } from '../types';

interface SalesViewProps {
  tasks: TaskItem[];
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
}

export function SalesView({
  tasks,
  onToggleTask,
  onDeleteTask,
}: SalesViewProps) {
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'pending') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  return (
    <div className="w-full max-w-[700px] mx-auto pt-10 md:pt-14 pb-20 px-6 font-sans">
      <h1 className="text-[22px] font-bold text-neutral-900 tracking-tight mb-4">Sales</h1>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-1 text-[15px]">
          <button
            onClick={() => setFilter('all')}
            className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
              filter === 'all'
                ? 'bg-[#f4f4f5] text-neutral-900 font-medium border border-neutral-200/60'
                : 'text-neutral-500 hover:text-neutral-900 font-normal'
            }`}
          >
            All ({tasks.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
              filter === 'pending'
                ? 'bg-[#f4f4f5] text-neutral-900 font-medium border border-neutral-200/60'
                : 'text-neutral-500 hover:text-neutral-900 font-normal'
            }`}
          >
            To-do ({tasks.filter((t) => !t.completed).length})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
              filter === 'completed'
                ? 'bg-[#f4f4f5] text-neutral-900 font-medium border border-neutral-200/60'
                : 'text-neutral-500 hover:text-neutral-900 font-normal'
            }`}
          >
            Completed ({tasks.filter((t) => t.completed).length})
          </button>
        </div>
      </div>

      <div className="border border-neutral-200/80 rounded-2xl p-5 bg-white shadow-2xs">
        {filteredTasks.length === 0 ? (
          <div className="flex items-center gap-2 text-neutral-500 select-none py-2">
            <AlertCircle size={13.5} strokeWidth={1.5} className="text-neutral-400" />
            <span className="text-[15px]">No tasks found in this view</span>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredTasks.map((task) => (
              <div
                key={task.id}
                className="group flex items-center justify-between p-2.5 rounded-xl hover:bg-neutral-50 border border-transparent hover:border-neutral-200/50 transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    onClick={() => onToggleTask(task.id)}
                    className="text-neutral-400 hover:text-neutral-800 cursor-pointer shrink-0"
                  >
                    {task.completed ? (
                      <CheckCircle2 size={15.5} className="text-emerald-600 fill-emerald-50" />
                    ) : (
                      <Circle size={15.5} />
                    )}
                  </button>
                  <span
                    className={`text-[15px] truncate ${
                      task.completed ? 'line-through text-neutral-400' : 'text-neutral-800'
                    }`}
                  >
                    {task.title}
                  </span>
                  {task.project && (
                    <span className="text-[15px] text-neutral-400 px-1.5 py-0.5 rounded bg-neutral-100 shrink-0">
                      {task.project}
                    </span>
                  )}
                  {task.dueDate && (
                    <span className="text-[15px] text-neutral-400 shrink-0">
                      Due {task.dueDate}
                    </span>
                  )}
                </div>

                <button
                  onClick={() => onDeleteTask(task.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-neutral-400 hover:text-red-500 rounded transition-all cursor-pointer"
                >
                  <Trash2 size={12.5} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
