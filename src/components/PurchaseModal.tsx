import { useState } from 'react';
import { X, Check, Zap } from 'lucide-react';

interface PurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PurchaseModal({ isOpen, onClose }: PurchaseModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');
  const [purchased, setPurchased] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-[2px] p-4 font-sans">
      <div className="bg-white rounded-2xl shadow-2xl border border-neutral-200/90 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150 p-6">
        <div className="flex items-center justify-between pb-3">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-[#00e5ff] via-[#00b4d8] to-[#0077b6] shadow-sm" />
            <h3 className="text-[16px] font-bold text-neutral-900">Purchase Koffi Pro</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
          >
            <X size={14.5} />
          </button>
        </div>

        {purchased ? (
          <div className="py-8 text-center space-y-2">
            <div className="w-12 h-12 mx-auto rounded-full bg-sky-100 text-sky-600 flex items-center justify-center">
              <Zap size={23.5} />
            </div>
            <h4 className="text-[16px] font-semibold text-neutral-900">Welcome to Koffi Pro!</h4>
            <p className="text-[16px] text-neutral-500">Your pro subscription is now active on your account.</p>
            <button
              onClick={onClose}
              className="mt-4 px-4 py-2 rounded-xl bg-black text-white text-[16px] font-medium cursor-pointer"
            >
              Continue to Koffi
            </button>
          </div>
        ) : (
          <div className="space-y-4 pt-2">
            <p className="text-[16px] text-neutral-500 leading-relaxed">
              Unlock unlimited calendars, bidirectional Linear sync, automated scheduling assistant, and custom projects.
            </p>

            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <button
                onClick={() => setSelectedPlan('yearly')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  selectedPlan === 'yearly'
                    ? 'border-neutral-900 bg-neutral-50 ring-1 ring-neutral-900'
                    : 'border-neutral-200 hover:border-neutral-300'
                }`}
              >
                <div className="text-[15px] font-semibold text-sky-600 uppercase">Save 30%</div>
                <div className="text-[15px] font-bold text-neutral-900 mt-0.5">$8 <span className="text-[16px] font-normal text-neutral-500">/mo</span></div>
                <div className="text-[15px] text-neutral-400">Billed annually</div>
              </button>

              <button
                onClick={() => setSelectedPlan('monthly')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  selectedPlan === 'monthly'
                    ? 'border-neutral-900 bg-neutral-50 ring-1 ring-neutral-900'
                    : 'border-neutral-200 hover:border-neutral-300'
                }`}
              >
                <div className="text-[15px] font-semibold text-neutral-400 uppercase">Monthly</div>
                <div className="text-[15px] font-bold text-neutral-900 mt-0.5">$12 <span className="text-[16px] font-normal text-neutral-500">/mo</span></div>
                <div className="text-[15px] text-neutral-400">Billed monthly</div>
              </button>
            </div>

            <div className="space-y-2 pt-1 text-[16px] text-neutral-600">
              <div className="flex items-center gap-2">
                <Check size={13.5} className="text-emerald-500 shrink-0" />
                <span>Unlimited Apple & Google calendar connections</span>
              </div>
              <div className="flex items-center gap-2">
                <Check size={13.5} className="text-emerald-500 shrink-0" />
                <span>Full two-way Linear issue sync</span>
              </div>
              <div className="flex items-center gap-2">
                <Check size={13.5} className="text-emerald-500 shrink-0" />
                <span>Focus timer and task time-blocking</span>
              </div>
            </div>

            <button
              onClick={() => setPurchased(true)}
              className="w-full py-2.5 rounded-xl bg-black hover:bg-neutral-800 text-white text-[16px] font-medium transition-colors cursor-pointer shadow-sm mt-3"
            >
              Upgrade to Pro
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
