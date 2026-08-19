import { useState } from 'react';
import { X, Send, Check } from 'lucide-react';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: import('react').FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) return;
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFeedback('');
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 backdrop-blur-[2px] p-4 font-sans">
      <div className="bg-white rounded-2xl shadow-2xl border border-neutral-200/90 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150 p-5">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
          <h3 className="text-[16px] font-semibold text-neutral-900">Share Feedback</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
          >
            <X size={14.5} />
          </button>
        </div>

        {submitted ? (
          <div className="py-8 flex flex-col items-center justify-center text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Check size={19.5} />
            </div>
            <p className="text-[16px] font-medium text-neutral-800">Thank you for your feedback!</p>
            <p className="text-[16px] text-neutral-500">We appreciate your thoughts in making Koffi better.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="pt-4 space-y-3">
            <p className="text-[16px] text-neutral-500">
              Tell us what you love or what we can improve in Koffi.
            </p>
            <textarea
              rows={4}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Your feedback or suggestions..."
              className="w-full text-[15px] p-3 rounded-xl border border-neutral-200 focus:border-neutral-800 outline-none resize-none transition-colors"
              autoFocus
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 rounded-lg text-[16px] text-neutral-600 hover:bg-neutral-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!feedback.trim()}
                className="px-3.5 py-1.5 rounded-lg bg-black hover:bg-neutral-800 disabled:opacity-40 text-white text-[16px] font-medium flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <span>Send</span>
                <Send size={11.5} />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
