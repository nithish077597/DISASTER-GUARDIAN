import { useState } from 'react';
import { ShieldAlert, Activity, Users, MapPin, CheckCircle2, AlertTriangle, Send, RefreshCw, Sparkles, MessageSquare, Satellite, Clock, Check, X, HelpCircle, ArrowRight, Key } from 'lucide-react';
import { systemHealthService } from '../services/systemHealthService';
import { dataFreshnessService } from '../services/dataFreshnessService';
import { aiSecondDetermination } from '../services/aiSecondDetermination';

const DISASTER_CLUSTERS = [
  { id: 'c1', title: 'POSSIBLE DISASTER CLUSTER DETECTED', count: 17, radius: '1.8 km', timeWindow: 'last 20 mins', risk: 'HIGH', location: 'Sulur Kallar Pass Sector 4' },
];

const REPORTS_QUEUE = [
  { id: 'DG-20491', type: 'FLOOD', citizen: 'Verified Citizen (DG-IND-884920)', location: 'Sulur Pass Road', photo: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?w=500&auto=format&fit=crop&q=60', aiResult: 'Possible Flooding', confidence: 86, status: 'NEEDS REVIEW', time: '10:31 PM' },
];

const TRAPPED_CITIZENS_QUEUE = [
  { id: 'sos-101', name: 'Sharan P', citizenId: 'DG-IND-884920', location: 'Sulur, Coimbatore', situation: 'I AM TRAPPED', lat: 28.618, lng: 77.208, time: '2 mins ago', status: 'NEW' },
  { id: 'sos-102', name: 'Priya K', citizenId: 'DG-IND-492014', location: 'Kallar Pass Slope', situation: 'FLOOD WATER ENTERING HOME', lat: 28.625, lng: 77.215, time: '8 mins ago', status: 'TEAM ASSIGNED' },
];

export default function Dashboard() {
  const [sosList, setSosList] = useState(TRAPPED_CITIZENS_QUEUE);
  const [reportsList, setReportsList] = useState(REPORTS_QUEUE);
  const [verificationStatus, setVerificationStatus] = useState('NEEDS REVIEW');
  const [timeline, setTimeline] = useState([
    { time: '10:31 PM', event: 'Citizen submitted flood report & evidence' },
    { time: '10:32 PM', event: 'AI image analysis completed (86% Confidence)' },
    { time: '10:33 PM', event: 'Weather & 17 nearby reports cross-verified' },
    { time: '10:34 PM', event: 'AI Second Determination generated (88% Evidence Score)' },
  ]);

  const healthItems = systemHealthService.getHealthStatus();
  const freshnessItems = dataFreshnessService.getFreshnessData();
  const determination = aiSecondDetermination.calculateSecondDetermination({});

  const handleUpdateSosStatus = (id, newStatus) => {
    setSosList((prev) => prev.map((s) => (s.id === id ? { ...s, status: newStatus } : s)));
  };

  const handleVerifyIncident = (status) => {
    setVerificationStatus(status);
    if (status === 'VERIFIED') {
      setTimeline((prev) => [
        ...prev,
        { time: '10:35 PM', event: 'Authorized Admin verified official flood incident' },
        { time: '10:37 PM', event: 'NDRF Rescue Team #4 assigned to Sector 4' },
      ]);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto select-none text-white font-sans p-4">
      {/* Admin Header with Secret Key Access */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-7 h-7 text-red-500" />
            <span>DISASTER MANAGEMENT ??? COMMAND CENTER</span>
          </h1>
          <p className="text-xs text-slate-400">Authorized NDRF Operations & Real-Time Incident Response Command</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-purple-950 border border-purple-600 text-purple-300 font-mono font-bold text-xs flex items-center gap-1">
            <Key className="w-3.5 h-3.5 text-purple-400" />
            <span>SECRET KEY: DG-ADMIN-9942</span>
          </span>
          <span className="px-3 py-1 rounded-full bg-red-950 border border-red-600 text-red-400 font-mono font-bold text-xs">
            ✅ COMMAND OPERATIONAL
          </span>
        </div>
      </div>

      {/* DISASTER CLUSTER DETECTION BANNER */}
      {DISASTER_CLUSTERS.map((c) => (
        <div key={c.id} className="p-4 rounded-3xl bg-amber-950/40 border-2 border-amber-500/80 flex items-center justify-between gap-4 text-xs font-mono">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-400 animate-pulse" />
            <div>
              <h3 className="font-extrabold text-amber-400 text-sm uppercase">{c.title}</h3>
              <p className="text-slate-300 font-sans text-xs">
                {c.count} citizen reports submitted within {c.radius} during {c.timeWindow} near <strong>{c.location}</strong>.
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-xl bg-amber-900 text-amber-200 font-bold border border-amber-600">
            RISK: {c.risk}
          </span>
        </div>
      ))}

      {/* AI SECOND DETERMINATION PANEL */}
      <div className="p-6 rounded-3xl bg-slate-900 border-2 border-purple-500/60 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-400 animate-pulse" />
            <div>
              <h2 className="font-black text-lg text-purple-300 uppercase tracking-tight">
                🤖 AI SECOND DETERMINATION PANEL
              </h2>
              <p className="text-xs text-slate-400">Multi-Source Weighted Evidence Correlation & Incident Intelligence</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-xl bg-purple-950 border border-purple-500 text-purple-300 font-mono font-extrabold text-xs">
              EVIDENCE SCORE: {determination.totalEvidenceScore} / 100
            </span>
            <span className="px-3 py-1 rounded-xl bg-red-950 border border-red-500 text-red-400 font-mono font-extrabold text-xs">
              RISK: {determination.riskLevel}
            </span>
          </div>
        </div>

        {/* Evidence Breakdown Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
          {determination.evidenceBreakdown.map((e, idx) => (
            <div key={idx} className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-[11px]">{e.label}</span>
                <span className="text-purple-400 text-[10px]">Weight: {e.weight} — Score: {e.score}</span>
              </div>
              <p className="text-slate-400 text-[11px] font-sans">{e.detail}</p>
            </div>
          ))}
        </div>

        {/* Admin Action Buttons */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <span className="text-slate-300 font-mono">
            Verification Status: <strong className="text-amber-400 uppercase">{verificationStatus}</strong>
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleVerifyIncident('VERIFIED')}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold uppercase shadow-md flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>✅ VERIFY INCIDENT</span>
            </button>
            <button
              onClick={() => handleVerifyIncident('NEED MORE INFO')}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-extrabold uppercase shadow-md flex items-center gap-1.5"
            >
              <HelpCircle className="w-4 h-4" />
              <span>❓ NEED MORE INFO</span>
            </button>
            <button
              onClick={() => handleVerifyIncident('REJECTED')}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold uppercase shadow-md flex items-center gap-1.5"
            >
              <X className="w-4 h-4" />
              <span>❌ REJECT</span>
            </button>
          </div>
        </div>

        {/* Emergency Data Timeline */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs font-mono">
          <span className="font-extrabold text-cyan-400 uppercase flex items-center gap-1.5 border-b border-slate-800 pb-2">
            <Clock className="w-4 h-4" />
            <span>EMERGENCY INCIDENT TIMELINE & AUDIT LOG</span>
          </span>
          <div className="space-y-1.5 pt-1">
            {timeline.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 text-slate-300">
                <span className="text-slate-400 font-bold shrink-0">{item.time}</span>
                <ArrowRight className="w-3 h-3 text-cyan-400 shrink-0" />
                <span className="font-sans text-xs">{item.event}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* TARGETED SMS ALERT DISTRIBUTION STATS */}
      <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-3 shadow-xl font-mono text-xs">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <span className="font-extrabold text-cyan-400 uppercase flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4" />
            <span>REAL-TIME TARGETED SMS ALERT ENGINE</span>
          </span>
          <span className="text-slate-400">Target Geofence: 5.0 km Radius</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-white">
          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
            <span className="text-slate-400 text-[10px] block">AFFECTED CITIZENS</span>
            <strong className="text-lg text-white">2,483</strong>
          </div>
          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
            <span className="text-slate-400 text-[10px] block">SMS QUEUED</span>
            <strong className="text-lg text-cyan-400">2,483</strong>
          </div>
          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
            <span className="text-slate-400 text-[10px] block">DELIVERED</span>
            <strong className="text-lg text-emerald-400">2,311 (93.1%)</strong>
          </div>
          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
            <span className="text-slate-400 text-[10px] block">FAILED / UNREACHABLE</span>
            <strong className="text-lg text-red-400">172</strong>
          </div>
        </div>
      </div>

      {/* DATA PROVENANCE & LATENCY MONITOR */}
      <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-3 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <h2 className="text-xs font-mono font-extrabold text-cyan-400 uppercase flex items-center gap-1.5">
            <Satellite className="w-4 h-4" />
            <span>REAL-TIME DATA PROVENANCE & LATENCY MONITOR</span>
          </h2>
          <span className="text-slate-400 font-mono text-[10px]">Data Freshness Verified</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 text-xs font-mono">
          {freshnessItems.map((item) => (
            <div key={item.id} className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-slate-400 block text-[10px] truncate">{item.name}</span>
              <strong className="text-white text-[11px] block">{item.badge}</strong>
              <p className="text-slate-400 text-[10px]">Latency: <strong className="text-slate-300">{item.latency}</strong></p>
            </div>
          ))}
        </div>
      </div>

      {/* TRAPPED CITIZENS & SOS RESCUE PIPELINE */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-red-400" />
            <h3 className="font-black text-lg uppercase tracking-tight text-white">
              TRAPPED CITIZENS & SOS RESCUE PIPELINE
            </h3>
          </div>
          <span className="px-3 py-1 rounded-xl bg-red-950 text-red-400 font-mono font-bold text-xs border border-red-600">
            {sosList.filter((s) => s.status !== 'RESCUED').length} Active Rescue Missions
          </span>
        </div>

        <div className="space-y-3">
          {sosList.map((sos) => (
            <div key={sos.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm text-white">{sos.name}</span>
                  <span className="text-slate-400 font-mono text-[11px]">{sos.citizenId}</span>
                  <span className="px-2 py-0.5 rounded bg-red-950 text-red-400 border border-red-800 font-bold text-[10px]">
                    {sos.situation}
                  </span>
                </div>
                <p className="text-slate-300 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{sos.location} ({sos.lat}, {sos.lng}) — <strong className="text-slate-400">{sos.time}</strong></span>
                </p>
              </div>

              {/* Status Selector */}
              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-mono text-[11px]">Rescue Status:</span>
                <select
                  value={sos.status}
                  onChange={(e) => handleUpdateSosStatus(sos.id, e.target.value)}
                  className="bg-slate-900 border border-slate-700 text-cyan-300 font-bold rounded-xl px-3 py-1.5 text-xs focus:outline-none cursor-pointer"
                >
                  <option value="NEW">🟡 NEW</option>
                  <option value="ACKNOWLEDGED">👀 ACKNOWLEDGED</option>
                  <option value="TEAM ASSIGNED">🚑 TEAM ASSIGNED</option>
                  <option value="RESCUE IN PROGRESS">🏊 RESCUE IN PROGRESS</option>
                  <option value="RESCUED">✅ RESCUED</option>
                  <option value="CLOSED">✔️ CLOSED</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
