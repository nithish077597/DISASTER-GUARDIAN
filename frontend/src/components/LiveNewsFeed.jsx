import { useState, useEffect } from 'react';
import { Newspaper, MapPin, Users, Camera, Clock, RefreshCw, Radio } from 'lucide-react';
import { newsApi } from '../api';
import { getDisasterPhoto } from '../services/photoLibrary';

const CATEGORY_BADGE = {
  NORMAL: 'bg-sky-950 border-sky-500/50 text-sky-300',
  HIGH: 'bg-amber-950 border-amber-500/50 text-amber-300',
  RISK: 'bg-orange-950 border-orange-500/50 text-orange-300',
  CRITICAL: 'bg-red-950 border-red-500/60 text-red-300 animate-pulse',
};

const timeAgo = (iso) => {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

export default function LiveNewsFeed({ locationName = '', coords = null }) {
  const [newsItems, setNewsItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNews = async () => {
    setLoading(true);
    try {
      const data = await newsApi.live(coords?.lat, coords?.lng, 100);
      setNewsItems(Array.isArray(data) ? data : []);
    } catch {
      setNewsItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
    const interval = setInterval(fetchNews, 30000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coords?.lat, coords?.lng]);

  return (
    <div className="p-4 md:p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-2xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Newspaper className="w-5 h-5 text-cyan-400" />
          <div>
            <h3 className="font-extrabold text-sm md:text-base text-white uppercase tracking-tight flex items-center gap-2">
              Live News
              <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-500/40 text-[9px] font-mono font-bold text-emerald-400 uppercase">
                <Radio className="w-2.5 h-2.5 animate-pulse" />
                Verified
              </span>
            </h3>
            {locationName && (
              <p className="text-[10px] text-slate-500 font-mono flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-red-400" />
                Reporting for {locationName}
              </p>
            )}
          </div>
        </div>
        <button
          onClick={fetchNews}
          disabled={loading}
          className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-cyan-400 transition-colors"
          title="Refresh news"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {loading && newsItems.length === 0 ? (
        <div className="py-8 text-center space-y-2">
          <Radio className="w-6 h-6 text-slate-600 mx-auto animate-pulse" />
          <p className="text-xs text-slate-500 font-mono">Scanning verified reports near your location...</p>
        </div>
      ) : newsItems.length === 0 ? (
        <div className="py-8 text-center space-y-2">
          <Newspaper className="w-6 h-6 text-emerald-500 mx-auto" />
          <p className="text-xs font-bold text-emerald-400 uppercase">No emergency news in your area</p>
          <p className="text-[11px] text-slate-500">News is published only when photo evidence is real and more than 3 citizens report it.</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
          {newsItems.map((item) => {
            const badge = CATEGORY_BADGE[item.category] || CATEGORY_BADGE.NORMAL;
            const fallbackPhoto = getDisasterPhoto(item.disaster_type);
            const isUploadedImage = item.photo_url && (item.photo_url.startsWith('data:') || item.photo_url.startsWith('http'));
            const photoSrc = item.photo_url && item.photo_url.length < 500000 ? item.photo_url : null;
            return (
              <article
                key={item.id}
                className={`p-4 rounded-2xl bg-slate-950 border ${badge.split(' ').find((c) => c.startsWith('border-')) || 'border-slate-800'} space-y-2 hover:border-cyan-500/40 transition-colors`}
              >
                <div className="flex items-start gap-3">
                  {photoSrc ? (
                    <img
                      src={photoSrc}
                      alt={isUploadedImage ? 'Citizen evidence photo' : fallbackPhoto.alt}
                      className={`w-16 h-16 rounded-xl object-cover border border-slate-700 shrink-0 ${isUploadedImage ? 'ring-1 ring-emerald-500/50' : ''}`}
                      onError={(e) => { e.target.onerror = null; e.target.src = fallbackPhoto.url; }}
                    />
                  ) : (
                    <div className="relative w-16 h-16 shrink-0">
                      <img
                        src={fallbackPhoto.url}
                        alt={fallbackPhoto.alt}
                        className="w-16 h-16 rounded-xl object-cover border border-slate-700 opacity-70"
                      />
                      <span className="absolute inset-0 flex items-center justify-center">
                        <Camera className="w-4 h-4 text-white drop-shadow" />
                      </span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2 py-0.5 rounded-md border font-mono font-black text-[9px] tracking-widest uppercase ${badge}`}>
                        {item.category}
                      </span>
                      <span className="text-xs font-extrabold text-white uppercase">{item.disaster_type}</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-snug line-clamp-2">
                      {item.description || `${item.disaster_type} reported in the area.`}
                    </p>
                    <div className="flex items-center gap-3 text-[10px] text-slate-500 font-mono flex-wrap">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {timeAgo(item.timestamp)}
                      </span>
                      {(item.distinct_reporters ?? 0) > 0 && (
                        <span className="flex items-center gap-1 text-emerald-400 font-bold">
                          <Users className="w-3 h-3" />
                          {item.distinct_reporters} CITIZENS CONFIRMED
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-purple-400">
                        <Camera className="w-3 h-3" />
                        AI VERIFIED REAL
                      </span>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
