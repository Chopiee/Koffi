import { useState } from 'react';
import { Sliders, Bell, Shield, Palette } from 'lucide-react';

export function ProfitLossView() {
  const [syncNotifications, setSyncNotifications] = useState(true);
  const [calendarSync, setCalendarSync] = useState(true);
  const [hapticFeedback, setHapticFeedback] = useState(true);

  return (
    <div className="w-full max-w-[700px] mx-auto pt-10 md:pt-14 pb-20 px-6 font-sans">
      <h1 className="text-[22px] font-bold text-neutral-900 tracking-tight mb-6">Profit & Loss</h1>

      <div className="border border-neutral-200/80 rounded-2xl p-6 bg-white space-y-6">
        <div>
          <h3 className="text-[15px] font-semibold text-neutral-800 uppercase tracking-wider mb-3">
            General Preferences
          </h3>
          <div className="space-y-4 text-[16px]">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-neutral-800">Calendar Background Sync</div>
                <div className="text-neutral-400">Keep Apple Calendar events auto-refreshed</div>
              </div>
              <input
                type="checkbox"
                checked={calendarSync}
                onChange={(e) => setCalendarSync(e.target.checked)}
                className="w-4 h-4 rounded accent-black cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-neutral-800">Task Notifications</div>
                <div className="text-neutral-400">Reminders for scheduled deadlines</div>
              </div>
              <input
                type="checkbox"
                checked={syncNotifications}
                onChange={(e) => setSyncNotifications(e.target.checked)}
                className="w-4 h-4 rounded accent-black cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-neutral-800">Sound & Haptics</div>
                <div className="text-neutral-400">Subtle sound on task completion</div>
              </div>
              <input
                type="checkbox"
                checked={hapticFeedback}
                onChange={(e) => setHapticFeedback(e.target.checked)}
                className="w-4 h-4 rounded accent-black cursor-pointer"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-neutral-100">
          <h3 className="text-[15px] font-semibold text-neutral-800 uppercase tracking-wider mb-2">
            App Information
          </h3>
          <div className="text-[16px] text-neutral-500 space-y-1">
            <div>Koffi for Web v1.4.2</div>
            <div className="text-neutral-400">Connected account: Choppie (Personal)</div>
          </div>
        </div>
      </div>
    </div>
  );
}
