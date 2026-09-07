import { LayoutGrid } from 'lucide-react';

export function OverviewView() {
  return (
    <div className="w-full max-w-[1000px] mx-auto pt-10 md:pt-14 pb-20 px-6 md:px-8 font-sans">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-[22px] font-bold text-neutral-900 tracking-tight">Overview</h1>
      </div>
      <div className="border border-neutral-200/80 rounded-2xl p-5 bg-white space-y-4">
        <div className="flex items-center gap-3">
          <LayoutGrid size={24} className="text-neutral-400" />
          <p className="text-[15px] text-neutral-600">Welcome to your overview dashboard.</p>
        </div>
      </div>
    </div>
  );
}
