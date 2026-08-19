import { useState } from 'react';
import { X, Check, ArrowRight } from 'lucide-react';

interface LinearModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnected?: () => void;
}

export function LinearModal({ isOpen, onClose, onConnected }: LinearModalProps) {
  const [apiKey, setApiKey] = useState('');
  const [connected, setConnected] = useState(false);

  if (!isOpen) return null;

  const handleConnect = (e: import('react').FormEvent) => {
    e.preventDefault();
    setConnected(true);
    if (onConnected) onConnected();
    setTimeout(() => {
      setConnected(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-[2px] p-4 font-sans">
      <div className="bg-white rounded-2xl shadow-2xl border border-neutral-200/90 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150 p-6">
        <div className="flex items-center justify-between pb-3">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-[#5E6AD2] flex items-center justify-center text-white text-[7px] font-bold">
              <div className="w-2 h-2 border-t border-l border-white rounded-tl-[2px] transform -rotate-45" />
            </div>
            <h3 className="text-[15px] font-bold text-neutral-900">Connect Linear</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
          >
            <X size={14.5} />
          </button>
        </div>

        {connected ? (
          <div className="py-8 text-center space-y-2">
            <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <Check size={23.5} />
            </div>
            <h4 className="text-[15px] font-semibold text-neutral-900">Linear Workspace Connected</h4>
            <p className="text-[16px] text-neutral-500">Your assigned issues will now seamlessly show up in Koffi.</p>
          </div>
        ) : (
          <form onSubmit={handleConnect} className="space-y-4 pt-2">
            <p className="text-[16px] text-neutral-500 leading-relaxed">
              Sync your assigned Linear issues directly into Koffi's daily workspace to prioritize and plan your day.
            </p>

            <div>
              <label className="text-[15px] font-medium text-neutral-700 block mb-1">
                Linear Workspace / API Key
              </label>
              <input
                type="text"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="lin_api_key_... or click Connect with OAuth"
                className="w-full text-[16px] p-2.5 rounded-xl border border-neutral-200 focus:border-neutral-800 outline-none transition-colors"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 rounded-lg text-[16px] text-neutral-600 hover:bg-neutral-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#5E6AD2] hover:bg-[#4d5ac7] text-white text-[16px] font-medium flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
              >
                <span>Authorize Linear</span>
                <ArrowRight size={11.5} />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
