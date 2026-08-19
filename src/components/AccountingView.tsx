import { useState } from 'react';
import { Plus, Folder, Pin, Sparkles } from 'lucide-react';

export function AccountingView() {
  const [projects, setProjects] = useState([
    { id: '1', name: 'Design System', tasksCount: 4, pinned: false, color: '#3b82f6' },
    { id: '2', name: 'Marketing Campaign', tasksCount: 2, pinned: false, color: '#10b981' },
    { id: '3', name: 'Mobile App', tasksCount: 6, pinned: false, color: '#8b5cf6' },
  ]);
  const [newProjectName, setNewProjectName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    setProjects([
      ...projects,
      {
        id: Date.now().toString(),
        name: newProjectName.trim(),
        tasksCount: 0,
        pinned: false,
        color: '#6366f1',
      },
    ]);
    setNewProjectName('');
    setIsCreating(false);
  };

  const togglePin = (id: string) => {
    setProjects(
      projects.map((p) => (p.id === id ? { ...p, pinned: !p.pinned } : p))
    );
  };

  return (
    <div className="w-full max-w-[700px] mx-auto pt-10 md:pt-14 pb-20 px-6 font-sans">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-[22px] font-bold text-neutral-900 tracking-tight">Accounting</h1>
        <button
          onClick={() => setIsCreating(true)}
          className="text-[15px] text-neutral-800 hover:text-neutral-950 font-normal flex items-center gap-1 cursor-pointer"
        >
          <Plus size={13.5} strokeWidth={2} />
          <span>New project</span>
        </button>
      </div>

      {isCreating && (
        <form
          onSubmit={handleAddProject}
          className="mb-4 p-3 rounded-xl border border-neutral-200 bg-neutral-50 flex items-center gap-2"
        >
          <input
            type="text"
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            placeholder="Project name..."
            className="flex-1 text-[16px] bg-transparent outline-none text-neutral-800"
            autoFocus
          />
          <button
            type="submit"
            className="px-3 py-1 rounded-lg bg-black text-white text-[16px] font-medium cursor-pointer"
          >
            Add
          </button>
          <button
            type="button"
            onClick={() => setIsCreating(false)}
            className="px-2 py-1 text-[16px] text-neutral-500 hover:text-neutral-700 cursor-pointer"
          >
            Cancel
          </button>
        </form>
      )}

      <div className="border border-neutral-200/80 rounded-2xl p-5 bg-white space-y-2">
        {projects.map((proj) => (
          <div
            key={proj.id}
            className="flex items-center justify-between p-3 rounded-xl hover:bg-neutral-50 border border-transparent hover:border-neutral-200/50 transition-all"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: proj.color }}
              />
              <span className="text-[15px] font-medium text-neutral-800">{proj.name}</span>
              <span className="text-[15px] text-neutral-400">{proj.tasksCount} tasks</span>
            </div>
            <button
              onClick={() => togglePin(proj.id)}
              className={`p-1 rounded transition-colors cursor-pointer ${
                proj.pinned ? 'text-neutral-800' : 'text-neutral-300 hover:text-neutral-600'
              }`}
              title={proj.pinned ? 'Unpin' : 'Pin to favorites'}
            >
              <Pin size={13.5} className={proj.pinned ? '-rotate-45 fill-neutral-800' : '-rotate-45'} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
