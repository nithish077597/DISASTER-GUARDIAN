import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AdminLayout from './layouts/AdminLayout';
import Overview from './pages/Overview';
import LiveMap from './pages/LiveMap';
import { GlassCard } from './components/ui';

function PlaceholderPage({ title, description }) {
  return (
    <div className="space-y-4 py-6">
      <h1 className="text-3xl font-bold text-white">{title}</h1>
      <GlassCard className="p-6 border border-white/10 text-slate-300">
        <p>{description || 'Module integrated into command console.'}</p>
      </GlassCard>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AdminLayout />}>
          <Route index element={<Overview />} />
          <Route path="map" element={<LiveMap />} />
          <Route path="reports" element={<PlaceholderPage title="Verification Queue" description="All submitted reports and confidence scoring feed." />} />
          <Route path="verification" element={<PlaceholderPage title="Verification Engine" description="AI confidence scoring engine status." />} />
          <Route path="safe-zones" element={<PlaceholderPage title="Safe Evacuation Zones" description="Monitored relief camps and shelters." />} />
          <Route path="alerts" element={<PlaceholderPage title="Alert Dispatch Logs" description="Multi-channel alert dispatch queue." />} />
          <Route path="gateway" element={<PlaceholderPage title="Zero-Signal Gateway" description="Hardware siren & Pi node status." />} />
          <Route path="analytics" element={<PlaceholderPage title="Disaster Analytics" description="Historical incident trends and rainfall data." />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
