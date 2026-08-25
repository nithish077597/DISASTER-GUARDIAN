import { useState } from 'react';
import { BookOpen, CheckCircle2, XCircle, ShieldAlert } from 'lucide-react';
import { getDisasterPhoto } from '../services/photoLibrary';

const GUIDES = [
  {
    id: 'FLOOD',
    name: 'Flood Safety',
    dos: [
      'Move to higher ground immediately.',
      'Keep emergency documents in waterproof pouches.',
      'Listen to official disaster warnings on radio/app.',
      'Turn off main power switches if water enters building.',
    ],
    donts: [
      'Do not walk or drive through moving floodwater.',
      'Do not touch electrical equipment in flooded areas.',
      'Do not consume flood-affected water without boiling.',
    ],
  },
  {
    id: 'LANDSLIDE',
    name: 'Landslide Safety',
    dos: [
      'Evacuate steep slope areas immediately during heavy rain.',
      'Watch for unusual sounds like trees cracking or boulders knocking.',
      'Follow official evacuation routes.',
    ],
    donts: [
      'Do not cross blocked hill roads.',
      'Do not seek shelter under steep overhanging cliffs.',
    ],
  },
  {
    id: 'EARTHQUAKE',
    name: 'Earthquake Safety',
    dos: [
      'DROP, COVER, and HOLD ON under sturdy furniture.',
      'Stay away from glass windows and exterior walls.',
      'Move to open ground if outdoors.',
    ],
    donts: [
      'Do not use elevators during tremors.',
      'Do not rush into narrow stairwells.',
    ],
  },
  {
    id: 'CYCLONE',
    name: 'Cyclone Safety',
    dos: [
      'Secure roof sheets and loose outdoor items.',
      'Keep emergency lights and battery radios charged.',
      'Stay indoors away from windows.',
    ],
    donts: [
      'Do not venture outside during the eye of the storm.',
      'Do not go near sea coasts or rivers.',
    ],
  },
  {
    id: 'FIRE',
    name: 'Fire Safety',
    dos: [
      'Crawl low under smoke towards the exit.',
      'Use stairs instead of elevators.',
      'Call emergency 101 or 112 immediately.',
    ],
    donts: [
      'Do not open doors with hot handles.',
      'Do not re-enter a burning building.',
    ],
  },
  {
    id: 'LIGHTNING',
    name: 'Lightning Safety',
    dos: [
      'Seek shelter inside a substantial building or hard-topped vehicle.',
      'Crouch down low if caught in the open.',
    ],
    donts: [
      'Do not take shelter under tall isolated trees.',
      'Do not handle metal objects or wired phones.',
    ],
  },
  {
    id: 'TSUNAMI',
    name: 'Tsunami Safety',
    dos: [
      'Move inland to higher ground at least 30 meters above sea level.',
      'Stay away from the coast until official safe clearance is given.',
    ],
    donts: [
      'Do not go to the shore to watch a tsunami wave.',
    ],
  },
  {
    id: 'EXTREME_HEAT',
    name: 'Extreme Heat Safety',
    dos: [
      'Drink plenty of water even if not feeling thirsty.',
      'Wear lightweight, light-colored clothing.',
    ],
    donts: [
      'Do not leave children or pets inside parked vehicles.',
    ],
  },
];

export default function SafetyGuidesPage() {
  const [selectedId, setSelectedId] = useState('FLOOD');
  const activeGuide = GUIDES.find((g) => g.id === selectedId) || GUIDES[0];

  return (
    <div className="max-w-5xl mx-auto space-y-6 text-white select-none py-4 font-sans pb-24 md:pb-8 px-4">
      <div className="flex justify-between items-center border-b border-slate-800 pb-3">
        <div>
          <h1 className="text-xl font-extrabold text-white uppercase tracking-tight flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-cyan-400" />
            <span>DISASTER SAFETY GUIDES (DO'S & DON'TS)</span>
          </h1>
          <p className="text-xs text-slate-400">Concise, action-oriented instructions for emergency survival</p>
        </div>
        <span className="px-3 py-1 rounded-full bg-cyan-950 border border-cyan-500/50 text-cyan-300 font-mono font-bold text-xs">
          OFFLINE CACHED
        </span>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {GUIDES.map((g) => {
          const guidePhoto = getDisasterPhoto(g.id);
          return (
            <button
              key={g.id}
              onClick={() => setSelectedId(g.id)}
              className={`pl-1.5 pr-3.5 py-1.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
                selectedId === g.id
                  ? 'bg-cyan-600 text-white shadow-lg'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <img
                src={guidePhoto.url}
                alt={guidePhoto.alt}
                className="w-7 h-7 rounded-xl object-cover"
                loading="lazy"
              />
              <span>{g.name}</span>
            </button>
          );
        })}
      </div>

      {/* Active Guide Card */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 shadow-2xl">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <img
            src={getDisasterPhoto(activeGuide.id).url}
            alt={getDisasterPhoto(activeGuide.id).alt}
            className="w-14 h-14 rounded-2xl object-cover border border-slate-700"
          />
          <div>
            <h2 className="text-2xl font-black text-white uppercase">{activeGuide.name}</h2>
            <p className="text-xs text-slate-400">Follow these critical rules to stay safe</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* DO'S */}
          <div className="p-5 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 space-y-3">
            <h3 className="font-extrabold text-sm text-emerald-400 uppercase flex items-center gap-2 border-b border-emerald-500/30 pb-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>WHAT YOU SHOULD DO (DO'S)</span>
            </h3>
            <ul className="space-y-2 text-xs md:text-sm text-slate-200">
              {activeGuide.dos.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* DON'TS */}
          <div className="p-5 rounded-2xl bg-red-950/30 border border-red-500/40 space-y-3">
            <h3 className="font-extrabold text-sm text-red-400 uppercase flex items-center gap-2 border-b border-red-500/30 pb-2">
              <XCircle className="w-5 h-5 text-red-400" />
              <span>WHAT YOU MUST NOT DO (DON'TS)</span>
            </h3>
            <ul className="space-y-2 text-xs md:text-sm text-slate-200">
              {activeGuide.donts.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
