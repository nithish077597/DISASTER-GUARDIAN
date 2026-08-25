import { X, CheckCircle2, ShieldAlert, MapPin, CloudRain, ShieldCheck, XCircle, HelpCircle } from 'lucide-react';
import { useState } from 'react';

export default function AdminReportDetailModal({ report, isOpen, onClose, onVerify, onReject }) {
  const [statusText, setStatusText] = useState(report?.status || 'UNDER REVIEW');

  if (!isOpen || !report) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md select-none">
      <div className="max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5 shadow-2xl text-white max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <span className="text-xs font-bold text-cyan-400 font-mono">INCIDENT REPORT #{report.id || 1042}</span>
            <h3 className="text-lg font-black text-white">{report.title || 'Landslide Incident Report'}</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Photo & Location */}
          <div className="space-y-3">
            {report.photo ? (
              <div className="h-44 rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 relative">
                <img src={report.photo} alt="Report evidence" className="w-full h-full object-cover" />
                <span className="absolute bottom-2 left-2 px-2 py-1 rounded bg-slate-950/80 text-[10px] font-mono text-emerald-400 font-bold border border-emerald-500/40">
                  ???? Photo Attachment Verified
                </span>
              </div>
            ) : (
              <div className="h-44 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-xs text-slate-500">
                No Photo Provided
              </div>
            )}

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-xs">
              <span className="text-slate-400 font-bold block uppercase">Incident Location</span>
              <span className="text-white font-medium flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-red-400" />
                {report.location_name || 'Kallar Valley Region'} ({report.lat || 28.621}, {report.lng || 77.214})
              </span>
            </div>
          </div>

          {/* AI Evidence & Weather Context */}
          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-bold uppercase">AI Verification Pipeline</span>
                <span className="font-mono text-cyan-300 font-extrabold">{report.confidence_score || 87}% Confidence</span>
              </div>
              <p className="text-[11px] text-emerald-400 font-semibold uppercase">Status: {statusText}</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-xs">
              <span className="text-slate-400 font-bold uppercase flex items-center gap-1">
                <CloudRain className="w-3.5 h-3.5 text-cyan-400" /> Weather Context at Report Time
              </span>
              <p className="text-slate-200">Rainfall: 142 mm/24h ??? Soil Saturation: 87% ??? Slope: 38??</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-xs">
              <span className="text-slate-400 font-bold uppercase">Description</span>
              <p className="text-slate-300 leading-snug">{report.description || 'Cracks appeared near road. Slope slippage detected.'}</p>
            </div>
          </div>
        </div>

        {/* Audit Actions */}
        <div className="flex items-center gap-3 pt-3 border-t border-slate-800">
          <button
            onClick={() => {
              setStatusText('VERIFIED');
              if (onVerify) onVerify(report.id);
            }}
            className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>[ VERIFY INCIDENT ]</span>
          </button>

          <button
            onClick={() => {
              setStatusText('UNDER REVIEW');
            }}
            className="flex-1 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2"
          >
            <HelpCircle className="w-4 h-4" />
            <span>[ REQUEST REVIEW ]</span>
          </button>

          <button
            onClick={() => {
              setStatusText('REJECTED');
              if (onReject) onReject(report.id);
            }}
            className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs uppercase tracking-wider border border-slate-700 flex items-center justify-center gap-1.5"
          >
            <XCircle className="w-4 h-4 text-rose-400" />
            <span>[ REJECT ]</span>
          </button>
        </div>
      </div>
    </div>
  );
}
