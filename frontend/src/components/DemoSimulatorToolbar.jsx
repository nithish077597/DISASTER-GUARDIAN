import { motion } from 'framer-motion';
import { Play, Pause, SkipForward, RotateCcw, Activity, ShieldCheck, AlertTriangle } from 'lucide-react';
import { useRealtime } from '../context/RealtimeContext';
import { Button } from './ui';

const DEMO_STEPS = [
  'Rainfall Surge',
  'Soil Moisture Peak',
  'Risk Engine HIGH',
  'Citizen Report',
  'AI CRITICAL Alert',
  'Road Blockage',
  'Shelter Rerouting',
  'Alert Dispatch',
  'Gateway Sync',
];

export default function DemoSimulatorToolbar() {
  const { demoState, startDemo, pauseDemo, stepForwardDemo, resetDemo } = useRealtime();

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6 p-4 glass-card bg-slate-900/90 border border-cyan-500/30 rounded-2xl shadow-xl shadow-cyan-950/40 backdrop-blur-xl"
    >
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
        {/* Left Branding & Badge */}
        <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-start">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Activity className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-[10px] font-bold text-cyan-300 uppercase tracking-wider">
                  DEMO REAL-TIME MODE
                </span>
                <span className="text-[10px] text-slate-400 hidden sm:inline">Event Simulator Engine</span>
              </div>
              <p className="text-xs text-slate-300 font-semibold mt-0.5">
                Simulated Live Sensor & Operator Workflow
              </p>
            </div>
          </div>

          <div className="lg:hidden text-xs text-cyan-400 font-mono font-bold">
            Step {demoState.currentStep} / {demoState.totalSteps}
          </div>
        </div>

        {/* Step Progression Visualizer Bar */}
        <div className="hidden xl:flex items-center gap-1.5 flex-1 max-w-2xl px-4">
          {DEMO_STEPS.map((label, idx) => {
            const stepNum = idx + 1;
            const isDone = stepNum < demoState.currentStep;
            const isCurrent = stepNum === demoState.currentStep;
            return (
              <div key={label} className="flex-1 flex flex-col items-center gap-1 group">
                <div
                  className={`w-full h-2 rounded-full transition-all ${
                    isCurrent
                      ? 'bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)] animate-pulse'
                      : isDone
                      ? 'bg-cyan-600'
                      : 'bg-white/10'
                  }`}
                />
                <span
                  className={`text-[9px] font-semibold truncate max-w-[65px] ${
                    isCurrent ? 'text-cyan-300' : isDone ? 'text-slate-400' : 'text-slate-600'
                  }`}
                >
                  {stepNum}. {label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Controls Button Toolbar */}
        <div className="flex items-center gap-2 w-full lg:w-auto justify-end">
          {demoState.isPlaying ? (
            <Button
              variant="secondary"
              size="sm"
              icon={Pause}
              onClick={pauseDemo}
              className="bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30 text-xs font-bold"
            >
              PAUSE
            </Button>
          ) : (
            <Button
              variant="primary"
              size="sm"
              icon={Play}
              onClick={startDemo}
              className="shadow-lg shadow-cyan-500/20 text-xs font-bold"
            >
              START LIVE DEMO
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            icon={SkipForward}
            onClick={stepForwardDemo}
            className="text-xs font-medium text-slate-300 hover:text-white"
            title="Advance 1 Step"
          >
            STEP FORWARD
          </Button>

          <Button
            variant="ghost"
            size="sm"
            icon={RotateCcw}
            onClick={resetDemo}
            className="text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
            title="Reset Demo Scenario"
          >
            RESET
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
