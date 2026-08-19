interface CalendarIconProps {
  size?: 'normal' | 'mini' | 'sidebar';
  dayName?: string;
  dayNumber?: string | number;
}

export function CalendarIcon({
  size = 'normal',
  dayName = 'Tue',
  dayNumber = '1',
}: CalendarIconProps) {
  if (size === 'sidebar') {
    return (
      <div className="w-4 h-4 rounded-[3px] border border-neutral-700/80 bg-transparent flex flex-col items-center justify-between p-[1px] text-neutral-900 shrink-0">
        <div className="w-full h-[3px] bg-neutral-800 rounded-t-[1px]" />
        <span className="text-[6px] font-bold leading-none text-neutral-900 pb-[1px]">18</span>
      </div>
    );
  }

  if (size === 'mini') {
    return (
      <div className="w-4 h-4 rounded-[3.5px] bg-white flex flex-col items-center justify-between shadow-xs overflow-hidden shrink-0">
        <div className="w-full h-[4.5px] bg-[#ff3b30] flex items-center justify-center">
          <span className="text-[3px] font-bold text-white leading-none scale-75">TUE</span>
        </div>
        <span className="text-[6.5px] font-bold text-neutral-900 leading-none pb-[1.5px]">1</span>
      </div>
    );
  }

  return (
    <div className="w-10 h-10 rounded-xl border border-[#e5e5e7] bg-white flex flex-col items-center justify-between p-1 shadow-[0_1px_2px_rgba(0,0,0,0.04)] select-none">
      <div className="text-[7.5px] font-semibold text-[#ff3b30] tracking-tight leading-tight pt-0.5">
        {dayName}
      </div>
      <div className="text-[15px] font-semibold text-neutral-900 leading-none pb-0.5">
        {dayNumber}
      </div>
    </div>
  );
}
