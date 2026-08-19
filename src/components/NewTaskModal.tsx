import { useState, useEffect, useRef } from 'react';
import { X, Calendar, Tag, CornerDownLeft } from 'lucide-react';

interface NewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTask: (title: string, dueDate?: string, project?: string) => void;
}

export function NewTaskModal({ isOpen, onClose, onAddTask }: NewTaskModalProps) {
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [project, setProject] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setTitle('');
      setDueDate('');
      setProject('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: import('react').FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAddTask(title.trim(), dueDate || undefined, project || undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-black/25 backdrop-blur-[2px] p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-neutral-200/90 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150 font-sans">
        <div className="flex items-center justify-between px-4 pt-3 pb-2 border-b border-neutral-100">
          <span className="text-[15px] font-semibold text-neutral-800">New Task</span>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
          >
            <X size={14.5} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <input
            ref={inputRef}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What would you like to get done?"
            className="w-full text-[16px] text-neutral-900 placeholder:text-neutral-400 outline-none border-b border-neutral-200/70 pb-2 focus:border-neutral-800 transition-colors"
          />

          <div className="flex items-center gap-3 text-[16px]">
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-neutral-100/80 text-neutral-600">
              <Calendar size={12.5} className="text-neutral-500" />
              <input
                type="text"
                placeholder="Due date (e.g. Today)"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="bg-transparent text-[16px] text-neutral-800 placeholder:text-neutral-400 outline-none w-28"
              />
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-neutral-100/80 text-neutral-600">
              <Tag size={12.5} className="text-neutral-500" />
              <input
                type="text"
                placeholder="Project / Tag"
                value={project}
                onChange={(e) => setProject(e.target.value)}
                className="bg-transparent text-[16px] text-neutral-800 placeholder:text-neutral-400 outline-none w-24"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-neutral-100 text-[16px]">
            <span className="text-neutral-400">Press Enter to save</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 rounded-lg text-neutral-600 hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!title.trim()}
                className="px-3.5 py-1.5 rounded-lg bg-black hover:bg-neutral-800 disabled:opacity-40 text-white font-medium flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
              >
                <span>Create task</span>
                <CornerDownLeft size={11.5} />
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
