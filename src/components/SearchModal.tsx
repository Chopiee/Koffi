import { useState, useEffect, useRef } from 'react';
import { Search, X, CheckCircle2, Circle } from 'lucide-react';
import { TaskItem, CalendarEvent } from '../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: TaskItem[];
  events: CalendarEvent[];
  onToggleTask: (id: string) => void;
}

export function SearchModal({
  isOpen,
  onClose,
  tasks,
  events,
  onToggleTask,
}: SearchModalProps) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredTasks = query.trim()
    ? tasks.filter((t) => t.title.toLowerCase().includes(query.toLowerCase()))
    : [];

  const filteredEvents = query.trim()
    ? events.filter((e) => e.title.toLowerCase().includes(query.toLowerCase()))
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-black/25 backdrop-blur-[2px] p-4 font-sans">
      <div className="bg-white rounded-2xl shadow-2xl border border-neutral-200/90 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center gap-2.5 px-4 py-3 border-b border-neutral-100">
          <Search size={15.5} className="text-neutral-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tasks, events, and projects..."
            className="w-full text-[15px] outline-none text-neutral-800 placeholder:text-neutral-400"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
          >
            <X size={14.5} />
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto p-2">
          {query.trim() === '' ? (
            <div className="py-6 text-center text-[16px] text-neutral-400">
              Type something to search across your workspace
            </div>
          ) : filteredTasks.length === 0 && filteredEvents.length === 0 ? (
            <div className="py-6 text-center text-[16px] text-neutral-400">
              No results found for "{query}"
            </div>
          ) : (
            <div className="space-y-2">
              {filteredTasks.length > 0 && (
                <div>
                  <div className="px-2 py-1 text-[15px] font-medium text-neutral-400 uppercase">
                    Tasks
                  </div>
                  {filteredTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-neutral-100/70 text-[16px]"
                    >
                      <div className="flex items-center gap-2">
                        <button onClick={() => onToggleTask(task.id)} className="cursor-pointer">
                          {task.completed ? (
                            <CheckCircle2 size={13.5} className="text-emerald-500" />
                          ) : (
                            <Circle size={13.5} className="text-neutral-400" />
                          )}
                        </button>
                        <span className={task.completed ? 'line-through text-neutral-400' : 'text-neutral-800'}>
                          {task.title}
                        </span>
                      </div>
                      {task.dueDate && <span className="text-neutral-400 text-[16px]">{task.dueDate}</span>}
                    </div>
                  ))}
                </div>
              )}

              {filteredEvents.length > 0 && (
                <div>
                  <div className="px-2 py-1 text-[15px] font-medium text-neutral-400 uppercase">
                    Schedule Events
                  </div>
                  {filteredEvents.map((evt) => (
                    <div
                      key={evt.id}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-neutral-100/70 text-[16px]"
                    >
                      <span className="text-neutral-800">{evt.title}</span>
                      <span className="text-neutral-400 text-[16px]">{evt.time}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
