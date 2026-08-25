import { useRealtime } from '../context/RealtimeContext';
import { Play, Pause, FastForward, RotateCcw, AlertTriangle, ShieldCheck, Activity } from 'lucide-react';

export default function DemoBar() {
  const { demoState, startDemo, pauseDemo, stepDemo, resetDemo } = useRealtime();

  const steps = [
    '1. Normal Baseline State',
    '2. Intense Rainfall Surge (142mm/h)',
    '3. Soil Saturation Reaches 78%',
    '4. AI Landslide Score Hits 91/100 (CRITICAL)',
    '5. Citizen Photo Report Submitted',
    '6. AI Photo Confidence Verified (94%)',
    '7. Official Emergency Verified by NDRF',
    '8. SMS & Voice Call Alerts Dispatched',
    '9. Safe Evacuation Route Updated (NH-707)',
  ];

  return (
    <div className="p-4 bg-slate-900 border border-slate-800 rounded-3xl space-y-3 text-white shadow-2xl select-none">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-cyan-400 animate-pulse" />
          <div>
            <h3 className="font-extrabold text-sm uppercase tracking-tight text-white flex items-center gap-2">
              <span>DISASTER SCENARIO SIMULATOR</span>
              <span className="px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-500/50 text-cyan-300 text-[10px] font-mono font-bold">
                REAL-TIME SIMULATION
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">Trigger live disaster escalation sequence & inter-portal synchronization</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {!demoState.active ? (
            <button
              onClick={startDemo}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs uppercase flex items-center gap-1 shadow-md transition-all"
            >
              <Play className="w-3.5 h-3.5" />
              <span>START DEMO</span>
            </button>
          ) : (
            <button
              onClick={pauseDemo}
              className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-xs uppercase flex items-center gap-1 shadow-md transition-all"
            >
              <Pause className="w-3.5 h-3.5" />
              <span>PAUSE</span>
            </button>
          )}

          <button
            onClick={stepDemo}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-extrabold text-xs uppercase flex items-center gap-1 border border-slate-700 transition-all"
          >
            <FastForward className="w-3.5 h-3.5" />
            <span>STEP</span>
          </button>

          <button
            onClick={resetDemo}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-extrabold text-xs uppercase flex items-center gap-1 border border-slate-700 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>RESET</span>
          </button>
        </div>
      </div>

      {/* Progress & Step Banner */}
      <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs font-mono">
        <div className="flex items-center justify-between">
          <span className="text-cyan-400 font-bold">
            CURRENT STAGE: <span className="text-white font-extrabold">{steps[demoState.currentStep]}</span>
          </span>
          <span className="text-slate-400 font-bold">
            Step {demoState.currentStep + 1} of {steps.length}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 via-amber-500 to-red-500 transition-all duration-500"
            style={{ width: `${((demoState.currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
