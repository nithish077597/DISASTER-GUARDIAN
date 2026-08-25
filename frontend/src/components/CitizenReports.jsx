import { useState } from 'react';
import { Send, MapPin, ClipboardList, CheckCircle2, Eye } from 'lucide-react';
import { useRealtime } from '../context/RealtimeContext';
import { timeAgo } from '../utils/helpers';
import { getDisasterPhoto } from '../services/photoLibrary';
import AdminReportDetailModal from './AdminReportDetailModal';

const INCIDENT_TYPES = ['Landslide', 'Ground Crack', 'Slope Movement', 'Blocked Road'];

export default function CitizenReports() {
  const { incidents, submitCitizenReport } = useRealtime();

  const [disasterType, setDisasterType] = useState('Landslide');
  const [locationName, setLocationName] = useState('Kallar Valley Region');
  const [description, setDescription] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Selected report for Admin Inspection Modal
  const [selectedReport, setSelectedReport] = useState(null);
  const [inspectModalOpen, setInspectModalOpen] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);

    const payload = {
      disaster_type: disasterType.toUpperCase().replace(' ', '_'),
      location_name: locationName,
      description,
      photo: photoUrl || getDisasterPhoto(disasterType).url,
      lat: 28.621,
      lng: 77.214,
    };

    submitCitizenReport(payload);
    setSubmitting(false);
    setDescription('');
    setPhotoUrl('');
  };

  const handleInspect = (rep) => {
    setSelectedReport(rep);
    setInspectModalOpen(true);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-white select-none">
      <AdminReportDetailModal
        report={selectedReport}
        isOpen={inspectModalOpen}
        onClose={() => setInspectModalOpen(false)}
      />

      {/* Report Form */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-5">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <Send className="w-5 h-5 text-red-500" />
          <h3 className="font-extrabold text-base uppercase tracking-wider">SUBMIT HAZARD REPORT</h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Disaster Type</label>
            <div className="grid grid-cols-2 gap-2">
              {INCIDENT_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setDisasterType(type)}
                  className={`p-2.5 rounded-xl border text-xs font-bold text-left transition-all ${
                    disasterType === type
                      ? 'bg-red-600 border-red-500 text-white shadow-md shadow-red-600/20'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Incident Location</label>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs">
              <MapPin className="w-4 h-4 text-red-400" />
              <span className="text-slate-200 font-medium">GPS detected: <strong>{locationName} (28.621, 77.214)</strong></span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter description of slope slippage, boulders, or road hazards..."
              className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-red-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Photo Attachment URL</label>
            <input
              type="url"
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              placeholder="https://example.com/slope_photo.jpg"
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-red-500"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-red-600/30 transition-all flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            <span>[ SUBMIT REPORT ]</span>
          </button>
        </form>
      </div>

      {/* Recent Reports List with Inspect Action */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-cyan-400" />
            <h3 className="font-extrabold text-base uppercase tracking-wider">ADMIN VERIFICATION QUEUE</h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">Live Audit Stream</span>
        </div>

        <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
          {incidents.map((rep) => (
            <div key={rep.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-xs">INC-{rep.id} ??? {rep.disaster_type}</span>
                <span className="text-[10px] text-slate-400 font-mono">{timeAgo(rep.timestamp)}</span>
              </div>

              <p className="text-xs text-slate-300 leading-snug">{rep.description}</p>

              <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-800/80">
                <span className="text-emerald-400 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> GPS Verified
                </span>
                <button
                  onClick={() => handleInspect(rep)}
                  className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-cyan-300 font-bold text-[10px] flex items-center gap-1 border border-slate-800"
                >
                  <Eye className="w-3 h-3 text-cyan-400" />
                  <span>INSPECT ({rep.confidence_score ?? 87}%)</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
