import { useState } from 'react';
import { Sparkles, CheckCircle2, ShieldCheck, HelpCircle, XCircle } from 'lucide-react';
import { useRealtime } from '../context/RealtimeContext';

export default function AIReportVerification() {
  const { incidents } = useRealtime();
  const targetReport = incidents[0] || {};
  const [verificationStatus, setVerificationStatus] = useState('HIGH CONFIDENCE');

  const evidence = [
    'Heavy rainfall (>68 mm/h)',
    'High soil moisture (82%)',
    'Steep terrain (34?? slope)',
    'Historical risk zone (Zone 4)',
    'Nearby verified reports (3)',
  ];

  return (
    <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-6 text-white">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-cyan-400" />
          <h3 className="font-extrabold text-lg uppercase tracking-tight">AI REPORT VERIFICATION</h3>
        </div>
        <span className="px-3 py-1 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-extrabold text-xs font-mono">
          INC-{targetReport.id || 1042}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">AI Verification Score</p>
          <p className="text-3xl font-black text-cyan-300">{targetReport.confidence_score || 91}%</p>
          <p className="text-xs font-extrabold text-emerald-400 uppercase tracking-wider">{verificationStatus}</p>
        </div>

        {/* Evidence Checklist */}
        <div className="space-y-2 text-xs">
          <p className="font-bold text-slate-400 uppercase tracking-wider">Automated Evidence Checklist:</p>
          {evidence.map((item) => (
            <div key={item} className="flex items-center gap-2 text-slate-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons for Authority Verification */}
      <div className="flex flex-wrap items-center gap-3 pt-2">
        <button
          onClick={() => setVerificationStatus('CONFIRMED BY AUTHORITY')}
          className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-md shadow-emerald-600/20"
        >
          <ShieldCheck className="w-4 h-4" />
          <span>[ CONFIRM ]</span>
        </button>

        <button
          onClick={() => setVerificationStatus('PENDING GROUND FIELD TEAM')}
          className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-xs uppercase tracking-wider transition-all flex items-center gap-2"
        >
          <HelpCircle className="w-4 h-4" />
          <span>[ REQUEST VERIFICATION ]</span>
        </button>

        <button
          onClick={() => setVerificationStatus('REJECTED / FALSE ALARM')}
          className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 border border-slate-700"
        >
          <XCircle className="w-4 h-4 text-rose-400" />
          <span>[ MARK FALSE ]</span>
        </button>
      </div>
    </div>
  );
}
