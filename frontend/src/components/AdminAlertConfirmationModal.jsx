import { AlertTriangle, Send, X } from 'lucide-react';

export default function AdminAlertConfirmationModal({ isOpen, onClose, onConfirm, recipientCount }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="max-w-md w-full bg-slate-900 border-2 border-red-600 rounded-3xl p-6 space-y-5 shadow-2xl text-white">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-red-500">
            <AlertTriangle className="w-5 h-5 animate-pulse" />
            <h3 className="font-extrabold text-base uppercase">CONFIRM DISPATCH</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm font-semibold leading-relaxed text-slate-200">
          Send CRITICAL emergency alert to <strong className="text-red-400 text-base">{recipientCount || 143} people</strong> in the affected danger zone via SMS, Voice IVR, App Push, & Local Gateway?
        </p>

        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-red-600/40 transition-all flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            <span>[ CONFIRM SEND ]</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs uppercase transition-all border border-slate-700"
          >
            CANCEL
          </button>
        </div>
      </div>
    </div>
  );
}
