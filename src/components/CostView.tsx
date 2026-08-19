import { CalendarIcon } from './CalendarIcon';
import { CalendarEvent } from '../types';
import { Calendar as CalendarIconLucide, Clock, Plus } from 'lucide-react';

interface CostViewProps {
  events: CalendarEvent[];
  isCalendarConnected: boolean;
  onConnectCalendar: () => void;
}

export function CostView({
  events,
  isCalendarConnected,
  onConnectCalendar,
}: CostViewProps) {
  const days = [
    { dayName: 'Mon', dayNumber: '17', isToday: false },
    { dayName: 'Tue', dayNumber: '18', isToday: true },
    { dayName: 'Wed', dayNumber: '19', isToday: false },
    { dayName: 'Thu', dayNumber: '20', isToday: false },
    { dayName: 'Fri', dayNumber: '21', isToday: false },
  ];

  return (
    <div className="w-full max-w-[700px] mx-auto pt-10 md:pt-14 pb-20 px-6 font-sans">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-[22px] font-bold text-neutral-900 tracking-tight">Partners</h1>
        <button
          onClick={onConnectCalendar}
          className="text-[16px] px-3 py-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-50 text-neutral-700 font-medium cursor-pointer"
        >
          {isCalendarConnected ? 'Manage Calendar' : 'Connect Calendar'}
        </button>
      </div>

      {/* Week mini bar */}
      <div className="grid grid-cols-5 gap-2 mb-6">
        {days.map((d) => (
          <div
            key={d.dayNumber}
            className={`p-2.5 rounded-xl border text-center transition-all ${
              d.isToday
                ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs'
                : 'bg-white text-neutral-600 border-neutral-200/80 hover:border-neutral-300'
            }`}
          >
            <div className={`text-[16px] font-medium ${d.isToday ? 'text-neutral-300' : 'text-neutral-400'}`}>
              {d.dayName}
            </div>
            <div className="text-[16px] font-bold mt-0.5">{d.dayNumber}</div>
          </div>
        ))}
      </div>

      {!isCalendarConnected ? (
        <div className="border border-neutral-200/80 rounded-2xl p-6 bg-white shadow-2xs">
          <div className="mb-4">
            <CalendarIcon size="normal" dayName="Tue" dayNumber="1" />
          </div>
          <h3 className="font-semibold text-neutral-900 text-[16px] mb-1.5">
            Grant access to Apple Calendar
          </h3>
          <p className="text-[15px] text-neutral-500 leading-relaxed max-w-lg mb-4">
            Allowing Apple calendar access lets Koffi bring your schedule and tasks into one focused view.
          </p>
          <button
            onClick={onConnectCalendar}
            className="bg-black hover:bg-neutral-800 text-white rounded-full px-3.5 py-1.5 flex items-center gap-2 text-[16px] font-medium shadow-xs transition-all cursor-pointer"
          >
            <CalendarIcon size="mini" dayName="Tue" dayNumber="1" />
            <span>Grant access to Apple Calendar</span>
          </button>
        </div>
      ) : (
        <div className="border border-neutral-200/80 rounded-2xl p-5 bg-white space-y-3">
          <div className="text-[15px] font-semibold text-neutral-800 pb-1">
            Today's Timeline (Tue, Aug 18)
          </div>
          <div className="space-y-2">
            {events.map((evt) => (
              <div
                key={evt.id}
                className="flex items-start gap-3 p-3 rounded-xl bg-neutral-50 border border-neutral-100"
              >
                <div className="text-[15px] font-medium text-neutral-500 w-16 shrink-0 pt-0.5">
                  {evt.time}
                </div>
                <div className="flex-1">
                  <div className="text-[15px] font-semibold text-neutral-900">{evt.title}</div>
                  {evt.duration && (
                    <div className="text-[15px] text-neutral-400 flex items-center gap-1 mt-0.5">
                      <Clock size={10.5} />
                      <span>{evt.duration}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
